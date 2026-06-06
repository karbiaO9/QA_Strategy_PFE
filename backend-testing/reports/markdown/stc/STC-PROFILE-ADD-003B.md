# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PROFILE-ADD-003B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PROFILE-ADD-003/B |
| **USER STORY** |  |
| **Acceptance Criteria (sheet)** | — |
| **TC Type** | — |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate POST https://identity.physio.agregatech.com/api/v1/kine/profiles per test specification. |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | May 14, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority |  | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST https://identity.physio.agregatech.com/api/v1/kine/profiles. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-PROFILE-ADD-003/B | (sheet) — placeholder

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-PROFILE-ADD-003B (STC-PROFILE-ADD-003/B \| (sheet) — placeholder) | POST https://identity.physio.agregatech.com/api/v1/kine/profiles \| Body: { "profileType": "MEMBER", "cabinetId": "6a04a5695097a1ea13a2a996", "subscriptionPlanId": "507f1f77bcf86cd799439011" } \| Headers: Content-Type: application/json; Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTA0YTU2OTUwOTdhMWVhMTNhMmE5OTMiLCJlbWFpbCI6InNvcGhpZS5tYXJ0aW5AY2FiaW5ldC1wYXJpcy5mciIsInR5cGUiOiJraW5lIiwiY2FiaW5ldElkIjpudWxsLCJyb2xlU2x1ZyI6IiIsInYiOjgsImlhdCI… | HTTP 409; response matches acceptance for specified story. | 409 Conflict in 77 ms 2 assertion(s) passed. Body keys: code: PROFILE_ALREADY_EXISTS; message: …; statusCode: 409; error: ConflictException | Per Sprint 1 backend execution specification. | PASS |  |  |

