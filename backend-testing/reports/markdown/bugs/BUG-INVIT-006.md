# Bug Report Template

## 1. Bug Report

| Field | Value |
|-------|--------|
| **ID Number#** | BUG-INVIT-006 |
| **Title** | STC-INVIT-GEN-007B: POST — Preview conflict 409 |
| **Reporter** | Oussema Karbia |
| **Submit Date** | Jun 6, 2026 |
| **Verifier** |  |

---

## 2. Bug Overview

| Field | Value |
|-------|--------|
| **Summary** | STC-INVIT-GEN-007B: STC-INVIT-GEN-007/B \| Preview conflict 409 — HTTP 400 Bad Request; Excel-allowed HTTP {409}. Also: expected [ 409, 200 ] to include 400 |
| **Test Data** | POST https://identity.physio.agregatech.com/api/v1/kine/auth/invitations/preview \| Body: { "invitationToken": "", "email": "existing@example.fr" } \| Headers: Content-Type: application/json |
| **URL** | https://identity.physio.agregatech.com/api/v1/kine/auth/invitations/preview |
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
| **Precondition** | STC STC-INVIT-GEN-007/B mapped to this request; authenticated context per collection (tokens as saved in environment). |
| **Steps to Reproduce** | 1. Configure environment: base URL https://identity.physio.agregatech.com.<br>2. In Postman/Newman, open the request named "STC-INVIT-GEN-007/B \| Preview conflict 409".<br>3. Send POST to https://identity.physio.agregatech.com/api/v1/kine/auth/invitations/preview with the collection's body and headers.<br>4. Observe HTTP status, response body, and Newman test assertions. |
| **Expected Result** | • Response status code : HTTP 409 • Body contains : { "statusCode": 409, "error": "...", "code": "Conflict (doublon, état incompatible)" } • No side effects in database Allowed HTTP status (execution sheet): {409}. Align API with spreadsheet specification or adjust Newman tests after agreement. |
| **Actual Result** | 400 Bad Request in 63 ms. 1 failed, 1 passed. expected [ 409, 200 ] to include 400 — expected [ 409, 200 ] to include 400 |

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
| **Notes** | expected [ 409, 200 ] to include 400 \| Excel Expected Result requires HTTP in {409}; received 400. |

