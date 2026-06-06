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
import { ActionsService } from './actions.service';
import { CreateActionDto } from './dto/create-action.dto';
import { CheckPolicies } from '@common/decorators/check-policies.decorator';
import { CaslAction } from '@common/enums/casl-action.enum';
import { CaslSubject } from '@common/enums/casl-subject.enum';
import { AllowedUserTypes } from '@common/decorators/allowed-user-types.decorator';

@ApiTags('actions')
@ApiBearerAuth('access-token')
@AllowedUserTypes('admin')
@Controller('api/admin/v1/actions')
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  @Post()
  @CheckPolicies((ability) =>
    ability.can(CaslAction.CREATE, CaslSubject.PERMISSION),
  )
  @ApiOperation({ summary: 'Creer une action (admin)' })
  create(@Body() dto: CreateActionDto) {
    return this.actionsService.create(dto);
  }

  @Get()
  @CheckPolicies((ability) =>
    ability.can(CaslAction.READ, CaslSubject.PERMISSION),
  )
  @ApiOperation({ summary: 'Lister toutes les actions' })
  findAll() {
    return this.actionsService.findAll();
  }

  @Get(':id')
  @CheckPolicies((ability) =>
    ability.can(CaslAction.READ, CaslSubject.PERMISSION),
  )
  @ApiOperation({ summary: "Detail d'une action" })
  findOne(@Param('id') id: string) {
    return this.actionsService.findOne(id);
  }

  @Put(':id')
  @CheckPolicies((ability) =>
    ability.can(CaslAction.UPDATE, CaslSubject.PERMISSION),
  )
  @ApiOperation({ summary: 'Modifier une action' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateActionDto>) {
    return this.actionsService.update(id, dto);
  }

  @Delete(':id')
  @CheckPolicies((ability) =>
    ability.can(CaslAction.DELETE, CaslSubject.PERMISSION),
  )
  @ApiOperation({ summary: 'Supprimer (soft) une action' })
  remove(@Param('id') id: string) {
    return this.actionsService.remove(id);
  }
}
