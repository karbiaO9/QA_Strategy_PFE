import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { AuthErrorCode } from '@common/exceptions/auth-error-codes';
import { AppError } from '@common/exceptions/app-error';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  async create(dto: CreateRoleDto) {
    return this.roleModel.create(dto);
  }

  async findAll() {
    return this.roleModel
      .find({ isActive: true })
      .populate({
        path: 'permissionIds.permission',
        populate: [{ path: 'moduleId' }, { path: 'actionIds' }],
      })
      .populate('parentRoleId')
      .exec();
  }

  async findOne(id: string) {
    const role = await this.roleModel
      .findById(id)
      .populate({
        path: 'permissionIds.permission',
        populate: [{ path: 'moduleId' }, { path: 'actionIds' }],
      })
      .populate('parentRoleId')
      .exec();
    if (!role) throw AppError.notFound(AuthErrorCode.ROLE_NOT_FOUND, 'Role not found.');
    return role;
  }

  async findBySlug(slug: string) {
    return this.roleModel.findOne({ slug, isActive: true }).exec();
  }

  async update(id: string, dto: Partial<CreateRoleDto>) {
    const role = await this.roleModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!role) throw AppError.notFound(AuthErrorCode.ROLE_NOT_FOUND, 'Role not found.');

    // TODO: bust the perms:* Redis cache for every user that carries this
    // role — otherwise their CASL ability stays stale up to TTL (1h).
    return role;
  }

  async remove(id: string) {
    const role = await this.roleModel.findById(id).exec();
    if (!role) throw AppError.notFound(AuthErrorCode.ROLE_NOT_FOUND, 'Role not found.');
    if (role.isSystemRole) {
      throw AppError.badRequest(AuthErrorCode.ROLE_SYSTEM_PROTECTED, 'Cannot delete a system role.');
    }
    await this.roleModel.findByIdAndUpdate(id, { isActive: false }).exec();
    return { deleted: true };
  }
}
