# PHYSIO backend Postman — execution-ready packs

Generated from **Backend Execution Ready** (57 STCs). Regenerate: `npm run postman:physio-backend`

## Collection structure

| Collection | Folders | Requests |
|------------|---------|----------|
| **PHYSIO - KINE Backend** | Auth, Registration, Invitations Generate, Invitations Attach, Invitations Accept, Profiles Select, Profiles Add, Profiles Update | 34 |
| **PHYSIO - ADMIN Backend** | Auth, Profiles Admin Add To Kine, Verification Kine | 10 |
| **PHYSIO - PATIENT Backend** | Auth | 2 |
| **PHYSIO - SHARED Backend** | Password Forgot, Password Verify Code, Password Reset, Password Change, System Healthcheck | 11 |

**Classification rule:** `/api/admin/v1/*` → ADMIN; `/api/v1/patient/*` → PATIENT; `/auth/*` and `/healthz` → SHARED; else KINE.

## Environment (`PHYSIO-Backend-Execution.postman_environment.json`)

| Variable | Role |
|----------|------|
| baseUrl | API root (e.g. https://identity.example.com) |
| adminEmail, adminPassword | Admin login |
| kineEmail, kinePassword | Kine login / register seeds |
| patientEmail, patientPassword | Patient login |
| adminToken, kineToken, patientToken | Bearer tokens (tests set on login) |
| kineTokenInactive | STC-PROFILE-SELECT-007 |
| refreshToken | Set from login responses |
| kineId, cabinetId, profileId | Path/body placeholders |
| profileIdInactive, profileIdAssistant | Negative / role-specific STCs |
| invitationToken, invitationTokenConsumed | Invitation flows |
| resetToken, verificationCode, verificationCodeExpired | Password chain |
| testEmailExisting, testEmailNew | Forgot-password / conflict STCs |
| testProfessionalNumberExisting, testProfessionalNumberNew | Profile / RPPS STCs |
| subscriptionPlanId | Admin/kine profile add |

## Chaining (manual / Collection Runner order)

1. **KINE:** Auth → set `kineToken`. Invitations Generate / ASST → set `invitationToken` before Accept / Preview / Attach.
2. **ADMIN:** Auth → set `adminToken`. Verification/Profiles need `kineId` for path.
3. **SHARED:** Forgot-password → set `verificationCode` (manual or mail capture) → Verify-code → `resetToken` → Reset-password. Change-password needs Bearer (`kineToken` or role token).

## STC ↔ request mapping

See **STC_MAPPING.md** (full table).

## Notes

- Folder-level Bearer auth applies on KINE/ADMIN folders except public flows (Auth, Registration, Invitations Accept/Attach). Requests that must omit auth use **noauth** (e.g. preview 401).
- **STC-VERIF-001** body uses first variant (action APPROVE) when sheet lists `ou` alternatives; duplicate the request in Postman for REJECT/RESET if needed.
- **STC-PROFILE-UPDATE-001** same pattern for alternate PATCH bodies.
- Truncated Excel cells **STC-INVIT-ACCEPT-007**, **STC-REGISTER-ADMIN-003** use generator fallbacks documented in `scripts/build-physio-postman-from-excel.js` (`SPECIAL_JSON_BODY`).
