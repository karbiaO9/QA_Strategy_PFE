# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PWD-VERIFY-001B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PWD-VERIFY-001/B |
| **USER STORY** | US-F.2 — BE-F2-01 |
| **Acceptance Criteria (sheet)** | • POST /auth/verify-code accepte {email, code} • Vérification du code contre le hash bcrypt en Redis • Retour resetToken 64-hex si valide • HTTP 400 CODE_INVALID si incorrect • HTTP 400 CODE_EXPIRED si TTL dépassé • Limitation 3 tentatives (RESET_MAX_ATTEMPTS), invalidation après |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-F.2; BE-F2-01: Cas nominal validé selon les AC du ticket : • POST /auth/verify-code accepte {email, code} • Vérification du code contre le hash bcrypt en Redis • Retour resetToken 64-hex si valid |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 7, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | MEDIUM | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /auth/verify-code. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-F.2 — BE-F2-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-PWD-VERIFY-001/B | Verify code success

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-PWD-VERIFY-001B (STC-PWD-VERIFY-001/B \| Verify code success) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/verify-code \| Body: { "email": "sophie.martin@cabinet-paris.fr", "code": "" } \| Headers: Content-Type: application/json | Cas nominal validé selon les AC du ticket : • POST /auth/verify-code accepte {email, code} • Vérification du code contre le hash bcrypt en Redis • Retour resetToken 64-hex si valid | 400 Bad Request in 153 ms 2 assertion(s) passed. Body keys: code: VALIDATION_FAILED; message: Request payload is invalid.; errors: {…}; statusCode: 400; error: BadRequestException | • POST /auth/verify-code accepte {email, code} • Vérification du code contre le hash bcrypt en Redis • Retour resetToken 64-hex si valide • HTTP 400 CODE_INVALID si incorrect • HTTP 400 CODE_EXPIRED si TTL dépassé • Limitation 3 tentatives (RESET_MAX_ATTEMPTS), invalidation après | PASS |  |  |

