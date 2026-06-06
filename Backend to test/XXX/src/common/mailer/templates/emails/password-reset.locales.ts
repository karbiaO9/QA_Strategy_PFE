import { LocaleDict } from '../i18n';

export interface PasswordResetStrings extends Record<string, string> {
  subject: string;
  greeting: string;
  intro: string;
  codeLabel: string;
  ttlLine: string;
  ignoreLine: string;
  signOff: string;
}

export const PASSWORD_RESET_LOCALES: LocaleDict<PasswordResetStrings> = {
  fr: {
    subject: 'Reinitialisation de votre mot de passe XXX & Connect',
    greeting: 'Bonjour,',
    intro:
      'Vous avez demande la reinitialisation de votre mot de passe XXX & Connect. Utilisez le code ci-dessous pour finaliser la procedure.',
    codeLabel: 'Votre code de verification',
    ttlLine: 'Ce code est valable {{ttlMinutes}} minutes.',
    ignoreLine:
      'Si vous n’etes pas a l’origine de cette demande, ignorez ce message — votre mot de passe restera inchange.',
    signOff: 'L’equipe XXX & Connect.',
  },
};
