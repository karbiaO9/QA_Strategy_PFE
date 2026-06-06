import { LocaleDict } from '../i18n';

export interface InvitationStrings extends Record<string, string> {
  subject: string;
  greeting: string;
  introMember: string;
  introAssistant: string;
  expiresAtLabel: string;
  ctaButton: string;
  fallbackUrlLabel: string;
  ignoreLine: string;
  signOff: string;
}

export const INVITATION_LOCALES: LocaleDict<InvitationStrings> = {
  fr: {
    subject:
      'Invitation a rejoindre XXX & Connect{{cabinetSuffix}} en tant que {{roleLabel}}',
    greeting: 'Bonjour,',
    introMember:
      '{{inviter}} vous invite a rejoindre XXX & Connect{{cabinetSuffix}} en tant que membre kine.',
    introAssistant:
      '{{inviter}} vous invite a rejoindre XXX & Connect{{cabinetSuffix}} en tant qu’assistant administratif.',
    expiresAtLabel: 'Lien valable jusqu’au {{expiresAt}}.',
    ctaButton: 'Accepter l’invitation',
    fallbackUrlLabel: 'Si le bouton ne fonctionne pas, copiez ce lien :',
    ignoreLine:
      'Si vous n’etes pas a l’origine de cette invitation, ignorez simplement ce message.',
    signOff: 'A bientot sur XXX & Connect.',
  },
};
