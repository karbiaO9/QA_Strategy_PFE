# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PROFILE-ADD-001B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PROFILE-ADD-001/B |
| **USER STORY** | US-E.2 — BE-E2-01 |
| **Acceptance Criteria (sheet)** | • POST /api/v1/kine/profiles accepte un payload selon profileType • Profil créé avec profileType demandé (SOLO, ADMIN_GROUP, STUDENT, etc.) • Si profil clinique et numéro pro déjà sur le Compte : réutilisation • Cache CASL du Compte invalidé • HTTP 201 avec le profil créé • HTTP 409 si freemium en cours pour ce type |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-E.2; BE-E2-01: Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/profilees accepte un payload selon profileeType • Profil créé with profileeType demandé (SOLO, ADMIN_GROUP, STUDENT, etc.) • Si profile clinique et number… |



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

### TEST SCRIPT STEPS / RESULTS - STC-PROFILE-ADD-001/B | Add STUDENT profile

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-PROFILE-ADD-001B (STC-PROFILE-ADD-001/B \| Add STUDENT profile) | POST https://identity.physio.agregatech.com/api/v1/kine/profiles \| Body: { "profileType": "STUDENT", "schoolIfmk": "IFMK Lyon", "academicYear": "2024-2025" } \| Headers: Content-Type: application/json | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/profilees accepte un payload selon profileeType • Profil créé with profileeType demandé (SOLO, ADMIN_GROUP, STUDENT, etc.) • Si profile clinique et number pro déjà sur le Compte : réutilisation • ... | 400 Bad Request in 71 ms 2 assertion(s) passed. Body keys: code: FIELD_NOT_APPLICABLE; message: …; fields: {…}; statusCode: 400; error: BadRequestException | • POST /api/v1/kine/profiles accepte un payload selon profileType • Profil créé avec profileType demandé (SOLO, ADMIN_GROUP, STUDENT, etc.) • Si profil clinique et numéro pro déjà sur le Compte : réutilisation • Cache CASL du Compte invalidé • HTTP 201 avec le profil créé • HTTP 409 si freemium en cours pour ce type | PASS |  |  |

