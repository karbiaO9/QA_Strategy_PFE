# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-INVIT-ATTACH-001B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-INVIT-ATTACH-001/B |
| **USER STORY** | US-B.3 — BE-B3-01 |
| **Acceptance Criteria (sheet)** | • POST /invitations/attach accepte {invitationToken, password} • Vérification mot de passe contre le Compte kine existant • Création d'un nouveau Profil MEMBER avec cabinetId de l'inviteur • Le Profil hérite du roleId=KINE (pas KINE_ADMIN) • ownerId du nouveau Profil = nouveau profileId créé • Invalidation du cache CASL pour le Compte • HTTP 201 avec le nouveau profil créé • HTTP 401 si mot de passe incorrect • HTTP 409 si invitation déjà consommée |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-B.3; BE-B3-01: Cas nominal validé selon les AC du ticket : • POST /invitations/attach accepte {invitationToken, password} • Vérification password contre le Compte kine existant • Création d'un nouveau Profil MEMBER with cabinetId de l… |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 7, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | HIGH | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/v1/kine/auth/invitations/attach. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-B.3 — BE-B3-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-INVIT-ATTACH-001/B | Attach existing user to cabinet

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-INVIT-ATTACH-001B (STC-INVIT-ATTACH-001/B \| Attach existing user to cabinet) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/invitations/attach \| Body: { "invitationToken": "", "password": "KineAdmin123!" } \| Headers: Content-Type: application/json | Cas nominal validé selon les AC du ticket : • POST /invitations/attach accepte {invitationToken, password} • Vérification password contre le Compte kine existant • Création d'un nouveau Profil MEMBER with cabinetId de l'inviteur • Le Profil hérite du roleId=KI... | 401 Unauthorized in 154 ms 1 failed, 1 passed. expected [ 201, 409 ] to include 401 Body keys: code: TOKEN_MISSING; message: Token missing; statusCode: 401; error: UnauthorizedException expected [ 201, 409 ] to include 401 | • POST /invitations/attach accepte {invitationToken, password} • Vérification mot de passe contre le Compte kine existant • Création d'un nouveau Profil MEMBER avec cabinetId de l'inviteur • Le Profil hérite du roleId=KINE (pas KINE_ADMIN) • ownerId du nouveau Profil = nouveau profileId créé • Invalidation du cache CA… | FAIL | BUG-INVIT-007 | Medium |

