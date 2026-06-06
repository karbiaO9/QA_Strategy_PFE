import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Request } from 'express';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SKIP_PROFILE_GUARD_KEY } from '../decorators/skip-profile-guard.decorator';
import { AuthErrorCode } from '../exceptions/auth-error-codes';
import { AppError } from '../exceptions/app-error';
import { TenantContextService } from '../context/tenant-context.service';
import {
  Kine,
  KineDocument,
} from '../../modules/kines/schemas/kine.schema';
import { KineProfilesService } from '../../modules/kine-profiles/kine-profiles.service';

interface JwtPayload {
  sub: string;
  type: 'kine' | 'patient' | 'admin';
  email?: string;
  cabinetId?: string;
  roleSlug?: string;
}

const PROFILE_HEADER = 'x-profile-id';

@Injectable()
export class ProfileGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectModel(Kine.name)
    private readonly kineModel: Model<KineDocument>,
    private readonly kineProfilesService: KineProfilesService,
    private readonly tenantCtx: TenantContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const skipProfile = this.reflector.getAllAndOverride<boolean>(
      SKIP_PROFILE_GUARD_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skipProfile) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const user = (req as any).user as JwtPayload | undefined;

    if (!user || user.type !== 'kine') return true;

    const headerValue = req.headers[PROFILE_HEADER];
    const profileId = Array.isArray(headerValue) ? headerValue[0] : headerValue;

    if (!profileId) {
      throw AppError.badRequest(AuthErrorCode.PROFILE_HEADER_MISSING, 'X-Profile-Id header is required for kine requests.');
    }

    if (!Types.ObjectId.isValid(profileId)) {
      throw AppError.badRequest(AuthErrorCode.PROFILE_ID_INVALID, 'X-Profile-Id must be a valid Mongo ObjectId.');
    }

    // Fetch kine status + profile in parallel.
    const [kine, profile] = await Promise.all([
      this.kineModel
        .findById(new Types.ObjectId(user.sub), { status: 1 })
        .setOptions({ bypassTenantScope: true })
        .lean()
        .exec(),
      this.kineProfilesService
        .findOne(profileId)
        .catch(() => null),
    ]);

    if (!kine) {
      throw AppError.forbidden(AuthErrorCode.PROFILE_NOT_FOUND, 'Profile not found or does not belong to the user.');
    }

    if (kine.status !== 'ACTIVE') {
      throw AppError.forbidden(AuthErrorCode.KINE_INACTIVE, 'Kine account suspended.');
    }

    if (!profile || String((profile as any).kineId) !== String(user.sub)) {
      throw AppError.forbidden(AuthErrorCode.PROFILE_NOT_FOUND, 'Profile not found or does not belong to the user.');
    }

    if (!profile.isActive) {
      throw AppError.forbidden(AuthErrorCode.PROFILE_INACTIVE, 'This profile is disabled.');
    }

    (req as any).profile = profile;
    const cabinetId = profile.cabinetId ? String(profile.cabinetId) : '';
    (req as any).user = {
      ...user,
      profileId: String(profile._id),
      cabinetId,
    };

    if (user.sub && user.type) {
      this.tenantCtx.set({
        userId: user.sub,
        userType: user.type,
        cabinetId,
        roleSlug: user.roleSlug ?? '',
      });
    }

    return true;
  }
}
