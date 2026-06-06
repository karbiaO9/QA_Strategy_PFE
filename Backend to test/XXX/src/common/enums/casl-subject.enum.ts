
export enum CaslSubject {
  // identity
  ADMIN = 'ADMIN',
  KINE = 'KINE',
  PATIENT = 'PATIENT',
  CABINET = 'CABINET',
  ROLE = 'ROLE',
  PERMISSION = 'PERMISSION',

  // core
  EXERCISE = 'EXERCISE',
  SESSION = 'SESSION',
  PROGRAM = 'PROGRAM',
  ASSIGNED_PROGRAM = 'ASSIGNED_PROGRAM',
  SCHEDULED_SESSION = 'SCHEDULED_SESSION',
  SESSION_EXECUTION = 'SESSION_EXECUTION',
  BILAN = 'BILAN',
  KINE_NOTE = 'KINE_NOTE',
  PATIENT_NOTE = 'PATIENT_NOTE',

  // analytics
  BILAN_AI_CONFIG = 'BILAN_AI_CONFIG',
  SUPPORT_TICKET = 'SUPPORT_TICKET',
  FAQ = 'FAQ',

  // billing
  PLAN = 'PLAN',
  SUBSCRIPTION = 'SUBSCRIPTION',
  INVOICE = 'INVOICE',

  // notification
  NOTIFICATION = 'NOTIFICATION',
}

// 'all' here is the CASL wildcard reserved for SUPER_ADMIN (can(MANAGE, 'all')).
export type CaslSubjectType = CaslSubject | 'all';
