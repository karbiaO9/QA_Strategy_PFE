# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PWD-FORGOT-003B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PWD-FORGOT-003/B |
| **USER STORY** | US-F.1 — BE-F1-01 |
| **Acceptance Criteria (sheet)** | Anti-enumeration : la réponse est identique HTTP 200 que l'email existe ou non |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-F.1; BE-F1-01: • HTTP 200 OK (toujours) • Body: { message: 'Si un account existe, un code a été envoyé.' } • Email INEXISTANT : aucun email envoyé • Email EXISTANT : email envoyé silencieusement • Impossibilité d'énumérer les emails e… |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 6, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | MEDIUM | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /auth/forgot-password. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-F.1 — BE-F1-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-PWD-FORGOT-003/B | Forgot password unknown email 200

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-PWD-FORGOT-003B (STC-PWD-FORGOT-003/B \| Forgot password unknown email 200) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/forgot-password \| Body: { "email": "jean.nouveau.member@testmail.fr" } \| Headers: Content-Type: application/json | • HTTP 200 OK (toujours) • Body: { message: 'Si un account existe, un code a été envoyé.' } • Email INEXISTANT : aucun email envoyé • Email EXISTANT : email envoyé silencieusement • Impossibilité d'énumérer les emails existants Execution sheet: HTTP ∈ {200}. Newman: expect HTTP 200. | 404 Not Found in 261 ms 1 failed, 1 passed. expected response to have status code 200 but got 404 Body keys: code: USER_NOT_FOUND; message: Aucun compte n'est associe a cet email.; statusCode: 404; error: NotFoundException expected response to have status code 200 but got 404 | Anti-enumeration : la réponse est identique HTTP 200 que l'email existe ou non | FAIL | BUG-PWD-001 | Medium |

