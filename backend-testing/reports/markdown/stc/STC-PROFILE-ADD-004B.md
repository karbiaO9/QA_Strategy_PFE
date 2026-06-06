# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PROFILE-ADD-004B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PROFILE-ADD-004/B |
| **USER STORY** | US-E.2 — BE-E2-01 |
| **Acceptance Criteria (sheet)** | HTTP 409 |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-E.2; BE-E2-01: • Response status code : HTTP 409 • Body contains : { "statusCode": 409, "error": "...", "code": "Conflict (doublon, état incompatible)" } • No side effects in database |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | May 14, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | MEDIUM | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/v1/kine/profiles. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-E.2 — BE-E2-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-PROFILE-ADD-004/B | Add MEMBER conflict 409

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-PROFILE-ADD-004B (STC-PROFILE-ADD-004/B \| Add MEMBER conflict 409) | POST https://identity.physio.agregatech.com/api/v1/kine/profiles \| Body: { "profileType": "MEMBER", "subscriptionPlanId": "507f1f77bcf86cd799439011", "cabinetId": "6a04a5695097a1ea13a2a996" } \| Headers: Content-Type: application/json; Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTA0YTU2OTUwOTdhMWVhMTNhMmE5OTMiLCJlbWFpbCI6InNvcGhpZS5tYXJ0aW5AY2FiaW5ldC1wYXJpcy5mciIsInR5cGUiOiJraW5lIiwiY2FiaW5ldElkIjpudWxsLCJyb2xlU2x1ZyI6IiIsInYiOjgsImlhdCI… | • Response status code : HTTP 409 • Body contains : { "statusCode": 409, "error": "...", "code": "Conflict (doublon, état incompatible)" } • No side effects in database Execution sheet: HTTP ∈ {409}. | 409 Conflict in 78 ms 3 assertion(s) passed. Body keys: code: PROFILE_ALREADY_EXISTS; message: …; statusCode: 409; error: ConflictException | HTTP 409 | PASS |  |  |

