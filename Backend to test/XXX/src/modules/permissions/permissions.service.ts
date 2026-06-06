import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { AuthErrorCode } from '@common/exceptions/auth-error-codes';
import { AppError } from '@common/exceptions/app-error';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private permissionModel: Model<PermissionDocument>,
  ) {}

  async create(dto: CreatePermissionDto) {
    return this.permissionModel.create(dto);
  }

  async findAll() {
    return this.permissionModel
      .find({ isActive: true, deletedAt: null })
      .populate('moduleId')
      .populate('actionIds')
      .populate('parentPermissionId')
      .exec();
  }

  async findByModule(moduleId: string) {
    return this.permissionModel
      .find({ moduleId, isActive: true, deletedAt: null })
      .populate('actionIds')
      .populate('parentPermissionId')
      .exec();
  }

  async findOne(id: string) {
    const permission = await this.permissionModel
      .findById(id)
      .populate('moduleId')
      .populate('actionIds')
      .populate('parentPermissionId')
      .exec();
    if (!permission) throw AppError.notFound(AuthErrorCode.PERMISSION_NOT_FOUND, 'Permission not found.');
    return permission;
  }

  async update(id: string, dto: Partial<CreatePermissionDto>) {
    const permission = await this.permissionModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!permission) throw AppError.notFound(AuthErrorCode.PERMISSION_NOT_FOUND, 'Permission not found.');
    return permission;
  }

  async remove(id: string) {
    const permission = await this.permissionModel
      .findByIdAndUpdate(
        id,
        { isActive: false, deletedAt: new Date() },
        { new: true },
      )
      .exec();
    if (!permission) throw AppError.notFound(AuthErrorCode.PERMISSION_NOT_FOUND, 'Permission not found.');
    return permission;
  }
}
