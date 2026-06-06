import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes } from '@nestjs/swagger';
import { JustificatifFileInterceptor } from '@common/uploads/supporting-document.interceptor';
import type { UploadedFileLike } from '@common/uploads/supporting-document.interceptor';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterKineDto } from '../dto/register-kine.dto';
import { SelectProfileDto } from '../dto/select-profile.dto';
import { CreateInvitationDto } from '../dto/create-invitation.dto';
import { AcceptInvitationDto } from '../dto/accept-invitation.dto';
import { PreviewInvitationDto } from '../dto/preview-invitation.dto';
import { AttachInvitationDto } from '../dto/attach-invitation.dto';
import { AddKineProfileDto } from '../dto/add-kine-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UpdateKineSelfDto } from '../dto/update-kine-self.dto';
import { UpdateKineProfileSelfDto } from '../dto/update-kine-profile-self.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { VerifyCodeDto } from '../dto/verify-code.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { Public } from '@common/decorators/public.decorator';
import { SkipProfileGuard } from '@common/decorators/skip-profile-guard.decorator';
import { AllowedUserTypes } from '@common/decorators/allowed-user-types.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { JwtUser } from '@common/decorators/current-user.decorator';


@ApiTags('auth-kine')
@AllowedUserTypes('kine')
@Controller('api/v1/kine/auth')
export class KineAuthController {
  constructor(private readonly authService: AuthService) {}

  // Registration 

  @Public()
  @Post('register')
  @UseInterceptors(JustificatifFileInterceptor())
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({
    summary: 'Inscription kine (formulaire adaptatif — 1 endpoint, 3 profils)',
    description:
      "Endpoint unique pour l'inscription autonome du kine.\n\n" +
      "Accepte `multipart/form-data` (obligatoire si un fichier justificatif est envoye pour " +
      "un profil STUDENT) ou `application/json` (si `justificatifUrl` est deja une URL externe). " +
      "Champ fichier : `justificatif` (PDF/JPG/PNG, max 5 Mo). " +
      "Le fichier uploade est stocke sur le bucket S3 configure et la `justificatifUrl` retournee " +
      "peut etre une URL presignee a duree limitee (S3_USE_PRESIGNED_GET).\n\n" +
      "Le champ `profileType` agit comme discriminateur (valeurs: `LIBERAL` | `ADMIN_GROUP` | `STUDENT`) " +
      "et determine quels champs sont requis par `class-validator` via `@ValidateIf`. " +
      "Les champs hors scope pour un profileType donne sont ignores silencieusement " +
      "par le global ValidationPipe (whitelist).\n\n" +
      "### Tableau des champs par profileType\n\n" +
      "| Champ                    | LIBERAL | ADMIN_GROUP | STUDENT |\n" +
      "| ------------------------ | :-----: | :---------: | :-----: |\n" +
      "| firstName / lastName     | ✓       | ✓           | ✓       |\n" +
      "| email                    | ✓       | ✓           | ✓       |\n" +
      "| password + confirmation  | ✓       | ✓           | ✓       |\n" +
      "| cguAccepted              | ✓       | ✓           | ✓       |\n" +
      "| professionalNumber       | ✓       | ✓           | ✗       |\n" +
      "| cabinetName              | ✓       | ✓           | ✗       |\n" +
      "| street / postalCode      | ✓       | ✓           | ✗       |\n" +
      "| city                     | ✓       | ✓           | optionnel |\n" +
      "| phone                    | optionnel | —         | ✗       |\n" +
      "| isReplacement            | optionnel | —         | ✗       |\n" +
      "| siret (Luhn)             | —       | ✓           | ✗       |\n" +
      "| legalName                | —       | optionnel   | ✗       |\n" +
      "| school                   | —       | —           | ✓       |\n" +
      "| academicYear (1-5)       | —       | —           | ✓       |\n" +
      "| justificatif (file)      | —       | —           | ✓ *     |\n" +
      "| justificatifUrl          | —       | —           | ✓ *     |\n\n" +
      "\\* Pour STUDENT, au moins l'une des deux entrees (fichier `justificatif` en multipart, " +
      "OU `justificatifUrl` en JSON/string) est requise.\n\n" +
      "Renvoie un message de succes demandant a l'utilisateur de se connecter " +
      "via POST /api/v1/kine/auth/login. Aucune session n'est ouverte automatiquement.\n\n" +
      "**Regle metier** : REMPLACANT suit le meme flux que LIBERAL, differencie uniquement " +
      "par la case `isReplacement`. Le backend stocke `profileType = REMPLACANT` sur le profil " +
      "quand `isReplacement === true`.",
  })
  @ApiBody({
    type: RegisterKineDto,
    examples: {
      liberalSolo: {
        summary: '1. LIBERAL solo (sans case remplacant)',
        description:
          'Kine solo creant son propre cabinet. Pas de SIRET. Telephone optionnel.',
        value: {
          profileType: 'LIBERAL',
          firstName: 'Ali',
          lastName: 'Dupont',
          email: 'ali.nouveau@cabinet-paris.fr',
          password: 'Kine123!',
          passwordConfirmation: 'Kine123!',
          cguAccepted: true,
          professionalNumber: '123456789',
          cabinetName: 'Cabinet Ali Dupont',
          street: '15 Rue de Rivoli',
          postalCode: '75001',
          city: 'Paris',
          phone: '+33612345678',
          isReplacement: false,
        },
      },
      remplacant: {
        summary: '2. REMPLACANT (meme payload, isReplacement=true)',
        description:
          "Remplacant : meme formulaire que LIBERAL, case 'Je suis remplacant' cochee. " +
          'Le backend ecrit profileType=REMPLACANT sur le profil stocke.',
        value: {
          profileType: 'LIBERAL',
          firstName: 'Nadia',
          lastName: 'Benali',
          email: 'nadia.remplacante@cabinet-paris.fr',
          password: 'Kine123!',
          passwordConfirmation: 'Kine123!',
          cguAccepted: true,
          professionalNumber: '987654321',
          cabinetName: 'Cabinet Nadia Benali',
          street: '10 Avenue de la Republique',
          postalCode: '75011',
          city: 'Paris',
          isReplacement: true,
        },
      },
      adminGroup: {
        summary: '3. ADMIN_GROUP (cabinet de groupe + SIRET)',
        description:
          'Premier kine a creer un cabinet de groupe sur la plateforme. SIRET valide Luhn.',
        value: {
          profileType: 'ADMIN_GROUP',
          firstName: 'Sophie',
          lastName: 'Martin',
          email: 'sophie.nouvelle@cabinet-paris.fr',
          password: 'KineAdmin123!',
          passwordConfirmation: 'KineAdmin123!',
          cguAccepted: true,
          professionalNumber: '10000000001',
          cabinetName: 'Cabinet Paris Centre',
          siret: '81234567800013',
          street: '15 Rue de Rivoli',
          postalCode: '75001',
          city: 'Paris',
          legalName: 'Cabinet Paris Centre SAS',
        },
      },
      student: {
        summary: '4. STUDENT (IFMK, pas de cabinet, pas de numero pro)',
        description:
          "Etudiant en IFMK. Aucun cabinet rattache. justificatifUrl = URL d'un fichier " +
          'pre-uploade (PDF/JPG/PNG). academicYear entre 1 et 5.',
        value: {
          profileType: 'STUDENT',
          firstName: 'Emma',
          lastName: 'Laurent',
          email: 'emma.nouvelle@student.fr',
          password: 'Student123!',
          passwordConfirmation: 'Student123!',
          cguAccepted: true,
          school: 'IFMK Paris',
          academicYear: 3,
          justificatifUrl: 'https://cdn.physioconnect.com/justifs/emma-laurent-2026.pdf',
          city: 'Paris',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description:
      "Compte + Profil (+ Cabinet si applicable) crees. Reponse : " +
      "`{ success: true, message, email }`. L'utilisateur doit se connecter via /login.",
  })
  @ApiBadRequestResponse({
    description:
      'Validation echouee. Exemples: complexite mot de passe, passwordConfirmation divergent, ' +
      'SIRET invalide (Luhn), annee etudes hors [1..5], URL justificatif invalide, CGU non acceptees.',
  })
  @ApiConflictResponse({ description: 'Email deja utilise sur la plateforme (`EMAIL_ALREADY_USED`).' })
  register(
    @Body() dto: RegisterKineDto,
    @UploadedFile() justificatif?: UploadedFileLike,
  ) {
    return this.authService.registerKine(dto, justificatif);
  }

  // Invitation flow .

  @SkipProfileGuard()
  @Post('invitations')
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Creer une invitation MEMBER ou ASSISTANT (admin cabinet)",
    description:
      "Endpoint reserve aux kines qui possedent au moins un profil `ADMIN_GROUP` actif " +
      "\n\n" +
      "Le serveur :\n" +
      "1. Lit l'identite du kine appelant via le JWT.\n" +
      "2. Verifie qu'il a un profil ADMIN_GROUP actif ; recupere le `cabinetId` de ce profil.\n" +
      "3. Signe un JWT court (TTL 7 jours) contenant `{cabinetId, invitedEmail, targetProfileType, roleId, invitedByKineId}`.\n" +
      "4. Retourne le token pret a etre incorpore dans un lien d'email (ex. `https://app.physio.fr/accept?token=...`).\n\n" +
      "Aucune ligne n'est ecrite en base a ce stade — l'invitation est un JWT autonome, sans " +
      "revocation single-use en V1. Redis-backed revocation sera ajoutee en Track 3 de la roadmap.",
  })
  @ApiBody({
    type: CreateInvitationDto,
    examples: {
      inviteMember: {
        summary: "Inviter un MEMBER (kine praticien, ADELI/RPPS requis a l'acceptation)",
        value: {
          email: 'nouveau.membre@cabinet-paris.fr',
          targetProfileType: 'MEMBER',
        },
      },
      inviteAssistant: {
        summary: "Inviter un ASSISTANT (secretaire, pas de num. pro)",
        value: {
          email: 'secretaire@cabinet-paris.fr',
          targetProfileType: 'ASSISTANT',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Invitation generee. Retourne `{invitationToken, expiresAt, cabinetId, invitedEmail, targetProfileType}`.',
  })
  @ApiForbiddenResponse({ description: "Le kine appelant n'a pas de profil ADMIN_GROUP actif." })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide.' })
  createInvitation(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateInvitationDto,
  ) {
    return this.authService.createKineInvitation(user.sub, dto);
  }

  @Public()
  @Post('accept-invitation')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Acceptation d'invitation — cree un profil MEMBER ou ASSISTANT",
    description:
      "Endpoint public declenche par le clic sur le lien d'invitation.\n\n" +
      "Le serveur :\n" +
      "1. Verifie le `invitationToken` (signature + expiration).\n" +
      "2. Deduit `cabinetId`, `targetProfileType`, `roleId` du token — l'appelant ne les fournit PAS.\n" +
      "3. Valide la coherence: MEMBER doit fournir `professionalNumber` ; ASSISTANT ne doit PAS en fournir.\n" +
      "4. Cree le Kine (L1 identite) et pousse le Profil embedded MEMBER / ASSISTANT rattache au cabinet.\n" +
      "5. Retourne un message de succes demandant a l'utilisateur de se connecter via /login. " +
      "Aucune session n'est ouverte automatiquement.\n\n" +
      "Si l'email porte par le token correspond deja a un Compte existant, " +
      "le front doit rediriger vers un parcours `login + ajout de profil` plutot qu'appeler cet endpoint.",
  })
  @ApiBody({
    type: AcceptInvitationDto,
    examples: {
      acceptAsMember: {
        summary: 'Acceptation en tant que MEMBER (avec ADELI/RPPS)',
        value: {
          invitationToken: '<JWT recu par email>',
          firstName: 'Jean',
          lastName: 'Nouveau',
          password: 'Kine123!',
          passwordConfirmation: 'Kine123!',
          cguAccepted: true,
          professionalNumber: '112233445',
        },
      },
      acceptAsAssistant: {
        summary: 'Acceptation en tant que ASSISTANT (sans num. pro)',
        value: {
          invitationToken: '<JWT recu par email>',
          firstName: 'Claire',
          lastName: 'Secretaire',
          password: 'Assistant123!',
          passwordConfirmation: 'Assistant123!',
          cguAccepted: true,
        },
      },
    },
  })
  @ApiCreatedResponse({
    description:
      "Compte + Profil MEMBER/ASSISTANT crees. Reponse : " +
      "`{ success: true, message, email }`. L'utilisateur doit se connecter via /login.",
  })
  @ApiBadRequestResponse({
    description:
      "Validation echouee (complexite password, CGU non acceptees, ou incoherence " +
      "MEMBER sans professionalNumber / ASSISTANT avec professionalNumber).",
  })
  @ApiUnauthorizedResponse({ description: 'Invitation invalide ou expiree (`TOKEN_INVALID` / `TOKEN_EXPIRED`).' })
  @ApiConflictResponse({ description: "Un Compte existe deja pour l'email porte par l'invitation (`EMAIL_ALREADY_USED`)." })
  acceptInvitation(@Body() dto: AcceptInvitationDto) {
    return this.authService.acceptKineInvitation(dto);
  }

  @Public()
  @Post('invitations/preview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Prevoir le contenu d'une invitation (Option B - US-B.3)",
    description:
      "Decode le token sans le consommer et retourne le contexte necessaire au frontend " +
      "pour choisir l'ecran a afficher :\n" +
      "- `accountExists: false` -> afficher le formulaire complet (accept-invitation).\n" +
      "- `accountExists: true`  -> afficher l'ecran 'login + rattachement' (invitations/attach).\n\n" +
      "Le token est verifie signature + expiration + single-use ; si le lien a deja ete " +
      "utilise, renvoie `INVITATION_ALREADY_USED` (409) ici aussi pour eviter de lancer " +
      "le flow cote UI.",
  })
  @ApiBody({ type: PreviewInvitationDto })
  @ApiOkResponse({
    description:
      "Contexte du token : `{ accountExists, existingAccountKind, invitedEmail, targetProfileType, cabinetId, cabinetName, roleName, expiresAt }`.",
  })
  @ApiUnauthorizedResponse({ description: 'Invitation invalide ou expiree.' })
  @ApiConflictResponse({ description: 'Invitation deja utilisee (`INVITATION_ALREADY_USED`).' })
  previewInvitation(@Body() dto: PreviewInvitationDto) {
    return this.authService.previewInvitation(dto.invitationToken);
  }

  @Public()
  @Post('invitations/attach')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Rattacher un nouveau profil a un Compte existant via invitation (US-B.3)",
    description:
      "Endpoint public utilise quand le parcours preview a indique `accountExists=true`. " +
      "L'utilisateur fournit son mot de passe existant + le token d'invitation ; le backend " +
      "authentifie (bcrypt), pousse un nouveau Profil MEMBER/ASSISTANT sur le Compte existant, " +
      "invalide les caches CASL et marque le token comme consomme (single-use via Redis).\n\n" +
      "Aucune session nouvelle n'est creee : la reponse contient l'envelope /me a jour et " +
      "l'utilisateur doit passer par /login si il n'est pas deja connecte.",
  })
  @ApiBody({
    type: AttachInvitationDto,
    examples: {
      attachAsMember: {
        summary: 'Rattacher un profil MEMBER (avec ADELI/RPPS)',
        value: {
          invitationToken: '<JWT recu par email>',
          password: 'MyCurrentPassword123!',
          professionalNumber: '123456789',
        },
      },
      attachAsAssistant: {
        summary: 'Rattacher un profil ASSISTANT (sans num. pro)',
        value: {
          invitationToken: '<JWT recu par email>',
          password: 'MyCurrentPassword123!',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description:
      "Profil ajoute au Compte existant. Reponse : `{ newProfileId, cabinetId, storedProfileType, cabinetCreated, me, attached, kineId }`.",
  })
  @ApiBadRequestResponse({
    description:
      'MEMBER sans professionalNumber / ASSISTANT avec professionalNumber / kine inactif.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invitation invalide ou expiree, ou mot de passe invalide.',
  })
  @ApiConflictResponse({
    description:
      'Invitation deja utilisee (`INVITATION_ALREADY_USED`), email non rattache a un Compte kine (`INVITATION_ACCOUNT_MISMATCH`), ou profil deja present (`PROFILE_ALREADY_EXISTS`).',
  })
  attachInvitation(@Body() dto: AttachInvitationDto) {
    return this.authService.attachProfileFromInvitation(
      dto.invitationToken,
      dto.password,
      dto.professionalNumber,
    );
  }

  // Login

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Connexion kine (enveloppe minimale — choix du profil a suivre)',
    description:
      "Verifie les credentials et retourne une enveloppe minimale.\n\n" +
      "**Identifiant**: le champ `email` accepte au choix l'email OU le numero de telephone " +
      "stocke sur le Compte L1 (resolution serveur via `$or` {email, phone} sur la collection " +
      "`kines`). Le nom de la propriete reste `email` pour preserver la compatibilite client.\n\n" +
      "Reponse :\n" +
      "- `accessToken` (JWT, TTL court) a injecter en header `Authorization: Bearer <token>`\n" +
      "- `refreshToken` (TTL 7j, stocke en Redis, a utiliser sur /auth/refresh)\n" +
      "- `user` : identite L1 (firstName, lastName, email, photo, ...)\n" +
      "- `profiles` : liste des profils du kine (summary seulement : id, profileType, cabinet, role). " +
      "Les permissions CASL ne sont PAS incluses — elles sont renvoyees par /select-profile.\n" +
      "- `lastProfileId` : ObjectId du dernier profil selectionne (ou null). Le frontend peut " +
      "l'utiliser pour pre-selectionner ce profil dans le switcher.\n\n" +
      "Apres login, le frontend DOIT appeler POST /api/v1/kine/auth/select-profile pour choisir " +
      "le profil actif et recevoir les permissions. Les endpoints metier requerent ensuite " +
      "le header `X-Profile-Id`.",
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      kineAdmin: {
        summary: 'KINE_ADMIN (Sophie, cabinet Paris)',
        value: { email: 'sophie.martin@cabinet-paris.fr', password: 'KineAdmin123!' },
      },
      kineByPhone: {
        summary: 'Login par telephone (meme champ `email`, valeur = phone)',
        value: { email: '+33601010101', password: 'KineAdmin123!' },
      },
      kineMember: {
        summary: 'MEMBER (Ali, cabinet Paris)',
        value: { email: 'ali.dupont@cabinet-paris.fr', password: 'Kine123!' },
      },
      kineLiberal: {
        summary: 'LIBERAL (Julien, cabinet Nice solo)',
        value: { email: 'julien.leroy@cabinet-nice.fr', password: 'Kine123!' },
      },
      kineRemplacant: {
        summary: 'REMPLACANT (Nadia, cabinet Paris)',
        value: { email: 'nadia.benali@cabinet-paris.fr', password: 'Kine123!' },
      },
      kineStudent: {
        summary: 'STUDENT (Emma, no cabinet)',
        value: { email: 'emma.laurent@student.fr', password: 'Student123!' },
      },
      kineAssistant: {
        summary: 'ASSISTANT (Thomas, cabinet Lyon)',
        value: { email: 'thomas.garnier@cabinet-lyon.fr', password: 'Assistant123!' },
      },
    },
  })
  @ApiOkResponse({
    description:
      "Enveloppe minimale : `{ accessToken, refreshToken, user, profiles[], lastProfileId }`. " +
      "Pas de permissions ici — appeler /select-profile pour les obtenir.",
  })
  @ApiUnauthorizedResponse({ description: 'Credentials invalides ou compte inactif (`INVALID_CREDENTIALS`).' })
  login(@Body() dto: LoginDto) {
    return this.authService.loginKine(dto);
  }

  // Profile selection — step 2 of the two-step login.

  @SkipProfileGuard()
  @Post('select-profile')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Selection du profil actif apres login',
    description:
      "Etape 2 du flow de connexion kine. Apres /login (qui retourne une enveloppe minimale " +
      "avec la liste des profils), le frontend appelle cet endpoint avec le `profileId` choisi " +
      "par l'utilisateur.\n\n" +
      "Le serveur :\n" +
      "1. Verifie que le profil appartient bien au kine authentifie et qu'il est actif.\n" +
      "2. Stampe `lastProfileId` + `lastLoginAt` sur le Compte (memoire du 'dernier profil utilise').\n" +
      "3. Retourne le profil complet avec ses permissions CASL resolues et ses rules.\n\n" +
      "Pour les appels metier suivants, le frontend envoie le header `X-Profile-Id: <profileId>` " +
      "(c'est le ProfileGuard qui valide le header a chaque requete).",
  })
  @ApiBody({
    type: SelectProfileDto,
    examples: {
      pickLiberal: {
        summary: 'Selection du profil LIBERAL',
        value: { profileId: '65f2a1b0c1d2e3f4a5b6c7d8' },
      },
    },
  })
  @ApiOkResponse({
    description:
      "Profil actif selectionne. Reponse : `{ user, profile, permissions, rules }` ou " +
      "`profile` contient id / profileType / cabinet / role / subscription / metadata.",
  })
  @ApiForbiddenResponse({
    description: 'Profil desactive (`PROFILE_INACTIVE`).',
  })
  selectProfile(
    @CurrentUser() user: JwtUser,
    @Body() dto: SelectProfileDto,
  ) {
    return this.authService.selectKineProfile(user.sub, dto.profileId);
  }

  // Logout / refresh

  @SkipProfileGuard()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Deconnexion',
    description:
      "Revoque le refresh token du kine (Redis). L'access token courant reste valide jusqu'a " +
      "expiration naturelle.",
  })
  logout(@CurrentUser() user: JwtUser) {
    return this.authService.logout(user.sub);
  }

  @SkipProfileGuard()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: "Renouvellement de l'access token",
    description:
      "Echange un refresh token valide contre une nouvelle paire (access + refresh). " +
      'Rotation du refresh token a chaque appel.',
  })
  refresh(
    @CurrentUser() user: JwtUser,
    @Body() dto: RefreshDto,
  ) {
    return this.authService.refresh(user.sub, dto.refreshToken);
  }

  // Password-reset flow

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Demande de reinitialisation de mot de passe',
    description:
      "Envoie un code 6 chiffres par email (TTL 10 min, Redis). " +
      "Reponse toujours `{ success: true }` pour eviter l'enumeration de comptes.",
  })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('verify-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verification du code de reset',
    description:
      "Verifie le code a 6 chiffres. Retourne un `resetToken` temporaire (TTL 10 min) " +
      'a utiliser sur POST /reset-password. 3 tentatives max avant blocage temporaire.',
  })
  verifyCode(@Body() dto: VerifyCodeDto) {
    return this.authService.verifyCode(dto.email, dto.code);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Definition du nouveau mot de passe',
    description:
      "Consomme le `resetToken` et applique le nouveau mot de passe. " +
      "Memes regles de complexite que l'inscription (min 8 car., 1 maj, 1 chiffre, 1 special).",
  })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(
      dto.email,
      dto.resetToken,
      dto.newPassword,
    );
  }

  @SkipProfileGuard()
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Changement de mot de passe (kine self-service)',
    description:
      "Endpoint authentifie : le kine fournit son mot de passe courant + le nouveau. Le serveur " +
      "verifie bcrypt, rehash (cost 12), revoque les refresh tokens du Compte (toutes les autres " +
      "sessions doivent se reconnecter) et invalide le cache CASL des profils du kine. " +
      "L'access token courant reste utilisable jusqu'a expiration (SkipProfileGuard car le kine " +
      "peut changer son mot de passe sans avoir selectionne un profil).",
  })
  changePassword(@CurrentUser() user: JwtUser, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.sub, 'kine', dto);
  }
}


@ApiTags('auth-kine')
@AllowedUserTypes('kine')
@Controller('api/v1/kine')
export class KineMeController {
  constructor(private readonly authService: AuthService) {}

  @SkipProfileGuard()
  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Profil kine courant (dernier profil selectionne uniquement)',
    description:
      "Retourne l'identite L1 + **uniquement le dernier profil selectionne** (`lastProfileId`), " +
      "avec ses permissions CASL resolues. Reponse selon deux shapes possibles :\n\n" +
      "**Shape A — profil actif resolu** (cas nominal, lastProfileId valide et profil actif) :\n" +
      "```json\n" +
      "{ \"user\": {...}, \"profile\": {...}, \"permissions\": {...}, \"rules\": [...] }\n" +
      "```\n" +
      "Le champ `profile` contient l'enveloppe complete (cabinet, role, subscription, metadata) du profil.\n\n" +
      "**Shape B — pas encore de selection (lastProfileId=null ou profil desactive/supprime)** :\n" +
      "```json\n" +
      "{ \"user\": {...}, \"profile\": null, \"permissions\": null, \"rules\": null, \"availableProfiles\": [...] }\n" +
      "```\n" +
      "Le tableau `availableProfiles` liste les profils du kine (summaries) pour que le frontend affiche " +
      "le switcher en un seul round-trip. Le frontend interprete `profile === null` comme 'l'utilisateur " +
      "doit selectionner un profil via POST /api/v1/kine/auth/select-profile'.\n\n" +
      "Pas de filtrage par `X-Profile-Id` ici — ce endpoint est decore `@SkipProfileGuard()` " +
      "car il est appele avant qu'un profil ne soit actif.",
  })
  me(@CurrentUser() user: JwtUser) {
    return this.authService.buildMe(user.sub, 'kine');
  }

  @SkipProfileGuard()
  @Post('profiles')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(JustificatifFileInterceptor())
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({
    summary: 'Ajouter un nouveau profil au kine courant ',
    description:
      "Endpoint utilise par un kine DEJA connecte pour attacher un nouveau profil a son " +
      "propre Compte sans passer par la page d'inscription et sans re-connexion.\n\n" +
      "Le serveur :\n" +
      "1. Lit l'identite du kine appelant via le JWT (`user.sub`).\n" +
      "2. N'invoque PAS `assertEmailAvailableForUser` : le Compte existe deja, c'est le but.\n" +
      "3. Valide qu'il n'existe pas deja un profil (`profileType`, `cabinetId`) identique.\n" +
      "4. Cree le cabinet si necessaire (LIBERAL / ADMIN_GROUP), sinon rattache au `cabinetId` fourni (MEMBER / ASSISTANT).\n" +
      "5. Invalide les cles CASL Redis `perms:{kineId}` et `perms:profile:{id}` pour chaque profil existant.\n" +
      "6. Retourne `{ newProfileId, cabinetId, storedProfileType, cabinetCreated, me }` ; " +
      "le `me` contient la liste complete des profils (le front met a jour le Switcher).\n\n" +
      "La session n'est PAS rotee : l'access token reste valide. Le front bascule vers le nouveau " +
      "profil en envoyant le header `X-Profile-Id: <newProfileId>` sur la requete suivante.",
  })
  @ApiBody({
    type: AddKineProfileDto,
    examples: {
      addLiberal: {
        summary: 'Un KINE_ADMIN ajoute un profil LIBERAL (nouveau cabinet solo)',
        value: {
          profileType: 'LIBERAL',
          professionalNumber: '123456789',
          cabinetName: 'Cabinet Soir & Weekend',
          street: '22 Rue de Turenne',
          postalCode: '75003',
          city: 'Paris',
          cguAccepted: true,
        },
      },
      addStudent: {
        summary: "Un LIBERAL ajoute un profil STUDENT (reprise d'etudes)",
        value: {
          profileType: 'STUDENT',
          school: 'IFMK Paris',
          academicYear: 2,
          justificatifUrl: 'https://cdn.physioconnect.com/justifs/user-2026.pdf',
          cguAccepted: true,
        },
      },
      joinCabinetAsMember: {
        summary: 'Un kine rejoint un cabinet existant en tant que MEMBER',
        value: {
          profileType: 'MEMBER',
          cabinetId: '65f2a1b0c1d2e3f4a5b6c7d8',
          professionalNumber: '123456789',
          cguAccepted: true,
        },
      },
    },
  })
  @ApiCreatedResponse({
    description:
      'Profil cree et rattache au kine. Retourne la nouvelle enveloppe /me avec la liste complete des profils.',
  })
  @ApiConflictResponse({
    description:
      'Le kine a deja un profil identique (meme `profileType` sur le meme cabinet) — ' +
      '`PROFILE_ALREADY_EXISTS`.',
  })
  @ApiBadRequestResponse({
    description:
      'Validation echouee ou kine inactif (`KINE_INACTIVE`). Exemples: champs manquants pour le ' +
      'profileType, SIRET invalide, cabinetId manquant pour MEMBER/ASSISTANT.',
  })
  addProfile(
    @CurrentUser() user: JwtUser,
    @Body() dto: AddKineProfileDto,
    @UploadedFile() justificatif?: UploadedFileLike,
  ) {
    return this.authService.addProfileToKine(user.sub, dto, justificatif);
  }

  @SkipProfileGuard()
  @Patch('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Mise a jour du kine (L1 self-service)',
    description:
      "Met a jour les champs d'identite L1 du Compte kine authentifie. Accepte uniquement : " +
      "`firstName`, `lastName`, `phone`, `profilePhoto`, `timezone`, `language`.\n\n" +
      "Champs NON mutables ici (imposes par la regle metier) :\n" +
      "- `email` : changement passe par un flow dedie avec re-verification.\n" +
      "- `professionalNumber` : unique plateforme + workflow de verification admin (US-I.1/I.2).\n" +
      "- `verificationStatus` : admin-only.\n" +
      "- `status`, `roleId`, `cabinetId`, `profiles[]` (incl. `profiles[].isCabinetAdmin`) : admin / flows dedies.\n" +
      "- `passwordHash` : via POST /auth/change-password.",
  })
  @ApiOkResponse({ description: "Envelope /me mise a jour." })
  updateMe(@CurrentUser() user: JwtUser, @Body() dto: UpdateKineSelfDto) {
    return this.authService.updateKineSelf(user.sub, dto);
  }

  @SkipProfileGuard()
  @Patch('profiles/:profileId')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Mise a jour d\'un profil embedded (L2 self-service)',
    description:
      "Met a jour UN profil (subdoc) du kine authentifie. La propriete du profil est verifiee " +
      "cote serveur (404 `PROFILE_NOT_FOUND` si le profil n'appartient pas au Compte connecte).\n\n" +
      "Champs mutables cote self :\n" +
      "- `isActive: false` (self-suspension, la reactivation reste admin-only).\n" +
      "- `isReplacement` (LIBERAL / REMPLACANT uniquement, toggle profileType).\n" +
      "- `school`, `academicYear`, `justificatifUrl` (STUDENT uniquement).\n\n" +
      "Champs NON mutables cote self : `cabinetId`, `roleId`, `profileType`, `customPermissionOverrides`, " +
      "`subscriptionPlanId`, `cguAcceptedAt`, `cguVersion`. Toute mutation interdite sera rejetee " +
      "avec 400 `FIELD_NOT_APPLICABLE` ou 400 `PROFILE_ACTIVATION_ADMIN_ONLY` selon le cas.",
  })
  @ApiOkResponse({ description: "Envelope /me mise a jour." })
  updateProfile(
    @CurrentUser() user: JwtUser,
    @Param('profileId') profileId: string,
    @Body() dto: UpdateKineProfileSelfDto,
  ) {
    return this.authService.updateKineProfileSelf(
      user.sub,
      profileId,
      dto,
    );
  }
}
