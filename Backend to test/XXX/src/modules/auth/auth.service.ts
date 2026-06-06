import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import type Redis from 'ioredis';
import { Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { KinesService } from '../kines/kines.service';
import { PatientsService } from '../patients/patients.service';
import { RolesService } from '../roles/roles.service';
import { AdminsService } from '../admins/admins.service';
import { CabinetsService } from '../cabinets/cabinets.service';
import { CaslAbilityFactory } from '@common/casl/casl-ability.factory';
import { REDIS_CLIENT } from '@common/redis/redis.module';
import {
  RedisKeys,
  REDIS_TTL,
  RATE_LIMIT,
} from '@common/redis/redis-keys';
import { envNumber, requireEnv } from '@common/config/env';
import { MailerService } from '@common/mailer/mailer.service';
import { TokensService } from './services/tokens.service';
import { UniqueCodeService } from './services/unique-code.service';
import { LoginDto } from './dto/login.dto';
import {
  KineRegisterProfileType,
  RegisterKineDto,
} from './dto/register-kine.dto';
import { RegisterPatientDto } from './dto/register-patient.dto';
import {
  CreateInvitationDto,
  InvitationTargetProfileType,
} from './dto/create-invitation.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import {
  AddKineProfileDto,
  AddKineProfileType,
} from './dto/add-kine-profile.dto';
import type { UploadedFileLike } from '@common/uploads/supporting-document.interceptor';
import { StorageService } from '@common/storage/storage.service';
import { OAuthVerifierService } from '@common/oauth/oauth-verifier.service';
import { AuthErrorCode } from '@common/exceptions/auth-error-codes';
import { AppError } from '@common/exceptions/app-error';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateAdminSelfDto } from './dto/update-admin-self.dto';
import { UpdateKineSelfDto } from './dto/update-kine-self.dto';
import { UpdatePatientSelfDto } from './dto/update-patient-self.dto';
import { UpdateKineProfileSelfDto } from './dto/update-kine-profile-self.dto';

type KineProfileType =
  | 'LIBERAL'
  | 'REMPLACANT'
  | 'ADMIN_GROUP'
  | 'MEMBER'
  | 'STUDENT'
  | 'ASSISTANT';

@Injectable()
export class AuthService {
  private readonly RESET_MAX_ATTEMPTS = envNumber('RESET_MAX_ATTEMPTS', 3);
  private readonly BCRYPT_ROUNDS = envNumber('BCRYPT_ROUNDS', 12);
  private readonly RESET_CODE_BCRYPT_ROUNDS = envNumber(
    'RESET_CODE_BCRYPT_ROUNDS',
    10,
  );
  private readonly FREEMIUM_STUDENT_DAYS = envNumber(
    'FREEMIUM_STUDENT_DAYS',
    90,
  );
  private readonly FREEMIUM_TRIAL_DAYS = envNumber(
    'FREEMIUM_TRIAL_DAYS',
    30,
  );

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly kinesService: KinesService,
    private readonly patientsService: PatientsService,
    private readonly rolesService: RolesService,
    private readonly adminsService: AdminsService,
    private readonly cabinetsService: CabinetsService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly tokensService: TokensService,
    private readonly uniqueCodeService: UniqueCodeService,
    private readonly mailer: MailerService,
    private readonly storage: StorageService,
    private readonly oauthVerifier: OAuthVerifierService,
    private readonly config: ConfigService,
  ) {}


  async loginAdmin(dto: LoginDto) {
    await this.enforceRateLimit(
      RedisKeys.rateLimitLogin(dto.email),
      RATE_LIMIT.LOGIN_MAX_PER_MINUTE,
      REDIS_TTL.RATE_LIMIT_LOGIN,
      AuthErrorCode.RATE_LIMITED,
      'Too many login attempts. Try again in a minute.',
    );
    const admin = await this.adminsService.findByEmail(dto.email, true);
    if (!admin) {
      throw AppError.unauthorized(AuthErrorCode.INVALID_CREDENTIALS, 'Invalid credentials.');
    }
    const valid = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!valid) {
      throw AppError.unauthorized(AuthErrorCode.INVALID_CREDENTIALS, 'Invalid credentials.');
    }
    await this.adminsService
      .updateLastLogin(admin._id.toString())
      .catch(() => undefined);
    return this.buildAdminSession(admin);
  }

  async loginKine(dto: LoginDto) {
    await this.enforceRateLimit(
      RedisKeys.rateLimitLogin(dto.email),
      RATE_LIMIT.LOGIN_MAX_PER_MINUTE,
      REDIS_TTL.RATE_LIMIT_LOGIN,
      AuthErrorCode.RATE_LIMITED,
      'Too many login attempts. Try again in a minute.',
    );
    const kine = await this.kinesService.findByEmailOrPhone(dto.email, true);
    if (!kine || kine.status !== 'ACTIVE') {
      throw AppError.unauthorized(AuthErrorCode.INVALID_CREDENTIALS, 'Invalid credentials or inactive account.');
    }
    const valid = await bcrypt.compare(dto.password, kine.passwordHash);
    if (!valid) {
      throw AppError.unauthorized(AuthErrorCode.INVALID_CREDENTIALS, 'Invalid credentials.');
    }
    return this.buildKineLoginEnvelope(kine);
  }

  async loginPatient(dto: LoginDto) {
    await this.enforceRateLimit(
      RedisKeys.rateLimitLogin(dto.email),
      RATE_LIMIT.LOGIN_MAX_PER_MINUTE,
      REDIS_TTL.RATE_LIMIT_LOGIN,
      AuthErrorCode.RATE_LIMITED,
      'Too many login attempts. Try again in a minute.',
    );
    const patient = await this.patientsService.findByEmailOrPhone(
      dto.email,
      true,
    );
    if (!patient || patient.status === 'INACTIVE') {
      throw AppError.unauthorized(AuthErrorCode.INVALID_CREDENTIALS, 'Invalid credentials or inactive account.');
    }
    if (!patient.passwordHash) {
      throw AppError.unauthorized(AuthErrorCode.INVALID_CREDENTIALS, 'Invalid credentials.');
    }
    const valid = await bcrypt.compare(dto.password, patient.passwordHash);
    if (!valid) {
      throw AppError.unauthorized(AuthErrorCode.INVALID_CREDENTIALS, 'Invalid credentials.');
    }
    return this.buildPatientSession(patient);
  }

  async loginPatientWithGoogle(idToken: string) {
    const identity = await this.oauthVerifier.verifyGoogleIdToken(idToken);

    let patient = await this.patientsService.findOrLinkByOAuth({
      provider: identity.provider,
      providerId: identity.providerId,
      email: identity.email,
    });

    if (!patient) {
      const role = await this.rolesService.findBySlug('PATIENT');
      if (!role) {
        throw AppError.notFound(AuthErrorCode.ROLE_NOT_FOUND, 'Role PATIENT not found (seed missing).');
      }
      const uniqueCode = await this.uniqueCodeService.generateUniqueCode();
      const created: any = await this.patientsService.create({
        email: identity.email,
        firstName: identity.firstName,
        lastName: identity.lastName || identity.firstName,
        roleId: role._id.toString(),
        uniqueCode,
        profilePhoto: identity.picture,
        status: 'NEW',
        oauth: {
          provider: identity.provider,
          providerId: identity.providerId,
        },
      } as any);
      patient = await this.patientsService.findOne(created._id.toString(), {
        bypassTenantScope: true,
      });
    }

    if (!patient) {
      throw AppError.unauthorized(AuthErrorCode.OAUTH_LOGIN_FAILED, 'Could not resolve a patient from this Google identity.');
    }

    if (patient.status === 'INACTIVE') {
      throw AppError.unauthorized(AuthErrorCode.ACCOUNT_INACTIVE, 'This account has been suspended.');
    }

    return this.buildPatientSession(patient);
  }

  async registerKine(dto: RegisterKineDto, justificatifFile?: UploadedFileLike) {
    switch (dto.profileType) {
      case KineRegisterProfileType.LIBERAL:
        return this.registerLiberal(dto);
      case KineRegisterProfileType.ADMIN_GROUP:
        return this.registerAdminGroup(dto);
      case KineRegisterProfileType.STUDENT:
        return this.registerStudent(dto, justificatifFile);
      default:
        throw AppError.badRequest(
          AuthErrorCode.INVALID_PROFILE_TYPE,
          `Unsupported profileType: ${String((dto as any).profileType)}`,
        );
    }
  }

  private async registerLiberal(dto: RegisterKineDto) {
    await this.assertEmailAvailableForUser(dto.email);
    await this.assertProfessionalNumberAvailable(dto.professionalNumber!);

    const role = await this.rolesService.findBySlug('KINE');
    if (!role) {
      throw AppError.notFound(AuthErrorCode.ROLE_NOT_FOUND, 'Role KINE not found (seed missing).');
    }

    const now = new Date();
    const cguVersion = dto.cguVersion ?? '1.0';
    const profileType: KineProfileType = dto.isReplacement ? 'REMPLACANT' : 'LIBERAL';

    const kineId = new Types.ObjectId();
    const profileId = new Types.ObjectId();

    const cabinet = await this.cabinetsService.create({
      name: dto.cabinetName!,
      ownerId: kineId,
      address: `${dto.street}, ${dto.postalCode} ${dto.city}`,
    });

    await this.kinesService.createWithProfile({
      kineId,
      dto: {
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        professionalNumber: dto.professionalNumber,
        verificationStatus: 'PENDING',
        status: 'ACTIVE',
        cguAcceptedAt: now,
        cguVersion,
        cabinetId: cabinet._id,
      } as any,
      profile: {
        profileId,
        cabinetId: cabinet._id,
        roleId: role._id,
        profileType,
        isActive: true,
        isCabinetAdmin: false,
        customPermissionOverrides: [],
        additionalMetadata: { isReplacement: dto.isReplacement === true },
        cguAcceptedAt: now,
        cguVersion,
      },
    });

    return {
      success: true,
      message: 'Account successfully created. Please sign in.',
      email: dto.email,
    };
  }

  private async registerAdminGroup(dto: RegisterKineDto) {
    await this.assertEmailAvailableForUser(dto.email);
    await this.assertProfessionalNumberAvailable(dto.professionalNumber!);

    const role = await this.rolesService.findBySlug('KINE_ADMIN');
    if (!role) {
      throw AppError.notFound(AuthErrorCode.ROLE_NOT_FOUND, 'Role KINE_ADMIN not found (seed missing).');
    }

    const now = new Date();
    const cguVersion = dto.cguVersion ?? '1.0';

    const kineId = new Types.ObjectId();
    const profileId = new Types.ObjectId();

    const cabinet = await this.cabinetsService.create({
      name: dto.cabinetName!,
      ownerId: kineId,
      address: `${dto.street}, ${dto.postalCode} ${dto.city}`,
      legalName: dto.legalName,
      taxRegistrationNumber: dto.siret,
    });

    await this.kinesService.createWithProfile({
      kineId,
      dto: {
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        professionalNumber: dto.professionalNumber,
        verificationStatus: 'PENDING',
        status: 'ACTIVE',
        cguAcceptedAt: now,
        cguVersion,
        cabinetId: cabinet._id,
      } as any,
      profile: {
        profileId,
        cabinetId: cabinet._id,
        roleId: role._id,
        profileType: 'ADMIN_GROUP',
        isActive: true,
        isCabinetAdmin: true,
        customPermissionOverrides: [],
        additionalMetadata: {},
        cguAcceptedAt: now,
        cguVersion,
      },
    });

    return {
      success: true,
      message: 'Account successfully created. Please sign in.',
      email: dto.email,
    };
  }

  private async registerStudent(
    dto: RegisterKineDto,
    justificatifFile?: UploadedFileLike,
  ) {
    await this.assertEmailAvailableForUser(dto.email);

    if (!justificatifFile && !dto.justificatifUrl) {
      throw AppError.badRequest(AuthErrorCode.JUSTIFICATIF_REQUIRED, 'A supporting document is required for a STUDENT profile: provide a file ' +
          "(field 'justificatif' in multipart, PDF/JPG/PNG, max 5 MB) OR a 'justificatifUrl' URL.");
    }

    const role = await this.rolesService.findBySlug('KINE');
    if (!role) {
      throw AppError.notFound(AuthErrorCode.ROLE_NOT_FOUND, 'Role KINE not found (seed missing).');
    }

    const now = new Date();
    const cguVersion = dto.cguVersion ?? '1.0';

    const kineId = new Types.ObjectId();
    const profileId = new Types.ObjectId();

    let justificatifUrl: string | null = dto.justificatifUrl ?? null;
    let justificatifKey: string | null = null;
    if (justificatifFile) {
      const ref = await this.storage.uploadSupportingDocument(justificatifFile, {
        ownerId: kineId.toString(),
        kind: 'justificatif',
      });
      justificatifUrl = ref.url;
      justificatifKey = ref.key;
    }

    await this.kinesService.createWithProfile({
      kineId,
      dto: {
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        status: 'ACTIVE',
        cguAcceptedAt: now,
        cguVersion,
      } as any,
      profile: {
        profileId,
        cabinetId: null,
        roleId: role._id,
        profileType: 'STUDENT',
        isActive: true,
        isCabinetAdmin: false,
        customPermissionOverrides: [],
        additionalMetadata: {
          school: dto.school,
          academicYear: dto.academicYear,
          justificatifUrl,
          justificatifKey,
          city: dto.city ?? null,
        },
        cguAcceptedAt: now,
        cguVersion,
      },
    });

    await this.provisionFictifSandboxForStudent(kineId.toString());

    return {
      success: true,
      message: 'Account successfully created. Please sign in.',
      email: dto.email,
    };
  }

  private async provisionFictifSandboxForStudent(kineId: string): Promise<void> {
    try {
      await this.patientsService.cloneFictifTemplatesForStudent(kineId);
    } catch (err: any) {
      console.error(
        `[fictif-clone] FAILED for student kineId=${kineId}: ${err?.message ?? err}`,
        err?.stack,
      );
    }
  }


  async createKineInvitation(
    inviterKineId: string,
    dto: CreateInvitationDto,
  ): Promise<{
    invitationToken: string;
    invitationUrl: string;
    expiresAt: Date;
    cabinetId: string;
    cabinetName: string | null;
    targetProfileType: InvitationTargetProfileType;
    invitedEmail: string;
    emailDelivered: boolean;
  }> {
    const inviterKine: any = await this.kinesService.findOne(inviterKineId, {
      bypassTenantScope: true,
    });
    if (inviterKine.status !== 'ACTIVE') {
      throw AppError.forbidden(AuthErrorCode.KINE_INACTIVE, 'This account is suspended and cannot issue invitations.');
    }
    const profiles = Array.isArray(inviterKine.profiles)
      ? inviterKine.profiles
      : [];
    const adminProfile = profiles.find(
      (p: any) => p.profileType === 'ADMIN_GROUP' && p.isActive !== false,
    );
    if (!adminProfile) {
      throw AppError.forbidden(AuthErrorCode.PERMISSION_DENIED, 'Only a kine with an active ADMIN_GROUP profile can issue an invitation.');
    }

    const role = await this.rolesService.findBySlug('KINE');
    if (!role) {
      throw AppError.notFound(AuthErrorCode.ROLE_NOT_FOUND, 'Role KINE not found (seed missing).');
    }

    const cabinetIdStr = adminProfile.cabinetId.toString();
    const invitedEmail = dto.email.toLowerCase();
    const { token, expiresAt } = await this.tokensService.signInvitation({
      cabinetId: cabinetIdStr,
      invitedEmail,
      targetProfileType: dto.targetProfileType,
      roleId: role._id.toString(),
      invitedByKineId: inviterKineId,
    });

    const cabinet = await this.cabinetsService
      .findOne(cabinetIdStr)
      .catch(() => null);
    const cabinetName = (cabinet as any)?.name ?? null;

    const baseUrl = requireEnv('FRONTEND_BASE_URL').replace(/\/+$/, '');
    const invitationPath =
      this.config.get<string>('FRONTEND_INVITATION_PATH') ??
      '/kine/accept-invitation';
    const invitationUrl = `${baseUrl}${invitationPath}?token=${encodeURIComponent(token)}`;

    const mailResult = await this.mailer.sendInvitationEmail({
      to: invitedEmail,
      invitationUrl,
      cabinetName,
      targetProfileType: dto.targetProfileType,
      invitedByName:
        [inviterKine.firstName, inviterKine.lastName].filter(Boolean).join(' ') || null,
      expiresAt,
    });

    return {
      invitationToken: token,
      invitationUrl,
      expiresAt,
      cabinetId: cabinetIdStr,
      cabinetName,
      targetProfileType: dto.targetProfileType,
      invitedEmail,
      emailDelivered: mailResult.delivered && mailResult.driver === 'smtp',
    };
  }

  async previewInvitation(invitationToken: string): Promise<{
    accountExists: boolean;
    existingAccountKind: 'kine' | 'admin' | 'patient' | null;
    invitedEmail: string;
    targetProfileType: 'MEMBER' | 'ASSISTANT';
    cabinetId: string;
    cabinetName: string | null;
    roleSlug: string | null;
    expiresAt: Date;
  }> {
    const payload = await this.tokensService.verifyInvitation(invitationToken);

    const existing = await this.findAnyByEmail(payload.invitedEmail);
    const cabinet = await this.cabinetsService
      .findOne(payload.cabinetId)
      .catch(() => null);
    const role = await this.rolesService
      .findOne(payload.roleId)
      .catch(() => null);

    return {
      accountExists: existing !== null,
      existingAccountKind: existing?.kind ?? null,
      invitedEmail: payload.invitedEmail,
      targetProfileType: payload.targetProfileType,
      cabinetId: payload.cabinetId,
      cabinetName: (cabinet as any)?.name ?? null,
      roleSlug: (role as any)?.slug ?? null,
      expiresAt: payload.expiresAt,
    };
  }


  async attachProfileFromInvitation(
    invitationToken: string,
    password: string,
    professionalNumber?: string,
  ) {
    const payload = await this.tokensService.verifyInvitation(invitationToken);

    if (payload.targetProfileType === 'MEMBER' && !professionalNumber) {
      throw AppError.badRequest(AuthErrorCode.PROFESSIONAL_NUMBER_REQUIRED, 'A MEMBER must provide a professional number (ADELI 9 digits or RPPS 11 digits).');
    }
    if (payload.targetProfileType === 'ASSISTANT' && professionalNumber) {
      throw AppError.badRequest(AuthErrorCode.PROFESSIONAL_NUMBER_FORBIDDEN, 'An ASSISTANT must not provide a professional number.');
    }

    const existing = await this.findAnyByEmail(payload.invitedEmail);
    if (!existing || existing.kind !== 'kine') {
      throw AppError.conflict(AuthErrorCode.INVITATION_ACCOUNT_MISMATCH, 'This email does not belong to a kine account. The invitation cannot be attached.');
    }

    const kineForAuth = await this.kinesService.findByEmail(
      payload.invitedEmail,
      true,
    );
    if (!kineForAuth) {
      throw AppError.unauthorized(AuthErrorCode.INVALID_CREDENTIALS, 'Invalid credentials.');
    }
    const valid = await bcrypt.compare(
      password,
      (kineForAuth as any).passwordHash,
    );
    if (!valid) {
      throw AppError.unauthorized(AuthErrorCode.INVALID_CREDENTIALS, 'Invalid credentials.');
    }

    const result = await this.addProfileToKine(existing.id, {
      profileType: payload.targetProfileType as any,
      cabinetId: payload.cabinetId,
      professionalNumber,
      cguAccepted: true,
    } as any);

    await this.tokensService.markInvitationUsed(payload.jti, payload.expiresAt);

    return {
      ...result,
      attached: true,
      kineId: existing.id,
    };
  }

 
  async acceptKineInvitation(dto: AcceptInvitationDto) {
    const payload = await this.tokensService.verifyInvitation(dto.invitationToken);

    if (payload.targetProfileType === 'MEMBER' && !dto.professionalNumber) {
      throw AppError.badRequest(AuthErrorCode.PROFESSIONAL_NUMBER_REQUIRED, 'A MEMBER must provide a professional number (ADELI 9 digits or RPPS 11 digits).');
    }
    if (payload.targetProfileType === 'ASSISTANT' && dto.professionalNumber) {
      throw AppError.badRequest(AuthErrorCode.PROFESSIONAL_NUMBER_FORBIDDEN, 'An ASSISTANT must not provide a professional number.');
    }

    const existing = await this.findAnyByEmail(payload.invitedEmail);
    if (existing) {
      throw AppError.conflict(
        AuthErrorCode.EMAIL_ALREADY_USED,
        'An account already exists with this email. Use POST /kine/auth/invitations/attach to add this profile to your existing account.',
        { existingAccountKind: existing.kind },
      );
    }

    if (payload.targetProfileType === 'MEMBER' && dto.professionalNumber) {
      await this.assertProfessionalNumberAvailable(dto.professionalNumber);
    }

    const now = new Date();
    const cguVersion = dto.cguVersion ?? '1.0';

    const kineId = new Types.ObjectId();
    const profileId = new Types.ObjectId();

    const isCabinetAdminProfile = false;

    await this.kinesService.createWithProfile({
      kineId,
      dto: {
        email: payload.invitedEmail,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        professionalNumber:
          payload.targetProfileType === 'MEMBER' ? dto.professionalNumber : undefined,
        verificationStatus:
          payload.targetProfileType === 'MEMBER' ? 'PENDING' : undefined,
        status: 'ACTIVE',
        cguAcceptedAt: now,
        cguVersion,
      } as any,
      profile: {
        profileId,
        cabinetId: payload.cabinetId,
        roleId: payload.roleId,
        profileType: payload.targetProfileType,
        isActive: true,
        isCabinetAdmin: isCabinetAdminProfile,
        customPermissionOverrides: [],
        additionalMetadata: {
          invitedByKineId: payload.invitedByKineId,
        },
        cguAcceptedAt: now,
        cguVersion,
      },
    });

    await this.tokensService.markInvitationUsed(payload.jti, payload.expiresAt);

    return {
      success: true,
      message: 'Account successfully created. Please sign in.',
      email: payload.invitedEmail,
    };
  }



  async addProfileToKine(
    kineId: string,
    dto: AddKineProfileDto,
    justificatifFile?: UploadedFileLike,
    opts: { scope?: 'self' | 'admin' } = {},
  ) {
    const scope = opts.scope ?? 'self';
    const kine: any = await this.kinesService.findOne(kineId, {
      bypassTenantScope: true,
    });
    if (!kine) {
      throw AppError.notFound(AuthErrorCode.KINE_NOT_FOUND, 'Kine not found.');
    }
    if (kine.status !== 'ACTIVE') {
      throw AppError.forbidden(AuthErrorCode.KINE_INACTIVE, 'Cannot add a profile to an inactive kine.');
    }

    const now = new Date();
    const cguVersion = dto.cguVersion ?? '1.0';

    const storedProfileType = this.resolveStoredProfileType(dto);
    const roleSlug = this.resolveRoleSlugForProfile(storedProfileType);
    const role = await this.rolesService.findBySlug(roleSlug);
    if (!role) {
      throw AppError.notFound(
        AuthErrorCode.ROLE_NOT_FOUND,
        `Role ${roleSlug} not found (seed missing).`,
      );
    }

    const effectiveProfessionalNumber = this.resolveProfessionalNumber(
      storedProfileType,
      dto,
      kine,
    );

    if (
      effectiveProfessionalNumber &&
      effectiveProfessionalNumber !== kine.professionalNumber
    ) {
      await this.assertProfessionalNumberAvailable(
        effectiveProfessionalNumber,
        kineId,
      );
    }

    if (
      effectiveProfessionalNumber &&
      !kine.professionalNumber &&
      dto.professionalNumber
    ) {
      await this.kinesService
        .update(kineId, {
          professionalNumber: effectiveProfessionalNumber,
          verificationStatus: 'PENDING',
        })
        .catch(() => undefined);
    }

    let studentJustificatifUrl: string | null = null;
    let studentJustificatifKey: string | null = null;
    if (storedProfileType === 'STUDENT') {
      if (justificatifFile) {
        const ref = await this.storage.uploadSupportingDocument(justificatifFile, {
          ownerId: kineId,
          kind: 'justificatif',
        });
        studentJustificatifUrl = ref.url;
        studentJustificatifKey = ref.key;
      } else if (dto.justificatifUrl) {
        studentJustificatifUrl = dto.justificatifUrl;
      } else {
        throw AppError.badRequest(AuthErrorCode.STUDENT_JUSTIFICATIF_REQUIRED, "A supporting document is required: provide a file (field 'justificatif' in multipart, PDF/JPG/PNG, max 5 MB) OR a 'justificatifUrl' URL.");
      }
    }

    let cabinetId: string | null = null;
    let cabinetCreated = false;

    if (
      dto.profileType === AddKineProfileType.LIBERAL ||
      dto.profileType === AddKineProfileType.ADMIN_GROUP
    ) {
      const cabinet = await this.cabinetsService.create({
        name: dto.cabinetName!,
        ownerId: kine._id,
        address: `${dto.street}, ${dto.postalCode} ${dto.city}`,
        legalName:
          dto.profileType === AddKineProfileType.ADMIN_GROUP ? dto.legalName : undefined,
        taxRegistrationNumber:
          dto.profileType === AddKineProfileType.ADMIN_GROUP ? dto.siret : undefined,
      });
      cabinetId = cabinet._id.toString();
      cabinetCreated = true;
    } else if (
      dto.profileType === AddKineProfileType.MEMBER ||
      dto.profileType === AddKineProfileType.ASSISTANT
    ) {
      const existingCabinet = await this.cabinetsService
        .findOne(dto.cabinetId!)
        .catch(() => null);
      if (!existingCabinet) {
        throw AppError.notFound(
          AuthErrorCode.CABINET_NOT_FOUND,
          `Cabinet ${dto.cabinetId} not found.`,
        );
      }
      cabinetId = existingCabinet._id.toString();
    }

    this.assertNoDuplicateProfile(kine, storedProfileType, cabinetId);

    const metadata = this.buildProfileMetadata(
      dto,
      storedProfileType,
      studentJustificatifUrl,
      studentJustificatifKey,
      effectiveProfessionalNumber,
    );

    const subscriptionPlanId =
      scope === 'admin' && dto.subscriptionPlanId ? dto.subscriptionPlanId : null;
    const freemium = this.buildFreemiumForProfile(
      storedProfileType,
      subscriptionPlanId,
    );

    await this.kinesService.pushProfile(kineId, {
      cabinetId,
      roleId: role._id,
      profileType: storedProfileType,
      isActive: true,
      customPermissionOverrides: [],
      additionalMetadata: metadata,
      cguAcceptedAt: now,
      cguVersion,
      subscriptionPlanId,
      freemium,
    });

    if (storedProfileType === 'STUDENT') {
      await this.provisionFictifSandboxForStudent(kineId);
    }

    await this.invalidateKineCaches(kine);

    const refreshed: any = await this.kinesService.findOne(kineId, {
      bypassTenantScope: true,
    });

    const allProfiles: any[] = Array.isArray(refreshed.profiles)
      ? refreshed.profiles
      : [];
    const matchedProfile =
      allProfiles.find(
        (p) =>
          p.profileType === storedProfileType &&
          (p.cabinetId ? p.cabinetId.toString() : null) === cabinetId,
      ) ?? allProfiles[allProfiles.length - 1];

    const me = await this.buildKineMe(refreshed);

    return {
      newProfileId: matchedProfile._id.toString(),
      cabinetCreated,
      cabinetId,
      storedProfileType,
      me,
    };
  }

  private resolveStoredProfileType(dto: AddKineProfileDto): KineProfileType {
    if (dto.profileType === AddKineProfileType.LIBERAL) {
      return dto.isReplacement ? 'REMPLACANT' : 'LIBERAL';
    }
    return dto.profileType as KineProfileType;
  }

  private resolveRoleSlugForProfile(stored: KineProfileType): string {
    return stored === 'ADMIN_GROUP' ? 'KINE_ADMIN' : 'KINE';
  }

  private assertNoDuplicateProfile(
    kine: any,
    storedProfileType: KineProfileType,
    cabinetId: string | null,
  ): void {
    const profiles: any[] = Array.isArray(kine.profiles) ? kine.profiles : [];
    const duplicate = profiles.find((p: any) => {
      if (p.profileType !== storedProfileType) return false;
      const pCabinet = p.cabinetId ? p.cabinetId.toString() : null;
      return pCabinet === cabinetId;
    });
    if (duplicate) {
      throw AppError.conflict(
        AuthErrorCode.PROFILE_ALREADY_EXISTS,
        `This kine already has a ${storedProfileType} profile` +
          (cabinetId ? ` on this cabinet.` : `.`),
      );
    }
  }

  
  private resolveProfessionalNumber(
    storedProfileType: KineProfileType,
    dto: AddKineProfileDto,
    kine: any,
  ): string | undefined {
    const l1 = kine?.professionalNumber ?? undefined;
    const fromDto = dto.professionalNumber;

    if (storedProfileType === 'ASSISTANT') {
      if (fromDto) {
        throw AppError.badRequest(AuthErrorCode.PROFESSIONAL_NUMBER_FORBIDDEN, 'An ASSISTANT must not provide a professional number.');
      }
      return undefined;
    }
    if (storedProfileType === 'STUDENT') {
      return undefined;
    }

    const effective = fromDto ?? l1 ?? undefined;
    if (!effective) {
      throw AppError.badRequest(AuthErrorCode.PROFESSIONAL_NUMBER_REQUIRED, 'A professional number (ADELI 9 digits or RPPS 11 digits) is required for this profile type ' +
          'and is not present on your account. Add it to the request.');
    }
    return effective;
  }

  private buildProfileMetadata(
    dto: AddKineProfileDto,
    storedProfileType: KineProfileType,
    studentJustificatifUrl: string | null,
    studentJustificatifKey: string | null,
    effectiveProfessionalNumber: string | undefined,
  ): Record<string, unknown> {
    switch (storedProfileType) {
      case 'LIBERAL':
      case 'REMPLACANT':
        return {
          isReplacement: storedProfileType === 'REMPLACANT',
          professionalNumber: effectiveProfessionalNumber ?? null,
        };
      case 'ADMIN_GROUP':
        return { professionalNumber: effectiveProfessionalNumber ?? null };
      case 'STUDENT':
        return {
          school: dto.school,
          academicYear: dto.academicYear,
          justificatifUrl: studentJustificatifUrl,
          justificatifKey: studentJustificatifKey,
          city: dto.city ?? null,
        };
      case 'MEMBER':
        return { professionalNumber: effectiveProfessionalNumber ?? null };
      case 'ASSISTANT':
        return { professionalNumber: null };
      default:
        return {};
    }
  }

  /**
   * Default freemium window emitted on the profile subdoc at creation time.
   *
   *   | profileType                | default freemium                 |
   *   | -------------------------- | -------------------------------- |
   *   | STUDENT                    | 3 months                         |
   *   | LIBERAL / REMPLACANT       | 30 days trial                    |
   *   | ADMIN_GROUP                | 30 days trial                    |
   *   | MEMBER / ASSISTANT         | none                             |
   *   | any profile with paid plan | none                             |
   */
  private buildFreemiumForProfile(
    storedProfileType: KineProfileType,
    subscriptionPlanId: string | null,
  ): { startedAt: Date; endsAt: Date; consumed: boolean } | undefined {
    if (subscriptionPlanId) return undefined;
    if (storedProfileType === 'MEMBER' || storedProfileType === 'ASSISTANT') {
      return undefined;
    }
    const now = new Date();
    const endsAt = new Date(now);
    const days =
      storedProfileType === 'STUDENT'
        ? this.FREEMIUM_STUDENT_DAYS
        : this.FREEMIUM_TRIAL_DAYS;
    endsAt.setDate(endsAt.getDate() + days);
    return { startedAt: now, endsAt, consumed: false };
  }

  private async invalidateKineCaches(kine: any): Promise<void> {
    const kineId = kine._id.toString();
    await this.caslAbilityFactory.invalidateUser(kineId);
    const profiles: any[] = Array.isArray(kine.profiles) ? kine.profiles : [];
    await Promise.all(
      profiles.map((p: any) =>
        this.caslAbilityFactory.invalidateProfile(p._id.toString()),
      ),
    );
  }


  private async assertProfessionalNumberAvailable(
    professionalNumber: string,
    excludeKineId?: string,
  ): Promise<void> {
    if (!professionalNumber) return;
    const holder = await this.kinesService.findActiveByProfessionalNumber(
      professionalNumber,
      { excludeKineId },
    );
    if (holder) {
      throw AppError.conflict(AuthErrorCode.PROFESSIONAL_NUMBER_ALREADY_USED, 'This professional number is already associated with an active account on the platform.');
    }
  }

  async registerPatient(dto: RegisterPatientDto) {
    const existingPatient = await this.patientsService.findByEmail(dto.email);
    if (existingPatient) {
      throw AppError.conflict(
        AuthErrorCode.EMAIL_ALREADY_USED,
        'An account already exists with this email.',
      );
    }

    const role = await this.rolesService.findBySlug('PATIENT');
    if (!role) {
      throw AppError.notFound(AuthErrorCode.ROLE_NOT_FOUND, 'Role PATIENT not found (seed missing).');
    }

    const uniqueCode = await this.uniqueCodeService.generateUniqueCode();

    await this.patientsService.create({
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      roleId: role._id.toString(),
      uniqueCode,
      phone: dto.phone,
      status: 'NEW',
    });

    return {
      success: true,
      message: 'Account successfully created. Please sign in.',
      email: dto.email,
      uniqueCode,
    };
  }


  async refresh(userId: string, refreshToken: string) {
    await this.tokensService.verifyRefreshToken(userId, refreshToken);

    const found = await this.findAnyById(userId);
    if (!found) {
      throw AppError.notFound(AuthErrorCode.USER_NOT_FOUND, 'User not found.');
    }
    const payload = found.jwtPayload;
    const tokens = await this.tokensService.generateTokens(payload);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string) {
    await this.tokensService.revokeRefreshToken(userId);
    await this.tokensService.bumpTokenVersion(userId);
    try {
      await this.caslAbilityFactory.invalidateUser(userId);
    } catch {
    }
    try {
      const maybeKine: any = await this.kinesService.findOne(userId, {
        bypassTenantScope: true,
      });
      if (maybeKine && Array.isArray(maybeKine.profiles)) {
        await Promise.all(
          maybeKine.profiles.map((p: any) =>
            this.caslAbilityFactory
              .invalidateProfile(p._id.toString())
              .catch(() => undefined),
          ),
        );
      }
    } catch {
      /* not a kine (admin / patient) — perms key already dropped above */
    }
    return { success: true };
  }

  async buildMe(userId: string, expectedKind?: 'admin' | 'kine' | 'patient') {
    if (expectedKind === 'kine') {
      const kine = await this.kinesService
        .findOne(userId, { bypassTenantScope: true })
        .catch(() => null);
      if (!kine || !Array.isArray((kine as any).profiles)) {
        throw AppError.notFound(AuthErrorCode.USER_NOT_FOUND, 'User not found.');
      }
      return this.buildKineMe(kine);
    }

    if (expectedKind === 'admin' || expectedKind === 'patient') {
      const found = await this.findAnyById(userId, expectedKind);
      if (!found) {
        throw AppError.notFound(AuthErrorCode.USER_NOT_FOUND, 'User not found.');
      }
      const { permissions } = await this.caslAbilityFactory.createForUser(
        found.jwtPayload,
      );
      return { user: found.userPublic, permissions };
    }
    let kine: any = null;
    try {
      kine = await this.kinesService.findOne(userId, {
        bypassTenantScope: true,
      });
    } catch {
      kine = null;
    }
    if (kine && Array.isArray(kine.profiles)) {
      return this.buildKineMe(kine);
    }

    const found = await this.findAnyById(userId);
    if (!found) throw AppError.notFound(AuthErrorCode.USER_NOT_FOUND, 'User not found.');

    const { permissions } = await this.caslAbilityFactory.createForUser(
      found.jwtPayload,
    );

    return {
      user: found.userPublic,
      permissions,
    };
  }

 
  private async buildKineMe(kine: any) {
    const kineId = kine._id.toString();
    const profiles = Array.isArray(kine.profiles) ? kine.profiles : [];

    const user = {
      id: kineId,
      firstName: kine.firstName,
      lastName: kine.lastName,
      email: kine.email,
      profilePhoto: kine.profilePhoto ?? null,
      phone: kine.phone ?? null,
      professionalNumber: kine.professionalNumber ?? null,
      verificationStatus: kine.verificationStatus ?? null,
    };

    const lastProfileId = kine.lastProfileId
      ? kine.lastProfileId.toString()
      : null;
    const lastProfileRaw = lastProfileId
      ? profiles.find(
          (p: any) =>
            p._id.toString() === lastProfileId && p.isActive !== false,
        )
      : null;

    if (lastProfileRaw) {
      const profile = await this.buildProfileEnvelope(kineId, lastProfileRaw);
      return {
        user,
        profile,
        permissions: profile.permissions,
      };
    }

    // Null branch — no valid lastProfileId. Emit a summary list so the
    // frontend can show the switcher in the same round-trip.
    const availableProfiles = await Promise.all(
      profiles.map(async (p: any) => {
        const cabinetId = p.cabinetId ? p.cabinetId.toString() : null;
        const [cabinet, role] = await Promise.all([
          cabinetId
            ? this.cabinetsService.findOne(cabinetId).catch(() => null)
            : Promise.resolve(null),
          this.rolesService.findOne(p.roleId.toString()).catch(() => null),
        ]);
        return {
          id: p._id.toString(),
          profileType: p.profileType,
          cabinetId,
          cabinetName: (cabinet as any)?.name ?? null,
          role: {
            slug: (role as any)?.slug ?? null,
          },
          isActive: p.isActive !== false,
          isCabinetAdmin: p.isCabinetAdmin === true,
        };
      }),
    );

    return {
      user,
      profile: null,
      permissions: null,
      availableProfiles,
    };
  }

  async forgotPassword(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    // Rate-limit before the lookup so we don't expose an enumeration surface.
    await this.enforceRateLimit(
      RedisKeys.rateLimitForgot(email),
      RATE_LIMIT.FORGOT_MAX_PER_HOUR,
      REDIS_TTL.RATE_LIMIT_FORGOT,
      AuthErrorCode.RATE_LIMITED,
      'Too many requests. Try again later.',
    );

    const user = await this.findAnyByEmail(email);
    if (user) {
      const code = this.generate6DigitCode();
      const hashed = await bcrypt.hash(code, this.RESET_CODE_BCRYPT_ROUNDS);
      await this.redis.setex(
        RedisKeys.resetCode(email),
        REDIS_TTL.RESET_CODE,
        hashed,
      );
      await this.redis.del(RedisKeys.resetAttempts(email));

      await this.mailer
        .sendPasswordResetEmail({
          to: email,
          code,
          ttlMinutes: Math.floor(REDIS_TTL.RESET_CODE / 60),
        })
        .catch((err) => {
          // Don't surface mailer errors — the code is still in Redis, just log it.
          console.error(
            `[forgotPassword] mailer failed for ${email}: ${err?.message ?? err}`,
          );
        });
    }
    // Same response for known/unknown emails — anti-enumeration.
    return {
      success: true,
      message:
        'Si un compte est associe a cet email, un code de reinitialisation a ete envoye. Verifiez votre boite de reception (et vos spams).',
    };
  }

  async verifyCode(
    email: string,
    code: string,
  ): Promise<{ success: boolean; message: string; resetToken: string }> {
    const attempts = await this.redis.get(RedisKeys.resetAttempts(email));
    if (attempts && Number(attempts) >= this.RESET_MAX_ATTEMPTS) {
      throw AppError.badRequest(AuthErrorCode.CODE_TOO_MANY_ATTEMPTS, 'Too many attempts. Try again later.');
    }

    const hashed = await this.redis.get(RedisKeys.resetCode(email));
    if (!hashed) {
      throw AppError.badRequest(AuthErrorCode.CODE_EXPIRED, 'Code expired or not found.');
    }

    const valid = await bcrypt.compare(code, hashed);
    if (!valid) {
      const newAttempts = await this.redis.incr(RedisKeys.resetAttempts(email));
      if (newAttempts === 1) {
        await this.redis.expire(
          RedisKeys.resetAttempts(email),
          REDIS_TTL.RESET_CODE,
        );
      }
      throw AppError.badRequest(AuthErrorCode.CODE_INVALID, 'Invalid code.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await this.redis.setex(
      RedisKeys.resetToken(email),
      REDIS_TTL.RESET_CODE,
      resetToken,
    );
    await this.redis.del(RedisKeys.resetCode(email));
    await this.redis.del(RedisKeys.resetAttempts(email));

    return {
      success: true,
      message:
        'Code verifie avec succes. Utilisez le resetToken ci-dessous pour definir votre nouveau mot de passe.',
      resetToken,
    };
  }

  async resetPassword(
    email: string,
    resetToken: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    const stored = await this.redis.get(RedisKeys.resetToken(email));
    if (!stored || stored !== resetToken) {
      throw AppError.badRequest(AuthErrorCode.RESET_TOKEN_INVALID, 'Reset token invalid or expired.');
    }

    const user = await this.findAnyByEmail(email);
    if (!user) {
      throw AppError.badRequest(AuthErrorCode.RESET_TOKEN_INVALID, 'Account not found.');
    }

    const newHash = await bcrypt.hash(newPassword, this.BCRYPT_ROUNDS);

    if (user.kind === 'admin') {
      await this.adminsService.update(user.id, { password: newPassword });
    } else if (user.kind === 'kine') {
      await this.kinesService.updatePasswordHash(user.id, newHash);
    } else {
      await this.patientsService.updatePasswordHash(user.id, newHash);
    }

    await this.redis.del(RedisKeys.resetToken(email));

    await this.tokensService.revokeRefreshToken(user.id);
    await this.tokensService.bumpTokenVersion(user.id);
    await this.caslAbilityFactory
      .invalidateUser(user.id)
      .catch(() => undefined);

    return {
      success: true,
      message:
        'Mot de passe reinitialise avec succes. Veuillez vous reconnecter avec votre nouveau mot de passe.',
    };
  }


  private async findAnyById(
    userId: string,
    only?: 'admin' | 'kine' | 'patient',
  ): Promise<null | {
    jwtPayload: {
      sub: string;
      email: string;
      type: string;
      cabinetId: string | null;
      roleSlug: string;
    };
    userPublic: any;
  }> {
    if (!only || only === 'admin') {
      try {
        const admin = await this.adminsService.findOne(userId);
        const role: any = admin.roleId;
        return {
          jwtPayload: {
            sub: admin._id.toString(),
            email: admin.email,
            type: 'admin',
            cabinetId: 'platform',
            roleSlug: role?.slug ?? '',
          },
          userPublic: {
            id: admin._id.toString(),
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            profilePhoto: admin.profilePhoto ?? null,
            cabinetId: 'platform',
            role: { slug: role?.slug },
          },
        };
      } catch {
      }
    }

    if (!only || only === 'kine') {
      try {
        const kine = await this.kinesService.findOne(userId, {
          bypassTenantScope: true,
        });
        const profiles = Array.isArray(kine.profiles) ? kine.profiles : [];
        const activeProfile =
          profiles.find((p: any) => p.isActive !== false) ?? profiles[0] ?? null;
        const profileCabinetId = activeProfile?.cabinetId
          ? activeProfile.cabinetId.toString()
          : null;
        const cabinetIdStr =
          profileCabinetId ?? kine.cabinetId?.toString() ?? null;
        const role = activeProfile
          ? await this.rolesService
              .findOne(activeProfile.roleId.toString())
              .catch(() => null)
          : null;
        const roleSlug = (role as any)?.slug ?? '';
        return {
          jwtPayload: {
            sub: kine._id.toString(),
            email: kine.email,
            type: 'kine',
            cabinetId: cabinetIdStr,
            roleSlug,
          },
          userPublic: {
            id: kine._id.toString(),
            firstName: kine.firstName,
            lastName: kine.lastName,
            email: kine.email,
            profilePhoto: kine.profilePhoto ?? null,
            cabinetId: cabinetIdStr,
            role: { slug: roleSlug || null },
          },
        };
      } catch {
      }
    }

    if (!only || only === 'patient') {
      try {
        const patient = await this.patientsService.findOne(userId, {
          bypassTenantScope: true,
        });
        const role: any = patient.roleId;
        const cabinetIdStr = patient.cabinetId?.toString() ?? null;
        return {
          jwtPayload: {
            sub: patient._id.toString(),
            email: patient.email,
            type: 'patient',
            cabinetId: cabinetIdStr,
            roleSlug: role?.slug ?? '',
          },
          userPublic: {
            id: patient._id.toString(),
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: patient.email,
            profilePhoto: patient.profilePhoto ?? null,
            cabinetId: cabinetIdStr,
            uniqueCode: patient.uniqueCode,
            status: patient.status,
            role: { slug: role?.slug },
          },
        };
      } catch {
      }
    }

    return null;
  }

  private async assertEmailAvailableForUser(email: string): Promise<void> {
    const existing = await this.findAnyByEmail(email);
    if (existing) {
      throw AppError.conflict(AuthErrorCode.EMAIL_ALREADY_USED, 'An account already exists with this email.');
    }
  }

  private async findAnyByEmail(
    email: string,
  ): Promise<{ id: string; kind: 'admin' | 'kine' | 'patient' } | null> {
    const admin = await this.adminsService.findByEmail(email);
    if (admin) {
      return { id: (admin as any)._id.toString(), kind: 'admin' };
    }
    const kine = await this.kinesService.findByEmail(email);
    if (kine) {
      return { id: (kine as any)._id.toString(), kind: 'kine' };
    }
    const patient = await this.patientsService.findByEmail(email);
    if (patient) {
      return { id: (patient as any)._id.toString(), kind: 'patient' };
    }
    return null;
  }

  private async buildAdminSession(admin: any) {
    const role: any = admin.roleId;
    const payload = {
      sub: admin._id.toString(),
      email: admin.email,
      type: 'admin',
      cabinetId: 'platform',
      roleSlug: role?.slug ?? '',
    };
    const { permissions } = await this.caslAbilityFactory.createForUser(payload);
    const tokens = await this.tokensService.generateTokens(payload);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: admin._id.toString(),
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        profilePhoto: admin.profilePhoto ?? null,
        cabinetId: 'platform',
        role: { slug: role?.slug },
      },
      permissions,
    };
  }

  private async buildKineSession(kine: any) {
    const kineId = kine._id.toString();
    const profiles = Array.isArray(kine.profiles) ? kine.profiles : [];

    if (profiles.length === 0) {
      throw AppError.badRequest(AuthErrorCode.PROFILE_NOT_FOUND, 'Kine account has no profile. Contact support — this state should not occur.');
    }

    const envelopes = await Promise.all(
      profiles.map((p: any) => this.buildProfileEnvelope(kineId, p)),
    );

    const active = envelopes.find((e) => e.isActive) ?? envelopes[0];

    const tokenPayload = {
      sub: kineId,
      email: kine.email,
      type: 'kine',
      cabinetId: active.cabinetId,
      roleSlug: active.role?.slug ?? '',
    };
    const tokens = await this.tokensService.generateTokens(tokenPayload);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: kineId,
        firstName: kine.firstName,
        lastName: kine.lastName,
        email: kine.email,
        profilePhoto: kine.profilePhoto ?? null,
        phone: kine.phone ?? null,
        professionalNumber: kine.professionalNumber ?? null,
        verificationStatus: kine.verificationStatus ?? null,
        activeProfileId: active.id,
        cabinetId: active.cabinetId,
        role: active.role,
        profiles: envelopes,
      },
      permissions: active.permissions,
    };
  }

  private async buildKineLoginEnvelope(kine: any) {
    const kineId = kine._id.toString();
    const profiles = Array.isArray(kine.profiles) ? kine.profiles : [];

    const tokenPayload = {
      sub: kineId,
      email: kine.email,
      type: 'kine',
      cabinetId: null,
      roleSlug: '',
    };
    const tokens = await this.tokensService.generateTokens(tokenPayload);

    const profileSummaries = await Promise.all(
      profiles.map(async (p: any) => {
        const cabinetId = p.cabinetId ? p.cabinetId.toString() : null;
        const [cabinet, role] = await Promise.all([
          cabinetId
            ? this.cabinetsService.findOne(cabinetId).catch(() => null)
            : Promise.resolve(null),
          this.rolesService.findOne(p.roleId.toString()).catch(() => null),
        ]);
        return {
          id: p._id.toString(),
          profileType: p.profileType,
          cabinetId,
          cabinetName: (cabinet as any)?.name ?? null,
          role: {
            slug: (role as any)?.slug ?? null,
          },
          isActive: p.isActive !== false,
          isCabinetAdmin: p.isCabinetAdmin === true,
        };
      }),
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: kineId,
        firstName: kine.firstName,
        lastName: kine.lastName,
        email: kine.email,
        profilePhoto: kine.profilePhoto ?? null,
        phone: kine.phone ?? null,
        professionalNumber: kine.professionalNumber ?? null,
        verificationStatus: kine.verificationStatus ?? null,
      },
      profiles: profileSummaries,
      lastProfileId: kine.lastProfileId ? kine.lastProfileId.toString() : null,
    };
  }

  async selectKineProfile(kineId: string, profileId: string) {
    const kine: any = await this.kinesService.findOne(kineId, {
      bypassTenantScope: true,
    });
    if (kine.status !== 'ACTIVE') {
      throw AppError.forbidden(AuthErrorCode.KINE_INACTIVE, 'This account is suspended.');
    }
    const profiles = Array.isArray(kine.profiles) ? kine.profiles : [];
    const profile = profiles.find(
      (p: any) => p._id.toString() === profileId,
    );
    if (!profile) {
      throw AppError.notFound(AuthErrorCode.PROFILE_NOT_FOUND, 'Profile not found or does not belong to this account.');
    }
    if (profile.isActive === false) {
      throw AppError.forbidden(AuthErrorCode.PROFILE_INACTIVE, 'This profile is disabled.');
    }

    await this.kinesService.markProfileSelected(kineId, profileId);

    const envelope = await this.buildProfileEnvelope(kineId, profile);
    return {
      user: {
        id: kineId,
        firstName: kine.firstName,
        lastName: kine.lastName,
        email: kine.email,
        profilePhoto: kine.profilePhoto ?? null,
        phone: kine.phone ?? null,
        professionalNumber: kine.professionalNumber ?? null,
        verificationStatus: kine.verificationStatus ?? null,
      },
      profile: envelope,
      permissions: envelope.permissions,
    };
  }

  private async buildProfileEnvelope(kineId: string, profile: any) {
    const profileId = profile._id.toString();
    const cabinetId = profile.cabinetId ? profile.cabinetId.toString() : null;

    const cabinet = cabinetId
      ? await this.cabinetsService.findOne(cabinetId).catch(() => null)
      : null;
    const role = await this.rolesService
      .findOne(profile.roleId.toString())
      .catch(() => null);

    const payload = {
      sub: kineId,
      email: undefined as any,
      type: 'kine' as const,
      cabinetId,
      roleSlug: role?.slug ?? '',
      profileId,
      customPermissionOverrides: profile.customPermissionOverrides ?? [],
    };

    const { permissions } = await this.caslAbilityFactory.createForUser(
      payload,
    );

    return {
      id: profileId,
      profileType: profile.profileType,
      cabinetId,
      cabinetName: cabinet?.name ?? null,
      roleId: profile.roleId.toString(),
      role: { slug: role?.slug ?? null },
      isActive: profile.isActive !== false,
      isCabinetAdmin: profile.isCabinetAdmin === true,
      subscription: this.buildSubscriptionInfo(profile, cabinet),
      additionalMetadata: profile.additionalMetadata ?? {},
      cguAcceptedAt: profile.cguAcceptedAt ?? null,
      permissions,
    };
  }

  private buildSubscriptionInfo(profile: any, cabinet: any) {
    if (profile.subscriptionPlanId) {
      return {
        planId: profile.subscriptionPlanId.toString(),
        source: 'profile',
      };
    }
    if (cabinet?.planSnapshotId) {
      return {
        planId: cabinet.planSnapshotId.toString(),
        source: 'inherited',
      };
    }
    return { planId: null, source: null };
  }

  private async buildPatientSession(patient: any) {
    const role: any = patient.roleId;
    const cabinetIdStr = patient.cabinetId?.toString() ?? null;
    const payload = {
      sub: patient._id.toString(),
      email: patient.email,
      type: 'patient',
      cabinetId: cabinetIdStr,
      roleSlug: role?.slug ?? '',
    };
    const { permissions } = await this.caslAbilityFactory.createForUser(payload);
    const tokens = await this.tokensService.generateTokens(payload);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: patient._id.toString(),
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        profilePhoto: patient.profilePhoto ?? null,
        cabinetId: cabinetIdStr,
        uniqueCode: patient.uniqueCode,
        status: patient.status,
        role: { slug: role?.slug },
      },
      permissions,
    };
  }

  private generate6DigitCode(): string {
    return String(crypto.randomInt(100000, 1000000));
  }

  private async enforceRateLimit(
    key: string,
    max: number,
    windowSeconds: number,
    code: AuthErrorCode,
    message: string,
  ): Promise<void> {
    try {
      const attempts = await this.redis.incr(key);
      if (attempts === 1) {
        await this.redis.expire(key, windowSeconds);
      }
      if (attempts > max) {
        throw AppError.http(HttpStatus.TOO_MANY_REQUESTS, code, message);
      }
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
    }
  }


  async changePassword(
    userId: string,
    userKind: 'admin' | 'kine' | 'patient',
    dto: ChangePasswordDto,
  ): Promise<{ success: boolean }> {
   
    let user: any;
    if (userKind === 'admin') {
      const admin = await this.adminsService.findOne(userId).catch(() => null);
      user =
        admin && (await this.adminsService.findByEmail((admin as any).email, true));
    } else if (userKind === 'kine') {
      const kine = await this.kinesService
        .findOne(userId, { bypassTenantScope: true })
        .catch(() => null);
      user =
        kine && (await this.kinesService.findByEmail((kine as any).email, true));
    } else {
      const patient = await this.patientsService
        .findOne(userId, { bypassTenantScope: true })
        .catch(() => null);
      user =
        patient &&
        (await this.patientsService.findByEmail(
          (patient as any).email,
          true,
        ));
    }

    if (!user) {
      throw AppError.notFound(AuthErrorCode.USER_NOT_FOUND, 'User not found.');
    }

    const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!ok) {
      throw AppError.unauthorized(AuthErrorCode.INVALID_CREDENTIALS, 'Current password is invalid.');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw AppError.badRequest(AuthErrorCode.PASSWORD_SAME_AS_OLD, 'The new password must be different from the current password.');
    }

    const newHash = await bcrypt.hash(dto.newPassword, this.BCRYPT_ROUNDS);
    if (userKind === 'admin') {
      await this.adminsService.update(userId, { password: dto.newPassword });
    } else if (userKind === 'kine') {
      await this.kinesService.updatePasswordHash(userId, newHash);
    } else {
      await this.patientsService.updatePasswordHash(userId, newHash);
    }

    await this.tokensService.revokeRefreshToken(userId);
    await this.tokensService.bumpTokenVersion(userId);
    await this.caslAbilityFactory
      .invalidateUser(userId)
      .catch(() => undefined);

    return { success: true };
  }


  async updateAdminSelf(userId: string, dto: UpdateAdminSelfDto) {
    const allowed: (keyof UpdateAdminSelfDto)[] = [
      'firstName',
      'lastName',
      'profilePhoto',
    ];
    const patch = this.pickAllowed(dto, allowed);
    await this.adminsService.update(userId, patch);
    const me = await this.findAnyById(userId);
    if (!me) throw AppError.notFound(AuthErrorCode.ADMIN_NOT_FOUND, 'Admin not found.');
    const { permissions } = await this.caslAbilityFactory.createForUser(
      me.jwtPayload,
    );
    return { user: me.userPublic, permissions };
  }

  async updateKineSelf(userId: string, dto: UpdateKineSelfDto) {
    const allowed: (keyof UpdateKineSelfDto)[] = [
      'firstName',
      'lastName',
      'phone',
      'profilePhoto',
      'timezone',
      'language',
    ];
    const patch = this.pickAllowed(dto, allowed);
    await this.kinesService.update(userId, patch);
    const kine = await this.kinesService.findOne(userId, {
      bypassTenantScope: true,
    });
    return this.buildKineMe(kine);
  }

  async updatePatientSelf(userId: string, dto: UpdatePatientSelfDto) {
    const allowed: (keyof UpdatePatientSelfDto)[] = [
      'firstName',
      'lastName',
      'phone',
      'profilePhoto',
      'dateOfBirth',
      'timezone',
      'language',
    ];
    const patch = this.pickAllowed(dto, allowed);
    await this.patientsService.update(userId, patch);
    const me = await this.findAnyById(userId);
    if (!me) throw AppError.notFound(AuthErrorCode.PATIENT_NOT_FOUND, 'Patient not found.');
    const { permissions } = await this.caslAbilityFactory.createForUser(
      me.jwtPayload,
    );
    return { user: me.userPublic, permissions };
  }



  async updateKineProfileSelf(
    kineId: string,
    profileId: string,
    dto: UpdateKineProfileSelfDto,
  ) {
    const kine: any = await this.kinesService.findOne(kineId, {
      bypassTenantScope: true,
    });
    const profiles: any[] = Array.isArray(kine.profiles) ? kine.profiles : [];
    const profile = profiles.find(
      (p: any) => p._id?.toString() === profileId,
    );
    if (!profile) {
      throw AppError.notFound(AuthErrorCode.PROFILE_NOT_FOUND, 'Profile not found for this kine.');
    }

    const patch: Record<string, unknown> = {};

    if (dto.isActive !== undefined) {
      if (dto.isActive === true) {
        throw AppError.forbidden(AuthErrorCode.PROFILE_ACTIVATION_ADMIN_ONLY, 'Reactivating a profile is reserved to SUPER_ADMIN. Contact your platform admin.');
      }
      patch.isActive = false;
    }

    const studentFields: Array<keyof UpdateKineProfileSelfDto> = [
      'school',
      'academicYear',
      'justificatifUrl',
    ];
    const studentTouched = studentFields.some(
      (f) => (dto as any)[f] !== undefined,
    );
    if (studentTouched) {
      if (profile.profileType !== 'STUDENT') {
        throw AppError.badRequest(AuthErrorCode.FIELD_NOT_APPLICABLE, 'The `school` / `academicYear` / `justificatifUrl` fields only apply to STUDENT profiles.');
      }
      if (dto.school !== undefined) patch['additionalMetadata.school'] = dto.school;
      if (dto.academicYear !== undefined)
        patch['additionalMetadata.academicYear'] = dto.academicYear;
      if (dto.justificatifUrl !== undefined)
        patch['additionalMetadata.justificatifUrl'] = dto.justificatifUrl;
    }

    if (Object.keys(patch).length === 0) {
      return this.buildKineMe(kine);
    }

    await this.kinesService.updateProfileById(kineId, profileId, patch);

    await this.caslAbilityFactory
      .invalidateProfile(profileId)
      .catch(() => undefined);

    const refreshed = await this.kinesService.findOne(kineId, {
      bypassTenantScope: true,
    });
    return this.buildKineMe(refreshed);
  }

  private pickAllowed<T extends Record<string, any>, K extends keyof T>(
    dto: T,
    keys: readonly K[],
  ): Partial<Pick<T, K>> {
    const picked: Partial<Pick<T, K>> = {};
    for (const key of keys) {
      if (dto[key] !== undefined) {
        picked[key] = dto[key];
      }
    }
    return picked;
  }
}
