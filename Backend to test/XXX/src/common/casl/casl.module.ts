import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Role,
  RoleSchema,
} from '../../modules/roles/schemas/role.schema';
import {
  Permission,
  PermissionSchema,
} from '../../modules/permissions/schemas/permission.schema';
import {
  Action,
  ActionSchema,
} from '../../modules/actions/schemas/action.schema';
import {
  Module as ModuleEntity,
  ModuleSchema,
} from '../../modules/modules/schemas/module.schema';
import { CaslAbilityFactory } from './casl-ability.factory';
import { RedisModule } from '../redis/redis.module';

@Global()
@Module({
  imports: [
    RedisModule,
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: Action.name, schema: ActionSchema },
      { name: ModuleEntity.name, schema: ModuleSchema },
    ]),
  ],
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class CaslModule {}
