import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Role } from './schemas/role.schema';

describe('RolesService', () => {
  let service: RolesService;
  let model: any;

  const mockRole = {
    _id: 'role_id',
    name: 'Kine Praticien',
    slug: 'KINE',
    isSystemRole: true,
    scope: 'CABINET',
    parentRoleId: null,
    permissionIds: [],
    isActive: true,
  };

  beforeEach(async () => {
    model = {
      create: jest.fn(),
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      findByIdAndUpdate: jest.fn().mockReturnThis(),
      findByIdAndDelete: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: getModelToken(Role.name), useValue: model },
      ],
    }).compile();

    service = module.get(RolesService);
  });

  describe('create', () => {
    it('persists the new role and returns it', async () => {
      model.create.mockResolvedValue(mockRole);
      const result = await service.create({
        slug: 'KINE',
        scope: 'CABINET',
        isSystemRole: true,
      } as any);
      expect(result).toEqual(mockRole);
      expect(model.create).toHaveBeenCalledWith({
        slug: 'KINE',
        scope: 'CABINET',
        isSystemRole: true,
      });
    });
  });

  describe('findAll', () => {
    it('should return all active roles', async () => {
      model.exec.mockResolvedValue([mockRole]);
      const result = await service.findAll();
      expect(result).toEqual([mockRole]);
    });
  });

  describe('update', () => {
    it('patches and returns the updated role', async () => {
      const updated = { ...mockRole, slug: 'KINE_RENAMED' };
      model.exec.mockResolvedValue(updated);
      const result = await service.update('role_id', { slug: 'KINE_RENAMED' } as any);
      expect(result.slug).toBe('KINE_RENAMED');
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'role_id',
        { slug: 'KINE_RENAMED' },
        { new: true },
      );
    });

    it('throws NotFoundException when the role does not exist', async () => {
      model.exec.mockResolvedValue(null);
      await expect(
        service.update('bad_id', { slug: 'X' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a role by id', async () => {
      model.exec.mockResolvedValue(mockRole);
      const result = await service.findOne('role_id');
      expect(result.slug).toBe('KINE');
    });

    it('should throw NotFoundException if role not found', async () => {
      model.exec.mockResolvedValue(null);
      await expect(service.findOne('bad_id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('should return a role by slug', async () => {
      model.exec.mockResolvedValue(mockRole);
      const result = await service.findBySlug('KINE');
      expect(result.slug).toBe('KINE');
    });
  });

  describe('remove', () => {
    it('should throw BadRequestException for system roles', async () => {
      model.exec.mockResolvedValue(mockRole);
      await expect(service.remove('role_id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should soft-delete custom roles', async () => {
      model.exec
        .mockResolvedValueOnce({ ...mockRole, isSystemRole: false })
        .mockResolvedValueOnce({});
      const result = await service.remove('custom_role_id');
      expect(result).toEqual({ deleted: true });
    });
  });
});
