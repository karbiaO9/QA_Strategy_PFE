# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-VERIF-HISTORY-001B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-VERIF-HISTORY-001/B |
| **USER STORY** |  |
| **Acceptance Criteria (sheet)** | — |
| **TC Type** | — |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate GET https://identity.physio.agregatech.com/api/admin/v1/kines/6a04a5695097a1ea13a2a993/verification/history per test specification. |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | May 14, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority |  | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: GET https://identity.physio.agregatech.com/api/admin/v1/kines/6a04a5695097a1ea13a2a993/verification/history. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-VERIF-HISTORY-001/B | Kine verification audit trail GET

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute GET request for STC-VERIF-HISTORY-001B (STC-VERIF-HISTORY-001/B \| Kine verification audit trail GET) | GET https://identity.physio.agregatech.com/api/admin/v1/kines/6a04a5695097a1ea13a2a993/verification/history \| Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTA0YTU2OTUwOTdhMWVhMTNhMmE5OTAiLCJlbWFpbCI6ImFkbWluQHBoeXNpb2Nvbm5lY3QuY29tIiwidHlwZSI6ImFkbWluIiwiY2FiaW5ldElkIjoicGxhdGZvcm0iLCJyb2xlU2x1ZyI6IlNVUEVSX0FETUlOIiw… | HTTP 404; response matches acceptance for specified story. | 404 Not Found in 78 ms 1 assertion(s) passed. Body keys: message: …; error: Not Found; statusCode: 404 | Per Sprint 1 backend execution specification. | PASS |  |  |

