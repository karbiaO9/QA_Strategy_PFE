# Bug Report Template

## 1. Bug Report

| Field | Value |
|-------|--------|
| **ID Number#** | BUG-INVIT-007 |
| **Title** | STC-INVIT-ATTACH-001B: POST — Attach existing user to cabinet |
| **Reporter** | Oussema Karbia |
| **Submit Date** | Jun 6, 2026 |
| **Verifier** |  |

---

## 2. Bug Overview

| Field | Value |
|-------|--------|
| **Summary** | STC-INVIT-ATTACH-001B: STC-INVIT-ATTACH-001/B \| Attach existing user to cabinet — assertion failure (HTTP 401 Unauthorized). expected [ 201, 409 ] to include 401 |
| **Test Data** | POST https://identity.physio.agregatech.com/api/v1/kine/auth/invitations/attach \| Body: { "invitationToken": "", "password": "KineAdmin123!" } \| Headers: Content-Type: application/json |
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
| **Precondition** | STC STC-INVIT-ATTACH-001/B mapped to this request; authenticated context per collection (tokens as saved in environment). |
| **Steps to Reproduce** | 1. Configure environment: base URL https://identity.physio.agregatech.com.<br>2. In Postman/Newman, open the request named "STC-INVIT-ATTACH-001/B \| Attach existing user to cabinet".<br>3. Send POST to https://identity.physio.agregatech.com/api/v1/kine/auth/invitations/attach with the collection's body and headers.<br>4. Observe HTTP status, response body, and Newman test assertions. |
| **Expected Result** | Cas nominal validé selon les AC du ticket : • POST /invitations/attach accepte {invitationToken, password} • Vérification password contre le Compte kine existant • Création d'un nouveau Profil MEMBER with cabinetId de l'inviteur • Le Profil hérite du roleId=KI... Align API with spreadsheet specification or adjust Newman tests after agreement. |
| **Actual Result** | 401 Unauthorized in 63 ms. 1 failed, 1 passed. expected [ 201, 409 ] to include 401 — expected [ 201, 409 ] to include 401 |

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
| **Notes** | expected [ 201, 409 ] to include 401 |

