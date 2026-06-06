export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_CODE: '/verify-code',
  RESET_PASSWORD: '/reset-password',
  SELECT_PROFILE: '/select-profile',
  DASHBOARD: '/',
  CALENDAR: '/calendar',
  SIGNUP: '/signup',

  // Invitation & profile flows (Frontend to test → apps/physio)
  PRACTITIONERS: '/practitioners',
  CREATE_PROFILE: '/create-profile',
  /** Public invitation deep-link: /invitation/:id (preview → routing) */
  INVITATION: (id: string) => `/invitation/${id}`,
  INVITATION_REGISTER_PRACTITIONER: '/invitation/register/practitioner',
  INVITATION_REGISTER_ASSISTANT: '/invitation/register/assistant',
  INVITATION_COMPLETE_PRACTITIONER: '/invitation/complete-profile/practitioner',
  INVITATION_COMPLETE_ASSISTANT: '/invitation/complete-profile/assistant',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
