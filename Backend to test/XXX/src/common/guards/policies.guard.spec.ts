import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PoliciesGuard } from './policies.guard';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { CaslAction } from '../enums/casl-action.enum';

describe('PoliciesGuard', () => {
  let guard: PoliciesGuard;
  let reflector: Reflector;
  let caslFactory: CaslAbilityFactory;

  const mockUser = {
    sub: 'user123',
    type: 'kine',
    cabinetId: 'cabinet_001',
    roleSlug: 'KINE',
  };

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    caslFactory = { createForUser: jest.fn() } as any;
    guard = new PoliciesGuard(reflector, caslFactory);
  });

  const createMockContext = (user?: any): ExecutionContext => {
    const request = { user };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  };

  it('should allow when no @CheckPolicies is set', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    const context = createMockContext(mockUser);
    expect(await guard.canActivate(context)).toBe(true);
  });

  it('should allow when empty handlers array', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([]);
    const context = createMockContext(mockUser);
    expect(await guard.canActivate(context)).toBe(true);
  });

  it('should throw 403 when user is missing', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([() => true]);
    const context = createMockContext(undefined);
    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should allow when policy handler returns true', async () => {
    const mockAbility = { can: jest.fn().mockReturnValue(true) };
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      (ability: any) => ability.can(CaslAction.READ, 'PATIENT'),
    ]);
    (caslFactory.createForUser as jest.Mock).mockResolvedValue({
      ability: mockAbility,
      permissions: [],
    });
    const context = createMockContext(mockUser);

    expect(await guard.canActivate(context)).toBe(true);
    expect(mockAbility.can).toHaveBeenCalledWith('READ', 'PATIENT');
  });

  it('should throw 403 when policy handler returns false', async () => {
    const mockAbility = { can: jest.fn().mockReturnValue(false) };
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      (ability: any) => ability.can(CaslAction.CREATE, 'ROLE'),
    ]);
    (caslFactory.createForUser as jest.Mock).mockResolvedValue({
      ability: mockAbility,
      permissions: [],
    });
    const context = createMockContext(mockUser);

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should throw 403 when one of multiple handlers fails', async () => {
    const mockAbility = {
      can: jest.fn().mockReturnValueOnce(true).mockReturnValueOnce(false),
    };
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      (ability: any) => ability.can('READ', 'PATIENT'),
      (ability: any) => ability.can('DELETE', 'PATIENT'),
    ]);
    (caslFactory.createForUser as jest.Mock).mockResolvedValue({
      ability: mockAbility,
      permissions: [],
    });
    const context = createMockContext(mockUser);

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should attach ability to request', async () => {
    const mockAbility = { can: jest.fn().mockReturnValue(true) };
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([
      (ability: any) => ability.can('READ', 'PATIENT'),
    ]);
    (caslFactory.createForUser as jest.Mock).mockResolvedValue({
      ability: mockAbility,
      permissions: [],
    });
    const context = createMockContext(mockUser);
    const request = context.switchToHttp().getRequest();

    await guard.canActivate(context);

    expect(request.ability).toBe(mockAbility);
  });
});
