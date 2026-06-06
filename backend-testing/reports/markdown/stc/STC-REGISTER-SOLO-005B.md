# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-REGISTER-SOLO-005B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-REGISTER-SOLO-005/B |
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

### TEST SCRIPT STEPS / RESULTS - STC-REGISTER-SOLO-005/B | Duplicate email 409

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-REGISTER-SOLO-005B (STC-REGISTER-SOLO-005/B \| Duplicate email 409) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/register \| Body: { "email": "sophie.martin@cabinet-paris.fr", "password": "QaTest123!", "passwordConfirmation": "QaTest123!", "firstName": "Jean", "lastName": "LiberalSolo", "phone": "+33655554444", "profileType": "LIBERAL", "professionalNumber": "123456789", "cabinetName": "Cabinet Test Marseille", "street": "12 rue des Lilas", "postalCode": "13001", "city": "Marseille", "cguAccepted": true } \| Headers: Content-Type: application/json | HTTP 409; response matches acceptance for specified story. | 409 Conflict in 131 ms 1 assertion(s) passed. Body keys: code: EMAIL_ALREADY_USED; message: …; statusCode: 409; error: ConflictException | Per Sprint 1 backend execution specification. | PASS |  |  |

