import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  Patient,
  PatientDocument,
  PatientSource,
} from './schemas/patient.schema';
import { CreatePatientDto } from './dto/create-patient.dto';
import { envNumber } from '@common/config/env';
import { AuthErrorCode } from '@common/exceptions/auth-error-codes';
import { AppError } from '@common/exceptions/app-error';

const BCRYPT_ROUNDS = envNumber('BCRYPT_ROUNDS', 12);

const FICTIF_UNIQUE_CODE_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const FICTIF_UNIQUE_CODE_LENGTH = 12;

export type ListPatientsFilter = {
  source?: PatientSource | 'all';
  ownerId?: string;
};

@Injectable()
export class PatientsService implements OnModuleInit {
  private readonly logger = new Logger(PatientsService.name);

  constructor(
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
  ) {}

  // Boot-time canary: warn if the seed didn't run, otherwise STUDENT
  // sandboxes silently come up empty.
  async onModuleInit(): Promise<void> {
    try {
      const tplCount = await this.patientModel
        .countDocuments({ isTemplate: true, source: 'fictif' })
        .setOptions({ includeTemplates: true, bypassTenantScope: true })
        .exec();
      if (tplCount === 0) {
        this.logger.warn(
          '[fictif] No fictif patient templates found in DB. ' +
            'STUDENT registrations will provision an EMPTY sandbox until the seed runs.',
        );
      } else {
        this.logger.log(
          `[fictif] ${tplCount} fictif patient template(s) available for STUDENT sandbox provisioning.`,
        );
      }
    } catch (err: any) {
      this.logger.warn(
        `[fictif] Could not check fictif template count at startup: ${err?.message ?? err}`,
      );
    }
  }

  async create(dto: CreatePatientDto & { uniqueCode: string; status?: string }) {
    const { password, ...rest } = dto as any;
    const data: any = { ...rest };
    if (password) {
      data.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    }
    const created = await this.patientModel.create(data);
    const obj: any = created.toObject();
    delete obj.passwordHash;
    return obj;
  }

  async findByOAuth(provider: 'GOOGLE' | 'APPLE', providerId: string) {
    return this.patientModel
      .findOne({
        'oauth.provider': provider,
        'oauth.providerId': providerId,
        status: { $ne: 'INACTIVE' },
      })
      .setOptions({ bypassTenantScope: true })
      .populate('roleId')
      .exec();
  }

  /**
   * Resolve a patient from a verified OAuth identity.
   *
   * Branches:
   *   1) Patient already linked by (provider, providerId) → return as-is.
   *   2) Patient with the same email exists, no oauth attached → link oauth, return.
   *   3) Patient with the same email exists, oauth attached to a *different* providerId →
   *      refuse (OAUTH_ACCOUNT_MISMATCH).
   *   4) No match → caller creates a fresh patient.
   *
   * Caller must have already verified the OAuth token (signature + email_verified=true).
   */
  async findOrLinkByOAuth(input: {
    provider: 'GOOGLE' | 'APPLE';
    providerId: string;
    email: string;
  }): Promise<PatientDocument | null> {
    const byProvider = await this.findByOAuth(input.provider, input.providerId);
    if (byProvider) return byProvider;

    const byEmail = await this.patientModel
      .findOne({
        email: input.email,
        status: { $ne: 'INACTIVE' },
      })
      .setOptions({ bypassTenantScope: true })
      .populate('roleId')
      .exec();

    if (!byEmail) return null;

    if (byEmail.oauth && byEmail.oauth.providerId !== input.providerId) {
      throw AppError.conflict(AuthErrorCode.OAUTH_ACCOUNT_MISMATCH, 'This email is already linked to a different OAuth identity. Sign in with the original method.');
    }

    if (!byEmail.oauth) {
      byEmail.oauth = {
        provider: input.provider,
        providerId: input.providerId,
      };
      await byEmail.save();
    }
    return byEmail;
  }

  async findByEmail(email: string, includePassword = false) {
    const query = this.patientModel
      .findOne({ email, status: { $ne: 'INACTIVE' } })
      .setOptions({ bypassTenantScope: true });
    if (includePassword) query.select('+passwordHash');
    return query.populate('roleId').exec();
  }

  async findByEmailOrPhone(emailOrPhone: string, includePassword = false) {
    const query = this.patientModel
      .findOne({
        $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
        status: { $ne: 'INACTIVE' },
      })
      .setOptions({ bypassTenantScope: true });
    if (includePassword) query.select('+passwordHash');
    return query.populate('roleId').exec();
  }

  async findByUniqueCode(code: string) {
    return this.patientModel
      .findOne({ uniqueCode: code, status: { $ne: 'INACTIVE' } })
      .setOptions({ bypassTenantScope: true })
      .populate('roleId')
      .exec();
  }

  async isUniqueCodeTaken(code: string): Promise<boolean> {
    const exists = await this.patientModel
      .findOne({ uniqueCode: code })
      .setOptions({ bypassTenantScope: true, includeTemplates: true })
      .lean()
      .exec();
    return !!exists;
  }

  async findAll(filter: ListPatientsFilter = {}) {
    const where: Record<string, any> = { status: { $ne: 'INACTIVE' } };
    if (filter.source && filter.source !== 'all') {
      where.source = filter.source;
    }
    if (filter.ownerId) {
      where.ownerId = new Types.ObjectId(filter.ownerId);
    }
    return this.patientModel.find(where).populate('roleId').exec();
  }

  async findOne(id: string, opts: { bypassTenantScope?: boolean } = {}) {
    const query = this.patientModel.findOne({ _id: id }).populate('roleId');
    if (opts.bypassTenantScope) {
      query.setOptions({ bypassTenantScope: true });
    }
    const patient = await query.exec();
    if (!patient) throw AppError.notFound(AuthErrorCode.PATIENT_NOT_FOUND, 'Patient not found.');
    return patient;
  }

  async update(id: string, dto: Partial<any>) {
    const data: any = { ...dto };
    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
      delete data.password;
    }
    const patient = await this.patientModel
      .findOneAndUpdate({ _id: id }, data, { new: true })
      .populate('roleId')
      .exec();
    if (!patient) throw AppError.notFound(AuthErrorCode.PATIENT_NOT_FOUND, 'Patient not found.');
    return patient;
  }

  async updatePasswordHash(id: string, newHashedPassword: string) {
    return this.patientModel
      .findByIdAndUpdate(id, { passwordHash: newHashedPassword }, { new: true })
      .setOptions({ bypassTenantScope: true })
      .exec();
  }

  async updateCabinetId(id: string, cabinetId: string) {
    return this.patientModel
      .findByIdAndUpdate(id, { cabinetId: new Types.ObjectId(cabinetId) }, { new: true })
      .setOptions({ bypassTenantScope: true })
      .exec();
  }

  async linkToKine(patientId: string, kineId: string, cabinetId: string) {
    return this.patientModel
      .findByIdAndUpdate(
        patientId,
        {
          ownerId: new Types.ObjectId(kineId),
          cabinetId: new Types.ObjectId(cabinetId),
          status: 'ACTIVE',
          linkedAt: new Date(),
          linkedByKineId: new Types.ObjectId(kineId),
        },
        { new: true },
      )
      .setOptions({ bypassTenantScope: true })
      .exec();
  }

  async remove(id: string) {
    const patient = await this.patientModel
      .findOneAndUpdate({ _id: id }, { status: 'INACTIVE' }, { new: true })
      .exec();
    if (!patient) throw AppError.notFound(AuthErrorCode.PATIENT_NOT_FOUND, 'Patient not found.');
    return patient;
  }

  // Clones the fictif templates into per-student sandbox patients.
  // Idempotent: returns 0 if the kine already has fictif rows.
  async cloneFictifTemplatesForStudent(kineId: string): Promise<number> {
    const ownerObjectId = new Types.ObjectId(kineId);

    const existingCount = await this.patientModel
      .countDocuments({ ownerId: ownerObjectId, source: 'fictif' })
      .setOptions({ bypassTenantScope: true })
      .exec();
    if (existingCount > 0) {
      this.logger.log(
        `[fictif-clone] Skip: kine ${kineId} already owns ${existingCount} fictif patient(s).`,
      );
      return 0;
    }

    const templates = await this.patientModel
      .find({ isTemplate: true, source: 'fictif' })
      .setOptions({ bypassTenantScope: true, includeTemplates: true })
      .lean()
      .exec();
    if (templates.length === 0) {
      this.logger.warn(
        `[fictif-clone] No fictif templates in DB — kine ${kineId} sandbox is empty.`,
      );
      return 0;
    }

    const kineSuffix = kineId.slice(-6);
    const now = new Date();
    const docs: any[] = [];
    for (let templateIndex = 0; templateIndex < templates.length; templateIndex++) {
      const template: any = templates[templateIndex];
      const ordinal = String(templateIndex + 1).padStart(2, '0');
      docs.push({
        email: `sandbox-${kineSuffix}-${ordinal}@sandbox.physioandconnect.local`,
        firstName: template.firstName,
        lastName: template.lastName,
        roleId: template.roleId,
        ownerId: ownerObjectId,
        cabinetId: null,
        uniqueCode: await this.generateFictifUniqueCode(),
        dateOfBirth: template.dateOfBirth,
        address: template.address,
        timezone: template.timezone ?? 'Europe/Paris',
        language: template.language ?? 'fr',
        status: 'ACTIVE',
        linkedAt: now,
        linkedByKineId: ownerObjectId,
        source: 'fictif',
        isTemplate: false,
        templateId: template._id,
      });
    }

    // Skip the tenant scope — fictif patients live outside any cabinet.
    await this.patientModel.insertMany(docs, {
      bypassTenantScope: true,
    } as any);

    this.logger.log(
      `[fictif-clone] Provisioned ${docs.length} fictif patient(s) for kine ${kineId}.`,
    );
    return docs.length;
  }

  private async generateFictifUniqueCode(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const bytes = crypto.randomBytes(FICTIF_UNIQUE_CODE_LENGTH);
      let code = '';
      for (let position = 0; position < FICTIF_UNIQUE_CODE_LENGTH; position++) {
        code += FICTIF_UNIQUE_CODE_CHARSET[bytes[position] % FICTIF_UNIQUE_CODE_CHARSET.length];
      }
      const taken = await this.patientModel
        .findOne({ uniqueCode: code })
        .setOptions({ bypassTenantScope: true, includeTemplates: true })
        .lean()
        .exec();
      if (!taken) return code;
    }
    throw new Error(
      'Could not generate a unique fictif uniqueCode after 5 attempts.',
    );
  }
}
