# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-VERIF-005B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-VERIF-005/B |
| **USER STORY** | US-I.1 — BE-I1-01 |
| **Acceptance Criteria (sheet)** | HTTP 403 |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-I.1; BE-I1-01: • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "Forbidden (permission refusée)" } • No side effects in database |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | May 14, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | MEDIUM | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: PATCH /api/admin/v1/kines/:id/verification. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-I.1 — BE-I1-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-VERIF-005/B | Verification wrong actor 403

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute PATCH request for STC-VERIF-005B (STC-VERIF-005/B \| Verification wrong actor 403) | PATCH https://identity.physio.agregatech.com/api/admin/v1/kines/6a04a5695097a1ea13a2a993/verification \| Body: { "decision": "APPROVE" } \| Headers: Content-Type: application/json; Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTA0YTU2OTUwOTdhMWVhMTNhMmE5OTMiLCJlbWFpbCI6InNvcGhpZS5tYXJ0aW5AY2FiaW5ldC1wYXJpcy5mciIsInR5cGUiOiJraW5lIiwiY2FiaW5ldElkIjpudWxsLCJyb2xlU2x1ZyI6IiIsInYiOjYsImlhdCI… | • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "Forbidden (permission refusée)" } • No side effects in database Execution sheet: HTTP ∈ {403}. | 403 Forbidden in 74 ms 2 assertion(s) passed. Body keys: code: WRONG_AUDIENCE; message: …; statusCode: 403; error: ForbiddenException | HTTP 403 | PASS |  |  |

