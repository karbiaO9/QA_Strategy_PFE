import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Admin, AdminDocument } from './schemas/admin.schema';
import { CreateAdminDto } from './dto/create-admin.dto';
import { envNumber } from '@common/config/env';
import { AuthErrorCode } from '@common/exceptions/auth-error-codes';
import { AppError } from '@common/exceptions/app-error';

const BCRYPT_ROUNDS = envNumber('BCRYPT_ROUNDS', 12);
import { Role, RoleDocument } from '../roles/schemas/role.schema';

@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  async create(dto: CreateAdminDto) {
    const role = await this.roleModel.findById(dto.roleId).exec();
    if (!role) throw AppError.notFound(AuthErrorCode.ROLE_NOT_FOUND, 'Role not found.');
    if (!role.isSystemRole) {
      throw AppError.badRequest(
        AuthErrorCode.ADMIN_REQUIRES_SYSTEM_ROLE,
        'An admin can only receive a system role (e.g., SUPER_ADMIN).',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const { password, ...rest } = dto as any;
    const created = await this.adminModel.create({
      ...rest,
      passwordHash,
      status: dto.status ?? 'ACTIVE',
    });
    const obj: any = created.toObject();
    delete obj.passwordHash;
    return obj;
  }

  async findByEmail(email: string, includeHash = false) {
    const query = this.adminModel.findOne({
      email,
      status: 'ACTIVE',
    });
    if (includeHash) {
      query.select('+passwordHash');
    }
    return query.populate('roleId').exec();
  }

  async findAll() {
    return this.adminModel.find().populate('roleId').exec();
  }

  async findOne(id: string) {
    const admin = await this.adminModel
      .findById(id)
      .populate('roleId')
      .exec();
    if (!admin) throw AppError.notFound(AuthErrorCode.ADMIN_NOT_FOUND, 'Admin not found.');
    return admin;
  }

  async update(id: string, dto: Partial<CreateAdminDto & { password: string }>) {
    const data: any = { ...dto };
    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
      delete data.password;
    }
    const admin = await this.adminModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('roleId')
      .exec();
    if (!admin) throw AppError.notFound(AuthErrorCode.ADMIN_NOT_FOUND, 'Admin not found.');
    return admin;
  }

  async updateLastLogin(id: string) {
    await this.adminModel
      .findByIdAndUpdate(id, { lastLoginAt: new Date() })
      .exec();
  }

  async setStatus(id: string, status: 'ACTIVE' | 'INACTIVE') {
    const admin = await this.adminModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    if (!admin) throw AppError.notFound(AuthErrorCode.ADMIN_NOT_FOUND, 'Admin not found.');
    return admin;
  }

  async remove(id: string) {
    return this.setStatus(id, 'INACTIVE');
  }
}
