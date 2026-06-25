# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-REGISTER-STUD-002B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-REGISTER-STUD-002/B |
| **USER STORY** | US-A.4 — BE-A4-02 |
| **Acceptance Criteria (sheet)** | • À la création d'un profil STUDENT, lancement d'un job de duplication des patients démo • Le pool de patients démo est défini dans la collection demo_patients (à confirmer architecture) • Chaque patient dupliqué a le champ type=fictif • Les patients dupliqués sont rattachés au tenant de l'étudiant (cabinetId du profil) • Modifications de l'étudiant n'affectent pas les autres étudiants ni le pool master • L'import de vrais patients est désactivé pour les profils STUDENT (HTTP 403) |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-A.4; BE-A4-02: Cas nominal validé selon les AC du ticket : • À la création d'un profile STUDENT, lancement d'un job de duplication des patients démo • Le pool de patients démo est défini dans la collection demo_patients (à confirmer a… |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 7, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | HIGH | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/v1/kine/auth/register. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-A.4 — BE-A4-02. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-REGISTER-STUD-002/B | Register STUDENT demo patients

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-REGISTER-STUD-002B (STC-REGISTER-STUD-002/B \| Register STUDENT demo patients) | POST https://identity.physio.agregatech.com/api/v1/kine/auth/register \| Body: email: sophie.martin@cabinet-paris.fr; password: KineAdmin123!; passwordConfirmation: KineAdmin123!; firstName: Student; lastName: Test; phone: +33601020304; schoolIfmk: IFMK Lyon; academicYear: 2024-2025; cguAccepted: true | Cas nominal validé selon les AC du ticket : • À la création d'un profile STUDENT, lancement d'un job de duplication des patients démo • Le pool de patients démo est défini dans la collection demo_patients (à confirmer architecture) • Chaque patient dupliqué a ... | 400 Bad Request in 156 ms 2 assertion(s) passed. Body keys: code: FIELD_NOT_APPLICABLE; message: …; fields: {…}; statusCode: 400; error: BadRequestException | • À la création d'un profil STUDENT, lancement d'un job de duplication des patients démo • Le pool de patients démo est défini dans la collection demo_patients (à confirmer architecture) • Chaque patient dupliqué a le champ type=fictif • Les patients dupliqués sont rattachés au tenant de l'étudiant (cabinetId du profi… | PASS |  |  |

