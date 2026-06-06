import { BRAND, FONT_STACK, resolveLogoDataUri } from './brand';

interface LayoutOptions {
  // Inner HTML to drop inside the white card.
  bodyHtml: string;
  // Email "preview text" — the snippet most clients show next to the
  // subject line in the inbox list. Hidden from the body itself.
  preheader?: string;
}

// Wraps inner HTML in the brand shell: gradient header + white card + footer.
// Inline styles only and table layout — Outlook/Gmail compatibility tax.
export function renderLayout(opts: LayoutOptions): string {
  const preheader = opts.preheader ?? '';

  // Logo as a base64 data URI — keeps it in the HTML body, no MIME
  // attachment, no Gmail "pièce jointe". Falls back to a text wordmark
  // when the PNG isn't shipped.
  const dataUri = resolveLogoDataUri();
  const logoBlock = dataUri
    ? `<img src="${dataUri}" alt="${escapeAttr(BRAND.name)}" width="180" height="58" style="display:block;border:0;outline:none;text-decoration:none;max-width:180px;height:auto;" />`
    : `<span style="font-family:${FONT_STACK};font-size:22px;font-weight:700;letter-spacing:-0.5px;color:${BRAND.primaryBlue};">P<span style="color:${BRAND.primaryGreen};">hysio &amp; Connect</span></span>`;

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeAttr(BRAND.name)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bgPage};font-family:${FONT_STACK};color:${BRAND.textDark};-webkit-text-size-adjust:100%;">
  <!-- preheader (hidden inbox snippet) -->
  <div style="display:none;font-size:1px;color:${BRAND.bgPage};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.bgPage};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${BRAND.bgCard};border-radius:12px;overflow:hidden;border:1px solid ${BRAND.borderLight};box-shadow:0 1px 2px rgba(15,23,42,0.04);">
          <!-- HEADER BAND : brand gradient blue -> green -->
          <tr>
            <td style="background:${BRAND.primaryBlue};background-image:linear-gradient(90deg, ${BRAND.primaryBlue} 0%, ${BRAND.primaryMid} 50%, ${BRAND.primaryGreen} 100%);padding:20px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" valign="middle" style="background:#ffffff;border-radius:8px;padding:10px 16px;width:1%;white-space:nowrap;">
                    ${logoBlock}
                  </td>
                  <td align="right" valign="middle" style="font-family:${FONT_STACK};color:#ffffff;font-size:12px;letter-spacing:0.4px;text-transform:uppercase;font-weight:600;padding-left:16px;">
                    ${escapeHtml(BRAND.tagline)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CONTENT CARD -->
          <tr>
            <td style="padding:36px 36px 28px 36px;font-family:${FONT_STACK};color:${BRAND.textDark};font-size:15px;line-height:1.65;">
              ${opts.bodyHtml}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:20px 36px 28px 36px;border-top:1px solid ${BRAND.borderLight};font-family:${FONT_STACK};color:${BRAND.textMuted};font-size:12px;line-height:1.6;">
              <strong style="color:${BRAND.primaryBlue};">${escapeHtml(BRAND.name)}</strong>
              &nbsp;&middot;&nbsp;
              ${escapeHtml(BRAND.tagline)}
              <br>
              Cet email a ete envoye automatiquement &mdash; merci de ne pas y repondre.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Reusable building blocks templates can compose into their bodyHtml.

export function renderHeading(text: string): string {
  return `<h1 style="margin:0 0 16px 0;font-family:${FONT_STACK};font-size:22px;line-height:1.3;color:${BRAND.textDark};font-weight:700;">${escapeHtml(text)}</h1>`;
}

export function renderSectionTitle(text: string): string {
  return `<p style="margin:24px 0 8px 0;font-family:${FONT_STACK};font-size:13px;font-weight:600;color:${BRAND.accent};letter-spacing:0.4px;text-transform:uppercase;">${escapeHtml(text)}</p>`;
}

export function renderParagraph(text: string): string {
  return `<p style="margin:0 0 14px 0;font-family:${FONT_STACK};font-size:15px;line-height:1.65;color:${BRAND.textDark};">${escapeHtml(text)}</p>`;
}

export function renderMutedParagraph(text: string): string {
  return `<p style="margin:14px 0 0 0;font-family:${FONT_STACK};font-size:13px;line-height:1.6;color:${BRAND.textMuted};">${escapeHtml(text)}</p>`;
}

// CTA button. Wrapped in a table because Outlook ignores anchor padding.
export function renderButton(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px auto;">
  <tr>
    <td align="center" bgcolor="${BRAND.primaryBlue}" style="background:${BRAND.primaryBlue};background-image:linear-gradient(90deg, ${BRAND.primaryBlue} 0%, ${BRAND.primaryGreen} 100%);border-radius:8px;">
      <a href="${escapeAttr(href)}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:${FONT_STACK};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${escapeHtml(label)}</a>
    </td>
  </tr>
</table>`;
}

// Used for the 6-digit password-reset code.
export function renderCodeBox(code: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px auto;">
  <tr>
    <td align="center" style="background:${BRAND.bgSoftGreen};border:2px solid ${BRAND.primaryGreen};border-radius:10px;padding:18px 32px;">
      <span style="font-family:'Courier New', Courier, monospace;font-size:32px;font-weight:700;letter-spacing:10px;color:${BRAND.primaryBlue};">${escapeHtml(code)}</span>
    </td>
  </tr>
</table>`;
}

export function renderPill(text: string): string {
  return `<span style="display:inline-block;padding:6px 12px;margin:0 6px 6px 0;border:1px solid ${BRAND.primaryGreen};color:${BRAND.primaryGreen};border-radius:999px;font-family:${FONT_STACK};font-size:12px;font-weight:600;background:${BRAND.bgSoftGreen};">${escapeHtml(text)}</span>`;
}

export function renderLink(label: string, href: string): string {
  return `<a href="${escapeAttr(href)}" target="_blank" style="color:${BRAND.primaryBlue};text-decoration:underline;font-weight:500;">${escapeHtml(label)}</a>`;
}

// Cheap insurance for the day a template param ends up carrying user input.
export function escapeHtml(input: string): string {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function escapeAttr(input: string): string {
  return escapeHtml(input);
}
