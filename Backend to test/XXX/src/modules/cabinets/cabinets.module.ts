import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cabinet, CabinetSchema } from './schemas/cabinet.schema';
import { CabinetsService } from './cabinets.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cabinet.name, schema: CabinetSchema }]),
  ],
  providers: [CabinetsService],
  exports: [CabinetsService],
})
export class CabinetsModule {}
