# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PROFILE-ADD-010B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PROFILE-ADD-010/B |
| **USER STORY** | US-E.2 — BE-E2-01 |
| **Acceptance Criteria (sheet)** | Le clonage de patients fictifs est réservé au profil STUDENT |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-E.2; BE-E2-01: • Profil LIBERAL créé • Aucun patient fictif cloné • La méthode cloneFictifTemplatesForStudent N'EST PAS appelée |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 6, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | MEDIUM | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/v1/kine/profiles. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-E.2 — BE-E2-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-PROFILE-ADD-010/B | Add LIBERAL profile

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-PROFILE-ADD-010B (STC-PROFILE-ADD-010/B \| Add LIBERAL profile) | POST https://identity.physio.agregatech.com/api/v1/kine/profiles \| Body: { "profileType": "LIBERAL", "cabinetName": "Cabinet Manuel", "address": "12 rue X" } \| Headers: Content-Type: application/json | • Profil LIBERAL créé • Aucun patient fictif cloné • La méthode cloneFictifTemplatesForStudent N'EST PAS appelée | 400 Bad Request in 86 ms 1 assertion(s) passed. Body keys: code: FIELD_NOT_APPLICABLE; message: …; fields: {…}; statusCode: 400; error: BadRequestException | Le clonage de patients fictifs est réservé au profil STUDENT | PASS |  |  |

