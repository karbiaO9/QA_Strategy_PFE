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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { CheckPolicies } from '@common/decorators/check-policies.decorator';
import { CaslAction } from '@common/enums/casl-action.enum';
import { CaslSubject } from '@common/enums/casl-subject.enum';
import { AllowedUserTypes } from '@common/decorators/allowed-user-types.decorator';

@ApiTags('roles')
@ApiBearerAuth('access-token')
@AllowedUserTypes('admin')
@Controller('api/admin/v1/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @CheckPolicies((ability) =>
    ability.can(CaslAction.CREATE, CaslSubject.ROLE),
  )
  @ApiOperation({ summary: 'Creer un role' })
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Get()
  @CheckPolicies((ability) =>
    ability.can(CaslAction.READ, CaslSubject.ROLE),
  )
  @ApiOperation({ summary: 'Lister tous les roles' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @CheckPolicies((ability) =>
    ability.can(CaslAction.READ, CaslSubject.ROLE),
  )
  @ApiOperation({ summary: "Detail d'un role (avec permissions)" })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Put(':id')
  @CheckPolicies((ability) =>
    ability.can(CaslAction.UPDATE, CaslSubject.ROLE),
  )
  @ApiOperation({ summary: 'Modifier un role (invalide le cache)' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRoleDto>) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @CheckPolicies((ability) =>
    ability.can(CaslAction.DELETE, CaslSubject.ROLE),
  )
  @ApiOperation({ summary: 'Supprimer un role (interdit sur roles systeme)' })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
