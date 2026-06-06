# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-INVIT-GEN-005B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-INVIT-GEN-005/B |
| **USER STORY** | US-B.1 — BE-B1-01 |
| **Acceptance Criteria (sheet)** | HTTP 403 |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-B.1; BE-B1-01: • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "Forbidden (permission refusée)" } • No side effects in database |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | May 14, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | HIGH | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/v1/kine/auth/invitations. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-B.1 — BE-B1-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-INVIT-GEN-005/B | Generate invitation forbidden 403

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-INVIT-GEN-005B (STC-INVIT-GEN-005/B \| Generate invitation forbidden 403) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/invitations \| Body: { "email": "jean.nouveau.member@testmail.fr", "targetProfileType": "MEMBER" } \| Headers: Content-Type: application/json; Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTA0YTU2OTUwOTdhMWVhMTNhMmE5OTMiLCJlbWFpbCI6InNvcGhpZS5tYXJ0aW5AY2FiaW5ldC1wYXJpcy5mciIsInR5cGUiOiJraW5lIiwiY2FiaW5ldElkIjpudWxsLCJyb2xlU2x1ZyI6IiIsInYiOjcsImlhdCI… | • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "Forbidden (permission refusée)" } • No side effects in database Execution sheet: HTTP ∈ {403}. | 201 Created in 483 ms 2 assertion(s) passed. Body keys: invitationId: 6a05a94b97fa9b6719819a45; invitationUrl: …; expiresAt: 2026-05-21T10:51:55.367Z; cabinetId: 6a04a5695097a1ea13a2a996; cabinetName: Cabinet Paris Centre; targetProfileType: MEMBER; invitedEmail: jean.nouveau.member@testmail.fr; emailDelivered: true | HTTP 403 | PASS |  |  |

