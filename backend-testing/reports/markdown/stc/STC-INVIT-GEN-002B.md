# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-INVIT-GEN-002B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-INVIT-GEN-002/B |
| **USER STORY** | US-B.1 — BE-B1-02 |
| **Acceptance Criteria (sheet)** | • POST /api/v1/kine/auth/invitations/preview accepte {invitationToken} • Vérification validité token (signature, jti, TTL) • Retourne accountExists=true si email correspond à un Compte kine existant • Retourne accountExists=false sinon • Retourne aussi cabinetName, inviterName, role pour affichage UI • HTTP 401 si token expiré, HTTP 409 si déjà consommé |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-B.1; BE-B1-02: Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/invitations/preview accepte {invitationToken} • Vérification validité token (signature, jti, TTL) • Retourne accountExists=true si email correspond à… |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 6, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | HIGH | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/v1/kine/auth/invitations/preview. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-B.1 — BE-B1-02. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-INVIT-GEN-002/B | Preview invitation token

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-INVIT-GEN-002B (STC-INVIT-GEN-002/B \| Preview invitation token) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/invitations/preview \| Body: { "invitationToken": "" } \| Headers: Content-Type: application/json | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/invitations/preview accepte {invitationToken} • Vérification validité token (signature, jti, TTL) • Retourne accountExists=true si email correspond à un Compte kine existant • Retourne accoun... Newman: expect HTTP 200. | 400 Bad Request in 82 ms 1 failed, 1 passed. expected response to have status code 200 but got 400 Body keys: code: FIELD_NOT_APPLICABLE; message: …; fields: {…}; statusCode: 400; error: BadRequestException expected response to have status code 200 but got 400 | • POST /api/v1/kine/auth/invitations/preview accepte {invitationToken} • Vérification validité token (signature, jti, TTL) • Retourne accountExists=true si email correspond à un Compte kine existant • Retourne accountExists=false sinon • Retourne aussi cabinetName, inviterName, role pour affichage UI • HTTP 401 si tok… | FAIL | BUG-INVIT-003 | Medium |

