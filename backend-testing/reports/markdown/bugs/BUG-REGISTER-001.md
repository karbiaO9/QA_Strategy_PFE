# Bug Report Template

## 1. Bug Report

| Field | Value |
|-------|--------|
| **ID Number#** | BUG-REGISTER-001 |
| **Title** | STC-REGISTER-SOLO-001B: POST — Register LIBERAL nominal |
| **Reporter** | Oussema Karbia |
| **Submit Date** | May 14, 2026 |
| **Verifier** |  |

---

## 2. Bug Overview

| Field | Value |
|-------|--------|
| **Summary** | STC-REGISTER-SOLO-001B: STC-REGISTER-SOLO-001/B \| Register LIBERAL nominal — assertion failure (HTTP 409 Conflict). expected [ 201, 400 ] to include 409 |
| **Test Data** | POST https://identity.physio.agregatech.com/api/v1/kine/auth/register \| Body: { "email": "jean.nouveau.solo@testmail.fr", "password": "QaTest123!", "passwordConfirmation": "QaTest123!", "firstName": "Jean", "lastName": "LiberalSolo", "phone": "+33655554444", "profileType": "LIBERAL", "professionalNumber": "123456789", "cabinetName": "Cabinet Test Marseille", "street": "12 rue des Lilas", "postalCode": "13001", "city": "Marseille", "cguAccepted": true } \| Headers: Content-Type: application/json |
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
| **Precondition** | STC STC-REGISTER-SOLO-001/B mapped to this request; authenticated context per collection (tokens as saved in environment). |
| **Steps to Reproduce** | 1. Configure environment: base URL https://identity.physio.agregatech.com.<br>2. In Postman/Newman, open the request named "STC-REGISTER-SOLO-001/B \| Register LIBERAL nominal".<br>3. Send POST to https://identity.physio.agregatech.com/api/v1/kine/auth/register with the collection's body and headers.<br>4. Observe HTTP status, response body, and Newman test assertions. |
| **Expected Result** | Newman assertions must pass for POST (expected behavior per story). |
| **Actual Result** | 409 Conflict in 276 ms. 1 failed, 1 passed. expected [ 201, 400 ] to include 409 — expected [ 201, 400 ] to include 409 |

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
| **Notes** | expected [ 201, 400 ] to include 409 |

