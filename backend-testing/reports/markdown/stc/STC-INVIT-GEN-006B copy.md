# Software Test Case Sheet

**QA Governance / Test Evidence / Audit Traceability**

| Meta | Value |
|------|--------|
| **Document Ref** | QM-STC |
| **Version** | V02R00 |
| **Suffix** | `/B` (Backend API) |
| **Classification** | Internal — Confidential |

---

## Test Case — XXX & Connect — STC-INVIT-GEN-006B

### 01 — Identification

| Field | Value | Field | Value |
|-------|--------|-------|--------|
| **Project** | XXX & Connect | **STC ID** | STC-INVIT-GEN-006/B |
| **User story** | US-B.1 — BE-B1-02 | **Requirement ID** | BE-B1-02 |
| **Module** | Invitations — Generate / Preview | **Feature name** | Preview invitation without auth — 401 |
| **Test type** | Backend (API) | **Traceability ref** | STC-INVIT-GEN-006/B |
| **Acceptance criteria (sheet)** | HTTP **401** | **Postman collection** | PHYSIO - KINE Backend |
| **Linked defect** | **BUG-INVIT-005** | | |

**Test objective**

Verify that `POST /api/v1/kine/auth/invitations/preview` without a Bearer token returns HTTP **401 Unauthorized** with an appropriate error body and no side effects. Negative security / auth boundary test.

**Acceptance criteria (execution)**

- [ ] HTTP status **401** Unauthorized
- [ ] Body indicates unauthorized / invalid credentials context
- [ ] Newman assertion `status 401` passes
- [x] **Failed** — API returned **400**; defect **BUG-INVIT-005** opened

---

### 02 — Classification and governance

| Field | Value |
|-------|--------|
| **Priority** | High (P1) |
| **Risk level** | High |
| **Execution status** | **Failed** |
| **Automation** | Postman / Newman (automated) |
| **Automation script ref** | `postman/physio-backend/PHYSIO-KINE-Backend.postman_collection.json` |
| **Request name** | `STC-INVIT-GEN-006/B \| Preview without auth 401` |
| **Regression flag** | Yes |
| **Defect reference** | **BUG-INVIT-005** |

---

### 03 — Test run information

| Field | Value | Field | Value |
|-------|--------|-------|--------|
| **Tester name** | Oussema Karbia (Newman automated) | **Reviewer** | — |
| **Date(s) of test** | 14 May 2026 | **Execution duration** | 69 ms |
| **Test type** | API automated — Postman/Newman | **Execution cycle** | Sprint 1 — Backend STC run |

---

### 04 — Test environment

| Field | Value | Field | Value |
|-------|--------|-------|--------|
| **Environment** | Staging | **Application version** | Identity API (staging) |
| **Server / base URL** | `https://identity.physio.agregatech.com` | **API endpoint** | `POST /api/v1/kine/auth/invitations/preview` |
| **Browser** | N/A (API) | **Operating system** | Windows 10 |
| **Database** | N/A (not exposed during API test) | **Tool** | Postman + Newman |

---

### 05 — Preconditions and test data

| Field | Content |
|-------|---------|
| **Preconditions** | Base URL reachable; request sent with **No Auth** (no `Authorization` header); invalid or placeholder `invitationToken` in body per collection. |
| **Postconditions** | Expected: 401, no preview data leaked. **Observed:** 400 — behaviour under review (see BUG-INVIT-005). |
| **Dependencies** | `PHYSIO-Backend-Execution` environment; KINE Backend collection. |

**Test data**

| Item | Value |
|------|--------|
| **Method** | POST |
| **URL** | `{{baseUrl}}/api/v1/kine/auth/invitations/preview` |
| **Auth** | **None** (`auth.type: noauth` in collection) |
| **Headers** | `Content-Type: application/json` |
| **Body** | `{ "invitationToken": "invalid-or-missing-context" }` |

---

### 06 — Test script steps / results

| ID | Action / test step | Expected result | Actual result | Status |
|----|-------------------|-----------------|---------------|--------|
| 1 | Send POST to invitation preview **without** Bearer token and with invalid token in body. | HTTP **401**; unauthorized error body; Newman tests pass. | **400** Bad Request in 69 ms; `code: FIELD_NOT_APPLICABLE`; Newman: *expected status 401 but got 400* (1 failed, 1 passed). | **FAIL** |

| Field | Value |
|-------|--------|
| **Acceptance criteria met** | HTTP 401 (not met) |
| **PASS/FAIL** | **FAIL** |
| **Bug ID** | **BUG-INVIT-005** |
| **Severity** | Medium |

---

### 07 — Execution summary

| Field | Value |
|-------|--------|
| **Total steps** | 1 |
| **Steps passed** | 0 |
| **Steps failed** | 1 |
| **Overall result** | **FAILED** |
| **Evidence reference** | Postman / Newman run; linked bug report `reports/markdown/bugs/BUG-INVIT-005.md` |

**Execution notes**

| Item | Value |
|------|--------|
| Newman status | failed (assertion on status code) |
| Collection | PHYSIO - KINE Backend |
| Root cause (summary) | API returns **400** where specification expects **401** for unauthenticated preview |
| Next action | Track in **BUG-INVIT-005** — align API or update spec after team agreement |

---

### 08 — Traceability to defect

| STC field | Bug report field |
|-----------|------------------|
| STC-INVIT-GEN-006/B | BUG-INVIT-005 — Title references same STC |
| Expected HTTP 401 | Expected result: HTTP 401 |
| Actual HTTP 400 | Actual result: HTTP 400 |
| Bug ID column | Bug ID **BUG-INVIT-005** |

---

*QM-STC / V02R00 — Example for academic report (failed backend STC → linked bug)*
