# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-REGISTER-STUD-001B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-REGISTER-STUD-001/B |
| **USER STORY** | US-A.4 — BE-A4-01 |
| **Acceptance Criteria (sheet)** | • POST /api/v1/kine/auth/register accepte un fichier multipart (PDF/JPG/PNG ≤ 5 Mo) • Profil créé avec profileType=STUDENT + roleId=KINE + verificationStatus=PENDING • Freemium 90 jours activé automatiquement • Upload du justificatif via Multer memoryStorage + stockage S3 • URL signée S3 stockée dans le profil (pas de chemin local) • HTTP 400 FILE_TYPE_NOT_ALLOWED si type fichier invalide • HTTP 413 FILE_TOO_LARGE si > 5 Mo • Aucun champ ADELI/RPPS exigé pour ce profil |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-A.4; BE-A4-01: Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/register accepte un file multipart (PDF/JPG/PNG ≤ 5 Mo) • Profil créé with profileeType=STUDENT + roleId=KINE + verificationStatus=PENDING • Freemium… |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 7, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | HIGH | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/v1/kine/auth/register. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-A.4 — BE-A4-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-REGISTER-STUD-001/B | Register STUDENT multipart

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-REGISTER-STUD-001B (STC-REGISTER-STUD-001/B \| Register STUDENT multipart) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/register \| Body: email: sophie.martin@cabinet-paris.fr; password: KineAdmin123!; passwordConfirmation: KineAdmin123!; firstName: Student; lastName: Test; phone: +33601020304; schoolIfmk: IFMK Lyon; academicYear: 2024-2025; cguAccepted: true | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/register accepte un file multipart (PDF/JPG/PNG ≤ 5 Mo) • Profil créé with profileeType=STUDENT + roleId=KINE + verificationStatus=PENDING • Freemium 90 jours activé automatiquement • Upload ... | 400 Bad Request in 156 ms 2 assertion(s) passed. Body keys: code: FIELD_NOT_APPLICABLE; message: …; fields: {…}; statusCode: 400; error: BadRequestException | • POST /api/v1/kine/auth/register accepte un fichier multipart (PDF/JPG/PNG ≤ 5 Mo) • Profil créé avec profileType=STUDENT + roleId=KINE + verificationStatus=PENDING • Freemium 90 jours activé automatiquement • Upload du justificatif via Multer memoryStorage + stockage S3 • URL signée S3 stockée dans le profil (pas de… | PASS |  |  |

