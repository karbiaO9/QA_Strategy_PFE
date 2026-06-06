import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CheckPolicies } from '@common/decorators/check-policies.decorator';
import { CaslAction } from '@common/enums/casl-action.enum';
import { CaslSubject } from '@common/enums/casl-subject.enum';
import { AllowedUserTypes } from '@common/decorators/allowed-user-types.decorator';

@ApiTags('admins')
@ApiBearerAuth('access-token')
@AllowedUserTypes('admin')
@Controller('api/admin/v1/admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  @CheckPolicies((ability) =>
    ability.can(CaslAction.CREATE, CaslSubject.ADMIN),
  )
  @ApiOperation({
    summary: 'Creer un super-admin (reserve au SUPER_ADMIN existant)',
  })
  create(@Body() dto: CreateAdminDto) {
    return this.adminsService.create(dto);
  }

  @Get()
  @CheckPolicies((ability) =>
    ability.can(CaslAction.READ, CaslSubject.ADMIN),
  )
  @ApiOperation({ summary: 'Lister tous les admins' })
  findAll() {
    return this.adminsService.findAll();
  }

  @Get(':id')
  @CheckPolicies((ability) =>
    ability.can(CaslAction.READ, CaslSubject.ADMIN),
  )
  findOne(@Param('id') id: string) {
    return this.adminsService.findOne(id);
  }

  @Put(':id')
  @CheckPolicies((ability) =>
    ability.can(CaslAction.UPDATE, CaslSubject.ADMIN),
  )
  update(@Param('id') id: string, @Body() dto: Partial<CreateAdminDto>) {
    return this.adminsService.update(id, dto);
  }

  @Patch(':id/status')
  @CheckPolicies((ability) =>
    ability.can(CaslAction.MANAGE_STATUS, CaslSubject.ADMIN),
  )
  @ApiOperation({ summary: 'Activer/desactiver un admin (sans suppression)' })
  setStatus(
    @Param('id') id: string,
    @Body() body: { status: 'ACTIVE' | 'INACTIVE' },
  ) {
    return this.adminsService.setStatus(id, body.status);
  }

  @Delete(':id')
  @CheckPolicies((ability) =>
    ability.can(CaslAction.DELETE, CaslSubject.ADMIN),
  )
  @ApiOperation({ summary: 'Soft-delete admin (status INACTIVE)' })
  remove(@Param('id') id: string) {
    return this.adminsService.remove(id);
  }
}
