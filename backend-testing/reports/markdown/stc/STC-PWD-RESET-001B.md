# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PWD-RESET-001B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PWD-RESET-001/B |
| **USER STORY** | US-F.3 — BE-F3-01 |
| **Acceptance Criteria (sheet)** | • POST /auth/reset-password accepte {resetToken, newPassword} • Validation robustesse mot de passe • Hash bcrypt cost 12+ • Invalidation refresh tokens existants • Invalidation cache CASL • resetToken consommé une seule fois (one-shot) • HTTP 200 succès + nouvelle paire de tokens |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-F.3; BE-F3-01: Cas nominal validé selon les AC du ticket : • POST /auth/reset-password accepte {resetToken, newPassword} • Validation robustesse password • Hash bcrypt cost 12+ • Invalidation refresh tokens existants • Invalidation ca… |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 7, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | HIGH | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /auth/reset-password. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-F.3 — BE-F3-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-PWD-RESET-001/B | Reset password with token

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-PWD-RESET-001B (STC-PWD-RESET-001/B \| Reset password with token) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/reset-password \| Body: { "resetToken": "", "newPassword": "NewP@ssw0rd2025!", "passwordConfirmation": "NewP@ssw0rd2025!" } \| Headers: Content-Type: application/json | Cas nominal validé selon les AC du ticket : • POST /auth/reset-password accepte {resetToken, newPassword} • Validation robustesse password • Hash bcrypt cost 12+ • Invalidation refresh tokens existants • Invalidation cache CASL | 400 Bad Request in 153 ms 2 assertion(s) passed. Body keys: code: FIELD_NOT_APPLICABLE; message: …; fields: {…}; statusCode: 400; error: BadRequestException | • POST /auth/reset-password accepte {resetToken, newPassword} • Validation robustesse mot de passe • Hash bcrypt cost 12+ • Invalidation refresh tokens existants • Invalidation cache CASL • resetToken consommé une seule fois (one-shot) • HTTP 200 succès + nouvelle paire de tokens | PASS |  |  |

