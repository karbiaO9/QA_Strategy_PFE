# Bug Report Template

## 1. Bug Report

| Field | Value |
|-------|--------|
| **ID Number#** | BUG-INVIT-002 |
| **Title** | STC-INVIT-ASST-001B: POST — Invite ASSISTANT |
| **Reporter** | Oussema Karbia |
| **Submit Date** | Jun 7, 2026 |
| **Verifier** |  |

---

## 2. Bug Overview

| Field | Value |
|-------|--------|
| **Summary** | STC-INVIT-ASST-001B: STC-INVIT-ASST-001/B \| Invite ASSISTANT — assertion failure (HTTP 400 Bad Request). expected response to have status code 201 but got 400 |
| **Test Data** | POST https://identity.physio.agregatech.com/api/v1/kine/auth/invitations \| Body: { "email": "jean.nouveau.member@testmail.fr", "firstName": "Sami", "lastName": "Trabelsi", "targetProfileType": "ASSISTANT" } \| Headers: Content-Type: application/json |
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
| **Precondition** | STC STC-INVIT-ASST-001/B mapped to this request; authenticated context per collection (tokens as saved in environment). |
| **Steps to Reproduce** | 1. Configure environment: base URL https://identity.physio.agregatech.com.<br>2. In Postman/Newman, open the request named "STC-INVIT-ASST-001/B \| Invite ASSISTANT".<br>3. Send POST to https://identity.physio.agregatech.com/api/v1/kine/auth/invitations with the collection's body and headers.<br>4. Observe HTTP status, response body, and Newman test assertions. |
| **Expected Result** | Cas nominal validé selon les AC du ticket : • Le payload d'invitation accepte role=ASSISTANT • Profil créé with profileeType=ASSISTANT (verrouillé dans l'enum côté backend) • Aucune permission clinique accordée par défaut • Pas de champ number professionnel ex... Align API with spreadsheet specification or adjust Newman tests after agreement. |
| **Actual Result** | 400 Bad Request in 156 ms. 1 failed, 1 passed. expected response to have status code 201 but got 400 — expected response to have status code 201 but got 400 |

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
| **Notes** | expected response to have status code 201 but got 400 |

