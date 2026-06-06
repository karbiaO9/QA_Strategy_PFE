import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cabinet, CabinetDocument } from './schemas/cabinet.schema';
import { AuthErrorCode } from '@common/exceptions/auth-error-codes';
import { AppError } from '@common/exceptions/app-error';

@Injectable()
export class CabinetsService {
  constructor(
    @InjectModel(Cabinet.name) private cabinetModel: Model<CabinetDocument>,
  ) {}

  async create(data: {
    name: string;
    ownerId: string | Types.ObjectId;
    address?: string;
    timezone?: string;
    country?: string;
    legalName?: string;
    taxRegistrationNumber?: string;
  }) {
    return this.cabinetModel.create(data);
  }

  async findOne(id: string) {
    const cabinet = await this.cabinetModel.findById(id).exec();
    if (!cabinet) {
      throw AppError.notFound(AuthErrorCode.CABINET_NOT_FOUND, 'Cabinet not found.');
    }
    return cabinet;
  }

  async findAll() {
    return this.cabinetModel.find({ isActive: true }).exec();
  }
}
