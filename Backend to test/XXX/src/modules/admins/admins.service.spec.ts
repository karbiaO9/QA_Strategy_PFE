import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { Admin } from './schemas/admin.schema';
import { Role } from '../roles/schemas/role.schema';

describe('AdminsService', () => {
  let service: AdminsService;
  let adminModel: any;
  let roleModel: any;

  const mockAdmin = {
    _id: 'admin_id',
    firstName: 'Thomas',
    lastName: 'Platform',
    email: 'admin@physioconnect.com',
    roleId: 'role_super_admin_id',
    status: 'ACTIVE',
    toObject: function () {
      const obj = { ...this };
      delete obj.toObject;
      return obj;
    },
  };

  const mockSystemRole = {
    _id: 'role_super_admin_id',
    slug: 'SUPER_ADMIN',
    isSystemRole: true,
  };

  beforeEach(async () => {
    adminModel = {
      create: jest.fn(),
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findByIdAndUpdate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    roleModel = {
      findById: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminsService,
        { provide: getModelToken(Admin.name), useValue: adminModel },
        { provide: getModelToken(Role.name), useValue: roleModel },
      ],
    }).compile();

    service = module.get(AdminsService);
  });

  describe('create', () => {
    it('should throw NotFoundException when role does not exist', async () => {
      roleModel.exec.mockResolvedValue(null);
      await expect(
        service.create({
          firstName: 'T',
          lastName: 'P',
          email: 'a@b.com',
          password: 'Admin123!',
          roleId: 'bad_id',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when role is NOT a system role', async () => {
      roleModel.exec.mockResolvedValue({
        ...mockSystemRole,
        isSystemRole: false,
      });
      await expect(
        service.create({
          firstName: 'T',
          lastName: 'P',
          email: 'a@b.com',
          password: 'Admin123!',
          roleId: 'custom_role_id',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should hash password and create admin when role is system role', async () => {
      roleModel.exec.mockResolvedValue(mockSystemRole);
      adminModel.create.mockResolvedValue(mockAdmin);

      const result = await service.create({
        firstName: 'Thomas',
        lastName: 'Platform',
        email: 'admin@physioconnect.com',
        password: 'Admin123!',
        roleId: 'role_super_admin_id',
      });

      expect(result.email).toBe('admin@physioconnect.com');
      expect(result.passwordHash).toBeUndefined();
      expect(adminModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'admin@physioconnect.com',
          passwordHash: expect.any(String),
          status: 'ACTIVE',
        }),
      );
    });
  });

  describe('findByEmail', () => {
    it('should find only ACTIVE admins', async () => {
      adminModel.exec.mockResolvedValue(mockAdmin);
      await service.findByEmail('admin@physioconnect.com');
      expect(adminModel.findOne).toHaveBeenCalledWith({
        email: 'admin@physioconnect.com',
        status: 'ACTIVE',
      });
    });

    it('should include passwordHash when requested', async () => {
      adminModel.exec.mockResolvedValue({ ...mockAdmin, passwordHash: 'hash' });
      await service.findByEmail('admin@physioconnect.com', true);
      expect(adminModel.select).toHaveBeenCalledWith('+passwordHash');
    });
  });

  describe('setStatus', () => {
    it('should set status to INACTIVE', async () => {
      adminModel.exec.mockResolvedValue({ ...mockAdmin, status: 'INACTIVE' });
      const result = await service.setStatus('admin_id', 'INACTIVE');
      expect(result.status).toBe('INACTIVE');
      expect(adminModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'admin_id',
        { status: 'INACTIVE' },
        { new: true },
      );
    });

    it('should throw NotFoundException when admin does not exist', async () => {
      adminModel.exec.mockResolvedValue(null);
      await expect(service.setStatus('bad_id', 'INACTIVE')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove (soft-delete)', () => {
    it('should set status INACTIVE instead of hard delete', async () => {
      adminModel.exec.mockResolvedValue({ ...mockAdmin, status: 'INACTIVE' });
      const result = await service.remove('admin_id');
      expect(result.status).toBe('INACTIVE');
    });
  });

  describe('updateLastLogin', () => {
    it('should set lastLoginAt to current timestamp', async () => {
      adminModel.exec.mockResolvedValue({});
      await service.updateLastLogin('admin_id');
      expect(adminModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'admin_id',
        expect.objectContaining({ lastLoginAt: expect.any(Date) }),
      );
    });
  });

  describe('findAll', () => {
    it('lists every admin with their populated role', async () => {
      adminModel.exec.mockResolvedValue([mockAdmin]);
      const result = await service.findAll();
      expect(result).toEqual([mockAdmin]);
      expect(adminModel.find).toHaveBeenCalled();
      expect(adminModel.populate).toHaveBeenCalledWith('roleId');
    });
  });

  describe('findOne', () => {
    it('returns the admin populated with roleId when found', async () => {
      adminModel.exec.mockResolvedValue(mockAdmin);
      const result = await service.findOne('admin_id');
      expect(result).toEqual(mockAdmin);
      expect(adminModel.findById).toHaveBeenCalledWith('admin_id');
      expect(adminModel.populate).toHaveBeenCalledWith('roleId');
    });

    it('throws NotFoundException when admin does not exist', async () => {
      adminModel.exec.mockResolvedValue(null);
      await expect(service.findOne('bad_id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('attaches AuthErrorCode.ADMIN_NOT_FOUND on the thrown error', async () => {
      adminModel.exec.mockResolvedValue(null);
      await expect(service.findOne('bad_id')).rejects.toMatchObject({
        response: { code: 'ADMIN_NOT_FOUND' },
      });
    });
  });

  describe('update', () => {
    it('patches non-password fields directly', async () => {
      const updated = { ...mockAdmin, firstName: 'Renamed' };
      adminModel.exec.mockResolvedValue(updated);
      const result = await service.update('admin_id', { firstName: 'Renamed' } as any);
      expect(result.firstName).toBe('Renamed');
      expect(adminModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'admin_id',
        { firstName: 'Renamed' },
        { new: true },
      );
    });

    it('hashes a new password and strips the plaintext from the patch', async () => {
      adminModel.exec.mockResolvedValue(mockAdmin);
      await service.update('admin_id', { password: 'NewPass123!' } as any);
      const patchArg = adminModel.findByIdAndUpdate.mock.calls[0][1];
      expect(patchArg.password).toBeUndefined();
      expect(patchArg.passwordHash).toEqual(expect.any(String));
      expect(patchArg.passwordHash).not.toBe('NewPass123!');
    });

    it('throws NotFoundException when admin does not exist', async () => {
      adminModel.exec.mockResolvedValue(null);
      await expect(
        service.update('bad_id', { firstName: 'X' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
