import { Locale, RenderedEmail } from '../types';
import { interpolate, resolveDict } from '../i18n';
import {
  renderButton,
  renderHeading,
  renderLayout,
  renderLink,
  renderMutedParagraph,
  renderParagraph,
  renderSectionTitle,
} from '../layout.tpl';
import { INVITATION_LOCALES } from './invitation.locales';

export interface InvitationParams {
  invitationUrl: string;
  cabinetName?: string | null;
  targetProfileType: 'MEMBER' | 'ASSISTANT';
  invitedByName?: string | null;
  expiresAt: Date;
}

export function renderInvitationEmail(
  params: InvitationParams,
  locale?: Locale,
): RenderedEmail {
  const i18n = resolveDict(INVITATION_LOCALES, locale);

  const cabinetSuffix = params.cabinetName
    ? ` du cabinet ${params.cabinetName}`
    : '';
  const inviter = params.invitedByName ?? 'un administrateur';
  const roleLabel =
    params.targetProfileType === 'MEMBER' ? 'membre kine' : 'assistant administratif';
  const expiresAtLabel = formatDateFr(params.expiresAt);

  const subject = interpolate(i18n.subject, { cabinetSuffix, roleLabel });
  const introTemplate =
    params.targetProfileType === 'MEMBER' ? i18n.introMember : i18n.introAssistant;
  const introLine = interpolate(introTemplate, { cabinetSuffix, inviter });

  // Plain-text fallback (no markup, line breaks for readability).
  const text = [
    i18n.greeting,
    '',
    introLine,
    '',
    interpolate(i18n.expiresAtLabel, { expiresAt: expiresAtLabel }),
    '',
    `${i18n.ctaButton} : ${params.invitationUrl}`,
    '',
    i18n.ignoreLine,
    '',
    i18n.signOff,
  ].join('\n');

  // HTML body — uses the shared layout shell.
  const bodyHtml = [
    renderHeading(i18n.greeting),
    renderParagraph(introLine),
    renderSectionTitle(roleLabel.toUpperCase()),
    renderButton(i18n.ctaButton, params.invitationUrl),
    renderMutedParagraph(
      interpolate(i18n.expiresAtLabel, { expiresAt: expiresAtLabel }),
    ),
    renderParagraph(i18n.fallbackUrlLabel),
    `<p style="margin:0 0 14px 0;font-size:13px;word-break:break-all;">${renderLink(params.invitationUrl, params.invitationUrl)}</p>`,
    renderMutedParagraph(i18n.ignoreLine),
  ].join('\n');

  const html = renderLayout({
    bodyHtml,
    preheader: introLine,
  });

  return { subject, text, html };
}

function formatDateFr(d: Date): string {
  // FR locale, Europe/Paris-friendly, 24h format. No external deps.
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hh}:${mm} UTC`;
}
