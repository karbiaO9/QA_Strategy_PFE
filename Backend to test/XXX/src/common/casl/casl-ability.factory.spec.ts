import { CaslAbilityFactory, CaslUser } from './casl-ability.factory';
import { CaslAction } from '../enums/casl-action.enum';
import { CaslSubject } from '../enums/casl-subject.enum';

describe('CaslAbilityFactory', () => {
  let factory: CaslAbilityFactory;
  let mockRoleModel: any;
  let mockPermissionModel: any;
  let mockRedis: any;

  const createPopulatedRole = (overrides: any = {}) => ({
    _id: 'role_kine_id',
    slug: 'KINE',
    isActive: true,
    parentRoleId: null,
    permissionIds: [
      {
        permission: {
          _id: 'perm_read_patients_id',
          code: 'read_patients',
          moduleId: {
            _id: 'mod_patient_id',
            slug: 'PATIENT',
            ownershipField: 'assignedKineId',
          },
          actionIds: [{ _id: 'act_read_id', slug: 'READ' }],
        },
        accessScope: 'ALL',
        isDefault: true,
      },
      {
        permission: {
          _id: 'perm_manage_programs_id',
          code: 'manage_programs',
          moduleId: {
            _id: 'mod_program_id',
            slug: 'PROGRAM',
            ownershipField: 'ownerId',
          },
          actionIds: [
            { _id: 'act_read_id', slug: 'READ' },
            { _id: 'act_create_id', slug: 'CREATE' },
            { _id: 'act_update_id', slug: 'UPDATE' },
            { _id: 'act_delete_id', slug: 'DELETE' },
          ],
        },
        accessScope: 'OWN',
        isDefault: true,
      },
    ],
    ...overrides,
  });

  beforeEach(() => {
    mockRoleModel = {
      findOne: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };
    mockPermissionModel = {
      find: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    };
    mockRedis = {
      get: jest.fn().mockResolvedValue(null),
      setex: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      keys: jest.fn().mockResolvedValue([]),
    };
    factory = new CaslAbilityFactory(
      mockRoleModel,
      mockPermissionModel,
      mockRedis,
    );
  });

  const superAdmin: CaslUser = {
    sub: 'admin_id',
    type: 'admin',
    cabinetId: 'platform',
    roleSlug: 'SUPER_ADMIN',
  };

  const kineUser: CaslUser = {
    sub: 'kine_id',
    type: 'kine',
    cabinetId: 'cabinet_paris_oid',
    roleSlug: 'KINE',
  };

  describe('SUPER_ADMIN', () => {
    it('grants every action on every subject (CASL wildcard)', async () => {
      const { ability } = await factory.createForUser(superAdmin);
      expect(ability.can(CaslAction.READ, 'PATIENT' as any)).toBe(true);
      expect(ability.can(CaslAction.CREATE, 'KINE' as any)).toBe(true);
      expect(ability.can(CaslAction.DELETE, 'ROLE' as any)).toBe(true);
    });

    it('has wildcard rule in rules array', async () => {
      const { ability } = await factory.createForUser(superAdmin);
      const rule = ability.rules.find(
        (r) => (r.action as any) === 'manage' && r.subject === 'all',
      );
      expect(rule).toBeDefined();
    });

    it('returns a single { manage, all, conditions: null } row', async () => {
      const { permissions } = await factory.createForUser(superAdmin);
      expect(permissions).toEqual([
        { action: 'manage', subject: 'all', conditions: null },
      ]);
    });
  });

  describe('KINE role (no inheritance)', () => {
    beforeEach(() => {
      mockRoleModel.exec.mockResolvedValue(createPopulatedRole());
    });

    it('grants READ on PATIENT', async () => {
      const { ability } = await factory.createForUser(kineUser);
      expect(ability.can(CaslAction.READ, CaslSubject.PATIENT)).toBe(true);
    });

    it('grants CRUD on PROGRAM', async () => {
      const { ability } = await factory.createForUser(kineUser);
      expect(ability.can(CaslAction.CREATE, CaslSubject.PROGRAM)).toBe(true);
    });

    it('denies CREATE on ROLE', async () => {
      const { ability } = await factory.createForUser(kineUser);
      expect(ability.can(CaslAction.CREATE, CaslSubject.ROLE)).toBe(false);
    });

    it('builds a flat array with one row per (subject, action) pair', async () => {
      const { permissions } = await factory.createForUser(kineUser);
      const patientRead = permissions.find(
        (r) => r.subject === 'PATIENT' && r.action === 'READ',
      );
      const programCreate = permissions.find(
        (r) => r.subject === 'PROGRAM' && r.action === 'CREATE',
      );
      expect(patientRead?.conditions).toBeDefined();
      expect(programCreate?.conditions).toBeDefined();
    });
  });

  describe('Role with inheritance (KINE_ADMIN)', () => {
    const kineAdminUser: CaslUser = {
      sub: 'kine_admin_id',
      type: 'kine',
      cabinetId: 'cabinet_paris_oid',
      roleSlug: 'KINE_ADMIN',
    };

    it("merges parent + child permissions (non-restreinte l'emporte)", async () => {
      const kineAdminRole = createPopulatedRole({
        _id: 'role_kine_admin_id',
        slug: 'KINE_ADMIN',
        parentRoleId: 'role_kine_id',
        permissionIds: [
          {
            permission: {
              _id: 'perm_manage_patients_id',
              code: 'manage_patients',
              moduleId: {
                _id: 'mod_patient_id',
                slug: 'PATIENT',
                ownershipField: 'assignedKineId',
              },
              actionIds: [
                { _id: 'act_delete_id', slug: 'DELETE' },
                { _id: 'act_update_id', slug: 'UPDATE' },
              ],
            },
            accessScope: 'ALL',
            isDefault: true,
          },
        ],
      });

      mockRoleModel.exec
        .mockResolvedValueOnce(kineAdminRole)
        .mockResolvedValueOnce(createPopulatedRole());

      const { ability, permissions } =
        await factory.createForUser(kineAdminUser);

      expect(ability.can(CaslAction.DELETE, CaslSubject.PATIENT)).toBe(true);
      // DELETE vient de KINE_ADMIN (non restreint) et l'emporte sur la
      // version restreinte heritee de KINE.
      const patientDelete = permissions.find(
        (r) => r.subject === 'PATIENT' && r.action === 'DELETE',
      );
      expect(patientDelete?.conditions).toBeDefined();
    });
  });

  describe('Redis cache', () => {
    it('reads from Redis cache on second call', async () => {
      mockRoleModel.exec.mockResolvedValue(createPopulatedRole());

      await factory.createForUser(kineUser);

      // Second call: simulate cache hit
      mockRedis.get.mockResolvedValueOnce(
        JSON.stringify({
          v: 2,
          rules: [{ action: 'READ', subject: 'PATIENT', conditions: null }],
        }),
      );
      const { permissions } = await factory.createForUser(kineUser);
      expect(permissions).toEqual([
        { action: 'READ', subject: 'PATIENT', conditions: null },
      ]);
    });

    it('rebuilds when the cached payload version is missing or stale', async () => {
      mockRoleModel.exec.mockResolvedValue(createPopulatedRole());
      // Old-format cache entry (pre-v2): no `v` field, nested `flat` object.
      mockRedis.get.mockResolvedValueOnce(
        JSON.stringify({
          rules: [{ action: 'READ', subject: 'PATIENT' }],
          flat: { PATIENT: { READ: { conditions: null } } },
        }),
      );
      const { permissions } = await factory.createForUser(kineUser);
      expect(Array.isArray(permissions)).toBe(true);
      // Rebuild path was hit, so the cache was re-written with v2.
      expect(mockRedis.setex).toHaveBeenCalled();
    });

    it('writes to Redis with TTL 3600', async () => {
      mockRoleModel.exec.mockResolvedValue(createPopulatedRole());
      await factory.createForUser(kineUser);
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'perms:kine_id',
        3600,
        expect.any(String),
      );
    });

    it('invalidateUser deletes the Redis key', async () => {
      await factory.invalidateUser('kine_id');
      expect(mockRedis.del).toHaveBeenCalledWith('perms:kine_id');
    });

    it('invalidateAll scans and deletes all perms:* keys', async () => {
      mockRedis.keys.mockResolvedValue(['perms:a', 'perms:b']);
      await factory.invalidateAll();
      expect(mockRedis.del).toHaveBeenCalledWith('perms:a', 'perms:b');
    });
  });

  describe('Profile-aware cache key (kines only)', () => {
    it('keys kines with profileId under perms:profile:{id}', async () => {
      mockRoleModel.exec.mockResolvedValue(createPopulatedRole());
      await factory.createForUser({
        ...kineUser,
        profileId: 'profile_abc',
      });
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'perms:profile:profile_abc',
        3600,
        expect.any(String),
      );
    });

    it('falls back to perms:{sub} when a kine has no profileId (legacy path)', async () => {
      mockRoleModel.exec.mockResolvedValue(createPopulatedRole());
      await factory.createForUser(kineUser);
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'perms:kine_id',
        3600,
        expect.any(String),
      );
    });

    it('invalidateProfile deletes the profile-scoped key', async () => {
      await factory.invalidateProfile('profile_abc');
      expect(mockRedis.del).toHaveBeenCalledWith('perms:profile:profile_abc');
    });
  });

  describe('customPermissionOverrides merge (kines only)', () => {
    const EXPORT_PERM_ID = '64000000000000000000abcd';
    const READ_PERM_ID = '64000000000000000000dead';

    const overrideExportPerm = {
      _id: EXPORT_PERM_ID,
      code: 'export_patients',
      moduleId: { _id: 'mod_patient_id', slug: 'PATIENT' },
      actionIds: [{ _id: 'act_export_id', slug: 'EXPORT' }],
      conditions: null,
      isActive: true,
      deletedAt: null,
    };

    it('granted:true adds a can() and a row on top of role rules', async () => {
      mockRoleModel.exec.mockResolvedValue(createPopulatedRole());
      mockPermissionModel.exec.mockResolvedValue([overrideExportPerm]);

      const { ability, permissions } = await factory.createForUser({
        ...kineUser,
        profileId: 'profile_abc',
        customPermissionOverrides: [
          { permissionId: EXPORT_PERM_ID, granted: true },
        ],
      });

      expect(ability.can('EXPORT' as any, CaslSubject.PATIENT)).toBe(true);
      const exportRow = permissions.find(
        (r) => r.subject === 'PATIENT' && r.action === 'EXPORT',
      );
      expect(exportRow).toBeDefined();
      expect(exportRow?.inverted).toBeUndefined();
    });

    it('granted:false drops the role grant and emits an inverted row', async () => {
      const readPerm = {
        _id: READ_PERM_ID,
        code: 'read_patients',
        moduleId: { _id: 'mod_patient_id', slug: 'PATIENT' },
        actionIds: [{ _id: 'act_read_id', slug: 'READ' }],
        conditions: null,
        isActive: true,
        deletedAt: null,
      };
      mockRoleModel.exec.mockResolvedValue(createPopulatedRole());
      mockPermissionModel.exec.mockResolvedValue([readPerm]);

      const { ability, permissions } = await factory.createForUser({
        ...kineUser,
        profileId: 'profile_abc',
        customPermissionOverrides: [
          { permissionId: READ_PERM_ID, granted: false },
        ],
      });

      expect(ability.can(CaslAction.READ, CaslSubject.PATIENT)).toBe(false);
      const grantRow = permissions.find(
        (r) => r.subject === 'PATIENT' && r.action === 'READ' && !r.inverted,
      );
      const denyRow = permissions.find(
        (r) =>
          r.subject === 'PATIENT' && r.action === 'READ' && r.inverted === true,
      );
      expect(grantRow).toBeUndefined();
      expect(denyRow).toBeDefined();
    });
  });

  describe('Patient user', () => {
    it('adds patientId to conditions', async () => {
      const patientRole = createPopulatedRole({
        slug: 'PATIENT',
        permissionIds: [
          {
            permission: {
              _id: 'perm_read_programs_id',
              moduleId: {
                _id: 'mod_program_id',
                slug: 'PROGRAM',
                ownershipField: 'ownerId',
              },
              actionIds: [{ slug: 'READ' }],
            },
            accessScope: 'OWN',
            isDefault: true,
          },
        ],
      });
      mockRoleModel.exec.mockResolvedValue(patientRole);

      const { ability } = await factory.createForUser({
        sub: 'patient_id',
        type: 'patient',
        cabinetId: 'cabinet_paris_oid',
        roleSlug: 'PATIENT',
      });

      expect(ability.can(CaslAction.READ, CaslSubject.PROGRAM)).toBe(true);
    });
  });

  describe('cache invalidation', () => {
    it('invalidateUser deletes the perms key for that user', async () => {
      await factory.invalidateUser('user_id_42');
      expect(mockRedis.del).toHaveBeenCalledWith(
        expect.stringContaining('user_id_42'),
      );
    });

    it('invalidateProfile deletes the profile-scoped perms key', async () => {
      await factory.invalidateProfile('profile_id_99');
      expect(mockRedis.del).toHaveBeenCalledWith(
        expect.stringContaining('profile_id_99'),
      );
    });

    it('invalidateAll scans the perms prefix and deletes every match', async () => {
      mockRedis.keys.mockResolvedValue(['perms:a', 'perms:b']);
      await factory.invalidateAll();
      expect(mockRedis.keys).toHaveBeenCalled();
      expect(mockRedis.del).toHaveBeenCalledWith('perms:a', 'perms:b');
    });

    it('invalidateAll is a no-op when no keys match', async () => {
      mockRedis.keys.mockResolvedValue([]);
      await factory.invalidateAll();
      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('invalidateAll swallows redis errors silently', async () => {
      mockRedis.keys.mockRejectedValue(new Error('redis down'));
      await expect(factory.invalidateAll()).resolves.toBeUndefined();
    });
  });
});
