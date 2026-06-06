import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { KinesService } from './kines.service';
import { CreateKineDto } from './dto/create-kine.dto';
import {
  UpdateVerificationDto,
  ListVerificationsQueryDto,
} from './dto/update-verification.dto';
import { CheckPolicies } from '@common/decorators/check-policies.decorator';
import { CaslAction } from '@common/enums/casl-action.enum';
import { CaslSubject } from '@common/enums/casl-subject.enum';
import { VerificationDecision } from '@common/enums/verification-decision.enum';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { JwtUser } from '@common/decorators/current-user.decorator';
import { AllowedUserTypes } from '@common/decorators/allowed-user-types.decorator';

@ApiTags('kines')
@ApiBearerAuth('access-token')
@AllowedUserTypes('admin')
@Controller('api/admin/v1/kines')
export class KinesController {
  constructor(private readonly kinesService: KinesService) {}

  @Post()
  @CheckPolicies((a) => a.can(CaslAction.CREATE, CaslSubject.KINE))
  @ApiOperation({
    summary: 'Creer un Compte Kine (L1 identite uniquement)',
    description:
      "Cree uniquement l'identite L1 — email, mot de passe, nom, prenom, telephone, numero " +
      "professionnel, CGU. Le Compte est cree sans profil : un profil devra etre attache " +
      "separement (via registration flows ou /profiles endpoints a venir).\n\n" +
      "Permission CASL requise : `CREATE KINE`.",
  })
  @ApiOkResponse({ description: 'Kine cree. Retourne le document sans passwordHash.' })
  @ApiBadRequestResponse({ description: 'Validation echouee (email, password complexity, lengths).' })
  @ApiConflictResponse({ description: 'Email deja utilise.' })
  @ApiForbiddenResponse({ description: 'Permission CREATE KINE refusee.' })
  create(@Body() dto: CreateKineDto) {
    return this.kinesService.create(dto);
  }

  @Get()
  @CheckPolicies((a) => a.can(CaslAction.READ, CaslSubject.KINE))
  @ApiOperation({
    summary: 'Lister les kines actifs',
    description:
      "Retourne tous les kines avec `status === 'ACTIVE'`. Le filtrage tenant (cabinetId) est " +
      "applique au niveau des conditions CASL si l'utilisateur a un scope restreint.\n\n" +
      "Permission CASL requise : `READ KINE`.",
  })
  @ApiOkResponse({ description: 'Liste des kines.' })
  @ApiForbiddenResponse({ description: 'Permission READ KINE refusee.' })
  findAll() {
    return this.kinesService.findAll();
  }

  @Get('verifications')
  @CheckPolicies((a) => a.can(CaslAction.READ, CaslSubject.KINE))
  @ApiOperation({
    summary: "File de verification manuelle des numeros professionnels (US-I.1)",
    description:
      "Retourne la liste des Comptes kines dont le numero professionnel est en attente de " +
      "validation admin (`verificationStatus = PENDING` par defaut). Le SUPER_ADMIN (ou tout role " +
      "disposant de `READ KINE`) consulte cette file puis appelle " +
      "`PATCH /api/admin/v1/kines/:id/verification` pour trancher.\n\n" +
      "**Non-bloquant** : les kines PENDING disposent deja de leur session applicative ; la " +
      "verification conditionne uniquement l'affichage du badge 'Profil verifie'",
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    description: 'Filtre (default: PENDING).',
  })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'skip', required: false, example: 0 })
  @ApiOkResponse({
    description:
      'Liste paginée des Comptes kines. Chaque element contient email, nom/prenom, professionalNumber, verificationStatus, verifiedAt, verificationRejectionReason, createdAt/updatedAt.',
  })
  listVerifications(@Query() q: ListVerificationsQueryDto) {
    const status = (q.status as 'PENDING' | 'VERIFIED' | 'REJECTED') ?? 'PENDING';
    const limit = q.limit !== undefined ? Number(q.limit) : undefined;
    const skip = q.skip !== undefined ? Number(q.skip) : undefined;
    return this.kinesService.listByVerificationStatus(status, { limit, skip });
  }

  @Patch(':id/verification')
  @CheckPolicies((a) => a.can(CaslAction.UPDATE, CaslSubject.KINE))
  @ApiOperation({
    summary: "Decision admin sur la verification d'un numero professionnel (US-I.1)",
    description:
      "Permet au SUPER_ADMIN (ou tout role avec `UPDATE KINE`) de trancher sur un numero " +
      "professionnel precedement positionne a PENDING :\n" +
      "- `APPROVE` -> verificationStatus = VERIFIED, verifiedAt = now, efface le rejectionReason.\n" +
      "- `REJECT`  -> verificationStatus = REJECTED, rejectionReason enregistre (3-500 car).\n" +
      "- `RESET`   -> verificationStatus = PENDING (re-soumission).\n\n" +
      "`verifiedByAdminId` trace l'admin ayant pris la decision. Le kine cible voit sa badge " +
      "mise a jour sans se reconnecter (le champ est servi par `/me`).",
  })
  @ApiParam({ name: 'id', description: 'ObjectId du Kine cible' })
  @ApiBody({
    type: UpdateVerificationDto,
    examples: {
      approve: {
        summary: 'Approuver (annuaire.sante.fr verifie manuellement)',
        value: { decision: 'APPROVE' },
      },
      reject: {
        summary: 'Rejeter avec motif',
        value: {
          decision: 'REJECT',
          rejectionReason: 'ADELI introuvable sur annuaire.sante.fr — re-soumettre un justificatif lisible.',
        },
      },
      reset: {
        summary: 'Reouvrir (re-soumission)',
        value: { decision: 'RESET' },
      },
    },
  })
  @ApiOkResponse({ description: 'Kine mis a jour.' })
  @ApiBadRequestResponse({
    description:
      "Motif manquant sur REJECT (`REJECTION_REASON_REQUIRED`) ou decision invalide.",
  })
  @ApiNotFoundResponse({ description: 'Kine introuvable.' })
  @ApiForbiddenResponse({ description: 'Permission UPDATE KINE refusee.' })
  async updateVerification(
    @Param('id') id: string,
    @Body() dto: UpdateVerificationDto,
    @CurrentUser() admin: JwtUser,
  ) {
    return this.kinesService.updateVerification(
      id,
      admin.sub,
      dto.decision as VerificationDecision,
      dto.rejectionReason,
    );
  }

  @Get(':id')
  @CheckPolicies((a) => a.can(CaslAction.READ, CaslSubject.KINE))
  @ApiOperation({
    summary: 'Recuperer un kine par id',
    description: "Retourne le document Kine avec ses profils embedded. Permission requise : `READ KINE`.",
  })
  @ApiParam({ name: 'id', description: 'ObjectId du Kine' })
  @ApiOkResponse({ description: 'Kine trouve.' })
  @ApiNotFoundResponse({ description: 'Kine introuvable.' })
  @ApiForbiddenResponse({ description: 'Permission READ KINE refusee.' })
  findOne(@Param('id') id: string) {
    return this.kinesService.findOne(id);
  }

  @Put(':id')
  @CheckPolicies((a) => a.can(CaslAction.UPDATE, CaslSubject.KINE))
  @ApiOperation({
    summary: "Mettre a jour l'identite L1 d'un kine",
    description:
      "Accepte uniquement les champs de la couche identite (Partial<CreateKineDto>). " +
      "Les profils embedded ne sont PAS modifiables via cet endpoint — utiliser les endpoints " +
      "dedies /profiles (a venir).\n\nPermission CASL requise : `UPDATE KINE`.",
  })
  @ApiParam({ name: 'id', description: 'ObjectId du Kine' })
  @ApiOkResponse({ description: 'Kine mis a jour.' })
  @ApiNotFoundResponse({ description: 'Kine introuvable.' })
  @ApiBadRequestResponse({ description: 'Validation echouee.' })
  @ApiForbiddenResponse({ description: 'Permission UPDATE KINE refusee.' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateKineDto>) {
    return this.kinesService.update(id, dto);
  }

  @Delete(':id')
  @CheckPolicies((a) => a.can(CaslAction.DELETE, CaslSubject.KINE))
  @ApiOperation({
    summary: 'Desactiver (soft delete) un kine',
    description:
      "Positionne `status: INACTIVE` — ne supprime pas le document. Refuse la suppression " +
      "si le kine est proprietaire d'un Cabinet : le proprietaire doit etre transfere " +
      "manuellement via le Customer Success Manager.\n\n" +
      "Permission CASL requise : `DELETE KINE`.",
  })
  @ApiParam({ name: 'id', description: 'ObjectId du Kine' })
  @ApiOkResponse({ description: 'Kine desactive.' })
  @ApiBadRequestResponse({ description: 'Le kine est proprietaire d\'un cabinet — transfert CSM requis.' })
  @ApiNotFoundResponse({ description: 'Kine introuvable.' })
  @ApiForbiddenResponse({ description: 'Permission DELETE KINE refusee.' })
  remove(@Param('id') id: string) {
    return this.kinesService.remove(id);
  }
}
