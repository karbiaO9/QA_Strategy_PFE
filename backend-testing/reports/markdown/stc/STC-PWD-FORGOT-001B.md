# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PWD-FORGOT-001B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PWD-FORGOT-001/B |
| **USER STORY** | US-F.1 — BE-F1-01 |
| **Acceptance Criteria (sheet)** | • POST /auth/forgot-password accepte {email} • Génération code 6 chiffres • Hash bcrypt du code stocké en Redis avec TTL 10 min (RESET_CODE_TTL_SECONDS=600) • Email envoyé via MailerService (driver log Sprint 1, SMTP Sprint 2) • HTTP 200 message générique (même si email inexistant) • Rate limit 5/email/heure (RATE_LIMIT_FORGOT_MAX) |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-F.1; BE-F1-01: Cas nominal validé selon les AC du ticket : • POST /auth/forgot-password accepte {email} • Génération code 6 chiffres • Hash bcrypt du code stocké en Redis with TTL 10 min (RESET_CODE_TTL_SECONDS=600) • Email envoyé via… |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 6, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | MEDIUM | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /auth/forgot-password. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-F.1 — BE-F1-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-PWD-FORGOT-001/B | Forgot password existing email

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-PWD-FORGOT-001B (STC-PWD-FORGOT-001/B \| Forgot password existing email) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/forgot-password \| Body: { "email": "sophie.martin@cabinet-paris.fr" } \| Headers: Content-Type: application/json | Cas nominal validé selon les AC du ticket : • POST /auth/forgot-password accepte {email} • Génération code 6 chiffres • Hash bcrypt du code stocké en Redis with TTL 10 min (RESET_CODE_TTL_SECONDS=600) • Email envoyé via MailerService (driver log Sprint 1, SMTP... Newman: expect HTTP 200. | 200 OK in 657 ms 2 assertion(s) passed. Body keys: success: true; message: … | • POST /auth/forgot-password accepte {email} • Génération code 6 chiffres • Hash bcrypt du code stocké en Redis avec TTL 10 min (RESET_CODE_TTL_SECONDS=600) • Email envoyé via MailerService (driver log Sprint 1, SMTP Sprint 2) • HTTP 200 message générique (même si email inexistant) • Rate limit 5/email/heure (RATE_LIM… | PASS |  |  |

