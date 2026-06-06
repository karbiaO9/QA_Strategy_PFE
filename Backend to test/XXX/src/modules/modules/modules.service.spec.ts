import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { Module } from './schemas/module.schema';

describe('ModulesService', () => {
  let service: ModulesService;
  let model: any;

  const mockModule = {
    _id: 'mod_id',
    name: 'Patients',
    slug: 'PATIENT',
    microservice: 'core',
    isActive: true,
    deletedAt: null,
  };

  beforeEach(async () => {
    model = {
      create: jest.fn(),
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findByIdAndUpdate: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModulesService,
        { provide: getModelToken(Module.name), useValue: model },
      ],
    }).compile();

    service = module.get(ModulesService);
  });

  describe('create', () => {
    it('should create a module', async () => {
      model.create.mockResolvedValue(mockModule);
      const result = await service.create({
        name: 'Patients',
        slug: 'PATIENT',
        microservice: 'core',
      });
      expect(result.slug).toBe('PATIENT');
    });
  });

  describe('findAll', () => {
    it('should return active modules', async () => {
      model.exec.mockResolvedValue([mockModule]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(model.find).toHaveBeenCalledWith({
        isActive: true,
        deletedAt: null,
      });
    });
  });

  describe('findOne', () => {
    it('should return the module when it exists', async () => {
      model.exec.mockResolvedValue(mockModule);
      const result = await service.findOne('mod_id');
      expect(result).toEqual(mockModule);
      expect(model.findById).toHaveBeenCalledWith('mod_id');
    });

    it('should throw NotFoundException when not found', async () => {
      model.exec.mockResolvedValue(null);
      await expect(service.findOne('bad_id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should attach AuthErrorCode.MODULE_NOT_FOUND to the thrown error', async () => {
      model.exec.mockResolvedValue(null);
      await expect(service.findOne('bad_id')).rejects.toMatchObject({
        response: { code: 'MODULE_NOT_FOUND' },
      });
    });
  });

  describe('update', () => {
    it('should patch and return the updated module', async () => {
      const updated = { ...mockModule, microservice: 'identity' };
      model.exec.mockResolvedValue(updated);
      const result = await service.update('mod_id', {
        microservice: 'identity',
      } as any);
      expect(result.microservice).toBe('identity');
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'mod_id',
        { microservice: 'identity' },
        { new: true },
      );
    });

    it('should throw NotFoundException when the module does not exist', async () => {
      model.exec.mockResolvedValue(null);
      await expect(
        service.update('bad_id', { microservice: 'core' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft-delete with deletedAt', async () => {
      model.exec.mockResolvedValue({ ...mockModule, isActive: false });
      await service.remove('mod_id');
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'mod_id',
        expect.objectContaining({
          isActive: false,
          deletedAt: expect.any(Date),
        }),
        { new: true },
      );
    });

    it('should throw NotFoundException when the module does not exist', async () => {
      model.exec.mockResolvedValue(null);
      await expect(service.remove('bad_id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
