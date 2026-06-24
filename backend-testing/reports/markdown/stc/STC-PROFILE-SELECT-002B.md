# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PROFILE-SELECT-002B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PROFILE-SELECT-002/B |
| **USER STORY** | US-E.1 — BE-E4-01 |
| **Acceptance Criteria (sheet)** | • POST /api/v1/kine/auth/select-profile accepte {profileId} • Vérification ownership : profileId doit appartenir au Compte authentifié (404 PROFILE_NOT_FOUND sinon) • Charge cabinetId, roleId, permissions résolues via CaslAbilityFactory • Stamp lastProfileId + lastLoginAt sur le Compte • HTTP 200 avec {user, profile, permissions, rules} • HTTP 403 PROFILE_INACTIVE si profil désactivé • HTTP 403 KINE_INACTIVE si Compte désactivé • Cache Redis perms:profile:{id} alimenté (rapide sur appels suivants) |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-E.1; BE-E4-01: Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/select-profilee accepte {profileeId} • Vérification ownership : profileeId doit appartenir au Compte authentifié (404 PROFILE_NOT_FOUND sinon) • Charg… |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 6, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | HIGH | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/v1/kine/auth/select-profile. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-E.1 — BE-E4-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-PROFILE-SELECT-002/B | Select profile cache warmup

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-PROFILE-SELECT-002B (STC-PROFILE-SELECT-002/B \| Select profile cache warmup) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/select-profile \| Body: { "profileId": "6a0e174e73797a63a4ac8467" } \| Headers: Content-Type: application/json | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/select-profilee accepte {profileeId} • Vérification ownership : profileeId doit appartenir au Compte authentifié (404 PROFILE_NOT_FOUND sinon) • Charge cabinetId, roleId, permissions résolues... Newman: expect HTTP 200. | 200 OK in 76 ms 2 assertion(s) passed. Body keys: user: {…}; profile: {…}; lastProfileId: 6a0e174e73797a63a4ac8467; permissions: {…} | • POST /api/v1/kine/auth/select-profile accepte {profileId} • Vérification ownership : profileId doit appartenir au Compte authentifié (404 PROFILE_NOT_FOUND sinon) • Charge cabinetId, roleId, permissions résolues via CaslAbilityFactory • Stamp lastProfileId + lastLoginAt sur le Compte • HTTP 200 avec {user, profile,… | PASS |  |  |

