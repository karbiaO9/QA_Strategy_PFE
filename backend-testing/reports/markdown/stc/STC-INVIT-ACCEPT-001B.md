# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-INVIT-ACCEPT-001B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-INVIT-ACCEPT-001/B |
| **USER STORY** | US-B.4 — BE-B4-01 |
| **Acceptance Criteria (sheet)** | • POST /api/v1/kine/auth/accept-invitation accepte {invitationToken, firstName, lastName, password, passwordConfirmation, cguAccepted, professionalNumber?} • Vérification token JWT (signature, jti single-use Redis, TTL) • Création atomique Compte + profil MEMBER ou ASSISTANT selon targetProfileType • MEMBER : professionalNumber requis → verificationStatus=PENDING • ASSISTANT : pas de numéro professionnel exigé • jti marqué consommé en Redis (anti-replay) • HTTP 201 {success, message, email} — pas de tokens émis • HTTP 401 si token expiré, HTTP 409 INVITATION_ALREADY_USED si jti consommé • HTT… |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-B.4; BE-B4-01: Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/accept-invitation accepte {invitationToken, firstName, lastName, password, passwordConfirmation, cguAccepted, professionalNumber?} • Vérification toke… |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | May 14, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | HIGH | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/v1/kine/auth/accept-invitation. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-B.4 — BE-B4-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-INVIT-ACCEPT-001/B | Accept ASSISTANT invitation (nominal)

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-INVIT-ACCEPT-001B (STC-INVIT-ACCEPT-001/B \| Accept ASSISTANT invitation (nominal)) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/accept-invitation \| Body: { "invitationToken": "", "firstName": "Jean", "lastName": "Nouveau", "password": "QaTest123!", "passwordConfirmation": "QaTest123!", "cguAccepted": true } \| Headers: Content-Type: application/json | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/accept-invitation accepte {invitationToken, firstName, lastName, password, passwordConfirmation, cguAccepted, professionalNumber?} • Vérification token JWT (signature, jti single-use Redis, T... Newman: expect HTTP 201. | 400 Bad Request in 61 ms 1 failed, 0 passed. expected response to have status code 201 but got 400 Body keys: code: FIELD_NOT_APPLICABLE; message: …; fields: {…}; statusCode: 400; error: BadRequestException expected response to have status code 201 but got 400 | • POST /api/v1/kine/auth/accept-invitation accepte {invitationToken, firstName, lastName, password, passwordConfirmation, cguAccepted, professionalNumber?} • Vérification token JWT (signature, jti single-use Redis, TTL) • Création atomique Compte + profil MEMBER ou ASSISTANT selon targetProfileType • MEMBER : professi… | FAIL | BUG-INVIT-010 | Medium |

