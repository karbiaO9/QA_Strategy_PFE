# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-INVIT-ACCEPT-003B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-INVIT-ACCEPT-003/B |
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
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST https://identity.physio.agregatech.com/api/v1/kine/auth/accept-invitation. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-INVIT-ACCEPT-003/B | Replay accept — INVITATION_ALREADY_USED 409

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-INVIT-ACCEPT-003B (STC-INVIT-ACCEPT-003/B \| Replay accept — INVITATION_ALREADY_USED 409) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/accept-invitation \| Body: { "invitationToken": "", "firstName": "Jean", "lastName": "Nouveau", "password": "QaTest123!", "passwordConfirmation": "QaTest123!", "cguAccepted": true } \| Headers: Content-Type: application/json | Newman: expect HTTP 409. | 400 Bad Request in 77 ms 2 failed, 0 passed. expected response to have status code 409 but got 400 \| expected 'FIELD_NOT_APPLICABLE' to deeply equal 'INVITATION_ALREADY_USED' Body keys: code: FIELD_NOT_APPLICABLE; message: …; fields: {…}; statusCode: 400; error: BadRequestException expected response to have status code 409 but got 400 \| expected 'FIELD_NOT_APPLICABLE' to deeply equal 'INVITATION_ALREADY_USED' | Per Sprint 1 backend execution specification. | FAIL | BUG-INVIT-011 | Medium |

