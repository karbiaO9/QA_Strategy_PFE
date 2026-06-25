# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-AUTH-KINE-001B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-AUTH-KINE-001/B |
| **USER STORY** | US-C.1 — BE-C1-01 |
| **Acceptance Criteria (sheet)** | • POST /api/v1/kine/auth/login accepte {email, password} • Vérification mot de passe contre le hash bcrypt • Retour accessToken (TTL court) + refreshToken (TTL long) • Retour profiles[] avec id, profileType, cabinetName, roleId • HTTP 401 si credentials invalides • HTTP 403 si Compte INACTIVE (KINE_INACTIVE) • Pas de blocage si verificationStatus=PENDING (V2 §9.1 non bloquant) |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-C.1; BE-C1-01: Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/login accepte {email, password} • Vérification password contre le hash bcrypt • Retour accessToken (TTL court) + refreshToken (TTL long) • Retour prof… |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 7, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | HIGH | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/v1/kine/auth/login. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-C.1 — BE-C1-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-AUTH-KINE-001/B | Kine login nominal

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-AUTH-KINE-001B (STC-AUTH-KINE-001/B \| Kine login nominal) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/login \| Body: { "email": "sophie.martin@cabinet-paris.fr", "password": "KineAdmin123!" } \| Headers: Content-Type: application/json | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/login accepte {email, password} • Vérification password contre le hash bcrypt • Retour accessToken (TTL court) + refreshToken (TTL long) • Retour profilees[] with id, profileeType, cabinetNam... Newman: expect HTTP 200. | 200 OK in 1057 ms 2 assertion(s) passed. Body keys: accessToken: [redacted]; refreshToken: [redacted]; user: {…}; profiles: {…}; lastProfileId: 6a0e174e73797a63a4ac8467 | • POST /api/v1/kine/auth/login accepte {email, password} • Vérification mot de passe contre le hash bcrypt • Retour accessToken (TTL court) + refreshToken (TTL long) • Retour profiles[] avec id, profileType, cabinetName, roleId • HTTP 401 si credentials invalides • HTTP 403 si Compte INACTIVE (KINE_INACTIVE) • Pas de… | PASS |  |  |
| 2 | Execute POST request for STC-AUTH-KINE-001B (STC-AUTH-KINE-001/B \| Kine login nominal) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/login \| Body: { "email": "sophie.martin@cabinet-paris.fr", "password": "KineAdmin123!" } \| Headers: Content-Type: application/json | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/login accepte {email, password} • Vérification password contre le hash bcrypt • Retour accessToken (TTL court) + refreshToken (TTL long) • Retour profilees[] with id, profileeType, cabinetNam... Newman: expect HTTP 200. | 200 OK in 1031 ms 2 assertion(s) passed. Body keys: accessToken: [redacted]; refreshToken: [redacted]; user: {…}; profiles: {…}; lastProfileId: 6a0e174e73797a63a4ac8467 | • POST /api/v1/kine/auth/login accepte {email, password} • Vérification mot de passe contre le hash bcrypt • Retour accessToken (TTL court) + refreshToken (TTL long) • Retour profiles[] avec id, profileType, cabinetName, roleId • HTTP 401 si credentials invalides • HTTP 403 si Compte INACTIVE (KINE_INACTIVE) • Pas de… | PASS |  |  |

