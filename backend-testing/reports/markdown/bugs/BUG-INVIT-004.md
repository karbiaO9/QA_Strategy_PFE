# Bug Report Template

## 1. Bug Report

| Field | Value |
|-------|--------|
| **ID Number#** | BUG-INVIT-004 |
| **Title** | STC-INVIT-GEN-005B: POST — Generate invitation forbidden 403 |
| **Reporter** | Oussema Karbia |
| **Submit Date** | Jun 7, 2026 |
| **Verifier** |  |

---

## 2. Bug Overview

| Field | Value |
|-------|--------|
| **Summary** | STC-INVIT-GEN-005B: STC-INVIT-GEN-005/B \| Generate invitation forbidden 403 — HTTP 400 Bad Request; Excel-allowed HTTP {403}. Also: expected [ 403, 201 ] to include 400 |
| **Test Data** | POST https://identity.physio.agregatech.com/api/v1/kine/auth/invitations \| Body: { "email": "jean.nouveau.member@testmail.fr", "targetProfileType": "MEMBER" } \| Headers: Content-Type: application/json |
| **URL** | https://identity.physio.agregatech.com/api/v1/kine/auth/invitations |
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
| **Precondition** | STC STC-INVIT-GEN-005/B mapped to this request; authenticated context per collection (tokens as saved in environment). |
| **Steps to Reproduce** | 1. Configure environment: base URL https://identity.physio.agregatech.com.<br>2. In Postman/Newman, open the request named "STC-INVIT-GEN-005/B \| Generate invitation forbidden 403".<br>3. Send POST to https://identity.physio.agregatech.com/api/v1/kine/auth/invitations with the collection's body and headers.<br>4. Observe HTTP status, response body, and Newman test assertions. |
| **Expected Result** | • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "Forbidden (permission refusée)" } • No side effects in database Allowed HTTP status (execution sheet): {403}. Align API with spreadsheet specification or adjust Newman tests after agreement. |
| **Actual Result** | 400 Bad Request in 154 ms. 1 failed, 1 passed. expected [ 403, 201 ] to include 400 — expected [ 403, 201 ] to include 400 |

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
| **Notes** | expected [ 403, 201 ] to include 400 \| Excel Expected Result requires HTTP in {403}; received 400. |

