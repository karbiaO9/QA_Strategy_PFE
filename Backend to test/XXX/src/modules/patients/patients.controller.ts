import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { subject } from '@casl/ability';

import { PatientsService } from './patients.service';
import { Patient } from './schemas/patient.schema';
import { CreatePatientDto } from './dto/create-patient.dto';
import { CheckPolicies } from '@common/decorators/check-policies.decorator';
import { CurrentAbility } from '@common/decorators/current-ability.decorator';
import type { AppAbility } from '@common/casl/casl-ability.factory';
import { CaslAction } from '@common/enums/casl-action.enum';
import { CaslSubject } from '@common/enums/casl-subject.enum';
import { AuthErrorCode } from '@common/exceptions/auth-error-codes';
import { AppError } from '@common/exceptions/app-error';
import { AllowedUserTypes } from '@common/decorators/allowed-user-types.decorator';


@ApiTags('patients')
@ApiBearerAuth('access-token')
@AllowedUserTypes('admin')
@Controller('api/admin/v1/patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @CheckPolicies((a) => a.can(CaslAction.CREATE, CaslSubject.PATIENT))
  @ApiOperation({ summary: 'Creer un patient (admin)' })
  create(@Body() dto: CreatePatientDto) {
    if (!dto.uniqueCode) {
      throw AppError.badRequest(
        AuthErrorCode.UNIQUE_CODE_REQUIRED,
        'uniqueCode is required when creating a patient as admin.',
      );
    }
    return this.patientsService.create(dto as any);
  }

  @Get()
  @CheckPolicies((a) => a.can(CaslAction.READ, CaslSubject.PATIENT))
  @ApiOperation({ summary: 'Lister les patients (scope cabinet auto)' })
  findAll() {
    return this.patientsService.findAll();
  }

  @Get(':id')
  @CheckPolicies((a) => a.can(CaslAction.READ, CaslSubject.PATIENT))
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

  @Put(':id')
  @CheckPolicies((a) => a.can(CaslAction.UPDATE, CaslSubject.PATIENT))
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

  @Delete(':id')
  @CheckPolicies((a) => a.can(CaslAction.DELETE, CaslSubject.PATIENT))
  async remove(
    @Param('id') id: string,
    @CurrentAbility() ability: AppAbility,
  ) {
    const patient = await this.patientsService.findOne(id, {
      bypassTenantScope: true,
    });
    const pojo = normalizeForCasl(patient);
    if (!ability.can(CaslAction.DELETE, subject(CaslSubject.PATIENT, pojo))) {
      throw AppError.forbidden(AuthErrorCode.PERMISSION_DENIED, 'You do not have permission to delete this patient.');
    }
    return this.patientsService.remove(id);
  }
}

function normalizeForCasl(doc: any): Patient {
  const obj = typeof doc?.toObject === 'function' ? doc.toObject() : doc;
  return JSON.parse(JSON.stringify(obj)) as Patient;
}
