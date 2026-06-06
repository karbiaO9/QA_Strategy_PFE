import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  KineProfile,
  KineProfileDocument,
} from './schemas/kine-profile.schema';
import type { ProfileType } from '../kines/schemas/kine.schema';
import { AuthErrorCode } from '@common/exceptions/auth-error-codes';
import { AppError } from '@common/exceptions/app-error';

// CRUD + lookups for the kineprofiles collection. Access control happens
// at the kine level (via kineId), so writes bypass the cabinet tenant scope.
@Injectable()
export class KineProfilesService {
  constructor(
    @InjectModel(KineProfile.name)
    private readonly profileModel: Model<KineProfileDocument>,
  ) {}

  // The optional `_id` lets callers (e.g. registration / migration) preserve
  // a pre-allocated id so `lastProfileId` keeps pointing at the right doc.
  async create(input: {
    _id?: Types.ObjectId;
    kineId: Types.ObjectId | string;
    cabinetId?: Types.ObjectId | string | null;
    roleId: Types.ObjectId | string;
    profileType: ProfileType;
    isActive?: boolean;
    isCabinetAdmin?: boolean;
    subscriptionPlanId?: Types.ObjectId | string | null;
    customPermissionOverrides?: Array<{
      permissionId: Types.ObjectId | string;
      granted: boolean;
    }>;
    additionalMetadata?: Record<string, unknown>;
    cguAcceptedAt?: Date;
    cguVersion?: string;
    freemium?: {
      startedAt?: Date;
      endsAt?: Date;
      consumed?: boolean;
    };
  }): Promise<KineProfileDocument> {
    const doc: any = {
      kineId: new Types.ObjectId(input.kineId),
      cabinetId: input.cabinetId ? new Types.ObjectId(input.cabinetId) : null,
      roleId: new Types.ObjectId(input.roleId),
      profileType: input.profileType,
      isActive: input.isActive ?? true,
      isCabinetAdmin: input.isCabinetAdmin ?? false,
      subscriptionPlanId: input.subscriptionPlanId
        ? new Types.ObjectId(input.subscriptionPlanId)
        : null,
      customPermissionOverrides: (input.customPermissionOverrides ?? []).map(
        (o) => ({
          permissionId: new Types.ObjectId(o.permissionId),
          granted: o.granted,
        }),
      ),
      additionalMetadata: input.additionalMetadata ?? {},
      cguAcceptedAt: input.cguAcceptedAt,
      cguVersion: input.cguVersion,
      freemium: input.freemium,
    };
    if (input._id) doc._id = input._id;
    return this.profileModel.create(doc);
  }

  // Bulk insert that copies docs verbatim (no schema defaults applied).
  async insertManyRaw(docs: any[]): Promise<void> {
    if (!docs.length) return;
    await this.profileModel.insertMany(docs, {
      bypassTenantScope: true,
      ordered: false,
    } as any);
  }

  async findOne(id: string | Types.ObjectId): Promise<KineProfileDocument | null> {
    return this.profileModel
      .findById(new Types.ObjectId(id))
      .setOptions({ bypassTenantScope: true })
      .exec();
  }

  // Strict lookup — 404 if the profile is missing or owned by a different kine.
  async findOneByIdAndKine(
    id: string | Types.ObjectId,
    kineId: string | Types.ObjectId,
  ): Promise<KineProfileDocument> {
    const profile = await this.profileModel
      .findOne({
        _id: new Types.ObjectId(id),
        kineId: new Types.ObjectId(kineId),
      })
      .setOptions({ bypassTenantScope: true })
      .exec();
    if (!profile) {
      throw AppError.notFound(AuthErrorCode.PROFILE_NOT_FOUND, 'Profile not found.');
    }
    return profile;
  }

  async findByKine(
    kineId: string | Types.ObjectId,
  ): Promise<KineProfileDocument[]> {
    return this.profileModel
      .find({ kineId: new Types.ObjectId(kineId) })
      .setOptions({ bypassTenantScope: true })
      .sort({ createdAt: 1 })
      .exec();
  }

  async findActiveByKine(
    kineId: string | Types.ObjectId,
  ): Promise<KineProfileDocument[]> {
    return this.profileModel
      .find({ kineId: new Types.ObjectId(kineId), isActive: true })
      .setOptions({ bypassTenantScope: true })
      .sort({ createdAt: 1 })
      .exec();
  }

  // Detect a same-type/same-cabinet duplicate. cabinetId === null is matched
  // exactly (STUDENT case), not as "any cabinet".
  async findByKineTypeAndCabinet(
    kineId: string | Types.ObjectId,
    profileType: ProfileType,
    cabinetId: string | Types.ObjectId | null,
  ): Promise<KineProfileDocument | null> {
    return this.profileModel
      .findOne({
        kineId: new Types.ObjectId(kineId),
        profileType,
        cabinetId: cabinetId ? new Types.ObjectId(cabinetId) : null,
      })
      .setOptions({ bypassTenantScope: true })
      .exec();
  }

  async update(
    id: string | Types.ObjectId,
    patch: Partial<KineProfile>,
  ): Promise<KineProfileDocument | null> {
    return this.profileModel
      .findByIdAndUpdate(new Types.ObjectId(id), { $set: patch }, { new: true })
      .setOptions({ bypassTenantScope: true })
      .exec();
  }

  async remove(id: string | Types.ObjectId): Promise<void> {
    await this.profileModel
      .findByIdAndDelete(new Types.ObjectId(id))
      .setOptions({ bypassTenantScope: true })
      .exec();
  }

  async count(): Promise<number> {
    return this.profileModel
      .countDocuments({})
      .setOptions({ bypassTenantScope: true })
      .exec();
  }
}
