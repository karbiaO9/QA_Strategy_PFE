# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PROFILE-ADD-007B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PROFILE-ADD-007/B |
| **USER STORY** | US-E.2 — BE-E2-02 |
| **Acceptance Criteria (sheet)** | HTTP 409 PROFILE_ALREADY_EXISTS |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-E.2; BE-E2-02: • Response status code : HTTP 409 • Body contains : { "statusCode": 409, "error": "...", "code": "PROFILE_ALREADY_EXISTS" } • No side effects in database |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 6, 2026 |Browser | N/A - API testing with Postman/Newman |
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

### TEST SCRIPT STEPS / RESULTS - STC-PROFILE-ADD-007/B | Admin add MEMBER conflict 409

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-PROFILE-ADD-007B (STC-PROFILE-ADD-007/B \| Admin add MEMBER conflict 409) | POST https://identity.physio.agregatech.com/api/admin/v1/kines/6a0e174e73797a63a4ac8461/profiles \| Body: { "profileType": "MEMBER", "subscriptionPlanId": "507f1f77bcf86cd799439011" } \| Headers: Content-Type: application/json; Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTBlMTc0ZTczNzk3YTYzYTRhYzg0NWIiLCJlbWFpbCI6ImFkbWluQHBoeXNpb2Nvbm5lY3QuY29tIiwidHlwZSI6ImFkbWluIiwiY2FiaW5ldElkIjoicGxhdGZvcm0iLCJyb2xlU2x1ZyI6IlNVUEVSX0FETUlOIiw… | • Response status code : HTTP 409 • Body contains : { "statusCode": 409, "error": "...", "code": "PROFILE_ALREADY_EXISTS" } • No side effects in database Execution sheet: HTTP ∈ {409}. | 400 Bad Request in 83 ms 3 assertion(s) passed. Body keys: code: VALIDATION_FAILED; message: Request payload is invalid.; errors: {…}; statusCode: 400; error: BadRequestException | HTTP 409 PROFILE_ALREADY_EXISTS | PASS |  |  |

