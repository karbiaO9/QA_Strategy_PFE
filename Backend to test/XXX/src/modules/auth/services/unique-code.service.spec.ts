import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UniqueCodeService } from './unique-code.service';
import { Patient } from '../../patients/schemas/patient.schema';

describe('UniqueCodeService', () => {
  let service: UniqueCodeService;
  let model: any;

  beforeEach(async () => {
    model = {
      findOne: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniqueCodeService,
        { provide: getModelToken(Patient.name), useValue: model },
      ],
    }).compile();

    service = module.get(UniqueCodeService);
  });

  describe('generateUniqueCode', () => {
    it('returns a 12-char code drawn from [A-Z0-9] when no collision', async () => {
      model.exec.mockResolvedValue(null);
      const code = await service.generateUniqueCode();
      expect(code).toMatch(/^[A-Z0-9]{12}$/);
      expect(model.findOne).toHaveBeenCalledTimes(1);
    });

    it('retries on collision and returns the first free code', async () => {
      // 1st attempt collides, 2nd is free.
      model.exec
        .mockResolvedValueOnce({ uniqueCode: 'ALREADY_TAKEN' })
        .mockResolvedValueOnce(null);
      const code = await service.generateUniqueCode();
      expect(code).toMatch(/^[A-Z0-9]{12}$/);
      expect(model.findOne).toHaveBeenCalledTimes(2);
    });

    it('throws after 5 failed attempts (collision storm)', async () => {
      model.exec.mockResolvedValue({ uniqueCode: 'COLLIDE' });
      await expect(service.generateUniqueCode()).rejects.toThrow(
        /Could not generate a unique uniqueCode/,
      );
      expect(model.findOne).toHaveBeenCalledTimes(5);
    });

    it('queries by uniqueCode field', async () => {
      model.exec.mockResolvedValue(null);
      await service.generateUniqueCode();
      const arg = model.findOne.mock.calls[0][0];
      expect(arg).toHaveProperty('uniqueCode');
      expect(arg.uniqueCode).toMatch(/^[A-Z0-9]{12}$/);
    });
  });
});
