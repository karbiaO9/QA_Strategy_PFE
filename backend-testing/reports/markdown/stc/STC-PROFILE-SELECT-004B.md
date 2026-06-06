# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PROFILE-SELECT-004B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PROFILE-SELECT-004/B |
| **USER STORY** |  |
| **Acceptance Criteria (sheet)** | — |
| **TC Type** | — |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate POST https://identity.physio.agregatech.com/api/v1/kine/auth/select-profile per test specification. |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | May 14, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority |  | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST https://identity.physio.agregatech.com/api/v1/kine/auth/select-profile. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-PROFILE-SELECT-004/B | Select without Bearer 401

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-PROFILE-SELECT-004B (STC-PROFILE-SELECT-004/B \| Select without Bearer 401) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/select-profile \| Body: { "profileId": "6a04a5695097a1ea13a2a999" } \| Headers: Content-Type: application/json | Newman: expect HTTP 401. | 401 Unauthorized in 71 ms 1 assertion(s) passed. Body keys: code: TOKEN_MISSING; message: Token missing; statusCode: 401; error: UnauthorizedException | Per Sprint 1 backend execution specification. | PASS |  |  |

