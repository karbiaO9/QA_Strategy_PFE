import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotImplementedException,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/login.dto';
import { GoogleLoginDto } from '../dto/google-login.dto';
import { RegisterPatientDto } from '../dto/register-patient.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { VerifyCodeDto } from '../dto/verify-code.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UpdatePatientSelfDto } from '../dto/update-patient-self.dto';
import { Public } from '@common/decorators/public.decorator';
import { AllowedUserTypes } from '@common/decorators/allowed-user-types.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { JwtUser } from '@common/decorators/current-user.decorator';
import { AuthErrorCode } from '@common/exceptions/auth-error-codes';

@ApiTags('auth-patient')
@AllowedUserTypes('patient')
@Controller('api/v1/patient/auth')
export class PatientAuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Auto-inscription patient. Genere un uniqueCode 12 char.',
    description:
      "Cree le Compte patient et genere un `uniqueCode` (12 caracteres) a communiquer " +
      "au kine. Aucune session n'est ouverte automatiquement — l'utilisateur doit se " +
      "connecter via POST /api/v1/patient/auth/login.",
  })
  @ApiOkResponse({
    description:
      "Compte cree. Reponse : `{ success: true, message, email, uniqueCode }`.",
  })
  register(@Body() dto: RegisterPatientDto) {
    return this.authService.registerPatient(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login patient (email OU phone + password)',
    description:
      "Le champ `email` accepte au choix l'email OU le numero de telephone stocke sur le " +
      "patient (resolution serveur via `$or` {email, phone} sur la collection `patients`). " +
      'Le nom de la propriete reste `email` pour preserver la compatibilite client.',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.loginPatient(dto);
  }

  @Public()
  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Connexion patient via Google (web + mobile)',
    description:
      "Le frontend récupère un `id_token` Google (Google Identity Services / Sign in with Google " +
      "mobile SDK) et l'envoie ici. Le backend vérifie la signature contre les JWKS Google, " +
      "l'audience (`GOOGLE_CLIENT_ID`) et l'issuer, puis :\n\n" +
      "- si un patient est déjà lié à cette identité Google → connexion directe;\n" +
      "- sinon, si un patient existe avec le même email vérifié → liaison de l'identité Google " +
      "puis connexion;\n" +
      "- sinon, création d'un nouveau patient (status=NEW, sans mot de passe) puis connexion.\n\n" +
      "**Important** : le `client_secret` Google n'est JAMAIS transmis par le client. Seul " +
      "l'`id_token` (JWT signé par Google) circule.",
  })
  @ApiBody({ type: GoogleLoginDto })
  @ApiOkResponse({
    description:
      "Enveloppe de session patient : `{ accessToken, refreshToken, user, permissions, rules }`. " +
      "Identique au login email/password.",
  })
  async google(@Body() dto: GoogleLoginDto) {
    return this.authService.loginPatientWithGoogle(dto.idToken);
  }

  @Public()
  @Post('apple')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'OAuth Apple (mobile only) — STUB Sprint 2' })
  async apple(@Body() _body: { idToken: string }) {
    throw new NotImplementedException({
      code: AuthErrorCode.NOT_IMPLEMENTED,
      message: 'OAuth Apple will be implemented in Sprint 2.',
    });
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
    summary: 'Changement de mot de passe (patient self-service)',
    description:
      "Le patient fournit son mot de passe courant + le nouveau. Bcrypt verifie et met a jour " +
      "le hash, revoque le refresh token et invalide le cache CASL. L'access token courant reste " +
      "valide jusqu'a expiration.",
  })
  changePassword(@CurrentUser() user: JwtUser, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.sub, 'patient', dto);
  }
}

@ApiTags('auth-patient')
@AllowedUserTypes('patient')
@Controller('api/v1/patient')
export class PatientMeController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Retourne le profil patient + permissions' })
  me(@CurrentUser() user: JwtUser) {
    return this.authService.buildMe(user.sub, 'patient');
  }

  @Patch('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Mise a jour du patient (self-service, L1 uniquement)',
    description:
      "Accepte uniquement : `firstName`, `lastName`, `phone`, `dateOfBirth`, `profilePhoto`, " +
      "`timezone`, `language`. Les champs sensibles (email, uniqueCode, roleId, status, " +
      "ownerId, cabinetId) NE SONT PAS modifiables via cet endpoint. Le mot de passe passe " +
      "par POST /auth/change-password.",
  })
  @ApiOkResponse({ description: 'Envelope /me mise a jour.' })
  updateMe(@CurrentUser() user: JwtUser, @Body() dto: UpdatePatientSelfDto) {
    return this.authService.updatePatientSelf(user.sub, dto);
  }
}
