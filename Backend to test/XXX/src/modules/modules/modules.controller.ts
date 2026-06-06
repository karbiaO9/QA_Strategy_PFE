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
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { CheckPolicies } from '@common/decorators/check-policies.decorator';
import { CaslAction } from '@common/enums/casl-action.enum';
import { CaslSubject } from '@common/enums/casl-subject.enum';
import { AllowedUserTypes } from '@common/decorators/allowed-user-types.decorator';

@ApiTags('modules')
@ApiBearerAuth('access-token')
@AllowedUserTypes('admin')
@Controller('api/admin/v1/modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  @CheckPolicies((ability) =>
    ability.can(CaslAction.CREATE, CaslSubject.PERMISSION),
  )
  @ApiOperation({ summary: 'Creer un module (admin)' })
  create(@Body() dto: CreateModuleDto) {
    return this.modulesService.create(dto);
  }

  @Get()
  @CheckPolicies((ability) =>
    ability.can(CaslAction.READ, CaslSubject.PERMISSION),
  )
  @ApiOperation({ summary: 'Lister tous les modules' })
  findAll() {
    return this.modulesService.findAll();
  }

  @Get(':id')
  @CheckPolicies((ability) =>
    ability.can(CaslAction.READ, CaslSubject.PERMISSION),
  )
  @ApiOperation({ summary: "Detail d'un module" })
  findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id);
  }

  @Put(':id')
  @CheckPolicies((ability) =>
    ability.can(CaslAction.UPDATE, CaslSubject.PERMISSION),
  )
  @ApiOperation({ summary: 'Modifier un module' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateModuleDto>) {
    return this.modulesService.update(id, dto);
  }

  @Delete(':id')
  @CheckPolicies((ability) =>
    ability.can(CaslAction.DELETE, CaslSubject.PERMISSION),
  )
  @ApiOperation({ summary: 'Supprimer (soft) un module' })
  remove(@Param('id') id: string) {
    return this.modulesService.remove(id);
  }
}
