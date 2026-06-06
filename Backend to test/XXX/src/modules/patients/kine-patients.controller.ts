import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { subject } from '@casl/ability';

import { PatientsService } from './patients.service';
import { Patient } from './schemas/patient.schema';
import { CreatePatientDto } from './dto/create-patient.dto';
import { CheckPolicies } from '@common/decorators/check-policies.decorator';
import { CurrentAbility } from '@common/decorators/current-ability.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { JwtUser } from '@common/decorators/current-user.decorator';
import type { AppAbility } from '@common/casl/casl-ability.factory';
import { CaslAction } from '@common/enums/casl-action.enum';
import { CaslSubject } from '@common/enums/casl-subject.enum';
import { AuthErrorCode } from '@common/exceptions/auth-error-codes';
import { AppError } from '@common/exceptions/app-error';
import { AllowedUserTypes } from '@common/decorators/allowed-user-types.decorator';


@ApiTags('kine-patients')
@ApiBearerAuth('access-token')
@AllowedUserTypes('kine')
@Controller('api/v1/kine/patients')
export class KinePatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @CheckPolicies((a) => a.can(CaslAction.READ, CaslSubject.PATIENT))
  @ApiOperation({
    summary: 'Lister tous les patients du cabinet du kine authentifie',
    description:
      'Filtre optionnel `source`: real (defaut UI), fictif (sandbox student), ou all.',
  })
  @ApiQuery({
    name: 'source',
    required: false,
    enum: ['real', 'fictif', 'all'],
    description:
      'Filtre la liste par provenance. Omis = tous les patients du kine (real + fictif).',
  })
  findAll(@Query('source') source?: 'real' | 'fictif' | 'all') {
    if (source && source !== 'real' && source !== 'fictif' && source !== 'all') {
      throw AppError.badRequest(
        AuthErrorCode.INVALID_QUERY_PARAM,
        "Query param `source` must be one of: 'real', 'fictif', 'all'.",
      );
    }
    return this.patientsService.findAll({ source });
  }

  @Get(':id')
  @CheckPolicies((a) => a.can(CaslAction.READ, CaslSubject.PATIENT))
  @ApiOperation({ summary: 'Voir un patient (CASL verifie les conditions)' })
  async findOne(
    @Param('id') id: string,
    @CurrentAbility() ability: AppAbility,
  ) {
    const patient = await this.patientsService.findOne(id, {
      bypassTenantScope: true,
    });
    const pojo = normalizeForCasl(patient);
    if (!ability.can(CaslAction.READ, subject(CaslSubject.PATIENT, pojo))) {
      throw AppError.forbidden(AuthErrorCode.PERMISSION_DENIED, 'Patient not accessible.');
    }
    return patient;
  }

  @Post()
  @CheckPolicies((a) => a.can(CaslAction.CREATE, CaslSubject.PATIENT))
  @ApiOperation({
    summary:
      'Creer un patient (ownerId + cabinetId forces au kine authentifie)',
  })
  async create(
    @Body() dto: CreatePatientDto,
    @CurrentUser() user: JwtUser,
  ) {
    if (!dto.uniqueCode) {
      throw AppError.badRequest(AuthErrorCode.UNIQUE_CODE_REQUIRED, 'uniqueCode is required.');
    }
    const data: any = {
      ...dto,
      ownerId: user.sub,
      cabinetId: user.cabinetId,
    };
    return this.patientsService.create(data);
  }

  @Put(':id')
  @CheckPolicies((a) => a.can(CaslAction.UPDATE, CaslSubject.PATIENT))
  @ApiOperation({
    summary:
      'Modifier un patient (per-record CASL : filtre par ownerId pour KINE)',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreatePatientDto>,
    @CurrentAbility() ability: AppAbility,
  ) {
    const patient = await this.patientsService.findOne(id, {
      bypassTenantScope: true,
    });
    const pojo = normalizeForCasl(patient);
    if (!ability.can(CaslAction.UPDATE, subject(CaslSubject.PATIENT, pojo))) {
      throw AppError.forbidden(AuthErrorCode.PERMISSION_DENIED, 'You do not have permission to modify this patient.');
    }
    return this.patientsService.update(id, dto);
  }

  @Post('link/:uniqueCode')
  @CheckPolicies((a) => a.can(CaslAction.CREATE, CaslSubject.PATIENT))
  @ApiOperation({
    summary:
      'Lier un patient existant au kine courant via son uniqueCode 12 char',
  })
  async linkToMe(
    @Param('uniqueCode') uniqueCode: string,
    @CurrentUser() user: JwtUser,
  ) {
    const patient = await this.patientsService.findByUniqueCode(uniqueCode);
    if (!patient) {
      throw AppError.notFound(AuthErrorCode.PATIENT_NOT_FOUND, 'No patient found with this code.');
    }
    if (!user.cabinetId) {
      throw AppError.badRequest(
        AuthErrorCode.KINE_NO_CABINET,
        'The current kine is not attached to any cabinet.',
      );
    }
    return this.patientsService.linkToKine(
      patient._id.toString(),
      user.sub,
      user.cabinetId,
    );
  }
}


function normalizeForCasl(doc: any): Patient {
  const obj = typeof doc?.toObject === 'function' ? doc.toObject() : doc;
  return JSON.parse(JSON.stringify(obj)) as Patient;
}
