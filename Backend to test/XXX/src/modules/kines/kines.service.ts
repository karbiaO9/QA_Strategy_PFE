import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Kine, KineDocument } from './schemas/kine.schema';
import {
  Cabinet,
  CabinetDocument,
} from '../cabinets/schemas/cabinet.schema';
import { CreateKineDto } from './dto/create-kine.dto';
import { envNumber } from '@common/config/env';
import { AuthErrorCode } from '@common/exceptions/auth-error-codes';
import { AppError } from '@common/exceptions/app-error';
import { KineProfilesService } from '../kine-profiles/kine-profiles.service';

const BCRYPT_ROUNDS = envNumber('BCRYPT_ROUNDS', 12);

@Injectable()
export class KinesService {
  private readonly logger = new Logger(KinesService.name);

  constructor(
    @InjectModel(Kine.name) private kineModel: Model<KineDocument>,
    @InjectModel(Cabinet.name) private cabinetModel: Model<CabinetDocument>,
    private readonly kineProfilesService: KineProfilesService,
  ) {}

  // Loads profiles from the kineprofiles collection and attaches them to the
  // returned kine doc. Best-effort — a Mongo hiccup leaves profiles=[] and
  // logs a warning rather than crashing the request.
  private async attachProfiles<T extends KineDocument | null>(
    kine: T,
  ): Promise<T> {
    if (!kine) return kine;
    try {
      const fresh = await this.kineProfilesService.findByKine(
        (kine as any)._id,
      );
      (kine as any).profiles = fresh;
    } catch (err: any) {
      this.logger.warn(
        `[attachProfiles] kineprofiles read failed for ${(kine as any)._id}: ${err?.message ?? err}`,
      );
      (kine as any).profiles = [];
    }
    return kine;
  }

  async create(dto: CreateKineDto) {
    const { password, ...rest } = dto as any;
    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const created = await this.kineModel.create({
      ...rest,
      passwordHash: hashed,
    });
    const obj: any = created.toObject();
    delete obj.passwordHash;
    return obj;
  }

  // Creates the Kine doc + first profile in one go. Caller pre-allocates
  // both ids so cabinet/file work can happen before the writes land.
  // Invariant: every kine ends up with at least one profile.
  async createWithProfile(args: {
    kineId: Types.ObjectId;
    dto: CreateKineDto & {
      cabinetId?: Types.ObjectId | string | null;
    };
    profile: {
      profileId: Types.ObjectId;
      cabinetId?: Types.ObjectId | string | null;
      roleId: Types.ObjectId | string;
      profileType:
        | 'LIBERAL'
        | 'REMPLACANT'
        | 'ADMIN_GROUP'
        | 'MEMBER'
        | 'STUDENT'
        | 'ASSISTANT';
      isActive?: boolean;
      isCabinetAdmin?: boolean;
      subscriptionPlanId?: Types.ObjectId | string | null;
      customPermissionOverrides?: { permissionId: Types.ObjectId | string; granted: boolean }[];
      additionalMetadata?: Record<string, unknown>;
      cguAcceptedAt?: Date;
      cguVersion?: string;
      freemium?: {
        startedAt?: Date;
        endsAt?: Date;
        consumed?: boolean;
      };
    };
  }) {
    const { kineId, dto, profile } = args;
    const { password, ...rest } = dto as any;
    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const profileSubdoc: any = {
      _id: profile.profileId,
      cabinetId: profile.cabinetId
        ? new Types.ObjectId(String(profile.cabinetId))
        : null,
      roleId: new Types.ObjectId(String(profile.roleId)),
      profileType: profile.profileType,
      isActive: profile.isActive !== false,
      isCabinetAdmin: profile.isCabinetAdmin === true,
      subscriptionPlanId: profile.subscriptionPlanId
        ? new Types.ObjectId(String(profile.subscriptionPlanId))
        : null,
      customPermissionOverrides: profile.customPermissionOverrides ?? [],
      additionalMetadata: profile.additionalMetadata ?? {},
      cguAcceptedAt: profile.cguAcceptedAt,
      cguVersion: profile.cguVersion,
    };
    if (profile.freemium) {
      profileSubdoc.freemium = {
        startedAt: profile.freemium.startedAt ?? new Date(),
        endsAt: profile.freemium.endsAt,
        consumed: profile.freemium.consumed === true,
      };
    }

    // Kine first, then profile — kineId on the profile points back here.
    // lastProfileId is pre-stamped so /me returns Shape A right after register.
    const created = await this.kineModel.create({
      _id: kineId,
      ...rest,
      passwordHash: hashed,
      lastProfileId: profile.profileId,
    });

    await this.kineProfilesService.create({
      _id: profileSubdoc._id,
      kineId,
      cabinetId: profileSubdoc.cabinetId,
      roleId: profileSubdoc.roleId,
      profileType: profileSubdoc.profileType,
      isActive: profileSubdoc.isActive,
      isCabinetAdmin: profileSubdoc.isCabinetAdmin,
      subscriptionPlanId: profileSubdoc.subscriptionPlanId,
      customPermissionOverrides: profileSubdoc.customPermissionOverrides,
      additionalMetadata: profileSubdoc.additionalMetadata,
      cguAcceptedAt: profileSubdoc.cguAcceptedAt,
      cguVersion: profileSubdoc.cguVersion,
      freemium: profileSubdoc.freemium,
    });

    // Attach the just-written profile so callers see the populated shape.
    const obj: any = created.toObject();
    delete obj.passwordHash;
    obj.profiles = [profileSubdoc];
    return obj;
  }

  async findByEmail(email: string, includePassword = false) {
    const query = this.kineModel
      .findOne({ email, status: 'ACTIVE' })
      .setOptions({ bypassTenantScope: true });
    if (includePassword) query.select('+passwordHash');
    const kine = await query.exec();
    return this.attachProfiles(kine);
  }

  async findByEmailOrPhone(emailOrPhone: string, includePassword = false) {
    const query = this.kineModel
      .findOne({
        $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
        status: 'ACTIVE',
      })
      .setOptions({ bypassTenantScope: true });
    if (includePassword) query.select('+passwordHash');
    const kine = await query.exec();
    return this.attachProfiles(kine);
  }

  async findAll() {
    const kines = await this.kineModel.find({ status: 'ACTIVE' }).exec();
    for (const kine of kines) await this.attachProfiles(kine);
    return kines;
  }

  async findOne(id: string, opts: { bypassTenantScope?: boolean } = {}) {
    const query = this.kineModel.findOne({ _id: id });
    if (opts.bypassTenantScope) {
      query.setOptions({ bypassTenantScope: true });
    }
    const kine = await query.exec();
    if (!kine) throw AppError.notFound(AuthErrorCode.KINE_NOT_FOUND, 'Kine not found.');
    await this.attachProfiles(kine);
    return kine;
  }

  async update(id: string, dto: Partial<any>) {
    const ALLOWED_FIELDS = [
      'email',
      'firstName',
      'lastName',
      'phone',
      'profilePhoto',
      'timezone',
      'language',
      'status',
      'professionalNumber',
      'verificationStatus',
      'verifiedAt',
      'verifiedByAdminId',
      'verificationRejectionReason',
      'cguAcceptedAt',
      'cguVersion',
    ] as const;

    const data: Record<string, unknown> = {};
    for (const field of ALLOWED_FIELDS) {
      if ((dto as Record<string, unknown>)[field] !== undefined) {
        data[field] = (dto as Record<string, unknown>)[field];
      }
    }
    if ((dto as Record<string, unknown>).password) {
      data.passwordHash = await bcrypt.hash(
        String((dto as Record<string, unknown>).password),
        12,
      );
    }

    const kine = await this.kineModel
      .findOneAndUpdate({ _id: id }, data, { new: true })
      .exec();
    if (!kine) throw AppError.notFound(AuthErrorCode.KINE_NOT_FOUND, 'Kine not found.');
    return kine;
  }

  async updatePasswordHash(id: string, newHashedPassword: string) {
    return this.kineModel
      .findByIdAndUpdate(id, { passwordHash: newHashedPassword }, { new: true })
      .setOptions({ bypassTenantScope: true })
      .exec();
  }

  async updateCabinetId(id: string, cabinetId: string) {
    return this.kineModel
      .findByIdAndUpdate(id, { cabinetId: new Types.ObjectId(cabinetId) }, { new: true })
      .setOptions({ bypassTenantScope: true })
      .exec();
  }

  async markProfileSelected(kineId: string, profileId: string) {
    return this.kineModel
      .findByIdAndUpdate(
        kineId,
        {
          lastProfileId: new Types.ObjectId(profileId),
          lastLoginAt: new Date(),
        },
        { new: true },
      )
      .setOptions({ bypassTenantScope: true })
      .exec();
  }

  async pushProfile(
    kineId: string,
    profile: {
      cabinetId?: Types.ObjectId | string | null;
      roleId: Types.ObjectId | string;
      profileType:
        | 'LIBERAL'
        | 'REMPLACANT'
        | 'ADMIN_GROUP'
        | 'MEMBER'
        | 'STUDENT'
        | 'ASSISTANT';
      isActive?: boolean;
      subscriptionPlanId?: Types.ObjectId | string | null;
      customPermissionOverrides?: { permissionId: Types.ObjectId | string; granted: boolean }[];
      additionalMetadata?: Record<string, unknown>;
      cguAcceptedAt?: Date;
      cguVersion?: string;
      freemium?: {
        startedAt?: Date;
        endsAt?: Date;
        consumed?: boolean;
      };
    },
  ) {
    const subdoc: any = {
      _id: new Types.ObjectId(),
      cabinetId: profile.cabinetId ? new Types.ObjectId(String(profile.cabinetId)) : null,
      roleId: new Types.ObjectId(String(profile.roleId)),
      profileType: profile.profileType,
      isActive: profile.isActive !== false,
      subscriptionPlanId: profile.subscriptionPlanId
        ? new Types.ObjectId(String(profile.subscriptionPlanId))
        : null,
      customPermissionOverrides: profile.customPermissionOverrides ?? [],
      additionalMetadata: profile.additionalMetadata ?? {},
      cguAcceptedAt: profile.cguAcceptedAt,
      cguVersion: profile.cguVersion,
    };
    if (profile.freemium) {
      subdoc.freemium = {
        startedAt: profile.freemium.startedAt ?? new Date(),
        endsAt: profile.freemium.endsAt,
        consumed: profile.freemium.consumed === true,
      };
    }
    await this.kineProfilesService.create({
      _id: subdoc._id,
      kineId: kineId as any,
      cabinetId: subdoc.cabinetId,
      roleId: subdoc.roleId,
      profileType: subdoc.profileType,
      isActive: subdoc.isActive,
      isCabinetAdmin: subdoc.isCabinetAdmin,
      subscriptionPlanId: subdoc.subscriptionPlanId,
      customPermissionOverrides: subdoc.customPermissionOverrides,
      additionalMetadata: subdoc.additionalMetadata,
      cguAcceptedAt: subdoc.cguAcceptedAt,
      cguVersion: subdoc.cguVersion,
      freemium: subdoc.freemium,
    });

    // Re-fetch so the returned doc has the new profile attached.
    return this.findOne(kineId, { bypassTenantScope: true });
  }

  async remove(id: string) {

    const ownedCabinet = await this.cabinetModel
      .findOne({ ownerId: new Types.ObjectId(id) })
      .lean()
      .exec();
    if (ownedCabinet) {
      throw AppError.badRequest(
        AuthErrorCode.KINE_OWNS_CABINET,
        `This kine owns the cabinet "${ownedCabinet.name}". ` +
          `Transfer cabinet ownership to another kine before deactivating this account.`,
      );
    }

    const kine = await this.kineModel
      .findOneAndUpdate({ _id: id }, { status: 'INACTIVE' }, { new: true })
      .exec();
    if (!kine) throw AppError.notFound(AuthErrorCode.KINE_NOT_FOUND, 'Kine not found.');
    return kine;
  }

  
  async updateProfileById(
    kineId: string,
    profileId: string,
    patch: Record<string, unknown>,
  ) {
    if (Object.keys(patch).length === 0) {
      return this.findOne(kineId, { bypassTenantScope: true });
    }

    const $set: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) {
      $set[`profiles.$[elem].${k}`] = v;
    }

    // 404 if the profile doesn't exist or belongs to another kine.
    const profile = await this.kineProfilesService.findOne(profileId);
    if (
      !profile ||
      String((profile as any).kineId) !== String(kineId)
    ) {
      throw AppError.notFound(AuthErrorCode.PROFILE_NOT_FOUND, 'Profile not found for this kine.');
    }
    await this.kineProfilesService.update(profileId, patch as any);
    return this.findOne(kineId, { bypassTenantScope: true });
  }


  async findActiveByProfessionalNumber(
    professionalNumber: string,
    opts: { excludeKineId?: string } = {},
  ) {
    const filter: Record<string, unknown> = {
      professionalNumber,
      status: 'ACTIVE',
    };
    if (opts.excludeKineId) {
      filter._id = { $ne: new Types.ObjectId(opts.excludeKineId) };
    }
    return this.kineModel
      .findOne(filter)
      .setOptions({ bypassTenantScope: true })
      .lean()
      .exec();
  }


  async listByVerificationStatus(
    status: 'PENDING' | 'VERIFIED' | 'REJECTED' = 'PENDING',
    opts: { limit?: number; skip?: number } = {},
  ) {
    const limit = Math.max(1, Math.min(200, opts.limit ?? 50));
    const skip = Math.max(0, opts.skip ?? 0);
    return this.kineModel
      .find({ verificationStatus: status, status: 'ACTIVE' })
      .setOptions({ bypassTenantScope: true })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  }

  async updateVerification(
    kineId: string,
    adminId: string,
    decision: 'APPROVE' | 'REJECT' | 'RESET',
    rejectionReason?: string,
  ) {
    const patch: Record<string, unknown> = {
      verifiedAt: new Date(),
      verifiedByAdminId: new Types.ObjectId(adminId),
    };
    if (decision === 'APPROVE') {
      patch.verificationStatus = 'VERIFIED';
      patch.verificationRejectionReason = null;
    } else if (decision === 'REJECT') {
      if (!rejectionReason || rejectionReason.trim().length < 3) {
        throw AppError.badRequest(AuthErrorCode.REJECTION_REASON_REQUIRED, 'A reason (3 characters minimum) is required to reject a verification.');
      }
      patch.verificationStatus = 'REJECTED';
      patch.verificationRejectionReason = rejectionReason.trim();
    } else {
      patch.verificationStatus = 'PENDING';
      patch.verificationRejectionReason = null;
    }

    const kine = await this.kineModel
      .findByIdAndUpdate(kineId, patch, { new: true })
      .setOptions({ bypassTenantScope: true })
      .exec();
    if (!kine) throw AppError.notFound(AuthErrorCode.KINE_NOT_FOUND, 'Kine not found.');
    return kine;
  }
}
