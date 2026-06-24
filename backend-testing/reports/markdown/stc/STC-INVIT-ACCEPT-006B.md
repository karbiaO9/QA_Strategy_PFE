# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-INVIT-ACCEPT-006B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-INVIT-ACCEPT-006/B |
| **USER STORY** | US-B.4 — BE-B4-01 |
| **Acceptance Criteria (sheet)** | HTTP 401 |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-B.4; BE-B4-01: • Response status code : HTTP 401 • Body contains : { "statusCode": 401, "error": "...", "code": "Unauthorized (token invalid / credentials incorrects)" } • No side effects in database |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 6, 2026 |Browser | N/A - API testing with Postman/Newman |
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

### TEST SCRIPT STEPS / RESULTS - STC-INVIT-ACCEPT-006/B | Accept corrupted JWT 401

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-INVIT-ACCEPT-006B (STC-INVIT-ACCEPT-006/B \| Accept corrupted JWT 401) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/accept-invitation \| Body: { "invitationToken": "corrupted.jwt.token", "firstName": "Jean", "lastName": "Dupuis", "password": "KineAdmin123!", "passwordConfirmation": "KineAdmin123!", "cguAccepted": true } \| Headers: Content-Type: application/json | • Response status code : HTTP 401 • Body contains : { "statusCode": 401, "error": "...", "code": "Unauthorized (token invalid / credentials incorrects)" } • No side effects in database Execution sheet: HTTP ∈ {401}. Newman: expect HTTP 401. | 400 Bad Request in 61 ms 1 failed, 1 passed. expected response to have status code 401 but got 400 Body keys: code: FIELD_NOT_APPLICABLE; message: …; fields: {…}; statusCode: 400; error: BadRequestException expected response to have status code 401 but got 400 | HTTP 401 | FAIL | BUG-INVIT-010 | Medium |

