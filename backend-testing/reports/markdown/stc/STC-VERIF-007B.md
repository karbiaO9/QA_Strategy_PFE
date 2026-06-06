# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-VERIF-007B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-VERIF-007/B |
| **USER STORY** |  |
| **Acceptance Criteria (sheet)** | — |
| **TC Type** | — |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate GET https://identity.physio.agregatech.com/api/admin/v1/kines/verifications?status=REJECTED per test specification. |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | May 14, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority |  | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: GET https://identity.physio.agregatech.com/api/admin/v1/kines/verifications?status=REJECTED. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-VERIF-007/B | List kine verifications (REJECTED)

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute GET request for STC-VERIF-007B (STC-VERIF-007/B \| List kine verifications (REJECTED)) | GET https://identity.physio.agregatech.com/api/admin/v1/kines/verifications?status=REJECTED \| Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTA0YTU2OTUwOTdhMWVhMTNhMmE5OTAiLCJlbWFpbCI6ImFkbWluQHBoeXNpb2Nvbm5lY3QuY29tIiwidHlwZSI6ImFkbWluIiwiY2FiaW5ldElkIjoicGxhdGZvcm0iLCJyb2xlU2x1ZyI6IlNVUEVSX0FETUlOIiw… | Newman: expect HTTP 200. | 200 OK in 530 ms 1 assertion(s) passed. JSON array (2 items). | Per Sprint 1 backend execution specification. | PASS |  |  |

