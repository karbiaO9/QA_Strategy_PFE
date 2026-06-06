# Bug Report Template

## 1. Bug Report

| Field | Value |
|-------|--------|
| **ID Number#** | BUG-INVIT-012 |
| **Title** | STC-INVIT-ATTACH-003B: POST — Attach invalid token 401 |
| **Reporter** | Oussema Karbia |
| **Submit Date** | May 14, 2026 |
| **Verifier** |  |

---

## 2. Bug Overview

| Field | Value |
|-------|--------|
| **Summary** | STC-INVIT-ATTACH-003B: STC-INVIT-ATTACH-003/B \| Attach invalid token 401 — HTTP 400 Bad Request; Excel-allowed HTTP {401}. Also: expected response to have status code 401 but got 400 |
| **Test Data** | POST https://identity.physio.agregatech.com/api/v1/kine/auth/invitations/attach \| Body: { "invitationToken": "invalid-or-expired-token", "password": "QaTest123!" } \| Headers: Content-Type: application/json |
| **URL** | https://identity.physio.agregatech.com/api/v1/kine/auth/invitations/attach |
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
| **Precondition** | STC STC-INVIT-ATTACH-003/B mapped to this request; authenticated context per collection (tokens as saved in environment). |
| **Steps to Reproduce** | 1. Configure environment: base URL https://identity.physio.agregatech.com.<br>2. In Postman/Newman, open the request named "STC-INVIT-ATTACH-003/B \| Attach invalid token 401".<br>3. Send POST to https://identity.physio.agregatech.com/api/v1/kine/auth/invitations/attach with the collection's body and headers.<br>4. Observe HTTP status, response body, and Newman test assertions. |
| **Expected Result** | • Response status code : HTTP 401 • Body contains : { "statusCode": 401, "error": "...", "code": "Unauthorized (token invalid / credentials incorrects)" } • No side effects in database Allowed HTTP status (execution sheet): {401}. Align API with spreadsheet specification or adjust Newman tests after agreement. |
| **Actual Result** | 400 Bad Request in 73 ms. 1 failed, 0 passed. expected response to have status code 401 but got 400 — expected response to have status code 401 but got 400 |

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
| **Notes** | expected response to have status code 401 but got 400 \| Excel Expected Result requires HTTP in {401}; received 400. |

