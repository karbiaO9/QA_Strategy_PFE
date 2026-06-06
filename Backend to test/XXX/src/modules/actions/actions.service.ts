import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Action, ActionDocument } from './schemas/action.schema';
import { CreateActionDto } from './dto/create-action.dto';
import { AuthErrorCode } from '@common/exceptions/auth-error-codes';
import { AppError } from '@common/exceptions/app-error';

@Injectable()
export class ActionsService {
  constructor(
    @InjectModel(Action.name) private actionModel: Model<ActionDocument>,
  ) {}

  async create(dto: CreateActionDto) {
    return this.actionModel.create(dto);
  }

  async findAll() {
    return this.actionModel.find({ isActive: true, deletedAt: null }).exec();
  }

  async findOne(id: string) {
    const action = await this.actionModel.findById(id).exec();
    if (!action) throw AppError.notFound(AuthErrorCode.ACTION_NOT_FOUND, 'Action not found.');
    return action;
  }

  async update(id: string, dto: Partial<CreateActionDto>) {
    const action = await this.actionModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!action) throw AppError.notFound(AuthErrorCode.ACTION_NOT_FOUND, 'Action not found.');
    return action;
  }

  async remove(id: string) {
    const action = await this.actionModel
      .findByIdAndUpdate(id, { deletedAt: new Date(), isActive: false }, { new: true })
      .exec();
    if (!action) throw AppError.notFound(AuthErrorCode.ACTION_NOT_FOUND, 'Action not found.');
    return action;
  }
}
