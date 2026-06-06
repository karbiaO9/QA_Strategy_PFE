// Shared types for the email-template subsystem.

export type Locale = 'fr';

export const DEFAULT_LOCALE: Locale = 'fr';

// Output of every template renderer. Subject + plain-text fallback + HTML.
export interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}
