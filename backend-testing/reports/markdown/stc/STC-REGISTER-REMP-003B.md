# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-REGISTER-REMP-003B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-REGISTER-REMP-003/B |
| **USER STORY** | US-A.2 — BE-A2-01 |
| **Acceptance Criteria (sheet)** | Le numéro professionnel est requis pour le profil Remplaçant |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-A.2; BE-A2-01: • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'PROFESSIONAL_NUMBER_REQUIRED' } |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 7, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | HIGH | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/v1/kine/auth/register. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-A.2 — BE-A2-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-REGISTER-REMP-003/B | Register rempla missing RPPS 400

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-REGISTER-REMP-003B (STC-REGISTER-REMP-003/B \| Register rempla missing RPPS 400) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/register \| Body: { "email": "jean.nouveau.member@testmail.fr", "password": "KineAdmin123!", "firstName": "Marie", "lastName": "Leroy", "phone": "+33602030405", "isReplacement": true, "cguAccepted": true } \| Headers: Content-Type: application/json | • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'PROFESSIONAL_NUMBER_REQUIRED' } Execution sheet: HTTP ∈ {400}. Newman: expect HTTP 400. | 400 Bad Request in 155 ms 3 assertion(s) passed. Body keys: code: VALIDATION_FAILED; message: Request payload is invalid.; errors: {…}; statusCode: 400; error: BadRequestException | Le numéro professionnel est requis pour le profil Remplaçant | PASS |  |  |

