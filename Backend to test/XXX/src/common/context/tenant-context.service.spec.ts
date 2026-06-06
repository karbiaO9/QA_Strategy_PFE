import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { TenantContextService, TenantContext } from './tenant-context.service';

describe('TenantContextService', () => {
  let service: TenantContextService;
  let cls: any;

  const ctx: TenantContext = {
    userId: 'user_id',
    userType: 'kine',
    cabinetId: 'cabinet_id',
    roleSlug: 'KINE_ADMIN',
  };

  beforeEach(async () => {
    cls = {
      isActive: jest.fn().mockReturnValue(true),
      set: jest.fn(),
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantContextService,
        { provide: ClsService, useValue: cls },
      ],
    }).compile();

    service = module.get(TenantContextService);
  });

  describe('set / get', () => {
    it('set stores the context under the tenant key when CLS is active', () => {
      service.set(ctx);
      expect(cls.set).toHaveBeenCalledWith('tenant', ctx);
    });

    it('set is a no-op when CLS is not active (e.g. background workers)', () => {
      cls.isActive.mockReturnValue(false);
      service.set(ctx);
      expect(cls.set).not.toHaveBeenCalled();
    });

    it('get returns undefined when CLS is not active', () => {
      cls.isActive.mockReturnValue(false);
      expect(service.get()).toBeUndefined();
    });

    it('get returns the stored context when CLS is active', () => {
      cls.get.mockReturnValue(ctx);
      expect(service.get()).toEqual(ctx);
      expect(cls.get).toHaveBeenCalledWith('tenant');
    });
  });

  describe('field accessors', () => {
    it('getCabinetId returns ctx.cabinetId', () => {
      cls.get.mockReturnValue(ctx);
      expect(service.getCabinetId()).toBe('cabinet_id');
    });

    it('getCabinetId returns undefined when no context set', () => {
      cls.get.mockReturnValue(undefined);
      expect(service.getCabinetId()).toBeUndefined();
    });

    it('getUserId returns ctx.userId', () => {
      cls.get.mockReturnValue(ctx);
      expect(service.getUserId()).toBe('user_id');
    });

    it('getRoleSlug returns ctx.roleSlug', () => {
      cls.get.mockReturnValue(ctx);
      expect(service.getRoleSlug()).toBe('KINE_ADMIN');
    });
  });

  describe('isSuperAdmin', () => {
    it('returns true when role is SUPER_ADMIN', () => {
      cls.get.mockReturnValue({ ...ctx, roleSlug: 'SUPER_ADMIN' });
      expect(service.isSuperAdmin()).toBe(true);
    });

    it('returns false for any other role', () => {
      cls.get.mockReturnValue(ctx);
      expect(service.isSuperAdmin()).toBe(false);
    });

    it('returns false when no context set', () => {
      cls.get.mockReturnValue(undefined);
      expect(service.isSuperAdmin()).toBe(false);
    });
  });

  describe('setBypass / isBypassed', () => {
    it('setBypass(true) stores the flag', () => {
      service.setBypass(true);
      expect(cls.set).toHaveBeenCalledWith('tenant:bypass', true);
    });

    it('isBypassed returns true when flag is true', () => {
      cls.get.mockReturnValue(true);
      expect(service.isBypassed()).toBe(true);
    });

    it('isBypassed returns false when flag is unset', () => {
      cls.get.mockReturnValue(undefined);
      expect(service.isBypassed()).toBe(false);
    });

    it('isBypassed returns false when CLS is not active', () => {
      cls.isActive.mockReturnValue(false);
      expect(service.isBypassed()).toBe(false);
    });
  });
});
