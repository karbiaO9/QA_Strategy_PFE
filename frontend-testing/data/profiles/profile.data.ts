/**
 * Test data for the "Créer un profil" flow (POST /api/v1/kine/profiles).
 *
 * The LIBERAL / ADMIN_GROUP forms validate (zod):
 *  - professionalNumber: digits only, length 9 (ADELI) or 11 (RPPS)
 *  - siret: 14 digits, Luhn-valid
 *  - cabinetName / street / postalCode / city: non-empty
 *
 * `73282932000074` is a Luhn-valid SIRET (INSEE reference value).
 */
export interface LiberalProfileData {
  cabinetName: string;
  professionalNumber: string;
  siret: string;
  street: string;
  postalCode: string;
  city: string;
}

export function validLiberalProfile(
  overrides: Partial<LiberalProfileData> = {}
): LiberalProfileData {
  const stamp = Date.now().toString().slice(-6);
  return {
    cabinetName: `Cabinet QA ${stamp}`,
    professionalNumber: '101010101', // 9-digit ADELI
    siret: '73282932000074', // Luhn-valid
    street: '12 Rue de la Santé',
    postalCode: '75013',
    city: 'Paris',
    ...overrides,
  };
}

/** Malformed field-level inputs for negative validation testing. */
export const invalidProfileCases: ReadonlyArray<{
  id: string;
  patch: Partial<LiberalProfileData>;
  field: keyof LiberalProfileData;
  expectedMessage: RegExp;
}> = [
  {
    id: 'empty-cabinet',
    patch: { cabinetName: '' },
    field: 'cabinetName',
    expectedMessage: /obligatoire/i,
  },
  {
    id: 'pro-number-letters',
    patch: { professionalNumber: 'ABC123' },
    field: 'professionalNumber',
    expectedMessage: /uniquement des chiffres/i,
  },
  {
    id: 'pro-number-wrong-length',
    patch: { professionalNumber: '12345' },
    field: 'professionalNumber',
    expectedMessage: /9 chiffres .*11 chiffres/i,
  },
  {
    id: 'siret-too-short',
    patch: { siret: '123' },
    field: 'siret',
    expectedMessage: /14 chiffres/i,
  },
  {
    id: 'siret-bad-luhn',
    patch: { siret: '12345678901234' },
    field: 'siret',
    expectedMessage: /Luhn|valide/i,
  },
];

/** Server-side rejection used to assert UI error handling (HTTP 409). */
export const profileServerErrors = {
  freemiumExists: { status: 409, message: 'Un profil freemium existe déjà' },
} as const;
