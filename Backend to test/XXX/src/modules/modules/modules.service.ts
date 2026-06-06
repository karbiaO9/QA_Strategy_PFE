import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Module, ModuleDocument } from './schemas/module.schema';
import { CreateModuleDto } from './dto/create-module.dto';
import { AuthErrorCode } from '@common/exceptions/auth-error-codes';
import { AppError } from '@common/exceptions/app-error';

@Injectable()
export class ModulesService {
  constructor(
    @InjectModel(Module.name) private moduleModel: Model<ModuleDocument>,
  ) {}

  async create(dto: CreateModuleDto) {
    return this.moduleModel.create(dto);
  }

  async findAll() {
    return this.moduleModel
      .find({ isActive: true, deletedAt: null })
      .exec();
  }

  async findOne(id: string) {
    const mod = await this.moduleModel.findById(id).exec();
    if (!mod) throw AppError.notFound(AuthErrorCode.MODULE_NOT_FOUND, 'Module not found.');
    return mod;
  }

  async update(id: string, dto: Partial<CreateModuleDto>) {
    const mod = await this.moduleModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!mod) throw AppError.notFound(AuthErrorCode.MODULE_NOT_FOUND, 'Module not found.');
    return mod;
  }

  async remove(id: string) {
    const mod = await this.moduleModel
      .findByIdAndUpdate(
        id,
        { deletedAt: new Date(), isActive: false },
        { new: true },
      )
      .exec();
    if (!mod) throw AppError.notFound(AuthErrorCode.MODULE_NOT_FOUND, 'Module not found.');
    return mod;
  }
}
