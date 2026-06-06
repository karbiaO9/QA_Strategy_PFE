import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from '../auth.service';
import { AddKineProfileDto } from '../dto/add-kine-profile.dto';
import { CheckPolicies } from '@common/decorators/check-policies.decorator';
import { CaslAction } from '@common/enums/casl-action.enum';
import { CaslSubject } from '@common/enums/casl-subject.enum';
import { JustificatifFileInterceptor } from '@common/uploads/supporting-document.interceptor';
import type { UploadedFileLike } from '@common/uploads/supporting-document.interceptor';
import { AllowedUserTypes } from '@common/decorators/allowed-user-types.decorator';

@ApiTags('kines')
@ApiBearerAuth('access-token')
@AllowedUserTypes('admin')
@Controller('api/admin/v1/kines')
export class AdminKineProfilesController {
  constructor(private readonly authService: AuthService) {}

  @Post(':id/profiles')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(JustificatifFileInterceptor())
  @ApiConsumes('multipart/form-data', 'application/json')
  @CheckPolicies((a) => a.can(CaslAction.UPDATE, CaslSubject.KINE))
  @ApiOperation({
    summary: 'Ajouter un profil a un kine existant (cote admin / super-admin)',
    description:
      "Endpoint back-office : SUPER_ADMIN (ou tout role avec la permission `UPDATE KINE`) " +
      "attache un nouveau profil a un Compte Kine existant SANS reinscription et SANS " +
      "deconnexion du kine cible.\n\n" +
      "Le serveur :\n" +
      "1. Charge le Kine (bypass tenant-scope).\n" +
      "2. Refuse si le Kine est inactif (`KINE_INACTIVE`).\n" +
      "3. Refuse un doublon (meme `profileType` sur le meme `cabinetId`) via " +
      "`PROFILE_ALREADY_EXISTS`.\n" +
      "4. Cree le cabinet au besoin (LIBERAL / ADMIN_GROUP) ou valide le `cabinetId` fourni " +
      "(MEMBER / ASSISTANT).\n" +
      "5. Invalide les cles CASL Redis `perms:{kineId}` et `perms:profile:{id}` pour chaque " +
      "profil existant — le kine verra ses nouvelles regles au prochain appel, sans se " +
      "reconnecter.\n" +
      "6. Ne cree PAS un nouveau Compte et ne renvoie PAS de nouveaux tokens.\n\n" +
      "Permission CASL requise : `UPDATE KINE`.",
  })
  @ApiParam({ name: 'id', description: 'ObjectId du Kine cible' })
  @ApiBody({
    type: AddKineProfileDto,
    examples: {
      addMember: {
        summary: 'Attacher un MEMBER a un cabinet existant',
        value: {
          profileType: 'MEMBER',
          cabinetId: '65f2a1b0c1d2e3f4a5b6c7d8',
          professionalNumber: '987654321',
          cguAccepted: true,
        },
      },
      addAdminGroup: {
        summary: "Creer un nouveau cabinet ADMIN_GROUP pour un kine existant",
        value: {
          profileType: 'ADMIN_GROUP',
          professionalNumber: '10000000001',
          cabinetName: "Cabinet Lyon Presqu'ile",
          street: '3 Rue de la Republique',
          postalCode: '69002',
          city: 'Lyon',
          siret: '81234567800013',
          legalName: "Cabinet Lyon Presqu'ile SAS",
          cguAccepted: true,
        },
      },
      addStudent: {
        summary: 'Attacher un profil STUDENT (reprise d\'etudes)',
        value: {
          profileType: 'STUDENT',
          school: 'IFMK Paris',
          academicYear: 3,
          justificatifUrl: 'https://cdn.physioconnect.com/justifs/user-2026.pdf',
          cguAccepted: true,
        },
      },
    },
  })
  @ApiCreatedResponse({
    description:
      'Profil cree et rattache. Retourne `{ newProfileId, cabinetId, storedProfileType, cabinetCreated, me }`.',
  })
  @ApiBadRequestResponse({
    description: 'Validation echouee ou kine inactif (`KINE_INACTIVE`).',
  })
  @ApiNotFoundResponse({ description: 'Kine ou cabinet cible introuvable.' })
  @ApiConflictResponse({
    description: 'Profil identique deja present (`PROFILE_ALREADY_EXISTS`).',
  })
  @ApiForbiddenResponse({ description: 'Permission UPDATE KINE refusee.' })
  addProfile(
    @Param('id') id: string,
    @Body() dto: AddKineProfileDto,
    @UploadedFile() justificatif?: UploadedFileLike,
  ) {
    return this.authService.addProfileToKine(id, dto, justificatif, {
      scope: 'admin',
    });
  }
}
