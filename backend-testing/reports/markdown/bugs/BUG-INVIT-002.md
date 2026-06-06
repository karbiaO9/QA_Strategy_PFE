# Bug Report Template

## 1. Bug Report

| Field | Value |
|-------|--------|
| **ID Number#** | BUG-INVIT-002 |
| **Title** | STC-INVIT-GEN-002B: POST — Preview MEMBER invitation token |
| **Reporter** | Oussema Karbia |
| **Submit Date** | May 14, 2026 |
| **Verifier** |  |

---

## 2. Bug Overview

| Field | Value |
|-------|--------|
| **Summary** | STC-INVIT-GEN-002B: STC-INVIT-GEN-002/B \| Preview MEMBER invitation token — assertion failure (HTTP 400 Bad Request). expected response to have status code 200 but got 400 |
| **Test Data** | POST https://identity.physio.agregatech.com/api/v1/kine/auth/invitations/preview \| Body: { "invitationToken": "" } \| Headers: Content-Type: application/json; Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTA0YTU2OTUwOTdhMWVhMTNhMmE5OTMiLCJlbWFpbCI6InNvcGhpZS5tYXJ0aW5AY2FiaW5ldC1wYXJpcy5mciIsInR5cGUiOiJraW5lIiwiY2FiaW5ldElkIjpudWxsLCJyb2xlU2x1ZyI6IiIsInYiOjcsImlhdCI… |
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
| **Precondition** | STC STC-INVIT-GEN-002/B mapped to this request; authenticated context per collection (tokens as saved in environment). |
| **Steps to Reproduce** | 1. Configure environment: base URL https://identity.physio.agregatech.com.<br>2. In Postman/Newman, open the request named "STC-INVIT-GEN-002/B \| Preview MEMBER invitation token".<br>3. Send POST to https://identity.physio.agregatech.com/api/v1/kine/auth/invitations/preview with the collection's body and headers.<br>4. Observe HTTP status, response body, and Newman test assertions. |
| **Expected Result** | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/invitations/preview accepte {invitationToken} • Vérification validité token (signature, jti, TTL) • Retourne accountExists=true si email correspond à un Compte kine existant • Retourne accoun... Align API with spreadsheet specification or adjust Newman tests after agreement. |
| **Actual Result** | 400 Bad Request in 65 ms. 1 failed, 1 passed. expected response to have status code 200 but got 400 — expected response to have status code 200 but got 400 |

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
| **Notes** | expected response to have status code 200 but got 400 |

