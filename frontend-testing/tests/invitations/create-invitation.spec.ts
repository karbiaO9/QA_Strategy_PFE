import {
  test,
  expect,
  stcAnnotations,
  clearAuthStorage,
} from '../../fixtures';
import { kineAdminCredentials, hasKineAdminCredentials } from '../../data/auth/kine-admin.credentials';
import { invitationRecipientEmail, validInvitation } from '../../data/invitations/invitation.data';
import { TEST_TAGS } from '../../constants/test-tags.constants';
import { ROUTES } from '../../constants/routes.constants';
import { isCreateInvitationRequest } from '../../utils/network.helpers';
import {
  resolveInvitationId,
  verifyInvitationPersisted,
  writeInvitationChain,
  type CreateInvitationResponse,
} from '../../utils/invitation.helpers';

test.describe('Invitations — Create practitioner invitation', () => {
  test.describe.configure({ mode: 'serial' });
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
  });

  test(
    `STC-INVIT-GEN-003/B Create invitation ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.E2E}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-INVIT-GEN-003/B',
        module: 'Invitations — Generate',
        priority: 'P1',
        testType: 'Frontend integration (positive)',
        endpoint: 'POST /api/v1/kine/auth/invitations',
      }),
    },
    async ({ page, loginPage, dashboardPage, practitionersPage, request }) => {
      test.skip(!hasKineAdminCredentials(), 'Set KINE_ADMIN_EMAIL / KINE_ADMIN_PASSWORD');

      const inviteeEmail = invitationRecipientEmail();
      const payload = validInvitation('MEMBER', {
        firstName: 'E2E',
        email: inviteeEmail,
      });
      const requestedAt = new Date();

      // Step 1: Login as cabinet admin
      await loginPage.open();
      await loginPage.login(kineAdminCredentials.email, kineAdminCredentials.password);
      await dashboardPage.expectAuthenticated();

      // Step 2: Open practitioners and open "Ajouter un praticien"
      const createRequestPromise = page.waitForRequest(
        (req) => req.method() === 'POST' && isCreateInvitationRequest(req.url())
      );
      const createResponsePromise = page.waitForResponse(
        (res) =>
          res.request().method() === 'POST' &&
          isCreateInvitationRequest(res.url()) &&
          res.status() >= 200 &&
          res.status() < 300
      );

      await practitionersPage.open();
      await practitionersPage.inviteDialog.open();
      await practitionersPage.inviteDialog.fill(payload.firstName, payload.email);
      await practitionersPage.inviteDialog.submit();

      // Step 3–4: Verify POST /invitations in network
      const createRequest = await createRequestPromise;
      expect(createRequest.postDataJSON()).toMatchObject({
        firstName: payload.firstName,
        email: payload.email,
        targetProfileType: 'MEMBER',
      });

      const createResponse = await createResponsePromise;
      expect([200, 201]).toContain(createResponse.status());

      const responseBody = (await createResponse.json()) as CreateInvitationResponse;
      const invitationId = resolveInvitationId(responseBody);
      expect(invitationId).toMatch(/^[a-f0-9]{24}$/i);

      // Step 5: UI success feedback
      await expect(page.getByText(/invitation a été envoyée avec succès/i)).toBeVisible({
        timeout: 15_000,
      });
      await expect(practitionersPage.inviteDialog.dialog).toBeHidden();
      await expect(page).toHaveURL(new RegExp(`${ROUTES.PRACTITIONERS}`));

      // Step 6: Backend persistence via public preview
      const preview = await verifyInvitationPersisted(request, invitationId);
      expect([200, 201]).toContain(preview.status);
      expect(String(preview.body.invitedEmail ?? '')).toBe(payload.email);

      writeInvitationChain({
        invitationId,
        invitationUrl: responseBody.invitationUrl,
        inviteeEmail,
        createdAt: requestedAt.toISOString(),
      });
    }
  );
});
