import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import {
  Patient,
  PatientDocument,
} from '../../patients/schemas/patient.schema';


@Injectable()
export class UniqueCodeService {
  private readonly CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  private readonly CODE_LENGTH = 12;
  private readonly MAX_ATTEMPTS = 5;

  constructor(
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
  ) {}

  async generateUniqueCode(): Promise<string> {
    for (let attempt = 0; attempt < this.MAX_ATTEMPTS; attempt++) {
      const code = this.randomCode();
      const existing = await this.patientModel
        .findOne({ uniqueCode: code })
        .lean()
        .exec();
      if (!existing) return code;
    }
    throw new Error(
      `Could not generate a unique uniqueCode after ${this.MAX_ATTEMPTS} attempts.`,
    );
  }

  private randomCode(): string {
    const bytes = crypto.randomBytes(this.CODE_LENGTH);
    let code = '';
    for (let position = 0; position < this.CODE_LENGTH; position++) {
      code += this.CHARSET[bytes[position] % this.CHARSET.length];
    }
    return code;
  }
}
