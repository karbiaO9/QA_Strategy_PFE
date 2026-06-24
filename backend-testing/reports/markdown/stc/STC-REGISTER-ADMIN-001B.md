# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-REGISTER-ADMIN-001B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-REGISTER-ADMIN-001/B |
| **USER STORY** | US-A.3 — BE-A3-01 |
| **Acceptance Criteria (sheet)** | • POST /api/v1/kine/auth/register accepte un payload RegisterAdminCabinetDto • Validation SIRET (14 chiffres + algorithme Luhn) • Création Cabinet + Profil ADMIN_GROUP en transaction • Le profil créé reçoit roleId=KINE_ADMIN automatiquement • HTTP 409 si SIRET déjà utilisé sur un autre Cabinet actif • HTTP 400 si SIRET au format invalide |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-A.3; BE-A3-01: Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/register accepte un payload RegisterAdminCabinetDto • Validation SIRET (14 chiffres + algorithme Luhn) • Création Cabinet + Profil ADMIN_GROUP en tran… |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 6, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | HIGH | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/v1/kine/auth/register. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-A.3 — BE-A3-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-REGISTER-ADMIN-001/B | Register ADMIN_GROUP

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-REGISTER-ADMIN-001B (STC-REGISTER-ADMIN-001/B \| Register ADMIN_GROUP) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/register \| Body: { "email": "jean.nouveau.member@testmail.fr", "password": "KineAdmin123!", "passwordConfirmation": "KineAdmin123!", "firstName": "Nadia", "lastName": "Ben Ali", "phone": "+21620000001", "professionalNumber": "12345678901", "cabinetName": "Cabinet Groupe Tunis", "raisonSociale": "Cabinet Groupe Tunis SARL", "siret": "73282932000074", "addressCabinet": "1 rue de Marseille, Tunis", "cguAccepted": true } \| Headers: Content-Type: application/json | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/register accepte un payload RegisterAdminCabinetDto • Validation SIRET (14 chiffres + algorithme Luhn) • Création Cabinet + Profil ADMIN_GROUP en transaction • Le profile créé reçoit roleId=K... | 400 Bad Request in 88 ms 2 assertion(s) passed. Body keys: code: FIELD_NOT_APPLICABLE; message: …; fields: {…}; statusCode: 400; error: BadRequestException | • POST /api/v1/kine/auth/register accepte un payload RegisterAdminCabinetDto • Validation SIRET (14 chiffres + algorithme Luhn) • Création Cabinet + Profil ADMIN_GROUP en transaction • Le profil créé reçoit roleId=KINE_ADMIN automatiquement • HTTP 409 si SIRET déjà utilisé sur un autre Cabinet actif • HTTP 400 si SIRE… | PASS |  |  |

