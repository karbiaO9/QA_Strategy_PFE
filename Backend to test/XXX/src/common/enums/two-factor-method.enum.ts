/**
 * Delivery channel for the second authentication factor.
 *
 *  - SMS   → one-time code sent to the user's phone
 *  - EMAIL → one-time code sent to the user's email
 */
export enum TwoFactorMethod {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}
