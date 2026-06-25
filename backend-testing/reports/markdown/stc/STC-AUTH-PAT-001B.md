# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-AUTH-PAT-001B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-AUTH-PAT-001/B |
| **USER STORY** | US-C.2 — BE-C2-01 |
| **Acceptance Criteria (sheet)** | • POST /api/v1/patient/auth/login accepte {emailOrPhone, password} • Recherche flexible (email ou téléphone) • Retour accessToken + refreshToken + profile (un seul, pas de Layer 2 pour les patients) • HTTP 401 message générique si credentials invalides • Rate limiting appliqué |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-C.2; BE-C2-01: Cas nominal validé selon les AC du ticket : • POST /api/v1/patient/auth/login accepte {emailOrPhone, password} • Recherche flexible (email ou téléphone) • Retour accessToken + refreshToken + profilee (un seul, pas de La… |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 7, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | HIGH | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/v1/patient/auth/login. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-C.2 — BE-C2-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-AUTH-PAT-001/B | Patient login nominal

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-AUTH-PAT-001B (STC-AUTH-PAT-001/B \| Patient login nominal) | POST https://identity.physio.agregatech.com/api/v1/patient/auth/login \| Body: { "password": "Patient123!", "email": "marie.durand@patient.fr" } \| Headers: Content-Type: application/json | Cas nominal validé selon les AC du ticket : • POST /api/v1/patient/auth/login accepte {emailOrPhone, password} • Recherche flexible (email ou téléphone) • Retour accessToken + refreshToken + profilee (un seul, pas de Layer 2 for les patients) • Rate limiting a... Newman: expect HTTP 200. | 200 OK in 841 ms 2 assertion(s) passed. Body keys: accessToken: [redacted]; refreshToken: [redacted]; user: {…}; permissions: {…} | • POST /api/v1/patient/auth/login accepte {emailOrPhone, password} • Recherche flexible (email ou téléphone) • Retour accessToken + refreshToken + profile (un seul, pas de Layer 2 pour les patients) • HTTP 401 message générique si credentials invalides • Rate limiting appliqué | PASS |  |  |

