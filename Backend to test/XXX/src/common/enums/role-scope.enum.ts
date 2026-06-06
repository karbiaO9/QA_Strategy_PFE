/**
 * Informational scope label on a Role document.
 *
 * Currently used as a UI/UX hint only — there is no security logic that
 * branches on this value. Kept as an enum so the set stays closed and Mongoose
 * / class-validator pull from a single source.
 */
export enum RoleScope {
  PLATFORM = 'PLATFORM',
  CABINET = 'CABINET',
}
