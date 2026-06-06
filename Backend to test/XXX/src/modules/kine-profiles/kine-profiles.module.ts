import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  KineProfile,
  KineProfileSchema,
} from './schemas/kine-profile.schema';
import { KineProfilesService } from './kine-profiles.service';
import { KineProfilesController } from './kine-profiles.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KineProfile.name, schema: KineProfileSchema },
    ]),
  ],
  controllers: [KineProfilesController],
  providers: [KineProfilesService],
  exports: [KineProfilesService, MongooseModule],
})
export class KineProfilesModule {}
