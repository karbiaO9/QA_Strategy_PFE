# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-HEALTHZ-001B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-HEALTHZ-001/B |
| **USER STORY** | X-15 — BE-X15-01 |
| **Acceptance Criteria (sheet)** | • Toutes les configs critiques en variables d'env • Validation des env vars au démarrage (joi ou class-validator) • Documentation des variables (.env.example) • Changement de config sans rebuild |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate X-15; BE-X15-01: Cas nominal validé selon les AC du ticket : • Toutes les configs critiques en variables d'env • Validation des env vars au démarrage (joi ou class-validator) • Documentation des variables (.env.example) • Changement de… |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 6, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | LOW | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: GET /healthz. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: X-15 — BE-X15-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-HEALTHZ-001/B | Liveness healthcheck

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute GET request for STC-HEALTHZ-001B (STC-HEALTHZ-001/B \| Liveness healthcheck) | GET https://identity.physio.agregatech.com \| Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTBlMTc0ZTczNzk3YTYzYTRhYzg0NWIiLCJlbWFpbCI6ImFkbWluQHBoeXNpb2Nvbm5lY3QuY29tIiwidHlwZSI6ImFkbWluIiwiY2FiaW5ldElkIjoicGxhdGZvcm0iLCJyb2xlU2x1ZyI6IlNVUEVSX0FETUlOIiw… | Cas nominal validé selon les AC du ticket : • Toutes les configs critiques en variables d'env • Validation des env vars au démarrage (joi ou class-validator) • Documentation des variables (.env.example) • Changement de config without rebuild Newman: expect HTTP 200. | 200 OK in 62 ms 2 assertion(s) passed. Hello World! | • Toutes les configs critiques en variables d'env • Validation des env vars au démarrage (joi ou class-validator) • Documentation des variables (.env.example) • Changement de config sans rebuild | PASS |  |  |

