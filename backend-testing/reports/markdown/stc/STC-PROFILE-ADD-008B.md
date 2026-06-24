# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PROFILE-ADD-008B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PROFILE-ADD-008/B |
| **USER STORY** | US-E.2 — BE-E2-02 |
| **Acceptance Criteria (sheet)** | HTTP 403 |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-E.2; BE-E2-02: • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "Forbidden (permission refusée)" } • No side effects in database |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 6, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | MEDIUM | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/admin/v1/kines/:id/profiles. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-E.2 — BE-E2-02. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-PROFILE-ADD-008/B | Admin add profile wrong token 403

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-PROFILE-ADD-008B (STC-PROFILE-ADD-008/B \| Admin add profile wrong token 403) | POST https://identity.physio.agregatech.com/api/admin/v1/kines/6a0e174e73797a63a4ac8461/profiles \| Body: { "profileType": "MEMBER", "subscriptionPlanId": "507f1f77bcf86cd799439011" } \| Headers: Content-Type: application/json; Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTBlMTc0ZTczNzk3YTYzYTRhYzg0NjEiLCJlbWFpbCI6InNvcGhpZS5tYXJ0aW5AY2FiaW5ldC1wYXJpcy5mciIsInR5cGUiOiJraW5lIiwiY2FiaW5ldElkIjpudWxsLCJyb2xlU2x1ZyI6IiIsInYiOjE5LCJpYXQ… | • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "Forbidden (permission refusée)" } • No side effects in database Execution sheet: HTTP ∈ {403}. | 403 Forbidden in 81 ms 2 assertion(s) passed. Body keys: code: WRONG_AUDIENCE; message: …; statusCode: 403; error: ForbiddenException | HTTP 403 | PASS |  |  |

