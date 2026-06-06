import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Types } from 'mongoose';

import { KineProfilesService } from './kine-profiles.service';
import { CheckPolicies } from '@common/decorators/check-policies.decorator';
import { CaslAction } from '@common/enums/casl-action.enum';
import { CaslSubject } from '@common/enums/casl-subject.enum';
import { AuthErrorCode } from '@common/exceptions/auth-error-codes';
import { AppError } from '@common/exceptions/app-error';
import { AllowedUserTypes } from '@common/decorators/allowed-user-types.decorator';

@ApiTags('kine-profiles')
@ApiBearerAuth('access-token')
@AllowedUserTypes('admin')
@Controller('api/admin/v1/kine-profiles')
export class KineProfilesController {
  constructor(private readonly kineProfilesService: KineProfilesService) {}

  @Get()
  @CheckPolicies((a) => a.can(CaslAction.READ, CaslSubject.KINE))
  @ApiOperation({
    summary: 'Lister les profils kine (filtre kineId)',
    description:
      'Retourne tous les profils dun kine donne. Filtre obligatoire `kineId` ' +
      "pour eviter d'exposer la collection entiere; utilisez l'endpoint " +
      'admin kines pour des recherches plus larges.',
  })
  @ApiQuery({ name: 'kineId', required: true })
  async list(@Query('kineId') kineId?: string) {
    if (!kineId) {
      throw AppError.badRequest(
        AuthErrorCode.KINE_ID_REQUIRED,
        'Query parameter `kineId` is required.',
      );
    }
    if (!Types.ObjectId.isValid(kineId)) {
      throw AppError.badRequest(
        AuthErrorCode.KINE_ID_INVALID,
        '`kineId` must be a valid ObjectId.',
      );
    }
    return this.kineProfilesService.findByKine(kineId);
  }

  @Get(':id')
  @CheckPolicies((a) => a.can(CaslAction.READ, CaslSubject.KINE))
  @ApiOperation({ summary: 'Recuperer un profil kine par son id' })
  @ApiNotFoundResponse({ description: '`PROFILE_NOT_FOUND`' })
  async getOne(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw AppError.badRequest(
        AuthErrorCode.PROFILE_ID_INVALID,
        '`id` must be a valid ObjectId.',
      );
    }
    const profile = await this.kineProfilesService.findOne(id);
    if (!profile) {
      throw AppError.notFound(
        AuthErrorCode.PROFILE_NOT_FOUND,
        'Profile not found.',
      );
    }
    return profile;
  }

  @Patch(':id')
  @CheckPolicies((a) => a.can(CaslAction.UPDATE, CaslSubject.KINE))
  @ApiOperation({
    summary: 'Modifier un profil kine (admin)',
    description:
      'Whitelist explicite — seuls `isActive`, `isCabinetAdmin`, ' +
      '`subscriptionPlanId` et `additionalMetadata` sont mutables via ' +
      "cet endpoint. `roleId` / `cabinetId` / `profileType` ne le sont pas " +
      "(retirer-recreer un profil pour les changer).",
  })
  @ApiOkResponse({ description: 'Profil mis a jour.' })
  async patch(
    @Param('id') id: string,
    @Body()
    body: {
      isActive?: boolean;
      isCabinetAdmin?: boolean;
      subscriptionPlanId?: string | null;
      additionalMetadata?: Record<string, unknown>;
    },
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw AppError.badRequest(
        AuthErrorCode.PROFILE_ID_INVALID,
        '`id` must be a valid ObjectId.',
      );
    }
    const allowedKeys: Array<keyof typeof body> = [
      'isActive',
      'isCabinetAdmin',
      'subscriptionPlanId',
      'additionalMetadata',
    ];
    const patch: Record<string, unknown> = {};
    for (const field of allowedKeys) {
      if (body[field] !== undefined) patch[field] = body[field];
    }
    if (Object.keys(patch).length === 0) {
      throw AppError.badRequest(
        AuthErrorCode.PATCH_EMPTY,
        'Provide at least one of: isActive, isCabinetAdmin, subscriptionPlanId, additionalMetadata.',
      );
    }
    const updated = await this.kineProfilesService.update(id, patch as any);
    if (!updated) {
      throw AppError.notFound(
        AuthErrorCode.PROFILE_NOT_FOUND,
        'Profile not found.',
      );
    }
    return updated;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @CheckPolicies((a) => a.can(CaslAction.UPDATE, CaslSubject.KINE))
  @ApiOperation({
    summary: 'Supprimer un profil kine (admin)',
    description:
      "Hard-delete sur la collection kineprofiles. Pour conserver l'historique, preferer " +
      'PATCH avec `isActive: false`. Si le profil supprime est le `lastProfileId` du kine, ' +
      'le caller doit reset `lastProfileId` (futur amelioration : cascade automatique).',
  })
  @ApiNoContentResponse()
  async remove(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw AppError.badRequest(
        AuthErrorCode.PROFILE_ID_INVALID,
        '`id` must be a valid ObjectId.',
      );
    }
    await this.kineProfilesService.remove(id);
  }
}
