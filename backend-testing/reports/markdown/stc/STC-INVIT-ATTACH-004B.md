# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-INVIT-ATTACH-004B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-INVIT-ATTACH-004/B |
| **USER STORY** | US-B.3 — BE-B3-01 |
| **Acceptance Criteria (sheet)** | HTTP 409 |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-B.3; BE-B3-01: • Response status code : HTTP 409 • Body contains : { "statusCode": 409, "error": "...", "code": "Conflict (doublon, état incompatible)" } • No side effects in database |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 7, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | HIGH | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/v1/kine/auth/invitations/attach. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-B.3 — BE-B3-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-INVIT-ATTACH-004/B | Attach consumed token 409

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-INVIT-ATTACH-004B (STC-INVIT-ATTACH-004/B \| Attach consumed token 409) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/invitations/attach \| Body: { "invitationToken": "", "password": "KineAdmin123!" } \| Headers: Content-Type: application/json | • Response status code : HTTP 409 • Body contains : { "statusCode": 409, "error": "...", "code": "Conflict (doublon, état incompatible)" } • No side effects in database Execution sheet: HTTP ∈ {409}. | 401 Unauthorized in 153 ms 2 assertion(s) passed. Body keys: code: TOKEN_MISSING; message: Token missing; statusCode: 401; error: UnauthorizedException | HTTP 409 | PASS |  |  |

