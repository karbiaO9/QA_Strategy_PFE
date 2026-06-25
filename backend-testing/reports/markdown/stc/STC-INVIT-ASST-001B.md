# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-INVIT-ASST-001B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-INVIT-ASST-001/B |
| **USER STORY** | US-B.2 — BE-B2-01 |
| **Acceptance Criteria (sheet)** | • Le payload d'invitation accepte role=ASSISTANT • Profil créé avec profileType=ASSISTANT (verrouillé dans l'enum côté backend) • Aucune permission clinique accordée par défaut • Pas de champ numéro professionnel exigé |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-B.2; BE-B2-01: Cas nominal validé selon les AC du ticket : • Le payload d'invitation accepte role=ASSISTANT • Profil créé with profileeType=ASSISTANT (verrouillé dans l'enum côté backend) • Aucune permission clinique accordée par défa… |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 7, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | MEDIUM | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/v1/kine/auth/invitations. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-B.2 — BE-B2-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-INVIT-ASST-001/B | Invite ASSISTANT

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-INVIT-ASST-001B (STC-INVIT-ASST-001/B \| Invite ASSISTANT) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/invitations \| Body: { "email": "jean.nouveau.member@testmail.fr", "firstName": "Sami", "lastName": "Trabelsi", "targetProfileType": "ASSISTANT" } \| Headers: Content-Type: application/json | Cas nominal validé selon les AC du ticket : • Le payload d'invitation accepte role=ASSISTANT • Profil créé with profileeType=ASSISTANT (verrouillé dans l'enum côté backend) • Aucune permission clinique accordée par défaut • Pas de champ number professionnel ex... Newman: expect HTTP 201. | 400 Bad Request in 156 ms 1 failed, 1 passed. expected response to have status code 201 but got 400 Body keys: code: PROFILE_HEADER_MISSING; message: …; statusCode: 400; error: BadRequestException expected response to have status code 201 but got 400 | • Le payload d'invitation accepte role=ASSISTANT • Profil créé avec profileType=ASSISTANT (verrouillé dans l'enum côté backend) • Aucune permission clinique accordée par défaut • Pas de champ numéro professionnel exigé | FAIL | BUG-INVIT-002 | Medium |

