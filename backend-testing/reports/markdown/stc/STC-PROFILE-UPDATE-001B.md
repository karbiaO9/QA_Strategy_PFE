# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PROFILE-UPDATE-001B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PROFILE-UPDATE-001/B |
| **USER STORY** | US-E.5 — BE-E5-01 |
| **Acceptance Criteria (sheet)** | • PATCH /api/v1/kine/profiles/:profileId scoped au Compte authentifié • Whitelist stricte : isActive (false only), isReplacement, school, academicYear, justificatifUrl • HTTP 404 PROFILE_NOT_FOUND si profileId pas sur le Compte • HTTP 400 PROFILE_ACTIVATION_ADMIN_ONLY si isActive=true (réactivation interdite via self) • HTTP 400 FIELD_NOT_APPLICABLE si STUDENT-only fields envoyés sur autre profileType • LIBERAL toggle isReplacement=true bascule profileType=REMPLACANT (et inversement) • Champs hors whitelist (email, roleId, etc.) silencieusement ignorés (réponse HTTP 200 mais aucune modif) • C… |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-E.5; BE-E5-01: Cas nominal validé selon les AC du ticket : • PATCH /api/v1/kine/profilees/:profileeId scoped au Compte authentifié • Whitelist stricte : isActive (false only), isReplacement, school, academicYear, justificatifUrl • LIB… |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 7, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | MEDIUM | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: PATCH /api/v1/kine/profiles/:profileId. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-E.5 — BE-E5-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-PROFILE-UPDATE-001/B | Patch profile allowed fields

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute PATCH request for STC-PROFILE-UPDATE-001B (STC-PROFILE-UPDATE-001/B \| Patch profile allowed fields) | PATCH https://identity.physio.agregatech.com/api/v1/kine/profiles/6a0e174e73797a63a4ac8467 \| Body: { "isReplacement": true } \| Headers: Content-Type: application/json | Cas nominal validé selon les AC du ticket : • PATCH /api/v1/kine/profilees/:profileeId scoped au Compte authentifié • Whitelist stricte : isActive (false only), isReplacement, school, academicYear, justificatifUrl • LIBERAL toggle isReplacement=true bascule pr... Newman: expect HTTP 200. | 401 Unauthorized in 154 ms 1 failed, 1 passed. expected [ 200, 201 ] to include 401 Body keys: code: TOKEN_INVALID; message: Token superseded by a newer session.; statusCode: 401; error: UnauthorizedException expected [ 200, 201 ] to include 401 | • PATCH /api/v1/kine/profiles/:profileId scoped au Compte authentifié • Whitelist stricte : isActive (false only), isReplacement, school, academicYear, justificatifUrl • HTTP 404 PROFILE_NOT_FOUND si profileId pas sur le Compte • HTTP 400 PROFILE_ACTIVATION_ADMIN_ONLY si isActive=true (réactivation interdite via self)… | FAIL | BUG-PROFILE-006 | Medium |

