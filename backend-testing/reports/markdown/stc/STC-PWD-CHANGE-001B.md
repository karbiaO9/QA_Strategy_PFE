# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PWD-CHANGE-001B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PWD-CHANGE-001/B |
| **USER STORY** | X-16 — BE-X16-01 |
| **Acceptance Criteria (sheet)** | • POST /auth/change-password : ancien + nouveau mot de passe • Application robustesse mot de passe • Rotation refresh token + invalidation cache CASL • PATCH /me : whitelist stricte (nom, téléphone, etc.) • Champs sensibles refusés (email, roleId, professionalNumber) |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate X-16; BE-X16-01: Cas nominal validé selon les AC du ticket : • POST /auth/change-password : ancien + nouveau password • Application robustesse password • PATCH /me : whitelist stricte (nom, téléphone, etc.) |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 7, 2026 |Browser | N/A - API testing with Postman/Newman |
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

### TEST SCRIPT STEPS / RESULTS - STC-PWD-CHANGE-001/B | Change password success

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-PWD-CHANGE-001B (STC-PWD-CHANGE-001/B \| Change password success) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/change-password \| Body: { "currentPassword": "KineAdmin123!", "newPassword": "KineAdmin123!", "newPasswordConfirmation": "KineAdmin123!" } \| Headers: Content-Type: application/json; Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTBlMTc0ZTczNzk3YTYzYTRhYzg0NjEiLCJlbWFpbCI6InNvcGhpZS5tYXJ0aW5AY2FiaW5ldC1wYXJpcy5mciIsInR5cGUiOiJraW5lIiwiY2FiaW5ldElkIjpudWxsLCJyb2xlU2x1ZyI6IiIsInYiOjMxLCJpYXQ… | Cas nominal validé selon les AC du ticket : • POST /auth/change-password : ancien + nouveau password • Application robustesse password • PATCH /me : whitelist stricte (nom, téléphone, etc.) Newman: expect HTTP 200. | 401 Unauthorized in 153 ms 1 failed, 1 passed. expected response to have status code 200 but got 401 Body keys: code: TOKEN_INVALID; message: Token superseded by a newer session.; statusCode: 401; error: UnauthorizedException expected response to have status code 200 but got 401 | • POST /auth/change-password : ancien + nouveau mot de passe • Application robustesse mot de passe • Rotation refresh token + invalidation cache CASL • PATCH /me : whitelist stricte (nom, téléphone, etc.) • Champs sensibles refusés (email, roleId, professionalNumber) | FAIL | BUG-PWD-004 | Medium |

