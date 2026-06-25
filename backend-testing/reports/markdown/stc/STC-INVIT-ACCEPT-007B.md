# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-INVIT-ACCEPT-007B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-INVIT-ACCEPT-007/B |
| **USER STORY** | US-B.4 — BE-B4-01 |
| **Acceptance Criteria (sheet)** | Un ASSISTANT ne doit PAS avoir de numéro professionnel |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-B.4; BE-B4-01: • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'PROFESSIONAL_NUMBER_FORBIDDEN' } • Aucun Compte créé |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 7, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | HIGH | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/v1/kine/auth/accept-invitation. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-B.4 — BE-B4-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-INVIT-ACCEPT-007/B | Assistant professional number forbidden 400

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-INVIT-ACCEPT-007B (STC-INVIT-ACCEPT-007/B \| Assistant professional number forbidden 400) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/accept-invitation \| Body: { "invitationToken": "", "firstName": "Sophie", "lastName": "Roux", "password": "KineAdmin123!", "passwordConfirmation": "KineAdmin123!", "cguAccepted": true, "professionalNumber": "12345678901" } \| Headers: Content-Type: application/json | • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'PROFESSIONAL_NUMBER_FORBIDDEN' } • Aucun Compte créé Execution sheet: HTTP ∈ {400}. Newman: expect HTTP 400. | 400 Bad Request in 153 ms 1 failed, 2 passed. expected 'FIELD_NOT_APPLICABLE' to deeply equal 'PROFESSIONAL_NUMBER_FORBIDDEN' Body keys: code: FIELD_NOT_APPLICABLE; message: …; fields: {…}; statusCode: 400; error: BadRequestException expected 'FIELD_NOT_APPLICABLE' to deeply equal 'PROFESSIONAL_NUMBER_FORBIDDEN' | Un ASSISTANT ne doit PAS avoir de numéro professionnel | FAIL | BUG-INVIT-008 | Medium |

