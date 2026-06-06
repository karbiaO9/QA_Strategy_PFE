# Bug Report

**QA Governance / Defect Traceability**

| Meta | Value |
|------|--------|
| **Document** | Bug report (linked to STC) |
| **Classification** | Internal — Confidential |

---

## 1 — Bug identification

| Field | Value |
|-------|--------|
| **Bug ID** | BUG-INVIT-005 |
| **Title** | STC-INVIT-GEN-006/B — Preview without auth returns 400 instead of 401 |
| **Related STC** | STC-INVIT-GEN-006/B (`STC-INVIT-GEN-006B`) |
| **Reporter** | Oussema Karbia |
| **Submit date** | 14 May 2026 |
| **Verifier** | — |

---

## 2 — Bug overview

| Field | Value |
|-------|--------|
| **Summary** | Unauthenticated `POST /api/v1/kine/auth/invitations/preview` returns **400 Bad Request** instead of the specified **401 Unauthorized**. Newman assertion fails; STC sheet marked **FAIL** with Bug ID **BUG-INVIT-005**. |
| **Module** | Invitations — Generate / Preview |
| **User story** | US-B.1 — BE-B1-02 |
| **Severity** | Medium |
| **Priority** | High |
| **Status** | New |
| **Bug type** | Functional (API contract) |

---

## 3 — Environment

| Field | Value |
|-------|--------|
| **Platform** | Backend API (Identity service) |
| **Base URL** | `https://identity.physio.agregatech.com` |
| **Operating system** | Windows 10 |
| **Browser** | N/A — Postman / Newman |
| **Collection** | PHYSIO - KINE Backend |
| **Environment file** | PHYSIO-Backend-Execution |

---

## 4 — Reproduction

| Field | Value |
|-------|--------|
| **Preconditions** | Staging API available; Postman request **STC-INVIT-GEN-006/B \| Preview without auth 401**; auth set to **No Auth** (no Bearer token). |
| **Steps to reproduce** | 1. Set `baseUrl` to `https://identity.physio.agregatech.com`.<br>2. Open request **STC-INVIT-GEN-006/B \| Preview without auth 401** in collection PHYSIO - KINE Backend.<br>3. Ensure **Authorization: No Auth**.<br>4. Body: `{ "invitationToken": "invalid-or-missing-context" }`.<br>5. Send POST and run Tests tab (Newman). |
| **Test data** | See STC sheet `STC-INVIT-GEN-006B copy.md` — section 05 Test data |

**Request summary**

| Item | Value |
|------|--------|
| **Method** | POST |
| **URL** | `/api/v1/kine/auth/invitations/preview` |
| **Auth** | None |
| **Body** | `{ "invitationToken": "invalid-or-missing-context" }` |

---

## 5 — Expected vs actual

| Field | Value |
|-------|--------|
| **Expected result** | HTTP **401** Unauthorized; body indicates unauthorized / invalid token context; no preview processing; no DB side effects. Execution sheet allows HTTP ∈ {401}. |
| **Actual result** | HTTP **400** Bad Request in ~69 ms; body `code: FIELD_NOT_APPLICABLE`; Newman: *expected response to have status code 401 but got 400* (1 failed, 1 passed). |
| **Impact** | STC-INVIT-GEN-006/B fails; auth-error semantics may differ from product spec (401 vs 400). |

---

## 6 — Traceability (STC ↔ Bug)

| Source | Reference |
|--------|-----------|
| **STC ID** | STC-INVIT-GEN-006/B |
| **STC report** | `reports/markdown/stc/STC-INVIT-GEN-006B copy.md` |
| **Postman request** | `STC-INVIT-GEN-006/B \| Preview without auth 401` |
| **STC mapping** | `postman/physio-backend/STC_MAPPING.md` |
| **Automation** | `PHYSIO-KINE-Backend.postman_collection.json` (Tests: `pm.response.to.have.status(401)`) |
| **Generated from** | Newman run → `generate-md-reports-from-newman.js` |

---

## 7 — Bug tracking

| Field | Value |
|-------|--------|
| **Assigned to** | — |
| **Severity** | Medium |
| **Priority** | High |
| **Status** | New |
| **Bug type** | Functional |
| **Resolution date** | — |
| **Retest STC** | STC-INVIT-GEN-006/B (after fix) |

---

## 8 — Evidence

| Field | Value |
|-------|--------|
| **Screenshot / export** | Postman response panel (400); Newman HTML/JSON report for failed assertion |
| **STC evidence** | Failed row in STC-INVIT-GEN-006B — PASS/FAIL = **FAIL**, Bug ID = **BUG-INVIT-005** |

---

## 9 — Notes

| Field | Value |
|-------|--------|
| **Notes** | Specification (Excel / execution sheet) requires HTTP **401** for unauthenticated preview; API currently responds with **400**. Team to decide: fix API to return 401, or update STC/Newman if 400 is the intended contract. |

---

*Example for academic report — defect linked from failed backend STC STC-INVIT-GEN-006/B*
