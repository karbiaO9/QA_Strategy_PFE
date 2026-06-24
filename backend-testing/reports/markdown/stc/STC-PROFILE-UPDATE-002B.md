# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PROFILE-UPDATE-002B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PROFILE-UPDATE-002/B |
| **USER STORY** | US-E.5 — BE-E5-01 |
| **Acceptance Criteria (sheet)** | HTTP 404 PROFILE_NOT_FOUND |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-E.5; BE-E5-01: • Response status code : HTTP 404 • Body contains : { "statusCode": 404, "error": "...", "code": "PROFILE_NOT_FOUND" } • No side effects in database |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 6, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | MEDIUM | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: PATCH /api/v1/kine/profiles/:profileId. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-E.5 — BE-E5-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-PROFILE-UPDATE-002/B | Patch unknown profile 404

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute PATCH request for STC-PROFILE-UPDATE-002B (STC-PROFILE-UPDATE-002/B \| Patch unknown profile 404) | PATCH https://identity.physio.agregatech.com/api/v1/kine/profiles/65f0000000000000000000ff \| Body: /path/65f0000000000000000000ff \| Headers: Content-Type: application/json | • Response status code : HTTP 404 • Body contains : { "statusCode": 404, "error": "...", "code": "PROFILE_NOT_FOUND" } • No side effects in database Execution sheet: HTTP ∈ {404}. | 400 Bad Request in 66 ms 3 assertion(s) passed. Body keys: message: …; error: Bad Request; statusCode: 400 | HTTP 404 PROFILE_NOT_FOUND | PASS |  |  |

