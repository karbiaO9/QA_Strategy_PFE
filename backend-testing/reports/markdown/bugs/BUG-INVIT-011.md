# Bug Report Template

## 1. Bug Report

| Field | Value |
|-------|--------|
| **ID Number#** | BUG-INVIT-011 |
| **Title** | STC-INVIT-ACCEPT-003B: POST — Replay accept — INVITATION_ALREADY_USED 409 |
| **Reporter** | Oussema Karbia |
| **Submit Date** | May 14, 2026 |
| **Verifier** |  |

---

## 2. Bug Overview

| Field | Value |
|-------|--------|
| **Summary** | STC-INVIT-ACCEPT-003B: STC-INVIT-ACCEPT-003/B \| Replay accept — INVITATION_ALREADY_USED 409 — assertion failure (HTTP 400 Bad Request). expected response to have status code 409 but got 400 |
| **Test Data** | POST https://identity.physio.agregatech.com/api/v1/kine/auth/accept-invitation \| Body: { "invitationToken": "", "firstName": "Jean", "lastName": "Nouveau", "password": "QaTest123!", "passwordConfirmation": "QaTest123!", "cguAccepted": true } \| Headers: Content-Type: application/json |
| **URL** | https://identity.physio.agregatech.com/api/v1/kine/auth/accept-invitation |
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
| **Precondition** | STC STC-INVIT-ACCEPT-003/B mapped to this request; authenticated context per collection (tokens as saved in environment). |
| **Steps to Reproduce** | 1. Configure environment: base URL https://identity.physio.agregatech.com.<br>2. In Postman/Newman, open the request named "STC-INVIT-ACCEPT-003/B \| Replay accept — INVITATION_ALREADY_USED 409".<br>3. Send POST to https://identity.physio.agregatech.com/api/v1/kine/auth/accept-invitation with the collection's body and headers.<br>4. Observe HTTP status, response body, and Newman test assertions. |
| **Expected Result** | Newman assertions must pass for POST (expected behavior per story). |
| **Actual Result** | 400 Bad Request in 77 ms. 2 failed, 0 passed. expected response to have status code 409 but got 400 \| expected 'FIELD_NOT_APPLICABLE' to deeply equal 'INVITATION_ALREADY_USED' — expected response to have status code 409 but got 400 |

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
| **Notes** | expected response to have status code 409 but got 400 \| expected 'FIELD_NOT_APPLICABLE' to deeply equal 'INVITATION_ALREADY_USED' |

