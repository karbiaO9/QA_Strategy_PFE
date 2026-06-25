# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-VERIF-006B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-VERIF-006/B |
| **USER STORY** | US-I.1 — BE-I1-01 |
| **Acceptance Criteria (sheet)** | Le motif de rejet est obligatoire et doit faire ≥ 3 caractères |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-I.1; BE-I1-01: • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'REJECTION_REASON_REQUIRED' } • verificationStatus reste inchangé |



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

### TEST SCRIPT STEPS / RESULTS - STC-VERIF-006/B | Verification reject validation 400

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute PATCH request for STC-VERIF-006B (STC-VERIF-006/B \| Verification reject validation 400) | PATCH https://identity.physio.agregatech.com/api/admin/v1/kines/6a0e174e73797a63a4ac8461/verification \| Body: { "decision": "REJECT" } \| Headers: Content-Type: application/json; Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTBlMTc0ZTczNzk3YTYzYTRhYzg0NWIiLCJlbWFpbCI6ImFkbWluQHBoeXNpb2Nvbm5lY3QuY29tIiwidHlwZSI6ImFkbWluIiwiY2FiaW5ldElkIjoicGxhdGZvcm0iLCJyb2xlU2x1ZyI6IlNVUEVSX0FETUlOIiw… | • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'REJECTION_REASON_REQUIRED' } • verificationStatus reste inchangé Execution sheet: HTTP ∈ {400}. Newman: expect HTTP 400. | 400 Bad Request in 155 ms 3 assertion(s) passed. Body keys: code: VALIDATION_FAILED; message: Request payload is invalid.; errors: {…}; statusCode: 400; error: BadRequestException | Le motif de rejet est obligatoire et doit faire ≥ 3 caractères | PASS |  |  |

