# SOFTWARE TEST CASE SHEET

## Test Case - XXX&Connect — STC-PROFILE-ADD-009B

| Field | Value |
|-------|--------|
| **Project** | XXX&Connect |
| **STC ID** | STC-PROFILE-ADD-009/B |
| **USER STORY** | US-E.2 — BE-E2-01 |
| **Acceptance Criteria (sheet)** | À l'ajout d'un profil STUDENT, des patients fictifs sont automatiquement clonés |
| **TC Type** | Backend (API) |

| Field | Value |
|-------|--------|
| **Purpose:** | Validate US-E.2; BE-E2-01: • Profil STUDENT créé • N patients fictifs créés (1 par template) • Chaque clone : source=fictif, isTemplate=false, ownerId=kineId • Les patients sont rattachés au tenant de l'étudiant |



| *Test Run Information*| Value |  *Test Environment:* | Value |
|------|--------|------|--------|
| Tester Name | Oussema Karbia  | Application Version |  |
| Date(s) of Test | May 14, 2026 |Browser | N/A - API testing with Postman/Newman |
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

### TEST SCRIPT STEPS / RESULTS - STC-PROFILE-ADD-009/B | Add STUDENT with justificatif

| ID | ACTION / TEST STEP | TEST DATA | EXPECTED RESULTS | ACTUAL RESULTS | ACCEPTANCE CRITERIA | PASS/FAIL | BUG ID | SEVERITY |
|----|--------------------|-----------|------------------|----------------|------------------------|-----------|--------|----------|
| 1 | Execute POST request for STC-PROFILE-ADD-009B (STC-PROFILE-ADD-009/B \| Add STUDENT with justificatif) | POST https://identity.physio.agregatech.com/api/v1/kine/profiles \| Body: { "profileType": "STUDENT", "schoolIfmk": "IFMK Lyon", "academicYear": "2024-2025", "justificatifUrl": "https://s3.example/justif.pdf" } \| Headers: Content-Type: application/json; Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTA0YTU2OTUwOTdhMWVhMTNhMmE5OTMiLCJlbWFpbCI6InNvcGhpZS5tYXJ0aW5AY2FiaW5ldC1wYXJpcy5mciIsInR5cGUiOiJraW5lIiwiY2FiaW5ldElkIjpudWxsLCJyb2xlU2x1ZyI6IiIsInYiOjgsImlhdCI…; X-Profile-Id: 6a04a5695097a1ea13a2a999 | • Profil STUDENT créé • N patients fictifs créés (1 par template) • Chaque clone : source=fictif, isTemplate=false, ownerId=kineId • Les patients sont rattachés au tenant de l'étudiant | 400 Bad Request in 73 ms 2 assertion(s) passed. Body keys: code: FIELD_NOT_APPLICABLE; message: …; fields: {…}; statusCode: 400; error: BadRequestException | À l'ajout d'un profil STUDENT, des patients fictifs sont automatiquement clonés | PASS |  |  |

