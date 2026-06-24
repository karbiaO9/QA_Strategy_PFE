# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PWD-CHANGE-002B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PWD-CHANGE-002/B |
| **USER STORY** | X-16 — BE-X16-01 |
| **Acceptance Criteria (sheet)** | Le nouveau mot de passe doit être différent de l'ancien |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate X-16; BE-X16-01: • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'PASSWORD_SAME_AS_OLD' } • Le password in database reste inchangé |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 6, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | MEDIUM | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /auth/change-password. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: X-16 — BE-X16-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-PWD-CHANGE-002/B | Change password same as old 400

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-PWD-CHANGE-002B (STC-PWD-CHANGE-002/B \| Change password same as old 400) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/change-password \| Body: { "newPassword": "KineAdmin123!", "currentPassword": "KineAdmin123!", "newPasswordConfirmation": "KineAdmin123!" } \| Headers: Content-Type: application/json; Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTBlMTc0ZTczNzk3YTYzYTRhYzg0NjEiLCJlbWFpbCI6InNvcGhpZS5tYXJ0aW5AY2FiaW5ldC1wYXJpcy5mciIsInR5cGUiOiJraW5lIiwiY2FiaW5ldElkIjpudWxsLCJyb2xlU2x1ZyI6IiIsInYiOjIwLCJpYXQ… | • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'PASSWORD_SAME_AS_OLD' } • Le password in database reste inchangé Execution sheet: HTTP ∈ {400}. Newman: expect HTTP 400. | 400 Bad Request in 275 ms 3 assertion(s) passed. Body keys: code: PASSWORD_SAME_AS_OLD; message: …; statusCode: 400; error: BadRequestException | Le nouveau mot de passe doit être différent de l'ancien | PASS |  |  |

