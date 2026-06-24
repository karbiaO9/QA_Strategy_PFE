# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PROFILE-SELECT-005B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PROFILE-SELECT-005/B |
| **USER STORY** | US-E.1 — BE-E1-01 |
| **Acceptance Criteria (sheet)** | ProfileGuard valide que X-Profile-Id est un ObjectId Mongo |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-E.1; BE-E1-01: • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'PROFILE_ID_INVALID' } |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 6, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | HIGH | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/v1/kine/auth/select-profile. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-E.1 — BE-E1-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-PROFILE-SELECT-005/B | Select invalid profileId 400

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-PROFILE-SELECT-005B (STC-PROFILE-SELECT-005/B \| Select invalid profileId 400) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/select-profile \| Body: { "profileId": "abc123" } \| Headers: Content-Type: application/json | • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'PROFILE_ID_INVALID' } Execution sheet: HTTP ∈ {400}. Newman: expect HTTP 400. | 400 Bad Request in 67 ms 1 failed, 2 passed. expected 'VALIDATION_FAILED' to deeply equal 'PROFILE_ID_INVALID' Body keys: code: VALIDATION_FAILED; message: Request payload is invalid.; errors: {…}; statusCode: 400; error: BadRequestException expected 'VALIDATION_FAILED' to deeply equal 'PROFILE_ID_INVALID' | ProfileGuard valide que X-Profile-Id est un ObjectId Mongo | FAIL | BUG-PROFILE-002 | Medium |

