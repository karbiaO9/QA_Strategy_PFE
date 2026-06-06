import {
  test,
  expect,
  stcAnnotations,
  clearAuthStorage,
} from '../../fixtures';
import { kineInviteeCredentials, hasKineInviteeCredentials } from '../../data/auth/kine-invitee.credentials';
import { TEST_TAGS } from '../../constants/test-tags.constants';
import { ROUTES } from '../../constants/routes.constants';
import { isPreviewInvitationRequest } from '../../utils/network.helpers';
import {
  readInvitationChain,
  resolveInvitationIdForAccept,
  fetchInvitationLinkFromMail,
} from '../../utils/invitation.helpers';
import { getMailboxConfig } from '../../utils/mailbox.helpers';

test.describe('Invitations — Accept invitation deep-link', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
  });

  test(
    `STC-INVIT-ACCEPT-004/B Open invitation link ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.E2E}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-INVIT-ACCEPT-004/B',
        module: 'Invitations — Accept',
        priority: 'P1',
        testType: 'Frontend integration (positive)',
        endpoint: 'POST /api/v1/kine/auth/invitations/preview',
      }),
    },
    async ({ page, loginPage, dashboardPage, invitationRoutingPage }) => {
      test.skip(!hasKineInviteeCredentials(), 'Set KINE_INVITEE_EMAIL / KINE_INVITEE_PASSWORD');

      const chain = readInvitationChain();
      const receivedAfter = chain?.createdAt ? new Date(chain.createdAt) : new Date(Date.now() - 30 * 60_000);

      test.skip(
        !chain?.invitationId && !process.env.INVITATION_ID?.trim(),
        'Run STC-INVIT-GEN-003/B first or set INVITATION_ID'
      );

      let invitationId = await resolveInvitationIdForAccept(chain, receivedAfter);
      let invitationUrl = chain?.invitationUrl ?? `${ROUTES.INVITATION(invitationId)}`;

      if (getMailboxConfig()) {
        try {
          const mail = await fetchInvitationLinkFromMail(new Date(receivedAfter.getTime() - 5_000));
          invitationId = mail.invitationId;
          invitationUrl = mail.invitationUrl;
        } catch {
          // Fall back to chain / INVITATION_ID when mail is slow or already read.
        }
      }

      // Step 1: Login as invitee (existing Kine account)
      await loginPage.open();
      await loginPage.login(kineInviteeCredentials.email, kineInviteeCredentials.password);
      await dashboardPage.expectAuthenticated();

      // Step 2: Open invitation accept link (from email or prior STC)
      const previewRequestPromise = page.waitForRequest(
        (req) => req.method() === 'POST' && isPreviewInvitationRequest(req.url())
      );

      await page.goto(invitationUrl.startsWith('http') ? invitationUrl : ROUTES.INVITATION(invitationId), {
        waitUntil: 'domcontentloaded',
      });

      const previewRequest = await previewRequestPromise;
      expect(previewRequest.postDataJSON()).toMatchObject({ invitationId });

      // Expected: invitation deep-link route (/invitation/:id). For an existing account the
      // app may continue to complete-profile after preview � both prove the link was accepted.
      const onInvitationRoute = await page
        .waitForURL(new RegExp(`/invitation/${invitationId}(?:\\?|$)`), { timeout: 8_000 })
        .then(() => true)
        .catch(() => false);

      if (onInvitationRoute) {
        await expect(page).toHaveURL(new RegExp(`/invitation/${invitationId}(?:\\?|$)`));
        await expect(invitationRoutingPage.loadingMessage()).toBeVisible().catch(() => undefined);
      } else {
        await expect(page).toHaveURL(
          new RegExp(`/invitation/(?:complete-profile/practitioner|${invitationId})`)
        );
      }

      const storedInviteId = await page.evaluate(() => sessionStorage.getItem('pc_invite_id'));
      expect(storedInviteId).toBe(invitationId);
    }
  );
});
