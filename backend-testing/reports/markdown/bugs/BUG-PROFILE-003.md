# Bug Report Template

## 1. Bug Report

| Field | Value |
|-------|--------|
| **ID Number#** | BUG-PROFILE-003 |
| **Title** | STC-PROFILE-SELECT-006B: POST — Select inactive profile 403 |
| **Reporter** | Oussema Karbia |
| **Submit Date** | May 14, 2026 |
| **Verifier** |  |

---

## 2. Bug Overview

| Field | Value |
|-------|--------|
| **Summary** | STC-PROFILE-SELECT-006B: STC-PROFILE-SELECT-006/B \| Select inactive profile 403 — HTTP 400 Bad Request; Excel-allowed HTTP {403}. Also: expected 'VALIDATION_FAILED' to deeply equal 'PROFILE_INACTIVE' |
| **Test Data** | POST https://identity.physio.agregatech.com/api/v1/kine/auth/select-profile \| Body: { "profileId": "" } \| Headers: Content-Type: application/json; Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTA0YTU2OTUwOTdhMWVhMTNhMmE5OTMiLCJlbWFpbCI6InNvcGhpZS5tYXJ0aW5AY2FiaW5ldC1wYXJpcy5mciIsInR5cGUiOiJraW5lIiwiY2FiaW5ldElkIjpudWxsLCJyb2xlU2x1ZyI6IiIsInYiOjgsImlhdCI… |
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
| **Precondition** | STC STC-PROFILE-SELECT-006/B mapped to this request; authenticated context per collection (tokens as saved in environment). |
| **Steps to Reproduce** | 1. Configure environment: base URL https://identity.physio.agregatech.com.<br>2. In Postman/Newman, open the request named "STC-PROFILE-SELECT-006/B \| Select inactive profile 403".<br>3. Send POST to https://identity.physio.agregatech.com/api/v1/kine/auth/select-profile with the collection's body and headers.<br>4. Observe HTTP status, response body, and Newman test assertions. |
| **Expected Result** | • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "PROFILE_INACTIVE" } • No side effects in database Allowed HTTP status (execution sheet): {403}. Align API with spreadsheet specification or adjust Newman tests after agreement. |
| **Actual Result** | 400 Bad Request in 84 ms. 1 failed, 2 passed. expected 'VALIDATION_FAILED' to deeply equal 'PROFILE_INACTIVE' — expected 'VALIDATION_FAILED' to deeply equal 'PROFILE_INACTIVE' |

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
| **Notes** | expected 'VALIDATION_FAILED' to deeply equal 'PROFILE_INACTIVE' \| Excel Expected Result requires HTTP in {403}; received 400. |

