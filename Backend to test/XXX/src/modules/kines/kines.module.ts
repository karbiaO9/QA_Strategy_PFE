import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Kine, KineSchema } from './schemas/kine.schema';
import {
  Cabinet,
  CabinetSchema,
} from '../cabinets/schemas/cabinet.schema';
import { KinesService } from './kines.service';
import { KinesController } from './kines.controller';
import { KineProfilesModule } from '../kine-profiles/kine-profiles.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Kine.name, schema: KineSchema },
      { name: Cabinet.name, schema: CabinetSchema },
    ]),
    // KinesService delegates profile reads/writes to this service.
    KineProfilesModule,
  ],
  controllers: [KinesController],
  providers: [KinesService],
  exports: [KinesService],
})
export class KinesModule {}
