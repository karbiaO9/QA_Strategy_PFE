# Software Test Case Sheet

**QA Governance / Test Evidence / Audit Traceability**

| Meta | Value |
|------|--------|
| **Document Ref** | QM-STC |
| **Version** | V02R00 |
| **Suffix** | `/B` (Backend API) |
| **Classification** | Internal — Confidential |

---

## Test Case — XXX & Connect — STC-PROFILE-ADD-005B

### 01 — Identification

| Field | Value | Field | Value |
|-------|--------|-------|--------|
| **Project** | XXX & Connect | **STC ID** | STC-PROFILE-ADD-005/B |
| **User story** | US-E.2 — BE-E2-02 | **Requirement ID** | BE-E2-02 |
| **Module** | Profiles — Admin add to Kine | **Feature name** | Admin add profile — validation 400 |
| **Test type** | Backend (API) | **Traceability ref** | STC-PROFILE-ADD-005/B |
| **Acceptance criteria (sheet)** | HTTP **400** | **Postman collection** | PHYSIO - ADMIN Backend |

**Test objective**

Verify that `POST /api/admin/v1/kines/:kineId/profiles` rejects invalid payloads with HTTP 400, returns a validation error body, and does not create a profile in the database.

**Acceptance criteria (execution)**

- [x] HTTP status **400** Bad Request
- [x] Response body includes validation error (`VALIDATION_FAILED` or equivalent)
- [x] Newman assertions pass
- [x] No defect raised

---

### 02 — Classification and governance

| Field | Value |
|-------|--------|
| **Priority** | Medium (P2) |
| **Risk level** | Medium |
| **Execution status** | Passed |
| **Automation** | Postman / Newman (automated) |
| **Automation script ref** | `postman/physio-backend/PHYSIO-ADMIN-Backend.postman_collection.json` |
| **Request name** | `STC-PROFILE-ADD-005/B \| Admin add profile validation 400` |
| **Regression flag** | Yes |
| **Defect reference** | — |

---

### 03 — Test run information

| Field | Value | Field | Value |
|-------|--------|-------|--------|
| **Tester name** | Oussema Karbia (Newman automated) | **Reviewer** | — |
| **Date(s) of test** | 14 May 2026 | **Execution duration** | 87 ms |
| **Test type** | API automated — Postman/Newman | **Execution cycle** | Sprint 1 — Backend STC run |

---

### 04 — Test environment

| Field | Value | Field | Value |
|-------|--------|-------|--------|
| **Environment** | Staging | **Application version** | Identity API (staging) |
| **Server / base URL** | `https://identity.physio.agregatech.com` | **API endpoint** | `POST /api/admin/v1/kines/{kineId}/profiles` |
| **Browser** | N/A (API) | **Operating system** | Windows 10 |
| **Database** | N/A (not exposed during API test) | **Tool** | Postman + Newman |

---

### 05 — Preconditions and test data

| Field | Content |
|-------|---------|
| **Preconditions** | Base URL reachable; admin token obtained via prerequisite login (`STC-AUTH-ADMIN-001/B` or env `{{adminToken}}`); valid `{{kineId}}` in environment. |
| **Postconditions** | No profile created; HTTP 400 only. |
| **Dependencies** | `PHYSIO-Backend-Execution` environment; ADMIN Backend collection. |

**Test data**

| Item | Value |
|------|--------|
| **Method** | POST |
| **URL** | `{{baseUrl}}/api/admin/v1/kines/{{kineId}}/profiles` |
| **Headers** | `Content-Type: application/json`; `Authorization: Bearer {{adminToken}}` |
| **Body** | `{ "profileType": "", "subscriptionPlanId": "bad-id" }` |

---

### 06 — Test script steps / results

| ID | Action / test step | Expected result | Actual result | Status |
|----|-------------------|-----------------|---------------|--------|
| 1 | Send POST with empty `profileType` and invalid `subscriptionPlanId` (admin bearer token). | HTTP **400**; validation error in body; Newman tests pass. | **400** Bad Request in 87 ms; `code: VALIDATION_FAILED`; 2 assertion(s) passed. | **PASS** |

| Field | Value |
|-------|--------|
| **Acceptance criteria met** | HTTP 400 |
| **PASS/FAIL** | **PASS** |
| **Bug ID** | — |
| **Severity** | — |

---

### 07 — Execution summary

| Field | Value |
|-------|--------|
| **Total steps** | 1 |
| **Steps passed** | 1 |
| **Steps failed** | 0 |
| **Overall result** | **PASSED** |
| **Evidence reference** | Postman run / Newman JSON export; academic report — passed backend example |

**Execution notes**

| Item | Value |
|------|--------|
| Newman status | passed |
| Collection | PHYSIO - ADMIN Backend |
| STC mapping | `postman/physio-backend/STC_MAPPING.md` (row STC-PROFILE-ADD-005/B) |

---

*QM-STC / V02R00 — Example for academic report (passed backend STC)*
