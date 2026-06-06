# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PROFILE-UPDATE-004B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PROFILE-UPDATE-004/B |
| **USER STORY** | US-E.5 — BE-E5-01 |
| **Acceptance Criteria (sheet)** | HTTP 400 FIELD_NOT_APPLICABLE |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-E.5; BE-E5-01: • Response status code : HTTP 400 • Body contains : { "statusCode": 400, "error": "...", "code": "FIELD_NOT_APPLICABLE" } • No side effects in database |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | May 14, 2026 |Browser | N/A - API testing with Postman/Newman |
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

### TEST SCRIPT STEPS / RESULTS - STC-PROFILE-UPDATE-004/B | Patch assistant field N/A 400

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute PATCH request for STC-PROFILE-UPDATE-004B (STC-PROFILE-UPDATE-004/B \| Patch assistant field N/A 400) | PATCH https://identity.physio.agregatech.com/api/v1/kine/profiles/6a04a5695097a1ea13a2a999 \| Body: { "professionalNumber": "123456789" } \| Headers: Content-Type: application/json; Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTA0YTU2OTUwOTdhMWVhMTNhMmE5OTMiLCJlbWFpbCI6InNvcGhpZS5tYXJ0aW5AY2FiaW5ldC1wYXJpcy5mciIsInR5cGUiOiJraW5lIiwiY2FiaW5ldElkIjpudWxsLCJyb2xlU2x1ZyI6IiIsInYiOjgsImlhdCI… | • Response status code : HTTP 400 • Body contains : { "statusCode": 400, "error": "...", "code": "FIELD_NOT_APPLICABLE" } • No side effects in database Execution sheet: HTTP ∈ {400}. | 400 Bad Request in 73 ms 3 assertion(s) passed. Body keys: code: FIELD_NOT_APPLICABLE; message: …; fields: {…}; statusCode: 400; error: BadRequestException | HTTP 400 FIELD_NOT_APPLICABLE | PASS |  |  |

