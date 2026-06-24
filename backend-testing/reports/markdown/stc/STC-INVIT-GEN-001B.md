# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-INVIT-GEN-001B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-INVIT-GEN-001/B |
| **USER STORY** | US-B.1 — BE-B1-01 |
| **Acceptance Criteria (sheet)** | • POST /api/v1/kine/auth/invitations accepte {email, role, cabinetId} dans le payload • Token JWT généré avec jti unique (anti-replay) • TTL JWT_INVITATION_TTL configurable (défaut 7 jours) • jti stocké en Redis pour single-use • Email envoyé via MailerService avec invitationUrl • HTTP 201 avec invitationUrl + emailDelivered • HTTP 403 si l'utilisateur n'a pas le rôle KINE_ADMIN |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-B.1; BE-B1-01: Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/invitations accepte {email, role, cabinetId} dans le payload • Token JWT généré with jti unique (anti-replay) • TTL JWT_INVITATION_TTL configurable (d… |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 6, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | HIGH | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/v1/kine/auth/invitations. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-B.1 — BE-B1-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-INVIT-GEN-001/B | Generate MEMBER invitation

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-INVIT-GEN-001B (STC-INVIT-GEN-001/B \| Generate MEMBER invitation) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/invitations \| Body: { "email": "jean.nouveau.member@testmail.fr", "cabinetId": "6a0e174e73797a63a4ac8464", "targetProfileType": "MEMBER" } \| Headers: Content-Type: application/json | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/invitations accepte {email, role, cabinetId} dans le payload • Token JWT généré with jti unique (anti-replay) • TTL JWT_INVITATION_TTL configurable (défaut 7 jours) • jti stocké en Redis for ... Newman: expect HTTP 200. | 400 Bad Request in 67 ms 1 failed, 1 passed. expected [ 200, 201 ] to include 400 Body keys: code: PROFILE_HEADER_MISSING; message: …; statusCode: 400; error: BadRequestException expected [ 200, 201 ] to include 400 | • POST /api/v1/kine/auth/invitations accepte {email, role, cabinetId} dans le payload • Token JWT généré avec jti unique (anti-replay) • TTL JWT_INVITATION_TTL configurable (défaut 7 jours) • jti stocké en Redis pour single-use • Email envoyé via MailerService avec invitationUrl • HTTP 201 avec invitationUrl + emailDe… | FAIL | BUG-INVIT-001 | Medium |

