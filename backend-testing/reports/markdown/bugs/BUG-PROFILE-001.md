# Bug Report Template

## 1. Bug Report

| Field | Value |
|-------|--------|
| **ID Number#** | BUG-PROFILE-001 |
| **Title** | STC-PROFILE-ADD-002B: POST — Admin add LIBERAL to kine |
| **Reporter** | Oussema Karbia |
| **Submit Date** | May 14, 2026 |
| **Verifier** |  |

---

## 2. Bug Overview

| Field | Value |
|-------|--------|
| **Summary** | STC-PROFILE-ADD-002B: STC-PROFILE-ADD-002/B \| Admin add LIBERAL to kine — HTTP 400 Bad Request; Excel-allowed HTTP {201}. Also: expected [ 200, 201 ] to include 400 |
| **Test Data** | POST https://identity.physio.agregatech.com/api/admin/v1/kines/6a04a5695097a1ea13a2a993/profiles \| Body: { "profileType": "LIBERAL", "cabinetName": "Cabinet Manuel", "subscriptionPlanId": "507f1f77bcf86cd799439011", "scope": "admin", "street": "12 rue du Cabinet Test", "postalCode": "75001", "city": "Paris" } \| Headers: Content-Type: application/json; Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTA0YTU2OTUwOTdhMWVhMTNhMmE5OTAiLCJlbWFpbCI6ImFkbWluQHBoeXNpb2Nvbm5lY3QuY29tIiwidHlwZSI6ImFkbWluIiwiY2FiaW5ldElkIjoicGxhdGZvcm0iLCJyb2xlU2x1ZyI6IlNVUEVSX0FETUlOIiw… |
| **URL** | https://identity.physio.agregatech.com/api/admin/v1/kines/6a04a5695097a1ea13a2a993/profiles |
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
| **Precondition** | STC STC-PROFILE-ADD-002/B mapped to this request; authenticated context per collection (tokens as saved in environment). |
| **Steps to Reproduce** | 1. Configure environment: base URL https://identity.physio.agregatech.com.<br>2. In Postman/Newman, open the request named "STC-PROFILE-ADD-002/B \| Admin add LIBERAL to kine".<br>3. Send POST to https://identity.physio.agregatech.com/api/admin/v1/kines/6a04a5695097a1ea13a2a993/profiles with the collection's body and headers.<br>4. Observe HTTP status, response body, and Newman test assertions. |
| **Expected Result** | Cas nominal validé selon les AC du ticket : • POST /api/admin/v1/kines/:id/profilees accepte AddKineProfileDto + scope=admin (côté backend) • Réservé SUPER_ADMIN via PoliciesGuard • HTTP 201 with le profile créé (et freemium si applicable) • Vérification fraîc... Allowed HTTP status (execution sheet): {201}. Align API with spreadsheet specification or adjust Newman tests after agreement. |
| **Actual Result** | 400 Bad Request in 72 ms. 1 failed, 1 passed. expected [ 200, 201 ] to include 400 — expected [ 200, 201 ] to include 400 |

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
| **Notes** | expected [ 200, 201 ] to include 400 \| Excel Expected Result requires HTTP in {201}; received 400. |

