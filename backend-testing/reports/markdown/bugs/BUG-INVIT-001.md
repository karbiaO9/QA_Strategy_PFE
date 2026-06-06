# Bug Report Template

## 1. Bug Report

| Field | Value |
|-------|--------|
| **ID Number#** | BUG-INVIT-001 |
| **Title** | STC-INVIT-GEN-001B: POST — Generate MEMBER invitation |
| **Reporter** | Oussema Karbia |
| **Submit Date** | May 14, 2026 |
| **Verifier** |  |

---

## 2. Bug Overview

| Field | Value |
|-------|--------|
| **Summary** | STC-INVIT-GEN-001B: STC-INVIT-GEN-001/B \| Generate MEMBER invitation — assertion failure (HTTP 400 Bad Request). expected [ 200, 201 ] to include 400 |
| **Test Data** | POST https://identity.physio.agregatech.com/api/v1/kine/auth/invitations \| Body: { "email": "jean.nouveau.member@testmail.fr", "cabinetId": "6a04a5695097a1ea13a2a996", "targetProfileType": "MEMBER" } \| Headers: Content-Type: application/json; Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTA0YTU2OTUwOTdhMWVhMTNhMmE5OTMiLCJlbWFpbCI6InNvcGhpZS5tYXJ0aW5AY2FiaW5ldC1wYXJpcy5mciIsInR5cGUiOiJraW5lIiwiY2FiaW5ldElkIjpudWxsLCJyb2xlU2x1ZyI6IiIsInYiOjcsImlhdCI… |
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
| **Precondition** | STC STC-INVIT-GEN-001/B mapped to this request; authenticated context per collection (tokens as saved in environment). |
| **Steps to Reproduce** | 1. Configure environment: base URL https://identity.physio.agregatech.com.<br>2. In Postman/Newman, open the request named "STC-INVIT-GEN-001/B \| Generate MEMBER invitation".<br>3. Send POST to https://identity.physio.agregatech.com/api/v1/kine/auth/invitations with the collection's body and headers.<br>4. Observe HTTP status, response body, and Newman test assertions. |
| **Expected Result** | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/invitations accepte {email, role, cabinetId} dans le payload • Token JWT généré with jti unique (anti-replay) • TTL JWT_INVITATION_TTL configurable (défaut 7 jours) • jti stocké en Redis for ... Align API with spreadsheet specification or adjust Newman tests after agreement. |
| **Actual Result** | 400 Bad Request in 97 ms. 1 failed, 1 passed. expected [ 200, 201 ] to include 400 — expected [ 200, 201 ] to include 400 |

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
| **Notes** | expected [ 200, 201 ] to include 400 |

