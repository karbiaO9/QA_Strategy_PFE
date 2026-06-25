# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PROFILE-SELECT-006B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PROFILE-SELECT-006/B |
| **USER STORY** | US-E.1 — BE-E4-01 |
| **Acceptance Criteria (sheet)** | HTTP 403 PROFILE_INACTIVE |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-E.1; BE-E4-01: • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "PROFILE_INACTIVE" } • No side effects in database |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 7, 2026 |Browser | N/A - API testing with Postman/Newman |
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

### TEST SCRIPT STEPS / RESULTS - STC-PROFILE-SELECT-006/B | Select inactive profile 403

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-PROFILE-SELECT-006B (STC-PROFILE-SELECT-006/B \| Select inactive profile 403) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/select-profile \| Body: { "profileId": "" } \| Headers: Content-Type: application/json | • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "PROFILE_INACTIVE" } • No side effects in database Execution sheet: HTTP ∈ {403}. | 400 Bad Request in 154 ms 1 failed, 2 passed. expected 'VALIDATION_FAILED' to deeply equal 'PROFILE_INACTIVE' Body keys: code: VALIDATION_FAILED; message: Request payload is invalid.; errors: {…}; statusCode: 400; error: BadRequestException expected 'VALIDATION_FAILED' to deeply equal 'PROFILE_INACTIVE' | HTTP 403 PROFILE_INACTIVE | FAIL | BUG-PROFILE-003 | Medium |

