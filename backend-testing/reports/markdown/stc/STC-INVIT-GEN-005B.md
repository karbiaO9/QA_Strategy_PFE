# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-INVIT-GEN-005B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-INVIT-GEN-005/B |
| **USER STORY** | US-B.1 — BE-B1-01 |
| **Acceptance Criteria (sheet)** | HTTP 403 |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-B.1; BE-B1-01: • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "Forbidden (permission refusée)" } • No side effects in database |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 7, 2026 |Browser | N/A - API testing with Postman/Newman |
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

### TEST SCRIPT STEPS / RESULTS - STC-INVIT-GEN-005/B | Generate invitation forbidden 403

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-INVIT-GEN-005B (STC-INVIT-GEN-005/B \| Generate invitation forbidden 403) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/invitations \| Body: { "email": "jean.nouveau.member@testmail.fr", "targetProfileType": "MEMBER" } \| Headers: Content-Type: application/json | • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "Forbidden (permission refusée)" } • No side effects in database Execution sheet: HTTP ∈ {403}. | 400 Bad Request in 154 ms 1 failed, 1 passed. expected [ 403, 201 ] to include 400 Body keys: code: PROFILE_HEADER_MISSING; message: …; statusCode: 400; error: BadRequestException expected [ 403, 201 ] to include 400 | HTTP 403 | FAIL | BUG-INVIT-004 | Medium |

