# Bug Report Template

## 1. Bug Report

| Field | Value |
|-------|--------|
| **ID Number#** | BUG-PWD-003 |
| **Title** | STC-PWD-CHANGE-002B: POST — Change password same as old 400 |
| **Reporter** | Oussema Karbia |
| **Submit Date** | Jun 7, 2026 |
| **Verifier** |  |

---

## 2. Bug Overview

| Field | Value |
|-------|--------|
| **Summary** | STC-PWD-CHANGE-002B: STC-PWD-CHANGE-002/B \| Change password same as old 400 — HTTP 401 Unauthorized; Excel-allowed HTTP {400}. Also: expected response to have status code 400 but got 401 |
| **Test Data** | POST https://identity.physio.agregatech.com/api/v1/kine/auth/change-password \| Body: { "newPassword": "KineAdmin123!", "currentPassword": "KineAdmin123!", "newPasswordConfirmation": "KineAdmin123!" } \| Headers: Content-Type: application/json; Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTBlMTc0ZTczNzk3YTYzYTRhYzg0NjEiLCJlbWFpbCI6InNvcGhpZS5tYXJ0aW5AY2FiaW5ldC1wYXJpcy5mciIsInR5cGUiOiJraW5lIiwiY2FiaW5ldElkIjpudWxsLCJyb2xlU2x1ZyI6IiIsInYiOjMxLCJpYXQ… |
| **URL** | https://identity.physio.agregatech.com/api/v1/kine/auth/change-password |
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
| **Precondition** | STC STC-PWD-CHANGE-002/B mapped to this request; authenticated context per collection (tokens as saved in environment). |
| **Steps to Reproduce** | 1. Configure environment: base URL https://identity.physio.agregatech.com.<br>2. In Postman/Newman, open the request named "STC-PWD-CHANGE-002/B \| Change password same as old 400".<br>3. Send POST to https://identity.physio.agregatech.com/api/v1/kine/auth/change-password with the collection's body and headers.<br>4. Observe HTTP status, response body, and Newman test assertions. |
| **Expected Result** | • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'PASSWORD_SAME_AS_OLD' } • Le password in database reste inchangé Allowed HTTP status (execution sheet): {400}. Align API with spreadsheet specification or adjust Newman tests after agreement. |
| **Actual Result** | 401 Unauthorized in 155 ms. 2 failed, 1 passed. expected response to have status code 400 but got 401 \| expected [ Array(2) ] to include 'TOKEN_INVALID' — expected response to have status code 400 but got 401 |

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
| **Notes** | expected response to have status code 400 but got 401 \| expected [ Array(2) ] to include 'TOKEN_INVALID' |

