# Bug Report Template

## 1. Bug Report

| Field | Value |
|-------|--------|
| **ID Number#** | BUG-PROFILE-002 |
| **Title** | STC-PROFILE-SELECT-005B: POST — Select invalid profileId 400 |
| **Reporter** | Oussema Karbia |
| **Submit Date** | Jun 6, 2026 |
| **Verifier** |  |

---

## 2. Bug Overview

| Field | Value |
|-------|--------|
| **Summary** | STC-PROFILE-SELECT-005B: STC-PROFILE-SELECT-005/B \| Select invalid profileId 400 — assertion failure (HTTP 400 Bad Request). expected 'VALIDATION_FAILED' to deeply equal 'PROFILE_ID_INVALID' |
| **Test Data** | POST https://identity.physio.agregatech.com/api/v1/kine/auth/select-profile \| Body: { "profileId": "abc123" } \| Headers: Content-Type: application/json |
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
| **Precondition** | STC STC-PROFILE-SELECT-005/B mapped to this request; authenticated context per collection (tokens as saved in environment). |
| **Steps to Reproduce** | 1. Configure environment: base URL https://identity.physio.agregatech.com.<br>2. In Postman/Newman, open the request named "STC-PROFILE-SELECT-005/B \| Select invalid profileId 400".<br>3. Send POST to https://identity.physio.agregatech.com/api/v1/kine/auth/select-profile with the collection's body and headers.<br>4. Observe HTTP status, response body, and Newman test assertions. |
| **Expected Result** | • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'PROFILE_ID_INVALID' } Allowed HTTP status (execution sheet): {400}. Align API with spreadsheet specification or adjust Newman tests after agreement. |
| **Actual Result** | 400 Bad Request in 67 ms. 1 failed, 2 passed. expected 'VALIDATION_FAILED' to deeply equal 'PROFILE_ID_INVALID' — expected 'VALIDATION_FAILED' to deeply equal 'PROFILE_ID_INVALID' |

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
| **Notes** | expected 'VALIDATION_FAILED' to deeply equal 'PROFILE_ID_INVALID' |

