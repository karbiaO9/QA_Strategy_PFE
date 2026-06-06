import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/login.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { VerifyCodeDto } from '../dto/verify-code.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UpdateAdminSelfDto } from '../dto/update-admin-self.dto';
import { Public } from '@common/decorators/public.decorator';
import { AllowedUserTypes } from '@common/decorators/allowed-user-types.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { JwtUser } from '@common/decorators/current-user.decorator';

@ApiTags('auth-admin')
@AllowedUserTypes('admin')
@Controller('api/admin/v1/auth')
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login admin back-office (email uniquement)',
    description:
      "La collection `admins` ne porte pas de champ `phone` — l'identifiant doit etre l'email. " +
      'A la difference des logins kine et patient, le login par telephone est non supporte ici.',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.loginAdmin(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout — invalide le refresh token' })
  logout(@CurrentUser() user: JwtUser) {
    return this.authService.logout(user.sub);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Echange refresh token contre nouveau access token' })
  refresh(@CurrentUser() user: JwtUser, @Body() dto: RefreshDto) {
    return this.authService.refresh(user.sub, dto.refreshToken);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Envoie un code 6 chiffres par email (TTL 10 min)' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('verify-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verifie le code et retourne un resetToken temporaire' })
  verifyCode(@Body() dto: VerifyCodeDto) {
    return this.authService.verifyCode(dto.email, dto.code);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Definit le nouveau mot de passe' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(
      dto.email,
      dto.resetToken,
      dto.newPassword,
    );
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Changement de mot de passe (self-service)',
    description:
      "Endpoint authentifie : l'admin fournit son mot de passe courant + le nouveau mot de passe. " +
      "Le serveur verifie bcrypt, rehash (cost 12), revoque les refresh tokens du Compte et invalide " +
      "le cache CASL. L'access token courant reste valide jusqu'a expiration naturelle.",
  })
  @ApiOkResponse({ description: '`{ success: true }` — changer le password a reussi.' })
  @ApiUnauthorizedResponse({ description: 'Mot de passe actuel invalide.' })
  @ApiBadRequestResponse({
    description:
      "Nouveau mot de passe = ancien (`PASSWORD_SAME_AS_OLD`) ou politique non respectee.",
  })
  changePassword(@CurrentUser() user: JwtUser, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.sub, 'admin', dto);
  }
}

@ApiTags('auth-admin')
@AllowedUserTypes('admin')
@Controller('api/admin/v1')
export class AdminMeController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Retourne le profil admin + permissions' })
  me(@CurrentUser() user: JwtUser) {
    return this.authService.buildMe(user.sub, 'admin');
  }

  @Patch('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Mise a jour du profil admin (self-service, L1 uniquement)',
    description:
      "Accepte uniquement les champs cosmetiques (`firstName`, `lastName`, `profilePhoto`). " +
      "Les champs sensibles (email, roleId, status) NE SONT PAS modifiables via cet endpoint — " +
      "un SUPER_ADMIN distinct doit le faire via les CRUD /admins. Le mot de passe passe par " +
      "POST /api/admin/v1/auth/change-password.",
  })
  @ApiOkResponse({ description: 'Envelope /me mise a jour.' })
  updateMe(@CurrentUser() user: JwtUser, @Body() dto: UpdateAdminSelfDto) {
    return this.authService.updateAdminSelf(user.sub, dto);
  }
}
