| STC ID | Collection | Folder | Request name |
|--------|------------|--------|----------------|
| STC-AUTH-ADMIN-001/B | PHYSIO - ADMIN Backend | Auth | STC-AUTH-ADMIN-001/B \| Admin login nominal |
| STC-AUTH-KINE-001/B | PHYSIO - KINE Backend | Auth | STC-AUTH-KINE-001/B \| Kine login nominal |
| STC-AUTH-PAT-001/B | PHYSIO - PATIENT Backend | Auth | STC-AUTH-PAT-001/B \| Patient login nominal |
| STC-INVIT-ACCEPT-007/B | PHYSIO - KINE Backend | Invitations Accept | STC-INVIT-ACCEPT-007/B \| Assistant professional number forbidden 400 |
| STC-INVIT-GEN-001/B | PHYSIO - KINE Backend | Invitations Generate | STC-INVIT-GEN-001/B \| Generate MEMBER invitation |
| STC-PROFILE-ADD-001/B | PHYSIO - KINE Backend | Profiles Add | STC-PROFILE-ADD-001/B \| Add STUDENT profile |
| STC-PROFILE-ADD-002/B | PHYSIO - ADMIN Backend | Profiles Admin Add To Kine | STC-PROFILE-ADD-002/B \| Admin add LIBERAL to kine |
| STC-PROFILE-ADD-010/B | PHYSIO - KINE Backend | Profiles Add | STC-PROFILE-ADD-010/B \| Add LIBERAL profile |
| STC-PROFILE-UPDATE-001/B | PHYSIO - KINE Backend | Profiles Update | STC-PROFILE-UPDATE-001/B \| Patch profile allowed fields |
| STC-PROFILE-UPDATE-002/B | PHYSIO - KINE Backend | Profiles Update | STC-PROFILE-UPDATE-002/B \| Patch unknown profile 404 |
| STC-PWD-CHANGE-002/B | PHYSIO - SHARED Backend | Password Change | STC-PWD-CHANGE-002/B \| Change password same as old 400 |
| STC-PWD-FORGOT-003/B | PHYSIO - SHARED Backend | Password Forgot | STC-PWD-FORGOT-003/B \| Forgot password unknown email 200 |
| STC-PWD-FORGOT-004/B | PHYSIO - SHARED Backend | Password Forgot | STC-PWD-FORGOT-004/B \| Forgot password rate limit 429 |
| STC-REGISTER-ADMIN-003/B | PHYSIO - KINE Backend | Registration | STC-REGISTER-ADMIN-003/B \| Register admin missing RPPS 400 |
| STC-REGISTER-REMP-003/B | PHYSIO - KINE Backend | Registration | STC-REGISTER-REMP-003/B \| Register rempla missing RPPS 400 |
| STC-VERIF-001/B | PHYSIO - ADMIN Backend | Verification Kine | STC-VERIF-001/B \| Verification APPROVE/REJECT/RESET |
| STC-VERIF-006/B | PHYSIO - ADMIN Backend | Verification Kine | STC-VERIF-006/B \| Verification reject validation 400 |
| STC-AUTH-KINE-003/B | PHYSIO - KINE Backend | Auth | STC-AUTH-KINE-003/B \| Kine login wrong password 401 |
| STC-AUTH-PAT-002/B | PHYSIO - PATIENT Backend | Auth | STC-AUTH-PAT-002/B \| Patient login wrong password 401 |
| STC-HEALTHZ-001/B | PHYSIO - SHARED Backend | System Healthcheck | STC-HEALTHZ-001/B \| Liveness healthcheck |
| STC-INVIT-ACCEPT-001/B | PHYSIO - KINE Backend | Invitations Accept | STC-INVIT-ACCEPT-001/B \| Accept invitation create account |
| STC-INVIT-ACCEPT-002/B | PHYSIO - KINE Backend | Invitations Accept | STC-INVIT-ACCEPT-002/B \| Accept invalid token 401 |
| STC-INVIT-ACCEPT-005/B | PHYSIO - KINE Backend | Invitations Accept | STC-INVIT-ACCEPT-005/B \| Accept validation 400 |
| STC-INVIT-ACCEPT-006/B | PHYSIO - KINE Backend | Invitations Accept | STC-INVIT-ACCEPT-006/B \| Accept corrupted JWT 401 |
| STC-INVIT-ASST-001/B | PHYSIO - KINE Backend | Invitations Generate | STC-INVIT-ASST-001/B \| Invite ASSISTANT |
| STC-INVIT-ATTACH-001/B | PHYSIO - KINE Backend | Invitations Attach | STC-INVIT-ATTACH-001/B \| Attach existing user to cabinet |
| STC-INVIT-ATTACH-003/B | PHYSIO - KINE Backend | Invitations Attach | STC-INVIT-ATTACH-003/B \| Attach invalid token 401 |
| STC-INVIT-ATTACH-004/B | PHYSIO - KINE Backend | Invitations Attach | STC-INVIT-ATTACH-004/B \| Attach consumed token 409 |
| STC-INVIT-GEN-002/B | PHYSIO - KINE Backend | Invitations Generate | STC-INVIT-GEN-002/B \| Preview invitation token |
| STC-INVIT-GEN-005/B | PHYSIO - KINE Backend | Invitations Generate | STC-INVIT-GEN-005/B \| Generate invitation forbidden 403 |
| STC-INVIT-GEN-006/B | PHYSIO - KINE Backend | Invitations Generate | STC-INVIT-GEN-006/B \| Preview without auth 401 |
| STC-INVIT-GEN-007/B | PHYSIO - KINE Backend | Invitations Generate | STC-INVIT-GEN-007/B \| Preview conflict 409 |
| STC-PROFILE-ADD-004/B | PHYSIO - KINE Backend | Profiles Add | STC-PROFILE-ADD-004/B \| Add MEMBER conflict 409 |
| STC-PROFILE-ADD-005/B | PHYSIO - ADMIN Backend | Profiles Admin Add To Kine | STC-PROFILE-ADD-005/B \| Admin add profile validation 400 |
| STC-PROFILE-ADD-006/B | PHYSIO - ADMIN Backend | Profiles Admin Add To Kine | STC-PROFILE-ADD-006/B \| Admin add profile kine 404 |
| STC-PROFILE-ADD-007/B | PHYSIO - ADMIN Backend | Profiles Admin Add To Kine | STC-PROFILE-ADD-007/B \| Admin add MEMBER conflict 409 |
| STC-PROFILE-ADD-008/B | PHYSIO - ADMIN Backend | Profiles Admin Add To Kine | STC-PROFILE-ADD-008/B \| Admin add profile wrong token 403 |
| STC-PROFILE-ADD-009/B | PHYSIO - KINE Backend | Profiles Add | STC-PROFILE-ADD-009/B \| Add STUDENT with justificatif |
| STC-PROFILE-SELECT-001/B | PHYSIO - KINE Backend | Profiles Select | STC-PROFILE-SELECT-001/B \| Select profile nominal |
| STC-PROFILE-SELECT-002/B | PHYSIO - KINE Backend | Profiles Select | STC-PROFILE-SELECT-002/B \| Select profile cache warmup |
| STC-PROFILE-SELECT-005/B | PHYSIO - KINE Backend | Profiles Select | STC-PROFILE-SELECT-005/B \| Select invalid profileId 400 |
| STC-PROFILE-SELECT-006/B | PHYSIO - KINE Backend | Profiles Select | STC-PROFILE-SELECT-006/B \| Select inactive profile 403 |
| STC-PROFILE-SELECT-007/B | PHYSIO - KINE Backend | Profiles Select | STC-PROFILE-SELECT-007/B \| Select with inactive kine 403 |
| STC-PROFILE-UPDATE-003/B | PHYSIO - KINE Backend | Profiles Update | STC-PROFILE-UPDATE-003/B \| Patch activate forbidden 400 |
| STC-PROFILE-UPDATE-004/B | PHYSIO - KINE Backend | Profiles Update | STC-PROFILE-UPDATE-004/B \| Patch assistant field N/A 400 |
| STC-PWD-CHANGE-001/B | PHYSIO - SHARED Backend | Password Change | STC-PWD-CHANGE-001/B \| Change password success |
| STC-PWD-FORGOT-001/B | PHYSIO - SHARED Backend | Password Forgot | STC-PWD-FORGOT-001/B \| Forgot password existing email |
| STC-PWD-RESET-001/B | PHYSIO - SHARED Backend | Password Reset | STC-PWD-RESET-001/B \| Reset password with token |
| STC-PWD-VERIFY-001/B | PHYSIO - SHARED Backend | Password Verify Code | STC-PWD-VERIFY-001/B \| Verify code success |
| STC-PWD-VERIFY-003/B | PHYSIO - SHARED Backend | Password Verify Code | STC-PWD-VERIFY-003/B \| Verify code invalid 400 |
| STC-PWD-VERIFY-004/B | PHYSIO - SHARED Backend | Password Verify Code | STC-PWD-VERIFY-004/B \| Verify code expired 400 |
| STC-PWD-VERIFY-005/B | PHYSIO - SHARED Backend | Password Verify Code | STC-PWD-VERIFY-005/B \| Verify code brute force |
| STC-REGISTER-ADMIN-001/B | PHYSIO - KINE Backend | Registration | STC-REGISTER-ADMIN-001/B \| Register ADMIN_GROUP |
| STC-REGISTER-STUD-001/B | PHYSIO - KINE Backend | Registration | STC-REGISTER-STUD-001/B \| Register STUDENT multipart |
| STC-REGISTER-STUD-002/B | PHYSIO - KINE Backend | Registration | STC-REGISTER-STUD-002/B \| Register STUDENT demo patients |
| STC-VERIF-002/B | PHYSIO - ADMIN Backend | Verification Kine | STC-VERIF-002/B \| Verification REJECT with reason |
| STC-VERIF-005/B | PHYSIO - ADMIN Backend | Verification Kine | STC-VERIF-005/B \| Verification wrong actor 403 |