# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-AUTH-ADMIN-001B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-AUTH-ADMIN-001/B |
| **USER STORY** | US-C.4 — BE-C4-01 |
| **Acceptance Criteria (sheet)** | • POST /api/admin/v1/auth/login accepte {email, password} • Recherche dans collection admins (séparée de kines/patients) • Retour accessToken + refreshToken + permissions wildcard pour SUPER_ADMIN • Rate limiting appliqué |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-C.4; BE-C4-01: Cas nominal validé selon les AC du ticket : • POST /api/admin/v1/auth/login accepte {email, password} • Recherche dans collection admins (séparée de kines/patients) • Retour accessToken + refreshToken + permissions wild… |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 7, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | HIGH | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/admin/v1/auth/login. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-C.4 — BE-C4-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-AUTH-ADMIN-001/B | Admin login nominal

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-AUTH-ADMIN-001B (STC-AUTH-ADMIN-001/B \| Admin login nominal) | POST https://identity.physio.agregatech.com/api/admin/v1/auth/login \| Body: { "email": "admin@physioconnect.com", "password": "Admin123!" } \| Headers: Content-Type: application/json | Cas nominal validé selon les AC du ticket : • POST /api/admin/v1/auth/login accepte {email, password} • Recherche dans collection admins (séparée de kines/patients) • Retour accessToken + refreshToken + permissions wildcard for SUPER_ADMIN • Rate limiting appl... Newman: expect HTTP 200. | 200 OK in 364 ms 2 assertion(s) passed. Body keys: accessToken: [redacted]; refreshToken: [redacted]; user: {…}; permissions: {…} | • POST /api/admin/v1/auth/login accepte {email, password} • Recherche dans collection admins (séparée de kines/patients) • Retour accessToken + refreshToken + permissions wildcard pour SUPER_ADMIN • Rate limiting appliqué | PASS |  |  |

