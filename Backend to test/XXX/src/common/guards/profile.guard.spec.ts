import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Types } from 'mongoose';

import { ProfileGuard } from './profile.guard';
import { AuthErrorCode } from '../exceptions/auth-error-codes';
import { TenantContextService } from '../context/tenant-context.service';

describe('ProfileGuard', () => {
  let guard: ProfileGuard;
  let reflector: Reflector;
  let kineModel: any;
  let kineProfilesService: any;
  let tenantCtx: TenantContextService;

  const kineId = new Types.ObjectId();
  const profileId = new Types.ObjectId();
  const cabinetId = new Types.ObjectId();
  const roleId = new Types.ObjectId();

  const activeProfile = {
    _id: profileId,
    kineId,
    cabinetId,
    roleId,
    profileType: 'LIBERAL',
    isActive: true,
    customPermissionOverrides: [],
    additionalMetadata: {},
  };

  const buildCtx = (opts: {
    isPublic?: boolean;
    user?: any;
    profileHeader?: string | undefined;
  }): { ctx: ExecutionContext; req: any } => {
    const req: any = {
      user: opts.user,
      headers: {
        ...(opts.profileHeader !== undefined
          ? { 'x-profile-id': opts.profileHeader }
          : {}),
      },
    };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => req }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(
      opts.isPublic ?? false,
    );
    return { ctx, req };
  };

  // Phase 3 — guard now does TWO parallel reads:
  //   - kineModel.findById(...).exec() returns { status }
  //   - kineProfilesService.findOne(...) returns the profile doc
  const mockReads = (kine: any, profile: any) => {
    const chain = {
      setOptions: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(kine),
    };
    kineModel.findById = jest.fn().mockReturnValue(chain);
    kineProfilesService.findOne = jest.fn().mockResolvedValue(profile);
    return chain;
  };

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    kineModel = {};
    kineProfilesService = {};
    tenantCtx = { set: jest.fn() } as any;
    guard = new ProfileGuard(
      reflector,
      kineModel,
      kineProfilesService,
      tenantCtx,
    );
  });

  it('skips on @Public() routes', async () => {
    const { ctx } = buildCtx({ isPublic: true });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('skips for non-kine user types (admin / patient)', async () => {
    const { ctx } = buildCtx({
      user: { sub: 'abc', type: 'admin' },
    });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(kineModel.findById).toBeUndefined();
    expect(kineProfilesService.findOne).toBeUndefined();
  });

  it('throws 400 PROFILE_HEADER_MISSING when header is absent', async () => {
    const { ctx } = buildCtx({
      user: { sub: kineId.toString(), type: 'kine' },
    });
    await expect(guard.canActivate(ctx)).rejects.toMatchObject({
      response: { code: AuthErrorCode.PROFILE_HEADER_MISSING },
    });
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('throws 400 PROFILE_ID_INVALID when header is not a valid ObjectId', async () => {
    const { ctx } = buildCtx({
      user: { sub: kineId.toString(), type: 'kine' },
      profileHeader: 'not-an-object-id',
    });
    await expect(guard.canActivate(ctx)).rejects.toMatchObject({
      response: { code: AuthErrorCode.PROFILE_ID_INVALID },
    });
  });

  it('throws 403 PROFILE_NOT_FOUND when kine lookup returns null', async () => {
    mockReads(null, activeProfile);
    const { ctx } = buildCtx({
      user: { sub: kineId.toString(), type: 'kine' },
      profileHeader: profileId.toString(),
    });
    await expect(guard.canActivate(ctx)).rejects.toMatchObject({
      response: { code: AuthErrorCode.PROFILE_NOT_FOUND },
    });
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('throws 403 PROFILE_NOT_FOUND when profile lookup returns null', async () => {
    mockReads({ status: 'ACTIVE' }, null);
    const { ctx } = buildCtx({
      user: { sub: kineId.toString(), type: 'kine' },
      profileHeader: profileId.toString(),
    });
    await expect(guard.canActivate(ctx)).rejects.toMatchObject({
      response: { code: AuthErrorCode.PROFILE_NOT_FOUND },
    });
  });

  it('throws 403 PROFILE_NOT_FOUND when profile.kineId !== user.sub', async () => {
    const otherKineId = new Types.ObjectId();
    mockReads(
      { status: 'ACTIVE' },
      { ...activeProfile, kineId: otherKineId },
    );
    const { ctx } = buildCtx({
      user: { sub: kineId.toString(), type: 'kine' },
      profileHeader: profileId.toString(),
    });
    await expect(guard.canActivate(ctx)).rejects.toMatchObject({
      response: { code: AuthErrorCode.PROFILE_NOT_FOUND },
    });
  });

  it('throws 403 KINE_INACTIVE when kine.status !== ACTIVE', async () => {
    mockReads({ status: 'INACTIVE' }, activeProfile);
    const { ctx } = buildCtx({
      user: { sub: kineId.toString(), type: 'kine' },
      profileHeader: profileId.toString(),
    });
    await expect(guard.canActivate(ctx)).rejects.toMatchObject({
      response: { code: AuthErrorCode.KINE_INACTIVE },
    });
  });

  it('throws 403 PROFILE_INACTIVE when the matched profile is disabled', async () => {
    mockReads(
      { status: 'ACTIVE' },
      { ...activeProfile, isActive: false },
    );
    const { ctx } = buildCtx({
      user: { sub: kineId.toString(), type: 'kine' },
      profileHeader: profileId.toString(),
    });
    await expect(guard.canActivate(ctx)).rejects.toMatchObject({
      response: { code: AuthErrorCode.PROFILE_INACTIVE },
    });
  });

  it('happy path: attaches request.profile + sets CLS cabinetId', async () => {
    mockReads({ status: 'ACTIVE' }, activeProfile);
    const { ctx, req } = buildCtx({
      user: {
        sub: kineId.toString(),
        type: 'kine',
        roleSlug: 'KINE_ADMIN',
      },
      profileHeader: profileId.toString(),
    });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);

    expect(req.profile).toBeDefined();
    expect(String(req.profile._id)).toBe(profileId.toString());
    expect(req.user.profileId).toBe(profileId.toString());
    expect(req.user.cabinetId).toBe(cabinetId.toString());

    expect(tenantCtx.set).toHaveBeenCalledWith({
      userId: kineId.toString(),
      userType: 'kine',
      cabinetId: cabinetId.toString(),
      roleSlug: 'KINE_ADMIN',
    });
  });

  it('happy path STUDENT with no cabinet: CLS cabinetId is empty string', async () => {
    mockReads(
      { status: 'ACTIVE' },
      {
        ...activeProfile,
        profileType: 'STUDENT',
        cabinetId: null,
      },
    );
    const { ctx, req } = buildCtx({
      user: { sub: kineId.toString(), type: 'kine', roleSlug: 'STUDENT' },
      profileHeader: profileId.toString(),
    });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(req.user.cabinetId).toBe('');
    expect(tenantCtx.set).toHaveBeenCalledWith(
      expect.objectContaining({ cabinetId: '' }),
    );
  });
});
