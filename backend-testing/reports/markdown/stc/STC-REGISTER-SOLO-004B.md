# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-REGISTER-SOLO-004B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-REGISTER-SOLO-004/B |
| **USER STORY** |  |
| **Acceptance Criteria (sheet)** | — |
| **TC Type** | — |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate POST https://identity.physio.agregatech.com/api/v1/kine/auth/register per test specification. |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | May 14, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority |  | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST https://identity.physio.agregatech.com/api/v1/kine/auth/register. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-REGISTER-SOLO-004/B | Invalid email 400

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-REGISTER-SOLO-004B (STC-REGISTER-SOLO-004/B \| Invalid email 400) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/register \| Body: { "email": "not-an-email", "password": "QaTest123!", "passwordConfirmation": "QaTest123!", "firstName": "Jean", "lastName": "LiberalSolo", "phone": "+33655554444", "profileType": "LIBERAL", "professionalNumber": "123456789", "cabinetName": "Cabinet Test Marseille", "street": "12 rue des Lilas", "postalCode": "13001", "city": "Marseille", "cguAccepted": true } \| Headers: Content-Type: application/json | HTTP 400; response matches acceptance for specified story. | 400 Bad Request in 71 ms 1 assertion(s) passed. Body keys: code: VALIDATION_FAILED; message: Request payload is invalid.; errors: {…}; statusCode: 400; error: BadRequestException | Per Sprint 1 backend execution specification. | PASS |  |  |

