# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PROFILE-ADD-002B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PROFILE-ADD-002/B |
| **USER STORY** | US-E.2 — BE-E2-02 |
| **Acceptance Criteria (sheet)** | • POST /api/admin/v1/kines/:id/profiles accepte AddKineProfileDto + scope=admin (côté backend) • Réservé SUPER_ADMIN via PoliciesGuard • subscriptionPlanId accepté uniquement quand scope=admin (sinon HTTP 400) • HTTP 201 avec le profil créé (et freemium si applicable) • HTTP 404 si :id ne correspond à aucun Compte Kiné • HTTP 409 PROFILE_ALREADY_EXISTS si doublon (profileType, cabinetId) • HTTP 403 si non SUPER_ADMIN • Cache CASL du Compte cible invalidé (perms:profile:{id}) • Vérification fraîcheur : GET /me sur le compte cible reflète immédiatement le nouveau profil |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-E.2; BE-E2-02: Cas nominal validé selon les AC du ticket : • POST /api/admin/v1/kines/:id/profilees accepte AddKineProfileDto + scope=admin (côté backend) • Réservé SUPER_ADMIN via PoliciesGuard • HTTP 201 with le profile créé (et fre… |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | May 14, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | MEDIUM | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/admin/v1/kines/:id/profiles. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-E.2 — BE-E2-02. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-PROFILE-ADD-002/B | Admin add LIBERAL to kine

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-PROFILE-ADD-002B (STC-PROFILE-ADD-002/B \| Admin add LIBERAL to kine) | POST https://identity.physio.agregatech.com/api/admin/v1/kines/6a04a5695097a1ea13a2a993/profiles \| Body: { "profileType": "LIBERAL", "cabinetName": "Cabinet Manuel", "subscriptionPlanId": "507f1f77bcf86cd799439011", "scope": "admin", "street": "12 rue du Cabinet Test", "postalCode": "75001", "city": "Paris" } \| Headers: Content-Type: application/json; Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTA0YTU2OTUwOTdhMWVhMTNhMmE5OTAiLCJlbWFpbCI6ImFkbWluQHBoeXNpb2Nvbm5lY3QuY29tIiwidHlwZSI6ImFkbWluIiwiY2FiaW5ldElkIjoicGxhdGZvcm0iLCJyb2xlU2x1ZyI6IlNVUEVSX0FETUlOIiw… | Cas nominal validé selon les AC du ticket : • POST /api/admin/v1/kines/:id/profilees accepte AddKineProfileDto + scope=admin (côté backend) • Réservé SUPER_ADMIN via PoliciesGuard • HTTP 201 with le profile créé (et freemium si applicable) • Vérification fraîc... Execution sheet: HTTP ∈ {201}. Newman: expect HTTP 200. | 400 Bad Request in 72 ms 1 failed, 1 passed. expected [ 200, 201 ] to include 400 Body keys: code: FIELD_NOT_APPLICABLE; message: Unknown or non-mutable field(s): scope.; fields: {…}; statusCode: 400; error: BadRequestException expected [ 200, 201 ] to include 400 | • POST /api/admin/v1/kines/:id/profiles accepte AddKineProfileDto + scope=admin (côté backend) • Réservé SUPER_ADMIN via PoliciesGuard • subscriptionPlanId accepté uniquement quand scope=admin (sinon HTTP 400) • HTTP 201 avec le profil créé (et freemium si applicable) • HTTP 404 si :id ne correspond à aucun Compte Kin… | FAIL | BUG-PROFILE-001 | Medium |

