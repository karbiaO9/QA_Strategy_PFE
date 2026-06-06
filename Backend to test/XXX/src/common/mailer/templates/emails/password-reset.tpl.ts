import { Locale, RenderedEmail } from '../types';
import { interpolate, resolveDict } from '../i18n';
import {
  renderCodeBox,
  renderHeading,
  renderLayout,
  renderMutedParagraph,
  renderParagraph,
  renderSectionTitle,
} from '../layout.tpl';
import { PASSWORD_RESET_LOCALES } from './password-reset.locales';

export interface PasswordResetParams {
  code: string;
  ttlMinutes: number;
}

export function renderPasswordResetEmail(
  params: PasswordResetParams,
  locale?: Locale,
): RenderedEmail {
  const i18n = resolveDict(PASSWORD_RESET_LOCALES, locale);

  const ttlLine = interpolate(i18n.ttlLine, { ttlMinutes: params.ttlMinutes });

  const text = [
    i18n.greeting,
    '',
    i18n.intro,
    '',
    `${i18n.codeLabel} : ${params.code}`,
    ttlLine,
    '',
    i18n.ignoreLine,
    '',
    i18n.signOff,
  ].join('\n');

  const bodyHtml = [
    renderHeading(i18n.greeting),
    renderParagraph(i18n.intro),
    renderSectionTitle(i18n.codeLabel),
    renderCodeBox(params.code),
    renderMutedParagraph(ttlLine),
    renderMutedParagraph(i18n.ignoreLine),
  ].join('\n');

  const html = renderLayout({
    bodyHtml,
    preheader: i18n.intro,
  });

  return { subject: i18n.subject, text, html };
}
