# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PWD-VERIFY-003B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PWD-VERIFY-003/B |
| **USER STORY** | US-F.2 — BE-F2-01 |
| **Acceptance Criteria (sheet)** | HTTP 400 CODE_INVALID |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-F.2; BE-F2-01: • Response status code : HTTP 400 • Body contains : { "statusCode": 400, "error": "...", "code": "CODE_INVALID" } • No side effects in database |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 6, 2026 |Browser | N/A - API testing with Postman/Newman |
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

### TEST SCRIPT STEPS / RESULTS - STC-PWD-VERIFY-003/B | Verify code invalid 400

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-PWD-VERIFY-003B (STC-PWD-VERIFY-003/B \| Verify code invalid 400) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/verify-code \| Body: { "email": "sophie.martin@cabinet-paris.fr", "code": "999999" } \| Headers: Content-Type: application/json | • Response status code : HTTP 400 • Body contains : { "statusCode": 400, "error": "...", "code": "CODE_INVALID" } • No side effects in database Execution sheet: HTTP ∈ {400}. Newman: expect HTTP 400. | 400 Bad Request in 142 ms 3 assertion(s) passed. Body keys: code: CODE_INVALID; message: Invalid code.; statusCode: 400; error: BadRequestException | HTTP 400 CODE_INVALID | PASS |  |  |

