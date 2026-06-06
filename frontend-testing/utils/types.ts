export interface KineCredentials {
  email: string;
  password: string;
  phone: string;
  invalidPassword: string;
}

/** Kine account that holds cabinet-admin rights (can create invitations). */
export interface KineAdminCredentials {
  email: string;
  password: string;
}

export type TargetProfileType = 'MEMBER' | 'ASSISTANT';

/** Body sent by the "Ajouter un praticien" dialog → POST /invitations */
export interface InvitationPayload {
  targetProfileType: TargetProfileType;
  firstName: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface StcAnnotation {
  stcId: string;
  title?: string;
  module?: string;
  priority?: string;
  testType?: string;
  endpoint?: string;
}

export interface StcStepResult {
  index: number;
  action: string;
  testData?: string;
  expected?: string;
  actual?: string;
  acceptanceCriteria?: string;
  status: 'Pass' | 'Fail' | 'Blocked' | 'N/A' | '�';
  defectRef?: string;
  severity?: string;
  evidenceRef?: string;
  notes?: string;
}

export interface StcReportPayload {
  stcId: string;
  title: string;
  module: string;
  endpoint?: string;
  testType: string;
  priority: string;
  overallResult: 'PASSED' | 'FAILED' | 'BLOCKED' | 'Not Executed';
  executionNotes: string;
  steps: StcStepResult[];
  evidenceReference?: string;
  attachmentReference?: string;
  executedAt: string;
  durationMs: number;
  project?: string;
  testerName?: string;
  /** Playwright project name (chromium-guest, etc.) */
  playwrightProject?: string;
  /** First failure message when the test did not pass */
  errorMessage?: string;
  userStory?: string;
  testObjective?: string;
  automationScriptRef?: string;
}
