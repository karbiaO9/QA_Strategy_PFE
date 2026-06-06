import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { Permission } from './schemas/permission.schema';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let model: any;

  const mockPermission = {
    _id: 'perm_id',
    name: 'Gerer les patients',
    code: 'manage_patients',
    moduleId: 'mod_patient_id',
    actionIds: ['act_read_id', 'act_create_id'],
    parentPermissionId: null,
    isActive: true,
  };

  beforeEach(async () => {
    model = {
      create: jest.fn(),
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findByIdAndUpdate: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: getModelToken(Permission.name), useValue: model },
      ],
    }).compile();

    service = module.get(PermissionsService);
  });

  describe('create', () => {
    it('should create a permission', async () => {
      model.create.mockResolvedValue(mockPermission);
      const result = await service.create({
        name: 'Gerer les patients',
        code: 'manage_patients',
        moduleId: 'mod_patient_id',
        actionIds: ['act_read_id'],
      });
      expect(result.code).toBe('manage_patients');
    });
  });

  describe('findAll', () => {
    it('should return active permissions with populates', async () => {
      model.exec.mockResolvedValue([mockPermission]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(model.populate).toHaveBeenCalledWith('moduleId');
    });
  });

  describe('findOne', () => {
    it('should return the permission with populated refs', async () => {
      model.exec.mockResolvedValue(mockPermission);
      const result = await service.findOne('perm_id');
      expect(result).toEqual(mockPermission);
      expect(model.findById).toHaveBeenCalledWith('perm_id');
      expect(model.populate).toHaveBeenCalledWith('moduleId');
      expect(model.populate).toHaveBeenCalledWith('actionIds');
      expect(model.populate).toHaveBeenCalledWith('parentPermissionId');
    });

    it('should throw NotFoundException if not found', async () => {
      model.exec.mockResolvedValue(null);
      await expect(service.findOne('bad_id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should attach AuthErrorCode.PERMISSION_NOT_FOUND to the thrown error', async () => {
      model.exec.mockResolvedValue(null);
      await expect(service.findOne('bad_id')).rejects.toMatchObject({
        response: { code: 'PERMISSION_NOT_FOUND' },
      });
    });
  });

  describe('findByModule', () => {
    it('should filter by moduleId and active state', async () => {
      model.exec.mockResolvedValue([mockPermission]);
      const result = await service.findByModule('mod_patient_id');
      expect(result).toEqual([mockPermission]);
      expect(model.find).toHaveBeenCalledWith({
        moduleId: 'mod_patient_id',
        isActive: true,
        deletedAt: null,
      });
      expect(model.populate).toHaveBeenCalledWith('actionIds');
      expect(model.populate).toHaveBeenCalledWith('parentPermissionId');
    });
  });

  describe('update', () => {
    it('should patch and return the updated permission', async () => {
      const updated = { ...mockPermission, code: 'manage_x' };
      model.exec.mockResolvedValue(updated);
      const result = await service.update('perm_id', {
        code: 'manage_x',
      } as any);
      expect(result.code).toBe('manage_x');
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'perm_id',
        { code: 'manage_x' },
        { new: true },
      );
    });

    it('should throw NotFoundException when the permission does not exist', async () => {
      model.exec.mockResolvedValue(null);
      await expect(
        service.update('bad_id', { code: 'x' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft-delete with deletedAt', async () => {
      model.exec.mockResolvedValue({ ...mockPermission, isActive: false });
      const result = await service.remove('perm_id');
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'perm_id',
        expect.objectContaining({ isActive: false }),
        { new: true },
      );
    });

    it('should throw NotFoundException when the permission does not exist', async () => {
      model.exec.mockResolvedValue(null);
      await expect(service.remove('bad_id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
