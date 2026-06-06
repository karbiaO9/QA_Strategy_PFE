# Bug Report Template

## 1. Bug Report

| Field | Value |
|-------|--------|
| **ID Number#** | BUG-PROFILE-005 |
| **Title** | STC-PROFILE-UPDATE-001B: PATCH — Patch profile allowed fields |
| **Reporter** | Oussema Karbia |
| **Submit Date** | May 14, 2026 |
| **Verifier** |  |

---

## 2. Bug Overview

| Field | Value |
|-------|--------|
| **Summary** | STC-PROFILE-UPDATE-001B: STC-PROFILE-UPDATE-001/B \| Patch profile allowed fields — assertion failure (HTTP 400 Bad Request). expected [ 200, 201 ] to include 400 |
| **Test Data** | PATCH https://identity.physio.agregatech.com/api/v1/kine/profiles/6a04a5695097a1ea13a2a999 \| Body: { "isReplacement": true } \| Headers: Content-Type: application/json; Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTA0YTU2OTUwOTdhMWVhMTNhMmE5OTMiLCJlbWFpbCI6InNvcGhpZS5tYXJ0aW5AY2FiaW5ldC1wYXJpcy5mciIsInR5cGUiOiJraW5lIiwiY2FiaW5ldElkIjpudWxsLCJyb2xlU2x1ZyI6IiIsInYiOjgsImlhdCI… |
| **URL** | https://identity.physio.agregatech.com/api/v1/kine/profiles/6a04a5695097a1ea13a2a999 |
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
| **Precondition** | STC STC-PROFILE-UPDATE-001/B mapped to this request; authenticated context per collection (tokens as saved in environment). |
| **Steps to Reproduce** | 1. Configure environment: base URL https://identity.physio.agregatech.com.<br>2. In Postman/Newman, open the request named "STC-PROFILE-UPDATE-001/B \| Patch profile allowed fields".<br>3. Send PATCH to https://identity.physio.agregatech.com/api/v1/kine/profiles/6a04a5695097a1ea13a2a999 with the collection's body and headers.<br>4. Observe HTTP status, response body, and Newman test assertions. |
| **Expected Result** | Cas nominal validé selon les AC du ticket : • PATCH /api/v1/kine/profilees/:profileeId scoped au Compte authentifié • Whitelist stricte : isActive (false only), isReplacement, school, academicYear, justificatifUrl • LIBERAL toggle isReplacement=true bascule pr... Align API with spreadsheet specification or adjust Newman tests after agreement. |
| **Actual Result** | 400 Bad Request in 74 ms. 1 failed, 1 passed. expected [ 200, 201 ] to include 400 — expected [ 200, 201 ] to include 400 |

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

