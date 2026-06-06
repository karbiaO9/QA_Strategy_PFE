import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { KinesService } from './kines.service';
import { Kine } from './schemas/kine.schema';
import { Cabinet } from '../cabinets/schemas/cabinet.schema';
import { KineProfilesService } from '../kine-profiles/kine-profiles.service';

describe('KinesService', () => {
  let service: KinesService;
  let model: any;

  const mockKine = {
    _id: 'kine_id',
    email: 'kine@test.com',
    firstName: 'Ali',
    lastName: 'Dupont',
    roleId: 'role_id',
    cabinetId: 'cabinet_paris_oid',
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
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      setOptions: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const cabinetModel = {
      findOne: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(null),
    };

    // Phase 4 — KinesService delegates ALL profile reads + writes to
    // KineProfilesService. Mock every method the service touches.
    const kineProfilesServiceMock = {
      create: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn().mockResolvedValue(null),
      findByKine: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KinesService,
        { provide: getModelToken(Kine.name), useValue: model },
        { provide: getModelToken(Cabinet.name), useValue: cabinetModel },
        { provide: KineProfilesService, useValue: kineProfilesServiceMock },
      ],
    }).compile();

    service = module.get(KinesService);
  });

  describe('create', () => {
    it('hashes password and strips it from response', async () => {
      model.create.mockResolvedValue({ ...mockKine, passwordHash: 'hashed' });
      const result = await service.create({
        email: 'kine@test.com',
        password: 'Password123!',
        firstName: 'Ali',
        lastName: 'Dupont',
      });
      expect(result.email).toBe('kine@test.com');
      expect(result.passwordHash).toBeUndefined();
    });
  });

  describe('findByEmail', () => {
    it('filters on status: ACTIVE and bypasses tenant scope', async () => {
      model.exec.mockResolvedValue(mockKine);
      await service.findByEmail('kine@test.com');
      expect(model.findOne).toHaveBeenCalledWith({
        email: 'kine@test.com',
        status: 'ACTIVE',
      });
      expect(model.setOptions).toHaveBeenCalledWith({
        bypassTenantScope: true,
      });
    });

    it('includes passwordHash when requested', async () => {
      model.exec.mockResolvedValue({ ...mockKine, passwordHash: 'hash' });
      await service.findByEmail('kine@test.com', true);
      expect(model.select).toHaveBeenCalledWith('+passwordHash');
    });
  });

  describe('findAll', () => {
    it('queries active kines without manual cabinet filter', async () => {
      model.exec.mockResolvedValue([mockKine]);
      await service.findAll();
      expect(model.find).toHaveBeenCalledWith({ status: 'ACTIVE' });
    });
  });

  describe('findOne', () => {
    it('returns the kine when found', async () => {
      model.exec.mockResolvedValue(mockKine);
      const result = await service.findOne('kine_id');
      expect(result).toEqual(mockKine);
    });

    it('passes setOptions when bypassTenantScope=true', async () => {
      model.exec.mockResolvedValue(mockKine);
      await service.findOne('kine_id', { bypassTenantScope: true });
      expect(model.setOptions).toHaveBeenCalledWith({
        bypassTenantScope: true,
      });
    });

    it('throws NotFoundException if missing', async () => {
      model.exec.mockResolvedValue(null);
      await expect(service.findOne('bad_id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmailOrPhone', () => {
    it('queries on email OR phone with status:ACTIVE and tenant bypass', async () => {
      model.exec.mockResolvedValue(mockKine);
      await service.findByEmailOrPhone('+33611111111');
      expect(model.findOne).toHaveBeenCalledWith({
        $or: [{ email: '+33611111111' }, { phone: '+33611111111' }],
        status: 'ACTIVE',
      });
      expect(model.setOptions).toHaveBeenCalledWith({
        bypassTenantScope: true,
      });
    });

    it('includes passwordHash when requested', async () => {
      model.exec.mockResolvedValue({ ...mockKine, passwordHash: 'h' });
      await service.findByEmailOrPhone('+33611111111', true);
      expect(model.select).toHaveBeenCalledWith('+passwordHash');
    });
  });

  describe('createWithProfile', () => {
    it('creates the Kine doc + delegates the profile to KineProfilesService and pre-stamps lastProfileId', async () => {
      const { Types } = require('mongoose');
      const kineId = new Types.ObjectId();
      const profileId = new Types.ObjectId();
      const roleId = new Types.ObjectId();
      const cabinetId = new Types.ObjectId();
      model.create.mockResolvedValue({
        ...mockKine,
        _id: kineId,
        passwordHash: 'h',
        lastProfileId: profileId,
      });
      const result = await service.createWithProfile({
        kineId,
        dto: {
          email: 'new@test.com',
          password: 'Password123!',
          firstName: 'New',
          lastName: 'Kine',
        } as any,
        profile: {
          profileId,
          roleId,
          cabinetId,
          profileType: 'LIBERAL',
          isActive: true,
        },
      });
      expect(result.passwordHash).toBeUndefined();
      // Phase 4: kineModel.create no longer carries `profiles` — the field
      // is gone from the schema. lastProfileId still pre-stamped.
      const created = (model.create as jest.Mock).mock.calls[0][0];
      expect(created._id).toBe(kineId);
      expect(created.passwordHash).toEqual(expect.any(String));
      expect(created.lastProfileId).toBe(profileId);
      expect(created.profiles).toBeUndefined();
      // Profile creation delegated to the new collection.
      const kineProfilesService: any = (service as any).kineProfilesService;
      expect(kineProfilesService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: profileId,
          kineId,
          profileType: 'LIBERAL',
          isActive: true,
        }),
      );
      // Returned object still carries `profiles` so consumers see the
      // expected shape immediately after registration.
      expect(result.profiles).toHaveLength(1);
      expect(result.profiles[0].profileType).toBe('LIBERAL');
    });

    it('honours freemium block when supplied (forwarded to kineprofiles)', async () => {
      const { Types } = require('mongoose');
      model.create.mockResolvedValue({ ...mockKine, toObject: mockKine.toObject });
      const start = new Date('2026-01-01');
      const end = new Date('2026-04-01');
      await service.createWithProfile({
        kineId: new Types.ObjectId(),
        dto: { email: 'a@b.com', password: 'X', firstName: 'A', lastName: 'B' } as any,
        profile: {
          profileId: new Types.ObjectId(),
          roleId: new Types.ObjectId(),
          profileType: 'STUDENT',
          freemium: { startedAt: start, endsAt: end, consumed: false },
        },
      });
      const kineProfilesService: any = (service as any).kineProfilesService;
      const profileArg = kineProfilesService.create.mock.calls[0][0];
      expect(profileArg.freemium).toEqual({
        startedAt: start,
        endsAt: end,
        consumed: false,
      });
    });
  });

  describe('update', () => {
    it('whitelists allowed fields and silently drops unknown ones', async () => {
      model.exec.mockResolvedValue(mockKine);
      await service.update('kine_id', {
        firstName: 'Renamed',
        professionalNumber: '99999999999',
        unknownField: 'should-be-stripped',
        password: 'NewPass123!',
      } as any);
      const data = (model.findOneAndUpdate as jest.Mock).mock.calls[0][1];
      expect(data.firstName).toBe('Renamed');
      expect(data.professionalNumber).toBe('99999999999');
      expect(data.unknownField).toBeUndefined();
      // password becomes passwordHash
      expect(data.password).toBeUndefined();
      expect(data.passwordHash).toEqual(expect.any(String));
    });

    it('throws NotFoundException when the kine does not exist', async () => {
      model.exec.mockResolvedValue(null);
      await expect(
        service.update('bad_id', { firstName: 'X' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePasswordHash', () => {
    it('writes the hash directly with tenant bypass', async () => {
      model.exec.mockResolvedValue(mockKine);
      await service.updatePasswordHash('kine_id', 'NEW_HASH');
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'kine_id',
        { passwordHash: 'NEW_HASH' },
        { new: true },
      );
      expect(model.setOptions).toHaveBeenCalledWith({
        bypassTenantScope: true,
      });
    });
  });

  describe('markProfileSelected', () => {
    it('stamps lastProfileId and lastLoginAt with tenant bypass', async () => {
      model.exec.mockResolvedValue(mockKine);
      await service.markProfileSelected(
        'kine_id',
        '507f1f77bcf86cd799439011',
      );
      const args = (model.findByIdAndUpdate as jest.Mock).mock.calls[0];
      expect(args[0]).toBe('kine_id');
      expect(args[1].lastProfileId).toBeDefined();
      expect(args[1].lastLoginAt).toBeInstanceOf(Date);
      expect(model.setOptions).toHaveBeenCalledWith({
        bypassTenantScope: true,
      });
    });
  });

  describe('pushProfile', () => {
    it('delegates the new profile to KineProfilesService.create', async () => {
      const { Types } = require('mongoose');
      model.exec.mockResolvedValue(mockKine);
      await service.pushProfile('kine_id', {
        roleId: new Types.ObjectId(),
        cabinetId: new Types.ObjectId(),
        profileType: 'MEMBER',
      });
      const kineProfilesService: any = (service as any).kineProfilesService;
      expect(kineProfilesService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          kineId: 'kine_id',
          profileType: 'MEMBER',
          isActive: true,
        }),
      );
      // No more $push on the kine doc.
      expect(model.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('updateProfileById', () => {
    const VALID_PROFILE_ID = '507f1f77bcf86cd799439011';

    it('updates the profile in the kineprofiles collection (ownership verified)', async () => {
      const kineProfilesService: any = (service as any).kineProfilesService;
      kineProfilesService.findOne.mockResolvedValueOnce({
        _id: VALID_PROFILE_ID,
        kineId: 'kine_id',
      });
      model.exec.mockResolvedValue(mockKine);
      await service.updateProfileById('kine_id', VALID_PROFILE_ID, {
        isActive: false,
      });
      expect(kineProfilesService.update).toHaveBeenCalledWith(
        VALID_PROFILE_ID,
        { isActive: false },
      );
      // No more arrayFilters on the embedded array.
      expect(model.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('returns findOne(kine) when patch is empty (no-op)', async () => {
      model.exec.mockResolvedValue(mockKine);
      const result = await service.updateProfileById(
        'kine_id',
        VALID_PROFILE_ID,
        {},
      );
      expect(result).toEqual(mockKine);
      const kineProfilesService: any = (service as any).kineProfilesService;
      expect(kineProfilesService.update).not.toHaveBeenCalled();
    });

    it('throws PROFILE_NOT_FOUND when the profile does not belong to the kine', async () => {
      const kineProfilesService: any = (service as any).kineProfilesService;
      kineProfilesService.findOne.mockResolvedValueOnce(null);
      await expect(
        service.updateProfileById('kine_id', VALID_PROFILE_ID, {
          isActive: false,
        }),
      ).rejects.toMatchObject({ response: { code: 'PROFILE_NOT_FOUND' } });
    });
  });

  describe('remove', () => {
    it('soft-deletes via status: INACTIVE', async () => {
      // Valid 24-char ObjectId hex (Types.ObjectId used internally to check owner)
      const kineId = '507f1f77bcf86cd799439011';
      model.exec.mockResolvedValue({ ...mockKine, _id: kineId, status: 'INACTIVE' });
      const result = await service.remove(kineId);
      expect(result.status).toBe('INACTIVE');
    });
  });

  describe('updateCabinetId', () => {
    it('updates the cabinetId field with tenant bypass', async () => {
      model.exec.mockResolvedValue(mockKine);
      const cabinetObjectId = '507f1f77bcf86cd799439099';
      await service.updateCabinetId('kine_id', cabinetObjectId);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'kine_id',
        expect.objectContaining({ cabinetId: expect.anything() }),
        { new: true },
      );
      expect(model.setOptions).toHaveBeenCalledWith({
        bypassTenantScope: true,
      });
    });
  });

  describe('findActiveByProfessionalNumber', () => {
    it('queries on professionalNumber + status=ACTIVE with tenant bypass', async () => {
      model.exec.mockResolvedValue(null);
      await service.findActiveByProfessionalNumber('123456789');
      expect(model.findOne).toHaveBeenCalledWith({
        professionalNumber: '123456789',
        status: 'ACTIVE',
      });
      expect(model.setOptions).toHaveBeenCalledWith({
        bypassTenantScope: true,
      });
      expect(model.lean).toHaveBeenCalled();
    });

    it('excludes the provided kineId ($ne) when excludeKineId is set', async () => {
      model.exec.mockResolvedValue(null);
      await service.findActiveByProfessionalNumber('123456789', {
        excludeKineId: '507f1f77bcf86cd799439011',
      });
      const filter = (model.findOne as jest.Mock).mock.calls[0][0];
      expect(filter.professionalNumber).toBe('123456789');
      expect(filter.status).toBe('ACTIVE');
      expect(filter._id).toBeDefined();
      expect(filter._id.$ne).toBeDefined();
    });
  });

  describe('listByVerificationStatus', () => {
    it('defaults to PENDING + ACTIVE, paginated', async () => {
      model.exec.mockResolvedValue([]);
      await service.listByVerificationStatus();
      expect(model.find).toHaveBeenCalledWith({
        verificationStatus: 'PENDING',
        status: 'ACTIVE',
      });
      expect(model.sort).toHaveBeenCalledWith({ updatedAt: -1 });
      expect(model.skip).toHaveBeenCalledWith(0);
      expect(model.limit).toHaveBeenCalledWith(50);
    });

    it('clamps the limit within [1, 200]', async () => {
      model.exec.mockResolvedValue([]);
      await service.listByVerificationStatus('REJECTED', { limit: 10000, skip: -1 });
      expect(model.find).toHaveBeenCalledWith({
        verificationStatus: 'REJECTED',
        status: 'ACTIVE',
      });
      expect(model.limit).toHaveBeenCalledWith(200);
      expect(model.skip).toHaveBeenCalledWith(0);
    });
  });

  describe('updateVerification', () => {
    const adminId = '507f191e810c19729de860ab';
    const kineId = '507f1f77bcf86cd799439011';

    it('APPROVE sets VERIFIED + clears rejectionReason + stores admin id', async () => {
      model.exec.mockResolvedValue({ ...mockKine, verificationStatus: 'VERIFIED' });
      await service.updateVerification(kineId, adminId, 'APPROVE');
      const patch = (model.findByIdAndUpdate as jest.Mock).mock.calls[0][1];
      expect(patch.verificationStatus).toBe('VERIFIED');
      expect(patch.verificationRejectionReason).toBeNull();
      expect(patch.verifiedAt).toBeInstanceOf(Date);
      expect(patch.verifiedByAdminId).toBeDefined();
    });

    it('REJECT stores the rejectionReason (trimmed) and flags REJECTED', async () => {
      model.exec.mockResolvedValue({ ...mockKine, verificationStatus: 'REJECTED' });
      await service.updateVerification(kineId, adminId, 'REJECT', '  illisible  ');
      const patch = (model.findByIdAndUpdate as jest.Mock).mock.calls[0][1];
      expect(patch.verificationStatus).toBe('REJECTED');
      expect(patch.verificationRejectionReason).toBe('illisible');
    });

    it('REJECT without a reason throws REJECTION_REASON_REQUIRED', async () => {
      await expect(
        service.updateVerification(kineId, adminId, 'REJECT'),
      ).rejects.toThrow(BadRequestException);
      expect(model.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('REJECT with a 2-char reason is rejected (too short)', async () => {
      await expect(
        service.updateVerification(kineId, adminId, 'REJECT', 'no'),
      ).rejects.toThrow(BadRequestException);
    });

    it('RESET puts the kine back to PENDING and clears the reason', async () => {
      model.exec.mockResolvedValue({ ...mockKine, verificationStatus: 'PENDING' });
      await service.updateVerification(kineId, adminId, 'RESET');
      const patch = (model.findByIdAndUpdate as jest.Mock).mock.calls[0][1];
      expect(patch.verificationStatus).toBe('PENDING');
      expect(patch.verificationRejectionReason).toBeNull();
    });

    it('NotFound when the kineId is unknown', async () => {
      model.exec.mockResolvedValue(null);
      await expect(
        service.updateVerification(kineId, adminId, 'APPROVE'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
