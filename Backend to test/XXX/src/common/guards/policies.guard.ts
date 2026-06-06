import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  CaslAbilityFactory,
  CaslUser,
} from '../casl/casl-ability.factory';
import {
  CHECK_POLICIES_KEY,
  PolicyHandler,
} from '../decorators/check-policies.decorator';
import { AuthErrorCode } from '../exceptions/auth-error-codes';
import { AppError } from '../exceptions/app-error';

/**
 * PoliciesGuard — runs the @CheckPolicies handlers.
 *
 * On failure, throws a ForbiddenException carrying the
 * `PERMISSION_DENIED` code so the frontend can distinguish.
 */
@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handlers = this.reflector.getAllAndOverride<PolicyHandler[]>(
      CHECK_POLICIES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!handlers || handlers.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user: CaslUser = request.user;

    if (!user) {
      throw AppError.forbidden(AuthErrorCode.USER_NOT_AUTHENTICATED, 'User not authenticated.');
    }

    const profile = (request as any).profile as
      | {
          _id: any;
          customPermissionOverrides?: { permissionId: any; granted: boolean }[];
        }
      | undefined;
    const enrichedUser: CaslUser = profile
      ? {
          ...user,
          profileId: String(profile._id),
          customPermissionOverrides: profile.customPermissionOverrides ?? [],
        }
      : user;

    const { ability } = await this.caslAbilityFactory.createForUser(enrichedUser);

    const allPassed = handlers.every((handler) => handler(ability));

    if (!allPassed) {
      throw AppError.forbidden(AuthErrorCode.PERMISSION_DENIED, 'You do not have permission to perform this action.');
    }

    request.ability = ability;
    return true;
  }
}
