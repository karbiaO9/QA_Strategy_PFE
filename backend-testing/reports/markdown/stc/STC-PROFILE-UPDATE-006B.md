# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PROFILE-UPDATE-006B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PROFILE-UPDATE-006/B |
| **USER STORY** |  |
| **Acceptance Criteria (sheet)** | — |
| **TC Type** | — |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate PATCH https://identity.physio.agregatech.com/api/v1/kine/profiles/6a04a5695097a1ea13a2a999 per test specification. |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | May 14, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority |  | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: PATCH https://identity.physio.agregatech.com/api/v1/kine/profiles/6a04a5695097a1ea13a2a999. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-PROFILE-UPDATE-006/B | Patch student field on non-student 400

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute PATCH request for STC-PROFILE-UPDATE-006B (STC-PROFILE-UPDATE-006/B \| Patch student field on non-student 400) | PATCH https://identity.physio.agregatech.com/api/v1/kine/profiles/6a04a5695097a1ea13a2a999 \| Body: { "schoolIfmk": "IFMK Paris", "academicYear": "2025-2026" } \| Headers: Content-Type: application/json; Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTA0YTU2OTUwOTdhMWVhMTNhMmE5OTMiLCJlbWFpbCI6InNvcGhpZS5tYXJ0aW5AY2FiaW5ldC1wYXJpcy5mciIsInR5cGUiOiJraW5lIiwiY2FiaW5ldElkIjpudWxsLCJyb2xlU2x1ZyI6IiIsInYiOjgsImlhdCI… | HTTP 400; response matches acceptance for specified story. | 400 Bad Request in 80 ms 1 assertion(s) passed. Body keys: code: FIELD_NOT_APPLICABLE; message: …; fields: {…}; statusCode: 400; error: BadRequestException | Per Sprint 1 backend execution specification. | PASS |  |  |

