# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-REGISTER-ADMIN-003B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-REGISTER-ADMIN-003/B |
| **USER STORY** | US-A.3 — BE-A3-01 |
| **Acceptance Criteria (sheet)** | Le numéro professionnel est requis pour Admin Cabinet de groupe |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-A.3; BE-A3-01: • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'PROFESSIONAL_NUMBER_REQUIRED' } |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 6, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | HIGH | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/v1/kine/auth/register. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-A.3 — BE-A3-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-REGISTER-ADMIN-003/B | Register admin missing RPPS 400

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-REGISTER-ADMIN-003B (STC-REGISTER-ADMIN-003/B \| Register admin missing RPPS 400) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/register \| Body: { "email": "jean.nouveau.member@testmail.fr", "password": "KineAdmin123!", "firstName": "Pierre", "lastName": "Martin", "raisonSociale": "Cabinet SARL", "siret": "12345678901234", "cguAccepted": true } \| Headers: Content-Type: application/json | • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'PROFESSIONAL_NUMBER_REQUIRED' } Execution sheet: HTTP ∈ {400}. Newman: expect HTTP 400. | 400 Bad Request in 93 ms 1 failed, 2 passed. expected [ Array(2) ] to include 'FIELD_NOT_APPLICABLE' Body keys: code: FIELD_NOT_APPLICABLE; message: …; fields: {…}; statusCode: 400; error: BadRequestException expected [ Array(2) ] to include 'FIELD_NOT_APPLICABLE' | Le numéro professionnel est requis pour Admin Cabinet de groupe | FAIL | BUG-REGISTER-001 | Medium |

