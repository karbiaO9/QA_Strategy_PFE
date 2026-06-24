# Bug Report Template

## 1. Bug Report

| Field | Value |
|-------|--------|
| **ID Number#** | BUG-PROFILE-005 |
| **Title** | STC-PROFILE-UPDATE-001B: PATCH — Patch profile allowed fields |
| **Reporter** | Oussema Karbia |
| **Submit Date** | Jun 6, 2026 |
| **Verifier** |  |

---

## 2. Bug Overview

| Field | Value |
|-------|--------|
| **Summary** | STC-PROFILE-UPDATE-001B: STC-PROFILE-UPDATE-001/B \| Patch profile allowed fields — assertion failure (HTTP 400 Bad Request). expected [ 200, 201 ] to include 400 |
| **Test Data** | PATCH https://identity.physio.agregatech.com/api/v1/kine/profiles/6a0e174e73797a63a4ac8467 \| Body: { "isReplacement": true } \| Headers: Content-Type: application/json |
| **URL** | https://identity.physio.agregatech.com/api/v1/kine/profiles/6a0e174e73797a63a4ac8467 |
| **Screenshot** | Use Newman HTML/JSON export for this run for full request/response capture. |

---

## 3. Environment

| Field | Value |
|-------|--------|
| **Platform** | Backend API |
| **Operating System** | Windows 10 |
| **Browser** | N/A - API testing with Postman/Newman |

---

## 4. Bug Details

| Field | Value |
|-------|--------|
| **Precondition** | STC STC-PROFILE-UPDATE-001/B mapped to this request; authenticated context per collection (tokens as saved in environment). |
| **Steps to Reproduce** | 1. Configure environment: base URL https://identity.physio.agregatech.com.<br>2. In Postman/Newman, open the request named "STC-PROFILE-UPDATE-001/B \| Patch profile allowed fields".<br>3. Send PATCH to https://identity.physio.agregatech.com/api/v1/kine/profiles/6a0e174e73797a63a4ac8467 with the collection's body and headers.<br>4. Observe HTTP status, response body, and Newman test assertions. |
| **Expected Result** | Cas nominal validé selon les AC du ticket : • PATCH /api/v1/kine/profilees/:profileeId scoped au Compte authentifié • Whitelist stricte : isActive (false only), isReplacement, school, academicYear, justificatifUrl • LIBERAL toggle isReplacement=true bascule pr... Align API with spreadsheet specification or adjust Newman tests after agreement. |
| **Actual Result** | 400 Bad Request in 64 ms. 1 failed, 1 passed. expected [ 200, 201 ] to include 400 — expected [ 200, 201 ] to include 400 |

---

## 5. Bug Tracking

| Field | Value |
|-------|--------|
| **Assigned To** |  |
| **Severity** | ☒ Blocking ☒ Medium ☒ Minor  ☒ Weak|
| **Priority** | ☒ Immediate  ☒ high ☒ Medium  ☒ Low |
| **Status** | ☒ New ☒ High ☒ Closed  |
| **Bug Type** | ☒ Functional  ☒ UI  ☒ Performance  ☒ Security  ☒ Compatibility |
| **Resolution Date** |  |

---

## 6. Notes

| Field | Value |
|-------|--------|
| **Notes** | expected [ 200, 201 ] to include 400 |

