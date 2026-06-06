import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Locale } from './templates/types';
import { renderInvitationEmail } from './templates/emails/invitation.tpl';
import { renderPasswordResetEmail } from './templates/emails/password-reset.tpl';

export interface MailEnvelope {
  to: string;
  subject: string;
  text: string;
  html?: string;
  tags?: Record<string, string | number | boolean>;
}

export interface MailSendResult {
  driver: 'log' | 'smtp';
  delivered: boolean;
  messageId?: string;
  reason?: string;
}

@Injectable()
export class MailerService implements OnModuleInit {
  private readonly logger = new Logger(MailerService.name);
  private driver: 'log' | 'smtp' = 'log';
  private transporter: any = null;
  private from = 'XXX & Connect <no-reply@physioandconnect.local>';

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const requested = (
      this.config.get<string>('MAIL_DRIVER') ?? 'log'
    ).toLowerCase();
    this.from = this.config.get<string>('MAIL_FROM') ?? this.from;

    if (requested !== 'smtp') {
      this.driver = 'log';
      this.logger.log(`Mailer initialised in LOG mode (driver=${requested}).`);
      return;
    }

    try {
      const nodemailer = require('nodemailer');
      const host = this.config.get<string>('MAIL_HOST');
      const port = Number(this.config.get<string>('MAIL_PORT') ?? 587);
      const user = this.config.get<string>('MAIL_USER');
      const pass = this.config.get<string>('MAIL_PASSWORD');
      const secure =
        (this.config.get<string>('MAIL_SECURE') ?? 'false') === 'true';

      if (!host || !user || !pass) {
        this.logger.warn(
          'MAIL_DRIVER=smtp but MAIL_HOST / MAIL_USER / MAIL_PASSWORD are incomplete — falling back to LOG driver.',
        );
        this.driver = 'log';
        return;
      }

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        // Force IPv4 — most clusters have no IPv6 egress, so resolving an
        // AAAA record (e.g. Gmail) ends in ENETUNREACH.
        family: 4,
      });
      this.driver = 'smtp';
      this.logger.log(
        `Mailer initialised in SMTP mode (${host}:${port}, secure=${secure}).`,
      );
    } catch (err: any) {
      this.logger.warn(
        `Mailer SMTP init failed (${err?.message ?? err}). Falling back to LOG driver.`,
      );
      this.driver = 'log';
    }
  }

  async sendMail(envelope: MailEnvelope): Promise<MailSendResult> {
    if (this.driver === 'log' || !this.transporter) {
      this.logEnvelope(envelope);
      return { driver: 'log', delivered: true };
    }
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to: envelope.to,
        subject: envelope.subject,
        text: envelope.text,
        html: envelope.html,
      });
      return {
        driver: 'smtp',
        delivered: true,
        messageId: info?.messageId,
      };
    } catch (err: any) {
      this.logger.error(
        `SMTP send failed for ${envelope.to} (${envelope.subject}): ${err?.message ?? err}`,
      );
      return {
        driver: 'smtp',
        delivered: false,
        reason: err?.message ?? String(err),
      };
    }
  }

  // Public API — each method renders its template and dispatches to sendMail.
  // Subject/HTML/text live in templates/emails/*.tpl.ts.

  async sendInvitationEmail(params: {
    to: string;
    invitationUrl: string;
    cabinetName?: string | null;
    targetProfileType: 'MEMBER' | 'ASSISTANT';
    invitedByName?: string | null;
    expiresAt: Date;
    locale?: Locale;
  }): Promise<MailSendResult> {
    const { to, locale, ...rest } = params;
    const rendered = renderInvitationEmail(rest, locale);
    return this.sendMail({
      to,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
      tags: {
        kind: 'kine-invitation',
        targetProfileType: params.targetProfileType,
      },
    });
  }

  async sendPasswordResetEmail(params: {
    to: string;
    code: string;
    ttlMinutes: number;
    locale?: Locale;
  }): Promise<MailSendResult> {
    const { to, locale, code, ttlMinutes } = params;
    const rendered = renderPasswordResetEmail({ code, ttlMinutes }, locale);
    return this.sendMail({
      to,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
      tags: { kind: 'password-reset' },
    });
  }

  isMailDelivered(): boolean {
    return this.driver === 'smtp';
  }

  private logEnvelope(envelope: MailEnvelope): void {
    this.logger.log(
      `[MAIL-LOG] to=${envelope.to} subject=${JSON.stringify(envelope.subject)}`,
    );
    this.logger.log(`[MAIL-LOG] body:\n${envelope.text}`);
    if (envelope.tags) {
      this.logger.log(`[MAIL-LOG] tags=${JSON.stringify(envelope.tags)}`);
    }
  }
}
