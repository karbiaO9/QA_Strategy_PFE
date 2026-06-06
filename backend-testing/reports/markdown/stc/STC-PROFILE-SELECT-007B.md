# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PROFILE-SELECT-007B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PROFILE-SELECT-007/B |
| **USER STORY** | US-E.1 — BE-E4-01 |
| **Acceptance Criteria (sheet)** | HTTP 403 KINE_INACTIVE |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-E.1; BE-E4-01: • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "KINE_INACTIVE" } • No side effects in database |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | May 14, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | HIGH | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/v1/kine/auth/select-profile. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-E.1 — BE-E4-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-PROFILE-SELECT-007/B | Select with inactive kine 403

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-PROFILE-SELECT-007B (STC-PROFILE-SELECT-007/B \| Select with inactive kine 403) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/select-profile \| Body: { "profileId": "6a04a5695097a1ea13a2a999" } \| Headers: Content-Type: application/json; Authorization: Bearer | • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "KINE_INACTIVE" } • No side effects in database Execution sheet: HTTP ∈ {403}. | 401 Unauthorized in 81 ms 1 failed, 2 passed. expected [ 403, 200 ] to include 401 Body keys: code: TOKEN_MISSING; message: Token missing; statusCode: 401; error: UnauthorizedException expected [ 403, 200 ] to include 401 | HTTP 403 KINE_INACTIVE | FAIL | BUG-PROFILE-004 | Medium |

