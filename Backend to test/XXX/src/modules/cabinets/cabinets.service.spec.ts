import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { CabinetsService } from './cabinets.service';
import { Cabinet } from './schemas/cabinet.schema';

describe('CabinetsService', () => {
  let service: CabinetsService;
  let model: any;

  const mockCabinet = {
    _id: 'cab_id',
    name: 'Cabinet Paris Centre',
    ownerId: 'kine_id',
    address: '15 Rue de Rivoli, 75001 Paris',
    legalName: 'Cabinet Paris Centre SAS',
    taxRegistrationNumber: '81234567800013',
    isActive: true,
  };

  beforeEach(async () => {
    model = {
      create: jest.fn(),
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CabinetsService,
        { provide: getModelToken(Cabinet.name), useValue: model },
      ],
    }).compile();

    service = module.get(CabinetsService);
  });

  describe('create', () => {
    it('persists the new cabinet and returns it', async () => {
      model.create.mockResolvedValue(mockCabinet);
      const result = await service.create({
        name: 'Cabinet Paris Centre',
        ownerId: 'kine_id',
        address: '15 Rue de Rivoli, 75001 Paris',
        legalName: 'Cabinet Paris Centre SAS',
        taxRegistrationNumber: '81234567800013',
      });
      expect(result).toEqual(mockCabinet);
      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Cabinet Paris Centre',
          ownerId: 'kine_id',
        }),
      );
    });
  });

  describe('findOne', () => {
    it('returns the cabinet when found', async () => {
      model.exec.mockResolvedValue(mockCabinet);
      const result = await service.findOne('cab_id');
      expect(result).toEqual(mockCabinet);
      expect(model.findById).toHaveBeenCalledWith('cab_id');
    });

    it('throws NotFoundException when missing', async () => {
      model.exec.mockResolvedValue(null);
      await expect(service.findOne('bad_id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('attaches AuthErrorCode.CABINET_NOT_FOUND on the thrown error', async () => {
      model.exec.mockResolvedValue(null);
      await expect(service.findOne('bad_id')).rejects.toMatchObject({
        response: { code: 'CABINET_NOT_FOUND' },
      });
    });
  });

  describe('findAll', () => {
    it('filters on isActive:true', async () => {
      model.exec.mockResolvedValue([mockCabinet]);
      const result = await service.findAll();
      expect(result).toEqual([mockCabinet]);
      expect(model.find).toHaveBeenCalledWith({ isActive: true });
    });
  });
});
