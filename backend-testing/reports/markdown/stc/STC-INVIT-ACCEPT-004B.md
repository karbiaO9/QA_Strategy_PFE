# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-INVIT-ACCEPT-004B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-INVIT-ACCEPT-004/B |
| **USER STORY** |  |
| **Acceptance Criteria (sheet)** | — |
| **TC Type** | — |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate POST https://identity.physio.agregatech.com/api/v1/kine/auth/accept-invitation per test specification. |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | May 14, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority |  | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST https://identity.physio.agregatech.com/api/v1/kine/auth/invitations. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-INVIT-ACCEPT-004/B | INVITATION_ACCOUNT_MISMATCH 409 (optional)

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-INVIT-ACCEPT-004B (STC-INVIT-ACCEPT-004/B \| INVITATION_ACCOUNT_MISMATCH 409 (optional)) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/invitations \| Body: { "email": "marie.durand@patient.fr", "firstName": "Pat", "lastName": "IENT", "targetProfileType": "ASSISTANT" } \| Headers: Content-Type: application/json; Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTA0YTU2OTUwOTdhMWVhMTNhMmE5OTMiLCJlbWFpbCI6InNvcGhpZS5tYXJ0aW5AY2FiaW5ldC1wYXJpcy5mciIsInR5cGUiOiJraW5lIiwiY2FiaW5ldElkIjpudWxsLCJyb2xlU2x1ZyI6IiIsInYiOjcsImlhdCI… | HTTP 400; response matches acceptance for specified story. | 400 Bad Request in 72 ms 1 assertion(s) passed. Body keys: code: FIELD_NOT_APPLICABLE; message: …; fields: {…}; statusCode: 400; error: BadRequestException | Per Sprint 1 backend execution specification. | PASS |  |  |
| 2 | Execute POST request for STC-INVIT-ACCEPT-004B (STC-INVIT-ACCEPT-004/B \| Accept (patient-email invite) — expect 409 i…) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/accept-invitation \| Body: { "invitationToken": "{{invitationTokenMismatch}}", "firstName": "DAli", "lastName": "Dali", "password": "QaTest123!", "passwordConfirmation": "QaTest123!", "cguAccepted": true } \| Headers: Content-Type: application/json | HTTP 400; response matches acceptance for specified story. | 400 Bad Request in 72 ms 1 assertion(s) passed. Body keys: code: FIELD_NOT_APPLICABLE; message: …; fields: {…}; statusCode: 400; error: BadRequestException | Per Sprint 1 backend execution specification. | PASS |  |  |

