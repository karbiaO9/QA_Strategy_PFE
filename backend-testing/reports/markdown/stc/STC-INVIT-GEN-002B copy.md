# Software Test Case Sheet
---

## 01 - Test Case Identification

| Field | Value | Field | Value |
|-------|--------|-------|--------|
| **Project** *(required)* | XXX & Connect | **STC ID** *(required)* | STC-INVIT-GEN-002/B |
| **Test Suite ID** | INVIT-GEN-BACKEND | **Requirement ID** | US-B.1 — BE-B1-02 |
| **Module / Component** | Invitations — Generate / Preview | **Feature Name** | Preview invitation token (MEMBER + ASSISTANT) |
| **Sprint ID** | Sprint 1 — Invitations | **Release ID** | R2026.05 |
| **Build Number** | Staging (continuous) | **API Version** | v1 (Kine identity API) |
| **Traceability Ref** | STC-INVIT-GEN-002/B | **Compliance Impact** | - [ ] Yes - [ ] No - [x] Partial |

**User Story** *(As a [role], I want to … so that …)*

As a cabinet administrator (Kine), I want to preview an invitation token before sharing it, so that I can confirm recipient context (`accountExists`, cabinet, role) without consuming the token.

**Test Objective** *(required)*

Verify that `POST /api/v1/kine/auth/invitations/preview` accepts a valid `invitationToken` for MEMBER and ASSISTANT flows, validates token integrity (signature, `jti`, TTL), and returns HTTP **200** with the expected preview payload; confirm error semantics **401** (expired) and **409** (consumed) per specification when applicable.

**Acceptance criteria (spec):**

- [ ] POST accepts `{ invitationToken }` with authenticated Kine caller (`Bearer {{kineToken}}`).
- [ ] Token validity checked (signature, `jti`, TTL).
- [ ] Response includes `accountExists`, `cabinetName`, `inviterName`, `role`.
- [ ] Step 1 — MEMBER preview: HTTP **200**; Newman passes.
- [ ] Step 2 — ASSISTANT preview: HTTP **200**; Newman passes.
- [x] **Failed** — both steps returned **400**; defects **BUG-INVIT-002** (step 1), **BUG-INVIT-003** (step 2).

---

## 02 - Test Classification and Governance

**Test Type** *(required)*

- [x] Functional - [ ] UI / UX - [x] Integration - [x] API - [ ] Performance - [ ] Security - [ ] Compatibility - [ ] Regression - [ ] Smoke

**Priority** *(required)*

- [ ] Critical - [x] High (P1) - [ ] Medium - [ ] Low

**Risk Level**

- [ ] Critical - [x] High - [ ] Medium - [ ] Low

**Execution Status**

- [ ] Not Run - [ ] In Progress - [ ] Passed - [x] Failed - [ ] Blocked - [ ] Skipped

| Field | Value | Field | Value |
|-------|--------|-------|--------|
| **Regression Flag** | - [x] Yes - [ ] No | **Automation Flag** | - [x] Automated - [ ] Manual - [ ] Hybrid |
| **Automation Script Ref** | `postman/physio-backend/PHYSIO-KINE-Backend.postman_collection.json` (STC-INVIT-GEN-002/B) | **CI/CD Pipeline Ref** | Local / academic Newman run |
| **Postman Collection Ref** | PHYSIO - KINE Backend · `STC-INVIT-GEN-002/B \| Preview invitation token` | **Retest Required** | - [x] Yes - [ ] No |
| **Defect Reference** | BUG-INVIT-002 (step 1), BUG-INVIT-003 (step 2) | **Approval Status** | - [ ] Draft - [x] Under Review - [ ] Approved - [ ] Rejected |
| **Security Classification** | - [ ] Public - [x] Internal - [ ] Confidential - [ ] Restricted | | |

---

## 03 - Test Run Information

| Field | Value | Field | Value |
|-------|--------|-------|--------|
| **Tester Name** *(required)* | Newman (automated by Karbia Oussema) | **Reviewer** | Mohammed Hedi Limem |
| **QA Validator** | Mohammed Hedi Limem | **Date(s) of Test** *(required)* | 14 May 2026 |
| **User Role Tested** | Kine practitioner / cabinet admin (test account) | **Tenant / Organisation** | Test cabinet (staging) |
| **Execution Duration** | 00:00:00.133 | **Execution Cycle** | Academic report — Cycle 1 / Staging validation |

---

## 04 - Test Environment

| Field | Value | Field | Value |
|-------|--------|-------|--------|
| **Environment Type** | - [ ] Dev - [x] Staging - [ ] UAT - [ ] Production | **Application Version** *(required)* | Identity API (staging deployment) |
| **Server / Base URL** | `https://identity.physio.agregatech.com` | **API Endpoint** | `POST /api/v1/kine/auth/invitations/preview` |
| **Browser** | N/A — Postman / Newman | **Operating System** | Windows 10 (win32) |
| **Database** | N/A (backend API integration) | **Device / Form Factor** | N/A — API only |

---

## 05 - Preconditions, Postconditions and Dependencies

| Field | Content |
|-------|---------|
| **Preconditions** *(required)* | Identity API reachable at base URL; `{{kineToken}}` set via Kine login prerequisite; **`{{invitationToken}}`** populated from prior generate-invitation step (e.g. STC-INVIT-GEN-001/B) for each profile type under test. |
| **Postconditions** | Expected: HTTP **200** and preview payload; token not consumed. **Observed:** HTTP **400** on both steps — see linked bug reports. |
| **Dependencies** | `PHYSIO-Backend-Execution` environment; PHYSIO - KINE Backend collection; invitation generation chain. |
| **Assumptions** | Newman Tests assert `pm.response.to.have.status(200)`; empty `invitationToken` in run indicates broken env chain. |
| **Required Test Data** | See table below (tokens via Postman environment — not stored in this document). |
| **General Notes** | Step 1 → **BUG-INVIT-002** · Step 2 → **BUG-INVIT-003** |

**Test data (common request)**

| Item | Value |
|------|--------|
| **Method** | POST |
| **URL** | `{{baseUrl}}/api/v1/kine/auth/invitations/preview` |
| **Auth** | Bearer `{{kineToken}}` |
| **Body** | `{ "invitationToken": "{{invitationToken}}" }` |

---

## 06 - Test Script Steps / Results

| # | Action / Test Step | Test Data | Expected Result | Actual Result | Status |
|---|-------------------|-----------|-----------------|---------------|--------|
| 1 | **MEMBER** — Send POST to preview invitation (authenticated Kine). | `Authorization: Bearer {{kineToken}}` · Body: `{ "invitationToken": "{{invitationToken}}" }` (MEMBER token) | HTTP **200**; preview fields (`accountExists`, `cabinetName`, `inviterName`, `role`); Newman `status 200` passes. | **400** Bad Request in 65 ms; `code: FIELD_NOT_APPLICABLE`; Newman: *expected 200 but got 400* (1 failed, 1 passed). Defect **BUG-INVIT-002**. | **Fail** |
| 2 | **ASSISTANT** — Send POST to preview ASSISTANT invitation (same endpoint). | Same headers · Body: `{ "invitationToken": "{{invitationToken}}" }` (ASSISTANT token) | HTTP **200**; preview payload returned; Newman passes. | **400** Bad Request in 68 ms; same error pattern (1 failed, 0 passed). Defect **BUG-INVIT-003**. | **Fail** |

*Status legend:* Pass / Fail / Blocked / N/A · *Severity (if fail):* C Critical / H High / M Medium / L Low

---

## 07 - Execution Summary

| Field | Value | Field | Value |
|-------|--------|-------|--------|
| **Total Steps** | 2 | **Steps Passed** | 0 |
| **Steps Failed** | 2 | **Blocked / Skipped** | 0 |
| **Overall Result** | **FAILED** | | |
| **Evidence Reference** | Postman / Newman JSON export; bug reports `BUG-INVIT-002 copy.md`, `BUG-INVIT-003.md` | **Attachment Reference** | Academic report — Figure: failed backend STC (2 steps → 2 bugs) |

**Execution notes**

| Item | Value |
|------|--------|
| Newman status | failed |
| Collection | PHYSIO - KINE Backend |
| Base URL | `https://identity.physio.agregatech.com` |
| Duration | ~133 ms (2 steps) |
| Executed at | 2026-05-14 (Sprint 1 backend run) |
| Spec source | Sprint 1 backend execution sheet / `STC_MAPPING.md` |
| Automation source | `PHYSIO-KINE-Backend.postman_collection.json` (Tests: `pm.response.to.have.status(200)`) |

---

## 08 - Reviewer and Approval Workflow

| Field | Value | Field | Value |
|-------|--------|-------|--------|
| **QA Tester** | Karbia Oussema | **Review Date** | 2026-05-15 |
| **QA Validator Name** | Mohammed Hedi Limem | **Validation Date** | 2026-05-16 |
| **Approver Name** | Mohammed Hedi Limem | **Approval Date** | 2026-05-16 |

---

**Date:** _______________________ **Signature:** _______________________

*QM-STC / V02R00 | Client XXX × Pura Solutions SARL | Contrat PURA-PC-2025-001 | Ce document fait partie du dossier de livraison du sprint.*

---

*Generated from Newman test **STC-INVIT-GEN-002/B** — PHYSIO - KINE Backend — 2026-05-14 — 2 steps failed — BUG-INVIT-002, BUG-INVIT-003*
