import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { Action } from './schemas/action.schema';

describe('ActionsService', () => {
  let service: ActionsService;
  let model: any;

  const mockAction = {
    _id: 'act_id',
    name: 'Voir',
    slug: 'READ',
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
        ActionsService,
        { provide: getModelToken(Action.name), useValue: model },
      ],
    }).compile();

    service = module.get(ActionsService);
  });

  describe('create', () => {
    it('should persist the new action and return it', async () => {
      model.create.mockResolvedValue(mockAction);
      const result = await service.create({ slug: 'READ', name: 'Voir' } as any);
      expect(result).toEqual(mockAction);
      expect(model.create).toHaveBeenCalledWith({ slug: 'READ', name: 'Voir' });
    });
  });

  describe('findAll', () => {
    it('should return active actions', async () => {
      model.exec.mockResolvedValue([mockAction]);
      const result = await service.findAll();
      expect(result).toEqual([mockAction]);
      expect(model.find).toHaveBeenCalledWith({
        isActive: true,
        deletedAt: null,
      });
    });
  });

  describe('findOne', () => {
    it('should return the action when it exists', async () => {
      model.exec.mockResolvedValue(mockAction);
      const result = await service.findOne('act_id');
      expect(result).toEqual(mockAction);
      expect(model.findById).toHaveBeenCalledWith('act_id');
    });

    it('should throw NotFoundException when not found', async () => {
      model.exec.mockResolvedValue(null);
      await expect(service.findOne('bad_id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should attach AuthErrorCode.ACTION_NOT_FOUND to the thrown error', async () => {
      model.exec.mockResolvedValue(null);
      await expect(service.findOne('bad_id')).rejects.toMatchObject({
        response: { code: 'ACTION_NOT_FOUND' },
      });
    });
  });

  describe('update', () => {
    it('should patch and return the updated action', async () => {
      const updated = { ...mockAction, name: 'Renamed' };
      model.exec.mockResolvedValue(updated);
      const result = await service.update('act_id', { name: 'Renamed' } as any);
      expect(result.name).toBe('Renamed');
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'act_id',
        { name: 'Renamed' },
        { new: true },
      );
    });

    it('should throw NotFoundException when the action does not exist', async () => {
      model.exec.mockResolvedValue(null);
      await expect(
        service.update('bad_id', { name: 'X' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft-delete with deletedAt', async () => {
      model.exec.mockResolvedValue({ ...mockAction, isActive: false });
      await service.remove('act_id');
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'act_id',
        expect.objectContaining({
          isActive: false,
          deletedAt: expect.any(Date),
        }),
        { new: true },
      );
    });

    it('should throw NotFoundException when the action does not exist', async () => {
      model.exec.mockResolvedValue(null);
      await expect(service.remove('bad_id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
