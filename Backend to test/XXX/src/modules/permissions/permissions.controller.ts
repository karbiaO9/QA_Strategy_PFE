import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { CheckPolicies } from '@common/decorators/check-policies.decorator';
import { CaslAction } from '@common/enums/casl-action.enum';
import { CaslSubject } from '@common/enums/casl-subject.enum';
import { AllowedUserTypes } from '@common/decorators/allowed-user-types.decorator';

@ApiTags('permissions')
@ApiBearerAuth('access-token')
@AllowedUserTypes('admin')
@Controller('api/admin/v1/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @CheckPolicies((ability) =>
    ability.can(CaslAction.CREATE, CaslSubject.PERMISSION),
  )
  @ApiOperation({ summary: 'Creer une permission (admin)' })
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }

  @Get()
  @CheckPolicies((ability) =>
    ability.can(CaslAction.READ, CaslSubject.PERMISSION),
  )
  @ApiOperation({ summary: 'Lister toutes les permissions' })
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @CheckPolicies((ability) =>
    ability.can(CaslAction.READ, CaslSubject.PERMISSION),
  )
  @ApiOperation({ summary: "Detail d'une permission" })
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Put(':id')
  @CheckPolicies((ability) =>
    ability.can(CaslAction.UPDATE, CaslSubject.PERMISSION),
  )
  @ApiOperation({ summary: 'Modifier une permission' })
  update(@Param('id') id: string, @Body() dto: Partial<CreatePermissionDto>) {
    return this.permissionsService.update(id, dto);
  }

  @Delete(':id')
  @CheckPolicies((ability) =>
    ability.can(CaslAction.DELETE, CaslSubject.PERMISSION),
  )
  @ApiOperation({ summary: 'Supprimer (soft) une permission' })
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
}
