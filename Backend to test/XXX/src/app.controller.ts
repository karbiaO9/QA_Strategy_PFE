import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { CheckPolicies } from './common/decorators/check-policies.decorator';
import { SkipProfileGuard } from './common/decorators/skip-profile-guard.decorator';

/**
 * Root endpoint — identity service health check.
 *
 * Authenticated + restricted to SUPER_ADMIN via CASL wildcard
 * (`can('manage', 'all')`, posed only by the SUPER_ADMIN rule in
 * CaslAbilityFactory).
 */
@ApiTags('health')
@ApiBearerAuth('access-token')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @SkipProfileGuard()
  @Get()
  @CheckPolicies((a) => a.can('manage' as any, 'all' as any))
  @ApiOperation({
    summary: 'Health check (SUPER_ADMIN uniquement)',
    description:
      "Retourne un court message indiquant que le service est en ligne. " +
      "Reserve au role **SUPER_ADMIN** — enforce via le wildcard CASL " +
      "`can('manage', 'all')`, pose uniquement pour les admins plateforme " +
      "par `CaslAbilityFactory`.\n\n" +
      "Authentification : login via `POST /api/admin/v1/auth/login` puis coller " +
      "l'`accessToken` dans le bouton **Authorize**.",
  })
  @ApiOkResponse({ description: 'Service UP.' })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide (`TOKEN_MISSING` / `TOKEN_INVALID`).' })
  @ApiForbiddenResponse({ description: 'Utilisateur non SUPER_ADMIN (`PERMISSION_DENIED`).' })
  getHello(): string {
    return this.appService.getHello();
  }
}
