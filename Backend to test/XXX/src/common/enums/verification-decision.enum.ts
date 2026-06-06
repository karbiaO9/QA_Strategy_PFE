/**
 * Decision an admin can take on a kine verification request.
 *
 *  - APPROVE → verificationStatus becomes VERIFIED
 *  - REJECT  → verificationStatus becomes REJECTED (rejection reason required)
 *  - RESET   → verificationStatus is reset to PENDING
 */
export enum VerificationDecision {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  RESET = 'RESET',
}
