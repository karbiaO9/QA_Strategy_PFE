# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-VERIF-001B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-VERIF-001/B |
| **USER STORY** | US-I.1 — BE-I1-01 |
| **Acceptance Criteria (sheet)** | • PATCH /api/admin/v1/kines/:id/verification accepte {action: 'APPROVE'|'REJECT'|'RESET', reason?} • Si APPROVE : verificationStatus=VERIFIED, verifiedAt=now, verifiedByAdminId • Si REJECT : verificationStatus=REJECTED, verificationRejectionReason, rejectedAt, rejectedByAdminId • Si RESET : verificationStatus=PENDING (remise à zéro en cas d'erreur de validation) • HTTP 403 si l'utilisateur n'est pas SUPER_ADMIN • Profil reste accessible même en PENDING (V2 §9.1 non bloquant) |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-I.1; BE-I1-01: Cas nominal validé selon les AC du ticket : • PATCH /api/admin/v1/kines/:id/verification accepte {action: 'APPROVE'|'REJECT'|'RESET', reason?} • Si APPROVE : verificationStatus=VERIFIED, verifiedAt=now, verifiedByAdminI… |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 7, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | MEDIUM | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: PATCH /api/admin/v1/kines/:id/verification. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-I.1 — BE-I1-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-VERIF-001/B | Verification APPROVE/REJECT/RESET

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute PATCH request for STC-VERIF-001B (STC-VERIF-001/B \| Verification APPROVE/REJECT/RESET) | PATCH https://identity.physio.agregatech.com/api/admin/v1/kines/6a0e174e73797a63a4ac8461/verification \| Body: { "decision": "APPROVE" } \| Headers: Content-Type: application/json; Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTBlMTc0ZTczNzk3YTYzYTRhYzg0NWIiLCJlbWFpbCI6ImFkbWluQHBoeXNpb2Nvbm5lY3QuY29tIiwidHlwZSI6ImFkbWluIiwiY2FiaW5ldElkIjoicGxhdGZvcm0iLCJyb2xlU2x1ZyI6IlNVUEVSX0FETUlOIiw… | Cas nominal validé selon les AC du ticket : • PATCH /api/admin/v1/kines/:id/verification accepte {action: 'APPROVE'\|'REJECT'\|'RESET', reason?} • Si APPROVE : verificationStatus=VERIFIED, verifiedAt=now, verifiedByAdminId • Si REJECT : verificationStatus=REJECT... Newman: expect HTTP 200. | 200 OK in 156 ms 2 assertion(s) passed. Body keys: _id: 6a0e174e73797a63a4ac8461; email: sophie.martin@cabinet-paris.fr; firstName: Sophie; lastName: Martin; cabinetId: 6a0e174e73797a63a4ac8464; professionalNumber: 10000000001; verificationStatus: VERIFIED; timezone: Europe/Paris; language: fr; status: ACTIVE; twoFactorEnabled: false; lastProfileId: 6a0e174… | • PATCH /api/admin/v1/kines/:id/verification accepte {action: 'APPROVE'\|'REJECT'\|'RESET', reason?} • Si APPROVE : verificationStatus=VERIFIED, verifiedAt=now, verifiedByAdminId • Si REJECT : verificationStatus=REJECTED, verificationRejectionReason, rejectedAt, rejectedByAdminId • Si RESET : verificationStatus=PENDING… | PASS |  |  |

