# Bug Report Template

## 1. Bug Report

| Field | Value |
|-------|--------|
| **ID Number#** | BUG-PROFILE-004 |
| **Title** | STC-PROFILE-SELECT-007B: POST — Select with inactive kine 403 |
| **Reporter** | Oussema Karbia |
| **Submit Date** | May 14, 2026 |
| **Verifier** |  |

---

## 2. Bug Overview

| Field | Value |
|-------|--------|
| **Summary** | STC-PROFILE-SELECT-007B: STC-PROFILE-SELECT-007/B \| Select with inactive kine 403 — HTTP 401 Unauthorized; Excel-allowed HTTP {403}. Also: expected [ 403, 200 ] to include 401 |
| **Test Data** | POST https://identity.physio.agregatech.com/api/v1/kine/auth/select-profile \| Body: { "profileId": "6a04a5695097a1ea13a2a999" } \| Headers: Content-Type: application/json; Authorization: Bearer |
| **URL** | https://identity.physio.agregatech.com/api/v1/kine/auth/select-profile |
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
| **Precondition** | STC STC-PROFILE-SELECT-007/B mapped to this request; authenticated context per collection (tokens as saved in environment). |
| **Steps to Reproduce** | 1. Configure environment: base URL https://identity.physio.agregatech.com.<br>2. In Postman/Newman, open the request named "STC-PROFILE-SELECT-007/B \| Select with inactive kine 403".<br>3. Send POST to https://identity.physio.agregatech.com/api/v1/kine/auth/select-profile with the collection's body and headers.<br>4. Observe HTTP status, response body, and Newman test assertions. |
| **Expected Result** | • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "KINE_INACTIVE" } • No side effects in database Allowed HTTP status (execution sheet): {403}. Align API with spreadsheet specification or adjust Newman tests after agreement. |
| **Actual Result** | 401 Unauthorized in 81 ms. 1 failed, 2 passed. expected [ 403, 200 ] to include 401 — expected [ 403, 200 ] to include 401 |

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
| **Notes** | expected [ 403, 200 ] to include 401 \| Excel Expected Result requires HTTP in {403}; received 401. |

