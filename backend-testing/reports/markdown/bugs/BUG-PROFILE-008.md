# Bug Report Template

## 1. Bug Report

| Field | Value |
|-------|--------|
| **ID Number#** | BUG-PROFILE-008 |
| **Title** | STC-PROFILE-UPDATE-004B: PATCH — Patch assistant field N/A 400 |
| **Reporter** | Oussema Karbia |
| **Submit Date** | Jun 7, 2026 |
| **Verifier** |  |

---

## 2. Bug Overview

| Field | Value |
|-------|--------|
| **Summary** | STC-PROFILE-UPDATE-004B: STC-PROFILE-UPDATE-004/B \| Patch assistant field N/A 400 — HTTP 401 Unauthorized; Excel-allowed HTTP {400}. Also: expected [ 400, 200 ] to include 401 |
| **Test Data** | PATCH https://identity.physio.agregatech.com/api/v1/kine/profiles/6a0e174e73797a63a4ac8467 \| Body: { "professionalNumber": "123456789" } \| Headers: Content-Type: application/json |
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
| **Precondition** | STC STC-PROFILE-UPDATE-004/B mapped to this request; authenticated context per collection (tokens as saved in environment). |
| **Steps to Reproduce** | 1. Configure environment: base URL https://identity.physio.agregatech.com.<br>2. In Postman/Newman, open the request named "STC-PROFILE-UPDATE-004/B \| Patch assistant field N/A 400".<br>3. Send PATCH to https://identity.physio.agregatech.com/api/v1/kine/profiles/6a0e174e73797a63a4ac8467 with the collection's body and headers.<br>4. Observe HTTP status, response body, and Newman test assertions. |
| **Expected Result** | • Response status code : HTTP 400 • Body contains : { "statusCode": 400, "error": "...", "code": "FIELD_NOT_APPLICABLE" } • No side effects in database Allowed HTTP status (execution sheet): {400}. Align API with spreadsheet specification or adjust Newman tests after agreement. |
| **Actual Result** | 401 Unauthorized in 154 ms. 2 failed, 1 passed. expected [ 400, 200 ] to include 401 \| expected 'TOKEN_INVALID' to deeply equal 'FIELD_NOT_APPLICABLE' — expected [ 400, 200 ] to include 401 |

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
| **Notes** | expected [ 400, 200 ] to include 401 \| expected 'TOKEN_INVALID' to deeply equal 'FIELD_NOT_APPLICABLE' |

