# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PROFILE-ADD-004B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PROFILE-ADD-004/B |
| **USER STORY** | US-E.2 — BE-E2-01 |
| **Acceptance Criteria (sheet)** | HTTP 409 |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-E.2; BE-E2-01: • Response status code : HTTP 409 • Body contains : { "statusCode": 409, "error": "...", "code": "Conflict (doublon, état incompatible)" } • No side effects in database |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | Jun 6, 2026 |Browser | N/A - API testing with Postman/Newman |
| Test Type | API Automated Test - Postman/Newman |Database | N/A - not directly exposed during API testing |
| Priority | MEDIUM | OS | Windows 10 |
|  | |Server | identity.physio.agregatech.com |

| Field | Value | Field | Value |
|------|--------|------|--------|
| **Testing Preconditions:**   | API base URL available; credentials and tokens as per Postman environment. Target: POST /api/v1/kine/profiles. |**Required Information:**  | Base URL: https://identity.physio.agregatech.com; Traceability: US-E.2 — BE-E2-01. Execution: Newman/Postman. |



| Field | Value |
|-------|--------|
|**Notes** |  |

---

### TEST SCRIPT STEPS / RESULTS - STC-PROFILE-ADD-004/B | Add MEMBER conflict 409

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-PROFILE-ADD-004B (STC-PROFILE-ADD-004/B \| Add MEMBER conflict 409) | POST https://identity.physio.agregatech.com/api/v1/kine/profiles \| Body: { "profileType": "MEMBER", "subscriptionPlanId": "507f1f77bcf86cd799439011", "cabinetId": "6a0e174e73797a63a4ac8464" } \| Headers: Content-Type: application/json | • Response status code : HTTP 409 • Body contains : { "statusCode": 409, "error": "...", "code": "Conflict (doublon, état incompatible)" } • No side effects in database Execution sheet: HTTP ∈ {409}. | 400 Bad Request in 87 ms 1 failed, 2 passed. expected [ 409, 201 ] to include 400 Body keys: code: VALIDATION_FAILED; message: Request payload is invalid.; errors: {…}; statusCode: 400; error: BadRequestException expected [ 409, 201 ] to include 400 | HTTP 409 | FAIL | BUG-PROFILE-004 | Medium |

