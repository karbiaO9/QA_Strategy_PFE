import { test as base, expect } from '@playwright/test';
import {
  LoginPage,
  DashboardPage,
  ForgotPasswordPage,
  VerifyCodePage,
  ResetPasswordPage,
  AppShellPage,
  PractitionersPage,
  InvitationRoutingPage,
  InvitationFormPage,
  CreateProfilePage,
  ProfileSwitcherPage,
  SelectProfilePage,
} from '../pages';
import { API_ENDPOINTS } from '../constants/api.constants';
import { STORAGE_KEYS } from '../constants/storage.constants';

type PhysioFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  forgotPasswordPage: ForgotPasswordPage;
  verifyCodePage: VerifyCodePage;
  resetPasswordPage: ResetPasswordPage;
  appShellPage: AppShellPage;
  practitionersPage: PractitionersPage;
  invitationRoutingPage: InvitationRoutingPage;
  invitationFormPage: InvitationFormPage;
  createProfilePage: CreateProfilePage;
  profileSwitcherPage: ProfileSwitcherPage;
  selectProfilePage: SelectProfilePage;
  apiContext: {
    endpoints: typeof API_ENDPOINTS;
  };
};

export const test = base.extend<PhysioFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  forgotPasswordPage: async ({ page }, use) => {
    await use(new ForgotPasswordPage(page));
  },

  verifyCodePage: async ({ page }, use) => {
    await use(new VerifyCodePage(page));
  },

  resetPasswordPage: async ({ page }, use) => {
    await use(new ResetPasswordPage(page));
  },

  appShellPage: async ({ page }, use) => {
    await use(new AppShellPage(page));
  },

  practitionersPage: async ({ page }, use) => {
    await use(new PractitionersPage(page));
  },

  invitationRoutingPage: async ({ page }, use) => {
    await use(new InvitationRoutingPage(page));
  },

  invitationFormPage: async ({ page }, use) => {
    await use(new InvitationFormPage(page));
  },

  createProfilePage: async ({ page }, use) => {
    await use(new CreateProfilePage(page));
  },

  profileSwitcherPage: async ({ page }, use) => {
    await use(new ProfileSwitcherPage(page));
  },

  selectProfilePage: async ({ page }, use) => {
    await use(new SelectProfilePage(page));
  },

  apiContext: async ({}, use) => {
    await use({ endpoints: API_ENDPOINTS });
  },
});

export { expect };

export {
  readAccessToken,
  clearAuthStorage,
  loginViaUi,
  seedAuthSession,
  ensureAuthSession,
  ensureKineAdminSession,
  acceptNextDialog,
  triggerSidebarLogout,
  triggerServerLogoutApi,
  setAccessToken,
} from '../utils/auth-session.helpers';
