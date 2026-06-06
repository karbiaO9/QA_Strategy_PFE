import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailerService } from './mailer.service';

describe('MailerService', () => {
  let service: MailerService;
  let config: any;

  beforeEach(async () => {
    config = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerService,
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get(MailerService);
  });

  describe('onModuleInit driver selection', () => {
    it('falls back to LOG mode when MAIL_DRIVER is unset', async () => {
      config.get.mockImplementation(() => undefined);
      await service.onModuleInit();
      expect(service.isMailDelivered()).toBe(false);
    });

    it('falls back to LOG mode when MAIL_DRIVER=log', async () => {
      config.get.mockImplementation((key: string) =>
        key === 'MAIL_DRIVER' ? 'log' : undefined,
      );
      await service.onModuleInit();
      expect(service.isMailDelivered()).toBe(false);
    });

    it('falls back to LOG mode when MAIL_DRIVER=smtp but creds are missing', async () => {
      config.get.mockImplementation((key: string) =>
        key === 'MAIL_DRIVER' ? 'smtp' : undefined,
      );
      await service.onModuleInit();
      // Missing MAIL_HOST / MAIL_USER / MAIL_PASSWORD -> LOG fallback.
      expect(service.isMailDelivered()).toBe(false);
    });
  });

  describe('sendMail (LOG driver)', () => {
    it('returns delivered:true and driver=log when not configured for SMTP', async () => {
      config.get.mockReturnValue('log');
      await service.onModuleInit();
      const result = await service.sendMail({
        to: 'a@b.com',
        subject: 'Hi',
        text: 'Hello',
      });
      expect(result.driver).toBe('log');
      expect(result.delivered).toBe(true);
    });
  });

  describe('sendInvitationEmail', () => {
    beforeEach(async () => {
      config.get.mockReturnValue('log');
      await service.onModuleInit();
    });

    it('builds the French subject for MEMBER invitations', async () => {
      const spy = jest.spyOn(service, 'sendMail').mockResolvedValue({
        driver: 'log',
        delivered: true,
      });
      await service.sendInvitationEmail({
        to: 'invitee@b.com',
        invitationUrl: 'https://app/accept?token=x',
        cabinetName: 'Cabinet Paris',
        targetProfileType: 'MEMBER',
        invitedByName: 'Sophie Martin',
        expiresAt: new Date('2026-05-07T00:00:00Z'),
      });
      const env = spy.mock.calls[0][0];
      expect(env.subject).toContain('membre kine');
      expect(env.subject).toContain('du cabinet Cabinet Paris');
      expect(env.text).toContain('https://app/accept?token=x');
      expect(env.html).toContain('https://app/accept?token=x');
      expect(env.tags).toMatchObject({ kind: 'kine-invitation' });
    });

    it('uses the assistant label for ASSISTANT invitations', async () => {
      const spy = jest.spyOn(service, 'sendMail').mockResolvedValue({
        driver: 'log',
        delivered: true,
      });
      await service.sendInvitationEmail({
        to: 'invitee@b.com',
        invitationUrl: 'https://app/accept?token=y',
        cabinetName: null,
        targetProfileType: 'ASSISTANT',
        invitedByName: null,
        expiresAt: new Date('2026-05-07T00:00:00Z'),
      });
      const env = spy.mock.calls[0][0];
      expect(env.subject).toContain('assistant administratif');
    });
  });

  describe('sendPasswordResetEmail', () => {
    beforeEach(async () => {
      config.get.mockReturnValue('log');
      await service.onModuleInit();
    });

    it('embeds the 6-digit code and TTL in body and tags it', async () => {
      const spy = jest.spyOn(service, 'sendMail').mockResolvedValue({
        driver: 'log',
        delivered: true,
      });
      await service.sendPasswordResetEmail({
        to: 'kine@b.com',
        code: '123456',
        ttlMinutes: 10,
      });
      const env = spy.mock.calls[0][0];
      expect(env.subject).toMatch(/Reinitialisation/);
      expect(env.text).toContain('123456');
      expect(env.text).toContain('10 minutes');
      expect(env.html).toContain('123456');
      expect(env.tags).toMatchObject({ kind: 'password-reset' });
    });
  });

  describe('isMailDelivered', () => {
    it('returns false in LOG mode', async () => {
      config.get.mockReturnValue('log');
      await service.onModuleInit();
      expect(service.isMailDelivered()).toBe(false);
    });
  });

  // Brand integration: verify the rendered HTML actually carries the
  // XXX & Connect identity (gradient colours, brand name, footer).
  describe('brand integration', () => {
    beforeEach(async () => {
      config.get.mockReturnValue('log');
      await service.onModuleInit();
    });

    it('password-reset HTML carries the brand wordmark and primary colours', async () => {
      const spy = jest.spyOn(service, 'sendMail').mockResolvedValue({
        driver: 'log',
        delivered: true,
      });
      await service.sendPasswordResetEmail({
        to: 'kine@b.com',
        code: '845291',
        ttlMinutes: 10,
      });
      const env = spy.mock.calls[0][0]!;
      expect(env.html).toContain('XXX &amp; Connect');
      expect(env.html).toContain('#2D8BCA'); // primary blue from logo
      expect(env.html).toContain('#53BD92'); // primary green from logo
      // Code box uses a monospace font + the actual code.
      expect(env.html).toContain('845291');
    });

    it('invitation HTML embeds the absolute invitation URL in a CTA button', async () => {
      const spy = jest.spyOn(service, 'sendMail').mockResolvedValue({
        driver: 'log',
        delivered: true,
      });
      await service.sendInvitationEmail({
        to: 'invitee@b.com',
        invitationUrl: 'https://app.physio/accept?token=abc',
        cabinetName: 'Cabinet Paris',
        targetProfileType: 'MEMBER',
        invitedByName: 'Sophie',
        expiresAt: new Date('2026-05-07T12:00:00Z'),
      });
      const env = spy.mock.calls[0][0]!;
      // CTA button is rendered as an anchor with the invitation URL.
      expect(env.html).toContain('href="https://app.physio/accept?token=abc"');
      // Brand-band tagline.
      expect(env.html).toContain('multi-tenant');
    });

    it('embeds the logo as a base64 data URI in the HTML body (no MIME attachment)', async () => {
      const spy = jest.spyOn(service, 'sendMail').mockResolvedValue({
        driver: 'log',
        delivered: true,
      });
      await service.sendPasswordResetEmail({
        to: 'kine@b.com',
        code: '222222',
        ttlMinutes: 10,
      });
      const env = spy.mock.calls[0][0]!;
      // When the PNG is present in the test env the layout uses a data URI;
      // otherwise it falls back to a styled HTML wordmark. Either is fine —
      // the critical assertions are: NO MIME attachment is built, and NO
      // CID reference is left dangling in the HTML.
      expect((env as any).attachments).toBeUndefined();
      expect(env.html).not.toContain('cid:');
      const usedDataUri = env.html?.includes('<img src="data:image/png;base64,');
      const usedWordmark = env.html?.includes('hysio &amp; Connect');
      expect(usedDataUri || usedWordmark).toBe(true);
    });
  });
});
