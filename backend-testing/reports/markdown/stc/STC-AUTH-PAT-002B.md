# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-AUTH-PAT-002B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-AUTH-PAT-002/B |
| **USER STORY** | US-C.2 — BE-C2-01 |
| **Acceptance Criteria (sheet)** | HTTP 401 |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-C.2; BE-C2-01: • Response status code : HTTP 401 • Body contains : { "statusCode": 401, "error": "...", "code": "Unauthorized (token invalid / credentials incorrects)" } • No side effects in database |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 6, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | HIGH | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/v1/patient/auth/login. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-C.2 — BE-C2-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-AUTH-PAT-002/B | Patient login wrong password 401

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-AUTH-PAT-002B (STC-AUTH-PAT-002/B \| Patient login wrong password 401) | POST https://identity.physio.agregatech.com/api/v1/patient/auth/login \| Body: { "email": "marie.durand@patient.fr", "password": "WrongP@ssword1!" } \| Headers: Content-Type: application/json | • Response status code : HTTP 401 • Body contains : { "statusCode": 401, "error": "...", "code": "Unauthorized (token invalid / credentials incorrects)" } • No side effects in database Execution sheet: HTTP ∈ {401}. Newman: expect HTTP 401. | 401 Unauthorized in 276 ms 2 assertion(s) passed. Body keys: code: INVALID_CREDENTIALS; message: Invalid credentials.; statusCode: 401; error: UnauthorizedException | HTTP 401 | PASS |  |  |

