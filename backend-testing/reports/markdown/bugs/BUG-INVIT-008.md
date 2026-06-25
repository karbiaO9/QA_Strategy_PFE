# Bug Report Template

## 1. Bug Report

| Field | Value |
|-------|--------|
| **ID Number#** | BUG-INVIT-008 |
| **Title** | STC-INVIT-ACCEPT-007B: POST — Assistant professional number forbidden 400 |
| **Reporter** | Oussema Karbia |
| **Submit Date** | Jun 7, 2026 |
| **Verifier** |  |

---

## 2. Bug Overview

| Field | Value |
|-------|--------|
| **Summary** | STC-INVIT-ACCEPT-007B: STC-INVIT-ACCEPT-007/B \| Assistant professional number forbidden 400 — assertion failure (HTTP 400 Bad Request). expected 'FIELD_NOT_APPLICABLE' to deeply equal 'PROFESSIONAL_NUMBER_FORBIDDEN' |
| **Test Data** | POST https://identity.physio.agregatech.com/api/v1/kine/auth/accept-invitation \| Body: { "invitationToken": "", "firstName": "Sophie", "lastName": "Roux", "password": "KineAdmin123!", "passwordConfirmation": "KineAdmin123!", "cguAccepted": true, "professionalNumber": "12345678901" } \| Headers: Content-Type: application/json |
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
| **Precondition** | STC STC-INVIT-ACCEPT-007/B mapped to this request; authenticated context per collection (tokens as saved in environment). |
| **Steps to Reproduce** | 1. Configure environment: base URL https://identity.physio.agregatech.com.<br>2. In Postman/Newman, open the request named "STC-INVIT-ACCEPT-007/B \| Assistant professional number forbidden 400".<br>3. Send POST to https://identity.physio.agregatech.com/api/v1/kine/auth/accept-invitation with the collection's body and headers.<br>4. Observe HTTP status, response body, and Newman test assertions. |
| **Expected Result** | • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'PROFESSIONAL_NUMBER_FORBIDDEN' } • Aucun Compte créé Allowed HTTP status (execution sheet): {400}. Align API with spreadsheet specification or adjust Newman tests after agreement. |
| **Actual Result** | 400 Bad Request in 153 ms. 1 failed, 2 passed. expected 'FIELD_NOT_APPLICABLE' to deeply equal 'PROFESSIONAL_NUMBER_FORBIDDEN' — expected 'FIELD_NOT_APPLICABLE' to deeply equal 'PROFESSIONAL_NUMBER_FORBIDDEN' |

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
| **Notes** | expected 'FIELD_NOT_APPLICABLE' to deeply equal 'PROFESSIONAL_NUMBER_FORBIDDEN' |

