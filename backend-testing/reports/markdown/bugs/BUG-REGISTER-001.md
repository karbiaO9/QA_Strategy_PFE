# Bug Report Template

## 1. Bug Report

| Field | Value |
|-------|--------|
| **ID Number#** | BUG-REGISTER-001 |
| **Title** | STC-REGISTER-ADMIN-003B: POST — Register admin missing RPPS 400 |
| **Reporter** | Oussema Karbia |
| **Submit Date** | Jun 7, 2026 |
| **Verifier** |  |

---

## 2. Bug Overview

| Field | Value |
|-------|--------|
| **Summary** | STC-REGISTER-ADMIN-003B: STC-REGISTER-ADMIN-003/B \| Register admin missing RPPS 400 — assertion failure (HTTP 400 Bad Request). expected [ Array(2) ] to include 'FIELD_NOT_APPLICABLE' |
| **Test Data** | POST https://identity.physio.agregatech.com/api/v1/kine/auth/register \| Body: { "email": "jean.nouveau.member@testmail.fr", "password": "KineAdmin123!", "firstName": "Pierre", "lastName": "Martin", "raisonSociale": "Cabinet SARL", "siret": "12345678901234", "cguAccepted": true } \| Headers: Content-Type: application/json |
| **URL** | https://identity.physio.agregatech.com/api/v1/kine/auth/register |
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
| **Precondition** | STC STC-REGISTER-ADMIN-003/B mapped to this request; authenticated context per collection (tokens as saved in environment). |
| **Steps to Reproduce** | 1. Configure environment: base URL https://identity.physio.agregatech.com.<br>2. In Postman/Newman, open the request named "STC-REGISTER-ADMIN-003/B \| Register admin missing RPPS 400".<br>3. Send POST to https://identity.physio.agregatech.com/api/v1/kine/auth/register with the collection's body and headers.<br>4. Observe HTTP status, response body, and Newman test assertions. |
| **Expected Result** | • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'PROFESSIONAL_NUMBER_REQUIRED' } Allowed HTTP status (execution sheet): {400}. Align API with spreadsheet specification or adjust Newman tests after agreement. |
| **Actual Result** | 400 Bad Request in 155 ms. 1 failed, 2 passed. expected [ Array(2) ] to include 'FIELD_NOT_APPLICABLE' — expected [ Array(2) ] to include 'FIELD_NOT_APPLICABLE' |

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
| **Notes** | expected [ Array(2) ] to include 'FIELD_NOT_APPLICABLE' |

