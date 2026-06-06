import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { Patient } from './schemas/patient.schema';

describe('PatientsService', () => {
  let service: PatientsService;
  let model: any;

  const mockPatient = {
    _id: 'patient_id',
    email: 'marie@test.com',
    firstName: 'Marie',
    lastName: 'Durand',
    roleId: 'role_id',
    cabinetId: 'cabinet_paris_oid',
    uniqueCode: 'ABC123DEF456',
    phone: '+33612345678',
    ownerId: 'kine_id',
    status: 'ACTIVE',
    toObject: function () {
      const o = { ...this };
      delete o.toObject;
      return o;
    },
  };

  beforeEach(async () => {
    model = {
      create: jest.fn(),
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findByIdAndUpdate: jest.fn().mockReturnThis(),
      findOneAndUpdate: jest.fn().mockReturnThis(),
      countDocuments: jest.fn().mockReturnThis(),
      insertMany: jest.fn(),
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      setOptions: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        { provide: getModelToken(Patient.name), useValue: model },
      ],
    }).compile();

    service = module.get(PatientsService);
  });

  describe('create', () => {
    it('hashes password and strips it', async () => {
      model.create.mockResolvedValue({ ...mockPatient, passwordHash: 'hashed' });
      const result = await service.create({
        email: 'marie@test.com',
        password: 'Password123!',
        firstName: 'Marie',
        lastName: 'Durand',
        roleId: 'role_id',
        uniqueCode: 'ABC123DEF456',
      });
      expect(result.email).toBe('marie@test.com');
      expect(result.passwordHash).toBeUndefined();
    });
  });

  describe('findByEmailOrPhone', () => {
    it('queries on email OR phone and bypasses tenant scope', async () => {
      model.exec.mockResolvedValue(mockPatient);
      await service.findByEmailOrPhone('+33612345678');
      expect(model.findOne).toHaveBeenCalledWith({
        $or: [{ email: '+33612345678' }, { phone: '+33612345678' }],
        status: { $ne: 'INACTIVE' },
      });
      expect(model.setOptions).toHaveBeenCalledWith({
        bypassTenantScope: true,
      });
    });
  });

  describe('findByUniqueCode', () => {
    it('looks up by uniqueCode with tenant bypass', async () => {
      model.exec.mockResolvedValue(mockPatient);
      await service.findByUniqueCode('ABC123DEF456');
      expect(model.findOne).toHaveBeenCalledWith({
        uniqueCode: 'ABC123DEF456',
        status: { $ne: 'INACTIVE' },
      });
      expect(model.setOptions).toHaveBeenCalledWith({
        bypassTenantScope: true,
      });
    });
  });

  describe('isUniqueCodeTaken', () => {
    it('returns true when code exists', async () => {
      model.exec.mockResolvedValue(mockPatient);
      const result = await service.isUniqueCodeTaken('ABC123DEF456');
      expect(result).toBe(true);
    });

    it('returns false when code free', async () => {
      model.exec.mockResolvedValue(null);
      const result = await service.isUniqueCodeTaken('FREE12345678');
      expect(result).toBe(false);
    });
  });

  describe('linkToKine', () => {
    it('sets ownerId and cabinetId (cross-tenant bypass)', async () => {
      model.exec.mockResolvedValue(mockPatient);
      await service.linkToKine(
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439022',
        '507f1f77bcf86cd799439033',
      );
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        expect.objectContaining({
          ownerId: expect.anything(),
          cabinetId: expect.anything(),
          status: 'ACTIVE',
        }),
        { new: true },
      );
      expect(model.setOptions).toHaveBeenCalledWith({
        bypassTenantScope: true,
      });
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException if missing', async () => {
      model.exec.mockResolvedValue(null);
      await expect(service.findOne('bad_id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns the patient with bypassTenantScope when requested', async () => {
      model.exec.mockResolvedValue(mockPatient);
      const result = await service.findOne('patient_id', { bypassTenantScope: true });
      expect(result).toEqual(mockPatient);
      expect(model.setOptions).toHaveBeenCalledWith({
        bypassTenantScope: true,
      });
    });
  });

  describe('findByEmail', () => {
    it('queries on email + status:!=INACTIVE with tenant bypass', async () => {
      model.exec.mockResolvedValue(mockPatient);
      await service.findByEmail('marie@test.com');
      expect(model.findOne).toHaveBeenCalledWith({
        email: 'marie@test.com',
        status: { $ne: 'INACTIVE' },
      });
      expect(model.setOptions).toHaveBeenCalledWith({
        bypassTenantScope: true,
      });
    });

    it('includes passwordHash when requested', async () => {
      model.exec.mockResolvedValue({ ...mockPatient, passwordHash: 'h' });
      await service.findByEmail('marie@test.com', true);
      expect(model.select).toHaveBeenCalledWith('+passwordHash');
    });
  });

  describe('findAll', () => {
    it('lists every active patient (no source filter)', async () => {
      model.exec.mockResolvedValue([mockPatient]);
      await service.findAll();
      expect(model.find).toHaveBeenCalledWith({
        status: { $ne: 'INACTIVE' },
      });
    });

    it('filters by source=real when requested', async () => {
      model.exec.mockResolvedValue([mockPatient]);
      await service.findAll({ source: 'real' });
      expect(model.find).toHaveBeenCalledWith({
        status: { $ne: 'INACTIVE' },
        source: 'real',
      });
    });

    it('filters by source=fictif when requested', async () => {
      model.exec.mockResolvedValue([]);
      await service.findAll({ source: 'fictif' });
      expect(model.find).toHaveBeenCalledWith({
        status: { $ne: 'INACTIVE' },
        source: 'fictif',
      });
    });

    it('does NOT inject a source clause when source=all', async () => {
      model.exec.mockResolvedValue([mockPatient]);
      await service.findAll({ source: 'all' });
      expect(model.find).toHaveBeenCalledWith({
        status: { $ne: 'INACTIVE' },
      });
    });
  });

  describe('cloneFictifTemplatesForStudent', () => {
    const kineId = '507f1f77bcf86cd799439055';

    it('is a no-op (returns 0) when the kine already owns >= 1 fictif', async () => {
      model.exec.mockResolvedValueOnce(3); // countDocuments
      const n = await service.cloneFictifTemplatesForStudent(kineId);
      expect(n).toBe(0);
      expect(model.insertMany).not.toHaveBeenCalled();
    });

    it('returns 0 and warns when no templates exist in the DB', async () => {
      model.exec
        .mockResolvedValueOnce(0) // countDocuments
        .mockResolvedValueOnce([]); // find templates
      const n = await service.cloneFictifTemplatesForStudent(kineId);
      expect(n).toBe(0);
      expect(model.insertMany).not.toHaveBeenCalled();
    });

    it('inserts one clone per template with source=fictif, isTemplate=false, ownerId=kineId', async () => {
      const templates = [
        { _id: 'tpl1', firstName: 'Marie', lastName: '(Fictif) A', roleId: 'role_id', dateOfBirth: new Date('1985-01-01'), address: 'addr a', timezone: 'Europe/Paris', language: 'fr' },
        { _id: 'tpl2', firstName: 'Julien', lastName: '(Fictif) B', roleId: 'role_id', dateOfBirth: new Date('1972-01-01'), address: 'addr b', timezone: 'Europe/Paris', language: 'fr' },
      ];
      model.exec
        .mockResolvedValueOnce(0) // countDocuments
        .mockResolvedValueOnce(templates) // find templates
        .mockResolvedValueOnce(null) // generateFictifUniqueCode #1
        .mockResolvedValueOnce(null); // generateFictifUniqueCode #2
      model.insertMany.mockResolvedValue(undefined);

      const n = await service.cloneFictifTemplatesForStudent(kineId);

      expect(n).toBe(2);
      expect(model.insertMany).toHaveBeenCalledTimes(1);
      const docs = (model.insertMany as jest.Mock).mock.calls[0][0];
      expect(docs).toHaveLength(2);
      for (const d of docs) {
        expect(d.source).toBe('fictif');
        expect(d.isTemplate).toBe(false);
        expect(d.ownerId.toString()).toBe(kineId);
        expect(d.cabinetId).toBeNull();
        expect(d.status).toBe('ACTIVE');
        expect(d.uniqueCode).toMatch(/^[A-Z0-9]{12}$/);
        expect(d.email).toMatch(/^sandbox-[a-f0-9]{6}-\d{2}@sandbox\.physioandconnect\.local$/);
      }
      expect(docs[0].templateId).toBe('tpl1');
      expect(docs[1].templateId).toBe('tpl2');
    });

    it('passes bypassTenantScope to insertMany so the cabinet plugin does not inject a cabinetId', async () => {
      model.exec
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce([
          { _id: 'tpl1', firstName: 'A', lastName: 'B', roleId: 'r' },
        ])
        .mockResolvedValueOnce(null);
      model.insertMany.mockResolvedValue(undefined);

      await service.cloneFictifTemplatesForStudent(kineId);

      const opts = (model.insertMany as jest.Mock).mock.calls[0][1];
      expect(opts).toEqual(expect.objectContaining({ bypassTenantScope: true }));
    });
  });

  describe('findByOAuth', () => {
    it('queries on oauth.provider + oauth.providerId with tenant bypass', async () => {
      model.exec.mockResolvedValue(mockPatient);
      await service.findByOAuth('GOOGLE', 'g_sub_id');
      expect(model.findOne).toHaveBeenCalledWith({
        'oauth.provider': 'GOOGLE',
        'oauth.providerId': 'g_sub_id',
        status: { $ne: 'INACTIVE' },
      });
      expect(model.setOptions).toHaveBeenCalledWith({
        bypassTenantScope: true,
      });
    });
  });

  describe('findOrLinkByOAuth', () => {
    it('returns the patient already linked by (provider, providerId) without re-linking', async () => {
      model.exec
        .mockResolvedValueOnce(mockPatient); // findByOAuth hit
      const result = await service.findOrLinkByOAuth({
        provider: 'GOOGLE',
        providerId: 'g_sub_id',
        email: 'marie@test.com',
      });
      expect(result).toEqual(mockPatient);
    });

    it('returns null when neither (provider, providerId) nor email match', async () => {
      model.exec
        .mockResolvedValueOnce(null) // findByOAuth miss
        .mockResolvedValueOnce(null); // findOne by email miss
      const result = await service.findOrLinkByOAuth({
        provider: 'GOOGLE',
        providerId: 'g_sub_id',
        email: 'unknown@test.com',
      });
      expect(result).toBeNull();
    });

    it('throws OAUTH_ACCOUNT_MISMATCH when email matches but oauth points elsewhere', async () => {
      const otherLinked = {
        ...mockPatient,
        oauth: { provider: 'GOOGLE', providerId: 'OTHER_g_sub' },
        save: jest.fn(),
      };
      model.exec
        .mockResolvedValueOnce(null) // findByOAuth miss
        .mockResolvedValueOnce(otherLinked); // findOne by email
      await expect(
        service.findOrLinkByOAuth({
          provider: 'GOOGLE',
          providerId: 'g_sub_id',
          email: 'marie@test.com',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('attaches oauth and persists when email matches but oauth is empty', async () => {
      const unlinked = {
        ...mockPatient,
        oauth: undefined,
        save: jest.fn().mockResolvedValue(undefined),
      };
      model.exec
        .mockResolvedValueOnce(null) // findByOAuth miss
        .mockResolvedValueOnce(unlinked); // findOne by email
      const result = await service.findOrLinkByOAuth({
        provider: 'GOOGLE',
        providerId: 'g_sub_id',
        email: 'marie@test.com',
      });
      expect((result as any).oauth).toEqual({
        provider: 'GOOGLE',
        providerId: 'g_sub_id',
      });
      expect(unlinked.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('hashes password and strips it from the patch', async () => {
      model.exec.mockResolvedValue(mockPatient);
      await service.update('patient_id', { password: 'NewPass123!' } as any);
      const data = (model.findOneAndUpdate as jest.Mock).mock.calls[0][1];
      expect(data.password).toBeUndefined();
      expect(data.passwordHash).toEqual(expect.any(String));
    });

    it('throws NotFoundException when missing', async () => {
      model.exec.mockResolvedValue(null);
      await expect(
        service.update('bad_id', { firstName: 'X' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePasswordHash', () => {
    it('writes the hash directly with tenant bypass', async () => {
      model.exec.mockResolvedValue(mockPatient);
      await service.updatePasswordHash('patient_id', 'NEW_HASH');
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'patient_id',
        { passwordHash: 'NEW_HASH' },
        { new: true },
      );
      expect(model.setOptions).toHaveBeenCalledWith({
        bypassTenantScope: true,
      });
    });
  });

  describe('updateCabinetId', () => {
    it('updates cabinetId with tenant bypass', async () => {
      model.exec.mockResolvedValue(mockPatient);
      await service.updateCabinetId(
        'patient_id',
        '507f1f77bcf86cd799439099',
      );
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'patient_id',
        expect.objectContaining({ cabinetId: expect.anything() }),
        { new: true },
      );
      expect(model.setOptions).toHaveBeenCalledWith({
        bypassTenantScope: true,
      });
    });
  });

  describe('remove', () => {
    it('soft-deletes via status: INACTIVE', async () => {
      model.exec.mockResolvedValue({ ...mockPatient, status: 'INACTIVE' });
      const result = await service.remove('patient_id');
      expect(result.status).toBe('INACTIVE');
      const args = (model.findOneAndUpdate as jest.Mock).mock.calls[0];
      expect(args[1]).toEqual({ status: 'INACTIVE' });
    });

    it('throws NotFoundException when missing', async () => {
      model.exec.mockResolvedValue(null);
      await expect(service.remove('bad_id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
