import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;
  let tokensService: any;

  const mockJwtPayload = {
    sub: 'user123',
    email: 'test@test.com',
    userType: 'kine',
    cabinetId: 'cabinet_001',
    role: 'KINE',
    permHash: 'abc123',
    v: 0, // grace-window default — matches stored version 0 by default
  };

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() } as any;
    reflector = { getAllAndOverride: jest.fn() } as any;
    tokensService = {
      getTokenVersion: jest.fn().mockResolvedValue(0),
    };
    guard = new JwtAuthGuard(jwtService, reflector, tokensService);
  });

  const createMockContext = (token?: string): ExecutionContext => {
    const request = {
      headers: {
        authorization: token ? `Bearer ${token}` : undefined,
      },
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  };

  it('should allow @Public() endpoints without token', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);
    const context = createMockContext();
    expect(await guard.canActivate(context)).toBe(true);
  });

  it('should throw 401 when no token is provided', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    const context = createMockContext();
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw 401 when token is invalid', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
      new Error('invalid'),
    );
    const context = createMockContext('invalid-token');
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should attach user to request on valid token', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockJwtPayload);
    const context = createMockContext('valid-token');
    const request = context.switchToHttp().getRequest();

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(request['user']).toEqual(mockJwtPayload);
  });

  it('rejects when token.v is older than the user current version (re-login killed it)', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      ...mockJwtPayload,
      v: 1,
    });
    tokensService.getTokenVersion.mockResolvedValue(2);
    const context = createMockContext('valid-old-token');
    await expect(guard.canActivate(context)).rejects.toMatchObject({
      response: { code: 'TOKEN_INVALID' },
    });
  });

  it('accepts grace-window tokens (no v claim) when stored version is still 0', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      ...mockJwtPayload,
      v: undefined,
    });
    tokensService.getTokenVersion.mockResolvedValue(0);
    const context = createMockContext('grace-token');
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('rejects grace-window tokens (no v claim) once the user has re-logged in (stored v >= 1)', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      ...mockJwtPayload,
      v: undefined,
    });
    tokensService.getTokenVersion.mockResolvedValue(1);
    const context = createMockContext('stale-grace-token');
    await expect(guard.canActivate(context)).rejects.toMatchObject({
      response: { code: 'TOKEN_INVALID' },
    });
  });

  it('should not extract token from non-Bearer auth', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Basic dXNlcjpwYXNz' },
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
