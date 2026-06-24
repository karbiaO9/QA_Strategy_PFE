# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PWD-FORGOT-004B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PWD-FORGOT-004/B |
| **USER STORY** | US-F.1 — BE-F1-01 |
| **Acceptance Criteria (sheet)** | Rate limit : 5 demandes par heure par email pour éviter le spam |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-F.1; BE-F1-01: • Appels 1-5 : HTTP 200 OK • Appel 6+ : HTTP 429 Too Many Requests • Body: { statusCode: 429, code: 'RATE_LIMIT_EXCEEDED' } • Reset après 1h |



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

### TEST SCRIPT STEPS / RESULTS - STC-PWD-FORGOT-004/B | Forgot password rate limit 429

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-PWD-FORGOT-004B (STC-PWD-FORGOT-004/B \| Forgot password rate limit 429) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/forgot-password \| Body: { "email": "marie.durand@patient.fr" } \| Headers: Content-Type: application/json | • Appels 1-5 : HTTP 200 OK • Appel 6+ : HTTP 429 Too Many Requests • Body: { statusCode: 429, code: 'RATE_LIMIT_EXCEEDED' } • Reset après 1h Execution sheet: HTTP ∈ {200, 429}. Newman: expect HTTP 200. | 404 Not Found in 102 ms 1 failed, 1 passed. expected [ 200, 429 ] to include 404 Body keys: code: USER_NOT_FOUND; message: Aucun compte n'est associe a cet email.; statusCode: 404; error: NotFoundException expected [ 200, 429 ] to include 404 | Rate limit : 5 demandes par heure par email pour éviter le spam | FAIL | BUG-PWD-002 | Medium |

