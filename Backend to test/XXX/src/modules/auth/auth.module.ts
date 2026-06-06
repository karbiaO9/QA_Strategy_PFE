import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthService } from './auth.service';
import { TokensService } from './services/tokens.service';
import { UniqueCodeService } from './services/unique-code.service';

import {
  KineAuthController,
  KineMeController,
} from './controllers/kine-auth.controller';
import {
  PatientAuthController,
  PatientMeController,
} from './controllers/patient-auth.controller';
import {
  AdminAuthController,
  AdminMeController,
} from './controllers/admin-auth.controller';
import { AdminKineProfilesController } from './controllers/admin-kine-profiles.controller';

import { KinesModule } from '../kines/kines.module';
import { PatientsModule } from '../patients/patients.module';
import { RolesModule } from '../roles/roles.module';
import { AdminsModule } from '../admins/admins.module';
import { CabinetsModule } from '../cabinets/cabinets.module';
import { Patient, PatientSchema } from '../patients/schemas/patient.schema';


@Module({
  imports: [
    KinesModule,
    PatientsModule,
    RolesModule,
    AdminsModule,
    CabinetsModule,
    MongooseModule.forFeature([{ name: Patient.name, schema: PatientSchema }]),
  ],
  controllers: [
    KineAuthController,
    KineMeController,
    PatientAuthController,
    PatientMeController,
    AdminAuthController,
    AdminMeController,
    AdminKineProfilesController,
  ],
  providers: [AuthService, TokensService, UniqueCodeService],
  exports: [AuthService, TokensService],
})
export class AuthModule {}
