import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { envNumber } from '@common/config/env';

// Same env toggles used by AuthService — keeps dev seed in sync with prod.
const BCRYPT_ROUNDS = envNumber('BCRYPT_ROUNDS', 12);
const FREEMIUM_STUDENT_DAYS = envNumber('FREEMIUM_STUDENT_DAYS', 90);
const FREEMIUM_TRIAL_DAYS = envNumber('FREEMIUM_TRIAL_DAYS', 30);


// Actions

// Display labels live in the frontend's i18n bundle, keyed by `slug`.
// Seed only stores the structural identifier.
const ACTIONS_SEED = [
  { slug: 'MANAGE' },
  { slug: 'CREATE' },
  { slug: 'READ' },
  { slug: 'UPDATE' },
  { slug: 'DELETE' },
  { slug: 'ASSIGN' },
  { slug: 'EXPORT' },
  { slug: 'SCHEDULE' },
  { slug: 'IMPORT' },
  { slug: 'BULK_ACTION' },
  { slug: 'MANAGE_STATUS' },
];

// Modules

// Same i18n contract as ACTIONS_SEED — only `slug` and the technical
// `microservice` routing hint are persisted.
const MODULES_SEED = [
  { slug: 'ADMIN', microservice: 'identity' },
  { slug: 'KINE', microservice: 'identity' },
  { slug: 'PATIENT', microservice: 'core' },
  { slug: 'CABINET', microservice: 'identity' },
  { slug: 'ROLE', microservice: 'identity' },
  { slug: 'PERMISSION', microservice: 'identity' },
  { slug: 'EXERCISE', microservice: 'core' },
  { slug: 'SESSION', microservice: 'core' },
  { slug: 'PROGRAM', microservice: 'core' },
  { slug: 'ASSIGNED_PROGRAM', microservice: 'core' },
  { slug: 'SCHEDULED_SESSION', microservice: 'core' },
  { slug: 'SESSION_EXECUTION', microservice: 'core' },
  { slug: 'BILAN', microservice: 'core' },
  { slug: 'BILAN_AI_CONFIG', microservice: 'analytics' },
  { slug: 'KINE_NOTE', microservice: 'core' },
  { slug: 'PATIENT_NOTE', microservice: 'core' },
  { slug: 'PLAN', microservice: 'billing' },
  { slug: 'SUBSCRIPTION', microservice: 'billing' },
  { slug: 'INVOICE', microservice: 'billing' },
  { slug: 'NOTIFICATION', microservice: 'notification' },
  { slug: 'SUPPORT_TICKET', microservice: 'analytics' },
  { slug: 'FAQ', microservice: 'analytics' },
];

// Permissions

// Same i18n contract — only structural fields are persisted. Display
// labels are owned by the frontend, keyed by `code`.
type PermissionSeed = {
  code: string;
  moduleSlug: string;
  actionSlugs: string[];
  conditions: Record<string, any> | null;
  parentCode: string | null;
};

const MINE = { ownerId: '$userId' };

const PERMISSIONS_SEED: PermissionSeed[] = [
  // PATIENT
  { code: 'manage_patients', moduleSlug: 'PATIENT', actionSlugs: ['READ', 'CREATE', 'UPDATE', 'DELETE'], conditions: null, parentCode: null },
  { code: 'read_patients', moduleSlug: 'PATIENT', actionSlugs: ['READ'], conditions: null, parentCode: 'manage_patients' },
  { code: 'delete_patients', moduleSlug: 'PATIENT', actionSlugs: ['DELETE'], conditions: null, parentCode: 'manage_patients' },
  { code: 'create_my_patients', moduleSlug: 'PATIENT', actionSlugs: ['CREATE'], conditions: MINE, parentCode: null },
  { code: 'update_my_patients', moduleSlug: 'PATIENT', actionSlugs: ['UPDATE'], conditions: MINE, parentCode: null },

  // PROGRAM
  { code: 'manage_my_programs', moduleSlug: 'PROGRAM', actionSlugs: ['READ', 'CREATE', 'UPDATE', 'DELETE', 'ASSIGN', 'IMPORT'], conditions: MINE, parentCode: null },
  { code: 'read_my_programs', moduleSlug: 'PROGRAM', actionSlugs: ['READ'], conditions: MINE, parentCode: null },

  // SESSION
  { code: 'manage_my_sessions', moduleSlug: 'SESSION', actionSlugs: ['READ', 'CREATE', 'UPDATE', 'DELETE', 'SCHEDULE'], conditions: MINE, parentCode: null },
  { code: 'read_my_sessions', moduleSlug: 'SESSION', actionSlugs: ['READ'], conditions: MINE, parentCode: null },

  // EXERCISE
  { code: 'manage_my_exercises', moduleSlug: 'EXERCISE', actionSlugs: ['READ', 'CREATE', 'UPDATE', 'DELETE', 'IMPORT'], conditions: MINE, parentCode: null },
  { code: 'read_my_exercises', moduleSlug: 'EXERCISE', actionSlugs: ['READ'], conditions: MINE, parentCode: null },

  // BILAN
  { code: 'manage_my_bilans', moduleSlug: 'BILAN', actionSlugs: ['READ', 'CREATE', 'UPDATE', 'DELETE'], conditions: MINE, parentCode: null },

  // KINE_NOTE
  { code: 'manage_my_kine_notes', moduleSlug: 'KINE_NOTE', actionSlugs: ['READ', 'CREATE', 'UPDATE', 'DELETE'], conditions: MINE, parentCode: null },

  // PATIENT_NOTE
  { code: 'manage_my_patient_notes', moduleSlug: 'PATIENT_NOTE', actionSlugs: ['READ', 'CREATE', 'UPDATE', 'DELETE'], conditions: MINE, parentCode: null },

  // ASSIGNED_PROGRAM
  { code: 'manage_my_assigned_programs', moduleSlug: 'ASSIGNED_PROGRAM', actionSlugs: ['READ', 'CREATE', 'UPDATE', 'DELETE'], conditions: MINE, parentCode: null },

  // SCHEDULED_SESSION
  { code: 'manage_my_scheduled_sessions', moduleSlug: 'SCHEDULED_SESSION', actionSlugs: ['READ', 'CREATE', 'UPDATE', 'DELETE'], conditions: MINE, parentCode: null },

  // SESSION_EXECUTION
  { code: 'manage_my_session_executions', moduleSlug: 'SESSION_EXECUTION', actionSlugs: ['READ', 'CREATE', 'UPDATE'], conditions: MINE, parentCode: null },

  // KINE
  { code: 'manage_practitioners', moduleSlug: 'KINE', actionSlugs: ['READ', 'CREATE', 'UPDATE', 'DELETE'], conditions: null, parentCode: null },
  { code: 'read_practitioners', moduleSlug: 'KINE', actionSlugs: ['READ'], conditions: null, parentCode: 'manage_practitioners' },

  // CABINET
  { code: 'manage_cabinet_settings', moduleSlug: 'CABINET', actionSlugs: ['READ', 'UPDATE'], conditions: null, parentCode: null },

  // ROLE
  { code: 'manage_roles', moduleSlug: 'ROLE', actionSlugs: ['READ', 'CREATE', 'UPDATE', 'DELETE'], conditions: null, parentCode: null },

  // PERMISSION
  { code: 'manage_permissions', moduleSlug: 'PERMISSION', actionSlugs: ['READ', 'CREATE', 'UPDATE', 'DELETE'], conditions: null, parentCode: null },

  // SUBSCRIPTION
  { code: 'manage_subscriptions', moduleSlug: 'SUBSCRIPTION', actionSlugs: ['READ', 'CREATE', 'UPDATE'], conditions: null, parentCode: null },
  { code: 'read_subscriptions', moduleSlug: 'SUBSCRIPTION', actionSlugs: ['READ'], conditions: null, parentCode: 'manage_subscriptions' },

  // INVOICE
  { code: 'manage_invoices', moduleSlug: 'INVOICE', actionSlugs: ['READ', 'EXPORT'], conditions: null, parentCode: null },

  // NOTIFICATION
  { code: 'manage_notifications', moduleSlug: 'NOTIFICATION', actionSlugs: ['READ', 'CREATE', 'UPDATE', 'DELETE'], conditions: null, parentCode: null },

  // SUPPORT_TICKET
  { code: 'manage_support_tickets', moduleSlug: 'SUPPORT_TICKET', actionSlugs: ['READ', 'CREATE', 'UPDATE'], conditions: null, parentCode: null },

  // FAQ
  { code: 'manage_faq', moduleSlug: 'FAQ', actionSlugs: ['READ', 'CREATE', 'UPDATE', 'DELETE'], conditions: null, parentCode: null },

  // PLAN
  { code: 'manage_plans', moduleSlug: 'PLAN', actionSlugs: ['READ', 'CREATE', 'UPDATE', 'DELETE'], conditions: null, parentCode: null },

  // BILAN_AI_CONFIG
  { code: 'manage_bilan_ai_config', moduleSlug: 'BILAN_AI_CONFIG', actionSlugs: ['READ', 'UPDATE'], conditions: null, parentCode: null },
];

// System roles

// Display labels live in the frontend's i18n bundle, keyed by `slug`.
// Seed only stores structural fields.
interface RoleSeed {
  slug: string;
  isSystemRole: boolean;
  scope: 'PLATFORM' | 'CABINET';
  parentRoleSlug: string | null;
  permissions: { permCode: string; isDefault: boolean }[];
}

const ROLES_SEED: RoleSeed[] = [
  {
    slug: 'SUPER_ADMIN',
    isSystemRole: true,
    scope: 'PLATFORM',
    parentRoleSlug: null,
    permissions: [],
  },
  {
    slug: 'KINE',
    isSystemRole: true,
    scope: 'CABINET',
    parentRoleSlug: null,
    permissions: [
      { permCode: 'read_patients', isDefault: true },
      { permCode: 'update_my_patients', isDefault: true },
      { permCode: 'create_my_patients', isDefault: true },
      { permCode: 'manage_my_programs', isDefault: true },
      { permCode: 'manage_my_sessions', isDefault: true },
      { permCode: 'manage_my_exercises', isDefault: true },
      { permCode: 'manage_my_bilans', isDefault: true },
      { permCode: 'manage_my_kine_notes', isDefault: true },
      { permCode: 'manage_my_assigned_programs', isDefault: true },
      { permCode: 'manage_my_scheduled_sessions', isDefault: true },
      { permCode: 'read_practitioners', isDefault: true },
    ],
  },
  {
    slug: 'KINE_ADMIN',
    isSystemRole: true,
    scope: 'CABINET',
    parentRoleSlug: 'KINE',
    permissions: [
      { permCode: 'manage_patients', isDefault: true },
      { permCode: 'manage_practitioners', isDefault: true },
      { permCode: 'read_subscriptions', isDefault: true },
      { permCode: 'manage_cabinet_settings', isDefault: true },
      { permCode: 'manage_roles', isDefault: true },
    ],
  },
  {
    slug: 'PATIENT',
    isSystemRole: true,
    scope: 'CABINET',
    parentRoleSlug: null,
    permissions: [
      { permCode: 'read_my_programs', isDefault: true },
      { permCode: 'read_my_sessions', isDefault: true },
      { permCode: 'read_my_exercises', isDefault: true },
      { permCode: 'manage_my_session_executions', isDefault: true },
      { permCode: 'manage_my_patient_notes', isDefault: true },
    ],
  },
];

// Test users.
// Two cabinets (Paris + Lyon) to exercise multi-tenant isolation, plus a
// solo Nice cabinet and an orphan STUDENT. Counts deliberately mirror the
// scenarios the QA team walks through end-to-end.

type KineProfileType =
  | 'LIBERAL'
  | 'REMPLACANT'
  | 'ADMIN_GROUP'
  | 'MEMBER'
  | 'STUDENT'
  | 'ASSISTANT';

interface UserSeed {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'kine' | 'patient';
  roleSlug: string;
  cabinetKey: string | null;
  uniqueCode?: string;
  phone?: string;
  assignedKineEmail?: string;
  profileType?: KineProfileType;
  professionalNumber?: string;
  additionalMetadata?: Record<string, unknown>;
}

interface CabinetSeed {
  key: string;
  name: string;
  ownerEmail: string;
  address?: string;
  legalName?: string;
  taxRegistrationNumber?: string;
}

const CABINETS_SEED: CabinetSeed[] = [
  {
    key: 'cabinet_paris',
    name: 'Cabinet Paris Centre',
    ownerEmail: 'sophie.martin@cabinet-paris.fr',
    address: '15 Rue de Rivoli, 75001 Paris',
    legalName: 'Cabinet Paris Centre SAS',
    taxRegistrationNumber: '81234567800013',
  },
  {
    key: 'cabinet_lyon',
    name: 'Cabinet Lyon Bellecour',
    ownerEmail: 'pierre.roux@cabinet-lyon.fr',
    address: '8 Place Bellecour, 69002 Lyon',
    legalName: 'Cabinet Lyon Bellecour SARL',
    taxRegistrationNumber: '79876543200025',
  },
  {
    key: 'cabinet_nice',
    name: 'Cabinet Julien Leroy',
    ownerEmail: 'julien.leroy@cabinet-nice.fr',
    address: '3 Promenade des Anglais, 06000 Nice',
  },
  // Dedicated QA cabinet for invitation-flow testing.
  // Owner = ADMIN_GROUP + auto-flipped to VERIFIED at seed time so the
  // POST /api/v1/kine/auth/invitations endpoint passes the permission check
  // without entangling the existing PENDING/VERIFIED/REJECTED demo cohort.
  {
    key: 'cabinet_qa',
    name: 'Cabinet QA Invitations',
    ownerEmail: 'qa.admin@physioconnect.fr',
    address: '1 Rue de Test, 75000 Paris',
    legalName: 'Cabinet QA Invitations SAS',
    taxRegistrationNumber: '82456789100018',
  },
];

const USERS_SEED: UserSeed[] = [

  // Cabinet Paris (ADMIN_GROUP)
  {
    email: 'sophie.martin@cabinet-paris.fr',
    password: 'KineAdmin123!',
    firstName: 'Sophie',
    lastName: 'Martin',
    userType: 'kine',
    roleSlug: 'KINE_ADMIN',
    cabinetKey: 'cabinet_paris',
    phone: '+33601010101',
    profileType: 'ADMIN_GROUP',
    professionalNumber: '10000000001',
  },
  {
    email: 'ali.dupont@cabinet-paris.fr',
    password: 'Kine123!',
    firstName: 'Ali',
    lastName: 'Dupont',
    userType: 'kine',
    roleSlug: 'KINE',
    cabinetKey: 'cabinet_paris',
    phone: '+33601010102',
    profileType: 'MEMBER',
    professionalNumber: '10000000002',
  },
  {
    email: 'lea.bernard@cabinet-paris.fr',
    password: 'Kine123!',
    firstName: 'Lea',
    lastName: 'Bernard',
    userType: 'kine',
    roleSlug: 'KINE',
    cabinetKey: 'cabinet_paris',
    phone: '+33601010103',
    profileType: 'MEMBER',
    professionalNumber: '10000000003',
  },
  {
    email: 'nadia.benali@cabinet-paris.fr',
    password: 'Kine123!',
    firstName: 'Nadia',
    lastName: 'Benali',
    userType: 'kine',
    roleSlug: 'KINE',
    cabinetKey: 'cabinet_paris',
    phone: '+33601010104',
    profileType: 'REMPLACANT',
    professionalNumber: '10000000004',
    additionalMetadata: {
      isReplacement: true,
      contractStart: '2026-04-01',
      contractEnd: '2026-06-30',
    },
  },
  {
    email: 'marie.durand@patient.fr',
    password: 'Patient123!',
    firstName: 'Marie',
    lastName: 'Durand',
    userType: 'patient',
    roleSlug: 'PATIENT',
    cabinetKey: 'cabinet_paris',
    uniqueCode: 'MARIEPARIS01',
    phone: '+33611111111',
    assignedKineEmail: 'ali.dupont@cabinet-paris.fr',
  },
  {
    email: 'paul.martin@patient.fr',
    password: 'Patient123!',
    firstName: 'Paul',
    lastName: 'Martin',
    userType: 'patient',
    roleSlug: 'PATIENT',
    cabinetKey: 'cabinet_paris',
    uniqueCode: 'PAULPARIS001',
    phone: '+33611111122',
    assignedKineEmail: 'lea.bernard@cabinet-paris.fr',
  },

  // Cabinet Lyon (ADMIN_GROUP)
  {
    email: 'pierre.roux@cabinet-lyon.fr',
    password: 'KineAdmin123!',
    firstName: 'Pierre',
    lastName: 'Roux',
    userType: 'kine',
    roleSlug: 'KINE_ADMIN',
    cabinetKey: 'cabinet_lyon',
    phone: '+33602020201',
    profileType: 'ADMIN_GROUP',
    professionalNumber: '10000000005',
  },
  {
    email: 'camille.petit@cabinet-lyon.fr',
    password: 'Kine123!',
    firstName: 'Camille',
    lastName: 'Petit',
    userType: 'kine',
    roleSlug: 'KINE',
    cabinetKey: 'cabinet_lyon',
    phone: '+33602020202',
    profileType: 'MEMBER',
    professionalNumber: '10000000006',
  },
  {
    email: 'thomas.garnier@cabinet-lyon.fr',
    password: 'Assistant123!',
    firstName: 'Thomas',
    lastName: 'Garnier',
    userType: 'kine',
    roleSlug: 'KINE',
    cabinetKey: 'cabinet_lyon',
    phone: '+33602020203',
    profileType: 'ASSISTANT',
    additionalMetadata: {
      workingDays: ['MON', 'TUE', 'WED'],
    },
  },
  {
    email: 'lucas.moreau@patient.fr',
    password: 'Patient123!',
    firstName: 'Lucas',
    lastName: 'Moreau',
    userType: 'patient',
    roleSlug: 'PATIENT',
    cabinetKey: 'cabinet_lyon',
    uniqueCode: 'LUCASLYON001',
    phone: '+33622222222',
    assignedKineEmail: 'camille.petit@cabinet-lyon.fr',
  },

  // Cabinet Nice (LIBERAL solo)
  {
    email: 'julien.leroy@cabinet-nice.fr',
    password: 'Kine123!',
    firstName: 'Julien',
    lastName: 'Leroy',
    userType: 'kine',
    roleSlug: 'KINE',
    cabinetKey: 'cabinet_nice',
    phone: '+33603030301',
    profileType: 'LIBERAL',
    professionalNumber: '10000000007',
    additionalMetadata: { isReplacement: false },
  },

  // QA test admin (Cabinet QA Invitations) — for invitation-flow testing.
  // ADMIN_GROUP + auto-VERIFIED at seed time (see post-loop block below).
  {
    email: 'qa.admin@physioconnect.fr',
    password: 'QaAdmin123!',
    firstName: 'QA',
    lastName: 'Admin',
    userType: 'kine',
    roleSlug: 'KINE_ADMIN',
    cabinetKey: 'cabinet_qa',
    phone: '+33699990088',
    profileType: 'ADMIN_GROUP',
    professionalNumber: '10000000088',
  },

  // STUDENT (no cabinet)
  {
    email: 'emma.laurent@student.fr',
    password: 'Student123!',
    firstName: 'Emma',
    lastName: 'Laurent',
    userType: 'kine',
    roleSlug: 'KINE',
    cabinetKey: null,
    profileType: 'STUDENT',
    additionalMetadata: {
      school: 'IFMK Paris',
      academicYear: 3,
      justificatifUrl: 'https://cdn.physioconnect.com/justifs/emma-laurent-2026.pdf',
    },
  },
];

// Admins (separate collection from kines)

interface AdminSeed {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleSlug: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const ADMINS_SEED: AdminSeed[] = [
  {
    firstName: 'Thomas',
    lastName: 'Platform',
    email: 'admin@physioconnect.com',
    password: 'Admin123!',
    roleSlug: 'SUPER_ADMIN',
    status: 'ACTIVE',
  },
];

// Master fictif templates — invisible to app queries (pre-find hook strips
// `isTemplate: true`). Cloned per student on registration. Upsert is keyed
// by `templateCode`, so reseeding is idempotent.
type FictifTemplateSeed = {
  templateCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
};

const FICTIF_PATIENT_TEMPLATES: FictifTemplateSeed[] = [
  {
    templateCode: 'fictif-lowerback-001',
    firstName: 'Marie',
    lastName: '(Fictif) Lombalgie',
    dateOfBirth: '1985-03-12',
    address: 'Cas clinique : lombalgie chronique, sedentaire',
  },
  {
    templateCode: 'fictif-postopknee-001',
    firstName: 'Julien',
    lastName: '(Fictif) Post-op genou',
    dateOfBirth: '1972-11-04',
    address: 'Cas clinique : reeducation post-arthroscopie genou droit',
  },
  {
    templateCode: 'fictif-sciatica-001',
    firstName: 'Camille',
    lastName: '(Fictif) Sciatique',
    dateOfBirth: '1990-07-23',
    address: 'Cas clinique : sciatalgie L5-S1, debut subaigu',
  },
  {
    templateCode: 'fictif-shoulder-001',
    firstName: 'Antoine',
    lastName: '(Fictif) Epaule',
    dateOfBirth: '1968-01-30',
    address: 'Cas clinique : conflit sous-acromial epaule droite',
  },
  {
    templateCode: 'fictif-cervical-001',
    firstName: 'Sophie',
    lastName: '(Fictif) Cervicalgie',
    dateOfBirth: '1995-09-17',
    address: 'Cas clinique : cervicalgie de tension, posture ecran',
  },
];

// Main seed function

const SHOULD_RESET =
  process.env.SEED_RESET === 'true' || process.argv.includes('--fresh');

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const ActionModel: Model<any> = app.get(getModelToken('Action'));
  const ModuleModel: Model<any> = app.get(getModelToken('Module'));
  const PermissionModel: Model<any> = app.get(getModelToken('Permission'));
  const RoleModel: Model<any> = app.get(getModelToken('Role'));
  const KineModel: Model<any> = app.get(getModelToken('Kine'));
  const KineProfileModel: Model<any> = app.get(getModelToken('KineProfile'));
  const PatientModel: Model<any> = app.get(getModelToken('Patient'));
  const AdminModel: Model<any> = app.get(getModelToken('Admin'));
  const CabinetModel: Model<any> = app.get(getModelToken('Cabinet'));

  if (SHOULD_RESET) {
    console.log('\n═══ RESET mode : wiping managed collections ═══');
    const managed: Model<any>[] = [
      ActionModel,
      ModuleModel,
      PermissionModel,
      RoleModel,
      AdminModel,
      KineModel,
      KineProfileModel,
      PatientModel,
      CabinetModel,
    ];
    for (const M of managed) {
      const name = M.collection.collectionName;
      try {
        await M.collection.drop();
        console.log(`  dropped ${name}`);
      } catch (err: any) {
        if (err?.codeName !== 'NamespaceNotFound') {
          console.warn(`  drop ${name} failed:`, err.message);
        } else {
          console.log(`  skip ${name} (not present)`);
        }
      }
      try {
        await M.syncIndexes();
      } catch {
      }
    }
    console.log('═══ wipe done ═══\n');
  }

  // 1. Actions
  console.log('\n--- Seeding Actions ---');
  const actionMap = new Map<string, any>();
  for (const action of ACTIONS_SEED) {
    const existing = await ActionModel.findOneAndUpdate(
      { slug: action.slug },
      { $setOnInsert: { ...action, isActive: true, deletedAt: null } },
      { upsert: true, new: true },
    );
    actionMap.set(action.slug, existing);
    console.log(`  Action: ${action.slug} (${existing._id})`);
  }

  // 2. Modules
  console.log('\n--- Seeding Modules ---');
  const moduleMap = new Map<string, any>();
  for (const moduleSeed of MODULES_SEED) {
    const existing = await ModuleModel.findOneAndUpdate(
      { slug: moduleSeed.slug },
      { $setOnInsert: { ...moduleSeed, isActive: true, deletedAt: null } },
      { upsert: true, new: true },
    );
    moduleMap.set(moduleSeed.slug, existing);
    console.log(`  Module: ${moduleSeed.slug} (${existing._id})`);
  }

  // 3. Permissions
  console.log('\n--- Seeding Permissions ---');
  const permMap = new Map<string, any>();
  for (const permission of PERMISSIONS_SEED) {
    const moduleDoc = moduleMap.get(permission.moduleSlug);
    if (!moduleDoc) {
      console.warn(`  SKIP: Module ${permission.moduleSlug} not found for permission ${permission.code}`);
      continue;
    }
    const actionIdsList = permission.actionSlugs
      .map((slug) => actionMap.get(slug)?._id)
      .filter(Boolean);

    const existing = await PermissionModel.findOneAndUpdate(
      { code: permission.code },
      {
        $setOnInsert: {
          code: permission.code,
          moduleId: moduleDoc._id,
          actionIds: actionIdsList,
          parentPermissionId: null,
          conditions: permission.conditions,
          isActive: true,
          deletedAt: null,
        },
      },
      { upsert: true, new: true },
    );
    permMap.set(permission.code, existing);
    const conditionsLabel = permission.conditions ? JSON.stringify(permission.conditions) : 'none';
    console.log(`  Permission: ${permission.code} conditions=${conditionsLabel} (${existing._id})`);
  }

  for (const permission of PERMISSIONS_SEED) {
    if (permission.parentCode) {
      const parentPerm = permMap.get(permission.parentCode);
      const thisPerm = permMap.get(permission.code);
      if (parentPerm && thisPerm && !thisPerm.parentPermissionId) {
        await PermissionModel.findByIdAndUpdate(thisPerm._id, {
          parentPermissionId: parentPerm._id,
        });
        console.log(`  Link: ${permission.code} -> parent ${permission.parentCode}`);
      }
    }
  }

  // 4. Roles
  console.log('\n--- Seeding Roles ---');
  const roleMap = new Map<string, any>();
  for (const role of ROLES_SEED) {
    const permissionIds = role.permissions
      .map((rolePerm) => {
        const permDoc = permMap.get(rolePerm.permCode);
        if (!permDoc) {
          console.warn(`  SKIP: Permission ${rolePerm.permCode} not found for role ${role.slug}`);
          return null;
        }
        return {
          permission: permDoc._id,
          isDefault: rolePerm.isDefault,
        };
      })
      .filter(Boolean);

    const existing = await RoleModel.findOneAndUpdate(
      { slug: role.slug },
      {
        $setOnInsert: {
          slug: role.slug,
          isSystemRole: role.isSystemRole,
          scope: role.scope,
          parentRoleId: null,
          permissionIds,
          isActive: true,
        },
      },
      { upsert: true, new: true },
    );
    roleMap.set(role.slug, existing);
    console.log(`  Role: ${role.slug} (${existing._id})`);
  }

  for (const role of ROLES_SEED) {
    if (role.parentRoleSlug) {
      const parentRole = roleMap.get(role.parentRoleSlug);
      const thisRole = roleMap.get(role.slug);
      if (parentRole && thisRole && !thisRole.parentRoleId) {
        await RoleModel.findByIdAndUpdate(thisRole._id, {
          parentRoleId: parentRole._id,
        });
        console.log(`  Link: ${role.slug} -> parent ${role.parentRoleSlug}`);
      }
    }
  }

  // 5. Admins
  console.log('\n--- Seeding Admins ---');
  for (const admin of ADMINS_SEED) {
    const roleDoc = roleMap.get(admin.roleSlug);
    if (!roleDoc) {
      console.warn(`  SKIP: Role ${admin.roleSlug} not found for admin ${admin.email}`);
      continue;
    }
    const existingAdmin = await AdminModel.findOne({ email: admin.email }).exec();
    if (existingAdmin) {
      console.log(
        `  EXISTS: ${admin.email} (${existingAdmin._id}) [${admin.roleSlug}] status=${existingAdmin.status}`,
      );
      continue;
    }
    const passwordHash = await bcrypt.hash(admin.password, BCRYPT_ROUNDS);
    const created = await AdminModel.create({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      passwordHash,
      roleId: roleDoc._id,
      status: admin.status,
    });
    console.log(
      `  CREATED: ${admin.email} (${created._id}) [${admin.roleSlug}] status=${admin.status}`,
    );
  }

  console.log('\n--- Seeding Cabinets + cabinet owners ---');
  const cabinetKeyToId = new Map<string, string>();

  for (const cabinetSeed of CABINETS_SEED) {
    const ownerSeed = USERS_SEED.find((entry) => entry.email === cabinetSeed.ownerEmail);
    if (!ownerSeed) {
      console.warn(`  SKIP: owner ${cabinetSeed.ownerEmail} not in USERS_SEED`);
      continue;
    }

    const roleDoc = roleMap.get(ownerSeed.roleSlug);
    if (!roleDoc) continue;

    let ownerKine = await KineModel.findOne({ email: ownerSeed.email }).exec();
    if (!ownerKine) {
      const hashedPassword = await bcrypt.hash(ownerSeed.password, BCRYPT_ROUNDS);
      // US-I.1 — cabinet owners always carry a professionalNumber, so they
      // start at PENDING. Pierre (Lyon) is flipped to VERIFIED below so the
      // QA / UI work on the real "badge verifie" state too.
      ownerKine = await KineModel.create({
        email: ownerSeed.email,
        passwordHash: hashedPassword,
        firstName: ownerSeed.firstName,
        lastName: ownerSeed.lastName,
        // Role lives on the embedded profile (profiles[].roleId), not at L1.
        // isCabinetAdmin is also per-profile now (profiles[].isCabinetAdmin).
        phone: ownerSeed.phone,
        professionalNumber: ownerSeed.professionalNumber,
        verificationStatus: 'PENDING',
        status: 'ACTIVE',
        cguAcceptedAt: new Date(),
        cguVersion: '1.0',
      });
      console.log(
        `  CREATED Kine (cabinet owner, orphan): ${ownerSeed.email} (${ownerKine._id})`,
      );
    }

    let cabinet = await CabinetModel.findOne({
      ownerId: ownerKine._id,
    }).exec();
    if (!cabinet) {
      cabinet = await CabinetModel.create({
        name: cabinetSeed.name,
        ownerId: ownerKine._id,
        address: cabinetSeed.address,
        legalName: cabinetSeed.legalName,
        taxRegistrationNumber: cabinetSeed.taxRegistrationNumber,
        isActive: true,
      });
      console.log(
        `  CREATED Cabinet: ${cabinetSeed.name} (${cabinet._id}) owner=${ownerSeed.email} siret=${cabinetSeed.taxRegistrationNumber ?? 'none'}`,
      );
    } else {
      console.log(`  EXISTS Cabinet: ${cabinetSeed.name} (${cabinet._id})`);
    }

    cabinetKeyToId.set(cabinetSeed.key, cabinet._id.toString());

    const ownerProfileType: KineProfileType =
      ownerSeed.profileType ??
      (ownerSeed.roleSlug === 'KINE_ADMIN' ? 'ADMIN_GROUP' : 'LIBERAL');

    const needsCabinetBackfill =
      ownerKine.cabinetId?.toString() !== cabinet._id.toString();
    const existingOwnerProfileCount = await KineProfileModel.countDocuments({
      kineId: ownerKine._id,
    })
      .setOptions({ bypassTenantScope: true })
      .exec();
    const needsProfileBackfill = existingOwnerProfileCount === 0;

    if (needsCabinetBackfill || needsProfileBackfill) {
      let ownerProfileId: Types.ObjectId | null = null;
      if (needsProfileBackfill) {
        // 30-day freemium per profile (subscriptions are profile-scoped, not user-scoped).
        const trialStart = new Date();
        const trialEnd = new Date(trialStart);
        trialEnd.setDate(trialEnd.getDate() + FREEMIUM_TRIAL_DAYS);
        ownerProfileId = new Types.ObjectId();
        await KineProfileModel.create({
          _id: ownerProfileId,
          kineId: ownerKine._id,
          cabinetId: cabinet._id,
          roleId: roleDoc._id,
          profileType: ownerProfileType,
          isActive: true,
          isCabinetAdmin:
            ownerSeed.roleSlug === 'KINE_ADMIN' ||
            ownerProfileType === 'ADMIN_GROUP',
          subscriptionPlanId: null,
          customPermissionOverrides: [],
          additionalMetadata: ownerSeed.additionalMetadata ?? {},
          cguAcceptedAt: new Date(),
          cguVersion: '1.0',
          freemium: {
            startedAt: trialStart,
            endsAt: trialEnd,
            consumed: false,
          },
        });
      }
      const kineUpdate: any = {};
      if (needsCabinetBackfill) kineUpdate.cabinetId = cabinet._id;
      if (ownerProfileId) {
        // Pre-select that first profile so GET /me returns Shape A
        // immediately after seed (no need to call /select-profile first).
        kineUpdate.lastProfileId = ownerProfileId;
      }
      if (Object.keys(kineUpdate).length > 0) {
        await KineModel.findByIdAndUpdate(ownerKine._id, kineUpdate);
      }
      if (needsProfileBackfill) {
        console.log(
          `    + profile ${ownerProfileType} created for ${ownerSeed.email} (lastProfileId pre-stamped)`,
        );
      }
    }
  }

  // US-I.1 — flip selected seeded owners to VERIFIED so the QA team can test:
  //   - the "Profil verifie" badge state alongside the default PENDING cohort
  //     (Pierre Roux — Cabinet Lyon)
  //   - the invitation-issuance flow with a known-good admin
  //     (qa.admin — Cabinet QA Invitations)
  for (const verifiedEmail of [
    'pierre.roux@cabinet-lyon.fr',
    'qa.admin@physioconnect.fr',
  ]) {
    const verifiedDemo = await KineModel.findOne({ email: verifiedEmail }).exec();
    if (verifiedDemo && verifiedDemo.verificationStatus !== 'VERIFIED') {
      verifiedDemo.verificationStatus = 'VERIFIED';
      verifiedDemo.verifiedAt = new Date();
      await verifiedDemo.save();
      console.log(
        `  verificationStatus=VERIFIED applique sur ${verifiedDemo.email} (demo admin screen)`,
      );
    }
  }

  // 7. Kines praticiens (non-owner KINE role)
  console.log('\n--- Seeding Kines praticiens ---');
  const ownerEmails = new Set(CABINETS_SEED.map((cabinet) => cabinet.ownerEmail));
  for (const userSeed of USERS_SEED.filter(
    (entry) =>
      entry.userType === 'kine' &&
      entry.roleSlug === 'KINE' &&
      !ownerEmails.has(entry.email),
  )) {
    const roleDoc = roleMap.get(userSeed.roleSlug);
    if (!roleDoc) continue;

    const existing = await KineModel.findOne({ email: userSeed.email }).exec();
    if (existing) {
      console.log(
        `  EXISTS Kine: ${userSeed.email} (${existing._id}) cabinet=${existing.cabinetId}`,
      );
      continue;
    }

    const hashedPassword = await bcrypt.hash(userSeed.password, BCRYPT_ROUNDS);
    const profileType: KineProfileType = userSeed.profileType ?? 'MEMBER';

    // STUDENT has no cabinet (neither on L1 nor on the profile)
    const cabinetObjectId =
      userSeed.cabinetKey && profileType !== 'STUDENT'
        ? new Types.ObjectId(cabinetKeyToId.get(userSeed.cabinetKey) ?? userSeed.cabinetKey)
        : null;

    // Clinical kines (LIBERAL / REMPLACANT / MEMBER) carry a pro number and
    // start PENDING; STUDENT / ASSISTANT have no pro number.
    const verificationStatus: 'PENDING' | undefined = userSeed.professionalNumber
      ? 'PENDING'
      : undefined;

    // Per-profile freemium: STUDENT 3 months, LIBERAL/REMPLACANT 30 days,
    // MEMBER/ASSISTANT inherits the cabinet plan (no freemium subdoc).
    const trialStart = new Date();
    const trialEnd = new Date(trialStart);
    let freemium:
      | { startedAt: Date; endsAt: Date; consumed: boolean }
      | undefined;
    if (profileType === 'STUDENT') {
      trialEnd.setDate(trialEnd.getDate() + FREEMIUM_STUDENT_DAYS);
      freemium = { startedAt: trialStart, endsAt: trialEnd, consumed: false };
    } else if (profileType === 'LIBERAL' || profileType === 'REMPLACANT') {
      trialEnd.setDate(trialEnd.getDate() + FREEMIUM_TRIAL_DAYS);
      freemium = { startedAt: trialStart, endsAt: trialEnd, consumed: false };
    }

    const firstProfileId = new Types.ObjectId();
    const created = await KineModel.create({
      email: userSeed.email,
      passwordHash: hashedPassword,
      firstName: userSeed.firstName,
      lastName: userSeed.lastName,
      cabinetId: cabinetObjectId,
      phone: userSeed.phone,
      professionalNumber: userSeed.professionalNumber,
      verificationStatus,
      status: 'ACTIVE',
      cguAcceptedAt: new Date(),
      cguVersion: '1.0',
      lastProfileId: firstProfileId,
    });
    await KineProfileModel.create({
      _id: firstProfileId,
      kineId: created._id,
      cabinetId: cabinetObjectId,
      roleId: roleDoc._id,
      profileType,
      isActive: true,
      isCabinetAdmin:
        userSeed.roleSlug === 'KINE_ADMIN' || profileType === 'ADMIN_GROUP',
      subscriptionPlanId: null,
      customPermissionOverrides: [],
      additionalMetadata: userSeed.additionalMetadata ?? {},
      cguAcceptedAt: new Date(),
      cguVersion: '1.0',
      ...(freemium ? { freemium } : {}),
    });
    console.log(
      `  CREATED Kine: ${userSeed.email} (${created._id}) cabinet=${cabinetObjectId ?? 'none'} +1 ${profileType} profile (lastProfileId pre-stamped)`,
    );
  }

  // 8. Patients
  console.log('\n--- Seeding Patients ---');
  const kinesByEmail = new Map<string, any>();
  const allKines = await KineModel.find({
    email: {
      $in: [
        ...USERS_SEED.filter((entry) => entry.userType === 'kine').map((entry) => entry.email),
      ],
    },
  }).exec();
  for (const kine of allKines) kinesByEmail.set(kine.email, kine);

  const cabinetOwnersByKey = new Map<string, any>();
  for (const cabinet of CABINETS_SEED) {
    const ownerKine = kinesByEmail.get(cabinet.ownerEmail);
    if (ownerKine) cabinetOwnersByKey.set(cabinet.key, ownerKine);
  }

  for (const patientSeed of USERS_SEED.filter((entry) => entry.userType === 'patient')) {
    const roleDoc = roleMap.get(patientSeed.roleSlug);
    if (!roleDoc) continue;
    if (!patientSeed.cabinetKey) {
      console.warn(`  SKIP Patient without cabinet: ${patientSeed.email}`);
      continue;
    }
    const realCabinetId = cabinetKeyToId.get(patientSeed.cabinetKey) ?? patientSeed.cabinetKey;

    const existing = await PatientModel.findOne({ email: patientSeed.email }).exec();
    if (existing) {
      console.log(
        `  EXISTS Patient: ${patientSeed.email} (${existing._id}) cabinet=${existing.cabinetId}`,
      );
      continue;
    }

    const hashedPassword = await bcrypt.hash(patientSeed.password, BCRYPT_ROUNDS);
    const assignedKine = patientSeed.assignedKineEmail
      ? kinesByEmail.get(patientSeed.assignedKineEmail)
      : cabinetOwnersByKey.get(patientSeed.cabinetKey);
    const created = await PatientModel.create({
      email: patientSeed.email,
      passwordHash: hashedPassword,
      firstName: patientSeed.firstName,
      lastName: patientSeed.lastName,
      roleId: roleDoc._id,
      cabinetId: new Types.ObjectId(realCabinetId),
      uniqueCode: patientSeed.uniqueCode,
      phone: patientSeed.phone,
      ownerId: assignedKine?._id ?? null,
      status: 'ACTIVE',
    });
    console.log(
      `  CREATED Patient: ${patientSeed.email} (${created._id}) code=${patientSeed.uniqueCode} assignedKine=${assignedKine?.email ?? 'NONE'}`,
    );
  }

  // 8b. Fictif patient templates (STUDENT freemium sandbox masters)
  console.log('\n--- Seeding Fictif Patient Templates ---');
  const patientRoleDoc = roleMap.get('PATIENT');
  if (!patientRoleDoc) {
    console.warn('  SKIP: PATIENT role not found — fictif templates not seeded.');
  } else {
    for (let templateIndex = 0; templateIndex < FICTIF_PATIENT_TEMPLATES.length; templateIndex++) {
      const template = FICTIF_PATIENT_TEMPLATES[templateIndex];
      // Stable synthetic email + uniqueCode so the upsert is idempotent
      // before we even have a Mongo _id.
      const templateEmail = `tpl-${template.templateCode}@templates.physioandconnect.local`;
      const ordinal = String(templateIndex + 1).padStart(3, '0');
      const templateUniqueCode = `TPLFICTIF${ordinal}`;
      // `any` typing dodges Mongoose's overload ambiguity caused by the
      // `as any` widening on the options bag (custom keys aren't in QueryOptions).
      const upsertResult: any = await PatientModel.findOneAndUpdate(
        { templateCode: template.templateCode },
        {
          $setOnInsert: {
            email: templateEmail,
            firstName: template.firstName,
            lastName: template.lastName,
            roleId: patientRoleDoc._id,
            uniqueCode: templateUniqueCode,
            dateOfBirth: new Date(template.dateOfBirth),
            address: template.address,
            timezone: 'Europe/Paris',
            language: 'fr',
            status: 'ACTIVE',
            ownerId: null,
            cabinetId: null,
            source: 'fictif',
            isTemplate: true,
            templateCode: template.templateCode,
            templateId: null,
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
          includeTemplates: true,
          bypassTenantScope: true,
        } as any,
      );
      console.log(
        `  Fictif template: ${template.templateCode} (${upsertResult?._id}) ${template.firstName} ${template.lastName}`,
      );
    }
    console.log(
      `  -> ${FICTIF_PATIENT_TEMPLATES.length} fictif templates ready (cloned to each STUDENT on registration).`,
    );
  }

  // 9. Multi-profile edge cases — for /select-profile + /me Shape A/B.
  // The linear single-profile seed above doesn't give us a kine with 2+
  // profiles or the lastProfileId states needed to exercise both shapes.
  console.log('\n--- Seeding multi-profile + edge cases ---');
  const kineRoleDoc = roleMap.get('KINE');

  // Ali Dupont: already MEMBER on Cabinet Paris Centre. Give him a second
  // active profile (LIBERAL on his own solo cabinet) + a third INACTIVE
  // profile (expired REMPLACANT contract). This makes Ali the reference
  // multi-profile account: /select-profile switcher, /select-profile
  // rejection on the inactive one, /me Shape A rehydration.
  const ali = await KineModel.findOne({
    email: 'ali.dupont@cabinet-paris.fr',
  }).exec();
  // Skip if Ali already has more than the base MEMBER profile (re-seed safety).
  const aliProfileCount = ali
    ? await KineProfileModel.countDocuments({ kineId: ali._id })
        .setOptions({ bypassTenantScope: true })
        .exec()
    : 0;
  if (ali && aliProfileCount === 1 && kineRoleDoc) {
    let aliSoloCabinet = await CabinetModel.findOne({
      ownerId: ali._id,
    }).exec();
    if (!aliSoloCabinet) {
      aliSoloCabinet = await CabinetModel.create({
        name: 'Cabinet Ali Solo (soir & weekend)',
        ownerId: ali._id,
        address: '22 Rue de Turenne, 75003 Paris',
        isActive: true,
      });
      console.log(`  CREATED Cabinet solo pour Ali: ${aliSoloCabinet._id}`);
    }
    const trialStart = new Date();
    const trialEnd = new Date(trialStart);
    trialEnd.setDate(trialEnd.getDate() + FREEMIUM_TRIAL_DAYS);
    const liberalProfileId = new Types.ObjectId();
    const inactiveProfileId = new Types.ObjectId();
    await KineProfileModel.create([
      {
        _id: liberalProfileId,
        kineId: ali._id,
        cabinetId: aliSoloCabinet._id,
        roleId: kineRoleDoc._id,
        profileType: 'LIBERAL',
        isActive: true,
        isCabinetAdmin: false,
        subscriptionPlanId: null,
        customPermissionOverrides: [],
        additionalMetadata: { isReplacement: false },
        cguAcceptedAt: new Date(),
        cguVersion: '1.0',
        freemium: {
          startedAt: trialStart,
          endsAt: trialEnd,
          consumed: false,
        },
      },
      {
        _id: inactiveProfileId,
        kineId: ali._id,
        cabinetId: null,
        roleId: kineRoleDoc._id,
        profileType: 'REMPLACANT',
        isActive: false,
        isCabinetAdmin: false,
        subscriptionPlanId: null,
        customPermissionOverrides: [],
        additionalMetadata: {
          isReplacement: true,
          contractStart: '2025-01-01',
          contractEnd: '2025-12-31',
          note: 'Contract expired — profile suspended',
        },
        cguAcceptedAt: new Date(),
        cguVersion: '1.0',
      },
    ]);
    console.log(
      `  Ali: +1 active LIBERAL profile (${liberalProfileId}) + 1 INACTIVE REMPLACANT profile (${inactiveProfileId})`,
    );
  }

  // Sophie Martin: cross-cabinet demo. Two profiles in two different
  // cabinets — KINE_ADMIN/ADMIN_GROUP at Cabinet Paris (admin) and
  // KINE/MEMBER at Cabinet Lyon (non-admin). Designed so the QA team
  // can switch X-Profile-Id between the two and see the flat
  // permissions[] array change shape (admin superset vs base set) AND
  // see profiles[i].isCabinetAdmin flip true/false.
  const kineAdminRoleDoc = roleMap.get('KINE_ADMIN');
  const sophieEmail = 'sophie.martin@multi-cabinet.fr';
  const sophieExisting = await KineModel.findOne({ email: sophieEmail }).exec();
  const parisCabinetId = cabinetKeyToId.get('cabinet_paris');
  const lyonCabinetId = cabinetKeyToId.get('cabinet_lyon');
  if (
    !sophieExisting &&
    kineRoleDoc &&
    kineAdminRoleDoc &&
    parisCabinetId &&
    lyonCabinetId
  ) {
    const hashedPassword = await bcrypt.hash('Sophie123!', BCRYPT_ROUNDS);
    const adminProfileId = new Types.ObjectId();
    const memberProfileId = new Types.ObjectId();
    const sophieCreated = await KineModel.create({
      email: sophieEmail,
      passwordHash: hashedPassword,
      firstName: 'Sophie',
      lastName: 'Martin',
      phone: '+33601010199',
      professionalNumber: '10000000099',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      status: 'ACTIVE',
      cguAcceptedAt: new Date(),
      cguVersion: '1.0',
      // Default to the admin profile so /me returns Shape A with the
      // KINE_ADMIN superset right after seed.
      lastProfileId: adminProfileId,
    });
    await KineProfileModel.create([
      {
        _id: adminProfileId,
        kineId: sophieCreated._id,
        cabinetId: new Types.ObjectId(parisCabinetId),
        roleId: kineAdminRoleDoc._id,
        profileType: 'ADMIN_GROUP',
        isActive: true,
        isCabinetAdmin: true,
        subscriptionPlanId: null,
        customPermissionOverrides: [],
        additionalMetadata: {},
        cguAcceptedAt: new Date(),
        cguVersion: '1.0',
      },
      {
        _id: memberProfileId,
        kineId: sophieCreated._id,
        cabinetId: new Types.ObjectId(lyonCabinetId),
        roleId: kineRoleDoc._id,
        profileType: 'MEMBER',
        isActive: true,
        isCabinetAdmin: false,
        subscriptionPlanId: null,
        customPermissionOverrides: [],
        additionalMetadata: {},
        cguAcceptedAt: new Date(),
        cguVersion: '1.0',
      },
    ]);
    console.log(
      `  CREATED Sophie (cross-cabinet demo): KINE_ADMIN/ADMIN_GROUP@Paris (${adminProfileId}) + KINE/MEMBER@Lyon (${memberProfileId})`,
    );
  } else if (sophieExisting) {
    console.log(`  EXISTS Sophie (cross-cabinet demo): ${sophieExisting._id}`);
  }

  // Emma (STUDENT): clear lastProfileId so GET /me returns Shape B
  // (profile: null, availableProfiles: [...]) — the "switcher-required"
  // demo state.
  const emmaBShape = await KineModel.findOne({
    email: 'emma.laurent@student.fr',
  }).exec();
  if (emmaBShape && emmaBShape.lastProfileId) {
    await KineModel.findByIdAndUpdate(emmaBShape._id, {
      $set: { lastProfileId: null },
    });
    console.log(
      `  Emma: lastProfileId cleared (demo /me Shape B — availableProfiles)`,
    );
  }

  // Lea Bernard: flip to REJECTED verification with a rejection reason so
  // the admin screen has a full PENDING / VERIFIED / REJECTED triad
  // (Pierre is VERIFIED; everyone else is PENDING by default).
  const lea = await KineModel.findOne({
    email: 'lea.bernard@cabinet-paris.fr',
  }).exec();
  if (lea && lea.verificationStatus !== 'REJECTED') {
    lea.verificationStatus = 'REJECTED';
    lea.verificationRejectionReason =
      'Justificatif illisible — merci de re-soumettre une photo de meilleure qualite.';
    lea.verifiedAt = new Date();
    await lea.save();
    console.log(
      `  Lea: verificationStatus=REJECTED applique (demo admin screen, motif stocke)`,
    );
  }

  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('                     SEED COMPLETE');
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`  Actions:     ${ACTIONS_SEED.length}`);
  console.log(`  Modules:     ${MODULES_SEED.length}`);
  console.log(`  Permissions: ${PERMISSIONS_SEED.length}`);
  console.log(`  Roles:       ${ROLES_SEED.length}`);
  const kinesCount = USERS_SEED.filter((entry) => entry.userType === 'kine').length;
  const patientsCount = USERS_SEED.filter((entry) => entry.userType === 'patient').length;
  console.log(`  Admins:      ${ADMINS_SEED.length} (collection: admins)`);
  console.log(`  Kines:       ${kinesCount} (collection: kines)`);
  console.log(`  Patients:    ${patientsCount} (collection: patients)`);
  console.log(
    `  Fictif templates: ${FICTIF_PATIENT_TEMPLATES.length} (cloned per STUDENT registration)`,
  );
  console.log(`  Cabinets:    ${CABINETS_SEED.length} (collection: cabinets)`);
  console.log('');
  console.log('──────────────────────────────────────────────────────────────');
  console.log('  CREDENTIALS FOR TESTING (use with POST /auth/login)');
  console.log('──────────────────────────────────────────────────────────────');
  console.log('');
  console.log('  SUPER_ADMIN (plateforme — acces total, tous cabinets) :');
  console.log('    email:    admin@physioconnect.com');
  console.log('    password: Admin123!');
  console.log('');
  console.log('  ── CABINET PARIS (ADMIN_GROUP, cabinet_paris) ──');
  console.log('');
  console.log('  ADMIN_GROUP Sophie (admin cabinet de groupe, SIRET) :');
  console.log('    email:    sophie.martin@cabinet-paris.fr');
  console.log('    password: KineAdmin123!');
  console.log('');
  console.log('  MEMBER Ali (membre du cabinet, patient: Marie) — MULTI-PROFILES :');
  console.log('    email:    ali.dupont@cabinet-paris.fr');
  console.log('    password: Kine123!');
  console.log('    profils : 1) MEMBER @ Cabinet Paris Centre (actif, lastProfileId)');
  console.log('              2) LIBERAL @ Cabinet Solo Ali (actif)');
  console.log('              3) REMPLACANT @ no cabinet (INACTIF — contrat expire)');
  console.log('    -> sert pour tester /select-profile switcher + /me Shape A + rejet profil inactif');
  console.log('');
  console.log('  MEMBER Lea (membre du cabinet, patient: Paul) — VERIFICATION=REJECTED :');
  console.log('    email:    lea.bernard@cabinet-paris.fr');
  console.log('    password: Kine123!');
  console.log('    -> verificationStatus=REJECTED + motif stocke (demo admin screen)');
  console.log('');
  console.log('  REMPLACANT Nadia (remplacante contrat 01/04-30/06) :');
  console.log('    email:    nadia.benali@cabinet-paris.fr');
  console.log('    password: Kine123!');
  console.log('');
  console.log('  PATIENT Marie (assignee a Ali) :');
  console.log('    email:    marie.durand@patient.fr');
  console.log('    password: Patient123!');
  console.log('');
  console.log('  PATIENT Paul (assigne a Lea) :');
  console.log('    email:    paul.martin@patient.fr');
  console.log('    password: Patient123!');
  console.log('');
  console.log('  ── CABINET LYON (ADMIN_GROUP, cabinet_lyon) ──');
  console.log('');
  console.log('  ADMIN_GROUP Pierre (admin cabinet de groupe, SIRET) :');
  console.log('    email:    pierre.roux@cabinet-lyon.fr');
  console.log('    password: KineAdmin123!');
  console.log('');
  console.log('  MEMBER Camille (membre du cabinet, patient: Lucas) :');
  console.log('    email:    camille.petit@cabinet-lyon.fr');
  console.log('    password: Kine123!');
  console.log('');
  console.log('  ASSISTANT Thomas (assistant admin, invitation) :');
  console.log('    email:    thomas.garnier@cabinet-lyon.fr');
  console.log('    password: Assistant123!');
  console.log('');
  console.log('  PATIENT Lucas (assigne a Camille) :');
  console.log('    email:    lucas.moreau@patient.fr');
  console.log('    password: Patient123!');
  console.log('');
  console.log('  ── CABINET NICE (LIBERAL solo, cabinet_nice) ──');
  console.log('');
  console.log('  LIBERAL Julien (kine solo, proprietaire de son cabinet) :');
  console.log('    email:    julien.leroy@cabinet-nice.fr');
  console.log('    password: Kine123!');
  console.log('');
  console.log('  ── STUDENT (sans cabinet) ──');
  console.log('');
  console.log('  STUDENT Emma (IFMK Paris, annee 3, justificatif) — /me SHAPE B :');
  console.log('    email:    emma.laurent@student.fr');
  console.log('    password: Student123!');
  console.log('    -> lastProfileId=null : GET /me retourne profile:null + availableProfiles[]');
  console.log('    -> demo du switcher requis + /select-profile obligatoire avant endpoints metier');
  console.log('');
  console.log('══════════════════════════════════════════════════════════════');
  console.log('  TEST SCENARIOS');
  console.log('══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  ── A. 2-STEP LOGIN + SELECT-PROFILE ──');
  console.log('');
  console.log('  A1. /me Shape A (lastProfileId pre-stamped)');
  console.log('      POST /api/v1/kine/auth/login { sophie.martin@cabinet-paris.fr, KineAdmin123! }');
  console.log('      -> accessToken, profiles[] summary, lastProfileId non-null');
  console.log('      GET /api/v1/kine/me');
  console.log('      -> { user, profile, permissions, rules }  (rehydration directe, Shape A)');
  console.log('');
  console.log('  A2. /me Shape B (lastProfileId=null — switcher requis)');
  console.log('      POST /api/v1/kine/auth/login { emma.laurent@student.fr, Student123! }');
  console.log('      GET /api/v1/kine/me');
  console.log('      -> { user, profile:null, permissions:null, availableProfiles:[STUDENT] }');
  console.log('      POST /api/v1/kine/auth/select-profile { profileId: <STUDENT id> }');
  console.log('      -> { user, profile, permissions, rules }  + lastProfileId stampe cote serveur');
  console.log('');
  console.log('  A3. Multi-profile switch (ali.dupont : MEMBER + LIBERAL + REMPLACANT-inactif)');
  console.log('      POST /api/v1/kine/auth/login { ali.dupont@cabinet-paris.fr, Kine123! }');
  console.log('      -> profiles[] contient 3 entrees (2 actives + 1 inactive)');
  console.log('      POST /api/v1/kine/auth/select-profile { profileId: <LIBERAL id> }');
  console.log('      -> switch effectif, permissions rechargees pour le LIBERAL (solo)');
  console.log('      POST /api/v1/kine/auth/select-profile { profileId: <REMPLACANT id> }');
  console.log('      -> 403 PROFILE_INACTIVE (le profil est desactive — contrat expire)');
  console.log('');
  console.log('  ── B. MULTI-TENANT ISOLATION (CASL conditions) ──');
  console.log('');
  console.log('  B1. Ali (cabinet_paris) vs Camille (cabinet_lyon)');
  console.log('      Chacun ne voit QUE les donnees de son cabinet — la regle CASL embarque');
  console.log('      une condition { cabinetId: "<son cabinetId>" } injectee a la selection du profil.');
  console.log('');
  console.log('  B2. SUPER_ADMIN (admin@physioconnect.com) :');
  console.log('      can(MANAGE, "all") — pas de filtre cabinet, voit toute la plateforme.');
  console.log('');
  console.log('  ── C. RBAC par role ──');
  console.log('');
  console.log('  C1. KINE_ADMIN (sophie.martin, pierre.roux) :');
  console.log('      peut manage_roles / manage_cabinet_settings dans son cabinet.');
  console.log('');
  console.log('  C2. KINE praticien (ali, camille) : pas de permission sur ROLE/PERMISSION/ACTION.');
  console.log('      GET /roles -> 403');
  console.log('');
  console.log('  C3. PATIENT (marie, paul, lucas) : uniquement read_my_* + manage_my_session_executions.');
  console.log('      GET /users -> 403, GET /auth/me -> 200.');
  console.log('');
  console.log('  ── D. ADMIN VERIFICATION WORKFLOW (ADELI/RPPS) ──');
  console.log('');
  console.log('  D1. Cohorte de verification (triad PENDING / VERIFIED / REJECTED) :');
  console.log('      Pierre (cabinet-lyon)  -> VERIFIED');
  console.log('      Lea (cabinet-paris)    -> REJECTED + motif stocke');
  console.log('      Sophie/Ali/Nadia/etc.  -> PENDING (defaut post-inscription)');
  console.log('      GET /api/admin/v1/kines/verifications?status=PENDING|VERIFIED|REJECTED');
  console.log('      PATCH /api/admin/v1/kines/:id/verification { decision, rejectionReason? }');
  console.log('');
  console.log('  ── E. INVITATION FLOW (MEMBER / ASSISTANT) ──');
  console.log('');
  console.log('  E1. Sophie invite un MEMBER :');
  console.log('      login sophie.martin@cabinet-paris.fr -> select ADMIN_GROUP profile');
  console.log('      POST /api/v1/kine/auth/invitations { email, targetProfileType: "MEMBER" }');
  console.log('      -> invitationUrl (JWT TTL 7j)');
  console.log('      POST /api/v1/kine/auth/invitations/preview { invitationToken }');
  console.log('      -> { accountExists, cabinetName, targetProfileType, ... }');
  console.log('      POST /api/v1/kine/auth/accept-invitation { invitationToken, ... }');
  console.log('      -> { success, message, email }  (PAS de session — login requis ensuite)');
  console.log('');
  console.log('  ── F. INSCRIPTION AUTONOME + UPLOAD ──');
  console.log('');
  console.log('  F1. POST /api/v1/kine/auth/register (multipart/form-data) :');
  console.log('      LIBERAL / ADMIN_GROUP / STUDENT selon profileType.');
  console.log('      STUDENT : envoyer `justificatif` (PDF/JPG/PNG, max 5 Mo) OU `justificatifUrl`.');
  console.log('      -> { success, message, email }  (login separe apres)');
  console.log('');
  console.log('══════════════════════════════════════════════════════════════');

  await app.close();
}

seed()
  .then(() => {
    // Force-exit so dangling Mongo / Redis / amqp connections do not keep the
    // event loop alive after `app.close()`. Without this, the docker entrypoint
    // hangs waiting for the seed process to terminate and never starts the app.
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
