# SOFTWARE QUALITY TEST REPORT

| Field | Value |
|---|---|
| **REF:** |  |
| **VER-REV:** |  |
| **Creation/Update Date:** |  |
| **Editor/Verifier:** |  |

## 1. Test Report Information

| Field | Value | Field | Value |
|---|---|---|---|
| **Project** | XXX&Connect | **Operating System** | Windows 10 |
| **Sprint** | Sprint 1 | **Location/Server** | identity.physio.agregatech.com |
| **Raised By** | Oussema Karbia | **Closed By** |  |
| **Raised On** | May 14, 2026 | **Closed On** |  |
| **Test Environment** | Backend API | **Release Decision** |  |
| **Executed Tests** | 57 | **Passed** | 38 |
| **Failed** | 19 | **Blocked** | 0 |
| **Total** | 57 |  |  |

## 2. Test Performed

| Test Case ID | Short Description | Result | Status (Passed/Failed) | Bug ID | Feedback |
|---|---|---|---|---|---|
| STC-AUTH-KINE-001/B | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/login accepte {email, password} • Vérification pas… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-AUTH-ADMIN-001/B | Cas nominal validé selon les AC du ticket : • POST /api/admin/v1/auth/login accepte {email, password} • Recherche dans… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-VERIF-001/B | Cas nominal validé selon les AC du ticket : • PATCH /api/admin/v1/kines/:id/verification accepte {action: 'APPROVE'\|'RE… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-VERIF-002/B | Cas nominal validé selon les AC du ticket : • Lien de re-soumission (renvoyer un nouveau justificatif) | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-VERIF-003/B | STC-VERIF-003/B \| List kine verifications (PENDING) | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-VERIF-005/B | • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "Forbidden (permission… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-VERIF-006/B | • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'REJECTION_REASON_REQUIRED' } • verificationStatus reste inchan… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-VERIF-007/B | STC-VERIF-007/B \| List kine verifications (REJECTED) | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-VERIF-HISTORY-001/B | STC-VERIF-HISTORY-001/B \| Kine verification audit trail GET | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-INVIT-GEN-001/B | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/invitations accepte {email, role, cabinetId} dans… | At least one assertion failed or Excel status mismatch | FAILED | BUG-INVIT-001 | Review linked bug report(s). |
| STC-INVIT-GEN-002/B | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/invitations/preview accepte {invitationToken} • Vé… | At least one assertion failed or Excel status mismatch | FAILED | BUG-INVIT-002, BUG-INVIT-003 | Review linked bug report(s). |
| STC-INVIT-GEN-007/B | • Response status code : HTTP 409 • Body contains : { "statusCode": 409, "error": "...", "code": "Conflict (doublon, ét… | At least one assertion failed or Excel status mismatch | FAILED | BUG-INVIT-004 | Review linked bug report(s). |
| STC-INVIT-GEN-005/B | • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "Forbidden (permission… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-INVIT-GEN-006/B | • Response status code : HTTP 401 • Body contains : { "statusCode": 401, "error": "...", "code": "Unauthorized (token i… | At least one assertion failed or Excel status mismatch | FAILED | BUG-INVIT-005 | Review linked bug report(s). |
| STC-INVIT-GEN-008/B | STC-INVIT-GEN-008/B \| Generate invalid payload 400 | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-INVIT-ASST-001/B | Cas nominal validé selon les AC du ticket : • Le payload d'invitation accepte role=ASSISTANT • Profil créé with profile… | At least one assertion failed or Excel status mismatch | FAILED | BUG-INVIT-006 | Review linked bug report(s). |
| STC-INVIT-ACCEPT-007/B | • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'PROFESSIONAL_NUMBER_FORBIDDEN' } • Aucun Compte créé | At least one assertion failed or Excel status mismatch | FAILED | BUG-INVIT-007 | Review linked bug report(s). |
| STC-INVIT-ACCEPT-005/B | • Response status code : HTTP 400 • Body contains : { "statusCode": 400, "error": "...", "code": "Bad Request (validati… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-INVIT-ACCEPT-008/B | STC-INVIT-ACCEPT-008/B \| CGU not accepted 400 | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-INVIT-ACCEPT-002/B | • Response status code : HTTP 401 • Body contains : { "statusCode": 401, "error": "...", "code": "Unauthorized (token i… | At least one assertion failed or Excel status mismatch | FAILED | BUG-INVIT-008 | Review linked bug report(s). |
| STC-INVIT-ACCEPT-006/B | • Response status code : HTTP 401 • Body contains : { "statusCode": 401, "error": "...", "code": "Unauthorized (token i… | At least one assertion failed or Excel status mismatch | FAILED | BUG-INVIT-009 | Review linked bug report(s). |
| STC-INVIT-ACCEPT-001/B | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/accept-invitation accepte {invitationToken, firstN… | At least one assertion failed or Excel status mismatch | FAILED | BUG-INVIT-010 | Review linked bug report(s). |
| STC-INVIT-ACCEPT-003/B | STC-INVIT-ACCEPT-003/B \| Replay accept — INVITATION_ALREADY_USED 409 | At least one assertion failed or Excel status mismatch | FAILED | BUG-INVIT-011 | Review linked bug report(s). |
| STC-INVIT-ACCEPT-004/B | STC-INVIT-ACCEPT-004/B \| INVITATION_ACCOUNT_MISMATCH 409 (optional) | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-INVIT-ATTACH-003/B | • Response status code : HTTP 401 • Body contains : { "statusCode": 401, "error": "...", "code": "Unauthorized (token i… | At least one assertion failed or Excel status mismatch | FAILED | BUG-INVIT-012 | Review linked bug report(s). |
| STC-INVIT-ATTACH-004/B | • Response status code : HTTP 409 • Body contains : { "statusCode": 409, "error": "...", "code": "Conflict (doublon, ét… | At least one assertion failed or Excel status mismatch | FAILED | BUG-INVIT-013 | Review linked bug report(s). |
| STC-INVIT-ATTACH-001/B | Cas nominal validé selon les AC du ticket : • POST /invitations/attach accepte {invitationToken, password} • Vérificati… | At least one assertion failed or Excel status mismatch | FAILED | BUG-INVIT-014 | Review linked bug report(s). |
| STC-PROFILE-ADD-001/B | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/profilees accepte un payload selon profileeType • Profi… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-ADD-002/B | Cas nominal validé selon les AC du ticket : • POST /api/admin/v1/kines/:id/profilees accepte AddKineProfileDto + scope=… | At least one assertion failed or Excel status mismatch | FAILED | BUG-PROFILE-001 | Review linked bug report(s). |
| STC-PROFILE-ADD-003/B | STC-PROFILE-ADD-003/B \| (sheet) — placeholder | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-ADD-004/B | • Response status code : HTTP 409 • Body contains : { "statusCode": 409, "error": "...", "code": "Conflict (doublon, ét… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-ADD-005/B | • Response status code : HTTP 400 • Body contains : { "statusCode": 400, "error": "...", "code": "Bad Request (validati… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-ADD-006/B | • Response status code : HTTP 404 • Body contains : { "statusCode": 404, "error": "...", "code": "Not Found (ressource… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-ADD-007/B | • Response status code : HTTP 409 • Body contains : { "statusCode": 409, "error": "...", "code": "PROFILE_ALREADY_EXIST… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-ADD-008/B | • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "Forbidden (permission… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-ADD-009/B | • Profil STUDENT créé • N patients fictifs créés (1 par template) • Chaque clone : source=fictif, isTemplate=false, own… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-ADD-010/B | • Profil LIBERAL créé • Aucun patient fictif cloné • La méthode cloneFictifTemplatesForStudent N'EST PAS appelée | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-ADD-011/B | STC-PROFILE-ADD-011/B \| Add REMPLACANT profile (adjust per sheet) | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-SELECT-001/B | Cas nominal validé selon les AC du ticket : • Header X-Profile-Id requis sur toutes les requêtes Kiné après login • Pro… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-SELECT-002/B | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/select-profilee accepte {profileeId} • Vérificatio… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-SELECT-004/B | STC-PROFILE-SELECT-004/B \| Select without Bearer 401 | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-SELECT-005/B | • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'PROFILE_ID_INVALID' } | At least one assertion failed or Excel status mismatch | FAILED | BUG-PROFILE-002 | Review linked bug report(s). |
| STC-PROFILE-SELECT-006/B | • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "PROFILE_INACTIVE" } •… | At least one assertion failed or Excel status mismatch | FAILED | BUG-PROFILE-003 | Review linked bug report(s). |
| STC-PROFILE-SELECT-007/B | • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "KINE_INACTIVE" } • No… | At least one assertion failed or Excel status mismatch | FAILED | BUG-PROFILE-004 | Review linked bug report(s). |
| STC-PROFILE-SELECT-008/B | STC-PROFILE-SELECT-008/B \| Select profile not owned 403/404 | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-SELECT-009/B | STC-PROFILE-SELECT-009/B \| Select malformed id 400 | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-UPDATE-001/B | Cas nominal validé selon les AC du ticket : • PATCH /api/v1/kine/profilees/:profileeId scoped au Compte authentifié • W… | At least one assertion failed or Excel status mismatch | FAILED | BUG-PROFILE-005 | Review linked bug report(s). |
| STC-PROFILE-UPDATE-002/B | • Response status code : HTTP 404 • Body contains : { "statusCode": 404, "error": "...", "code": "PROFILE_NOT_FOUND" }… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-UPDATE-003/B | • Response status code : HTTP 400 • Body contains : { "statusCode": 400, "error": "...", "code": "PROFILE_ACTIVATION_AD… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-UPDATE-004/B | • Response status code : HTTP 400 • Body contains : { "statusCode": 400, "error": "...", "code": "FIELD_NOT_APPLICABLE"… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-UPDATE-005/B | STC-PROFILE-UPDATE-005/B \| Patch immutable field ignored or 400 | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-UPDATE-006/B | STC-PROFILE-UPDATE-006/B \| Patch student field on non-student 400 | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-REGISTER-SOLO-001/B | STC-REGISTER-SOLO-001/B \| Register LIBERAL nominal | At least one assertion failed or Excel status mismatch | FAILED | BUG-REGISTER-001 | Review linked bug report(s). |
| STC-REGISTER-SOLO-003/B | STC-REGISTER-SOLO-003/B \| LIBERAL missing professionalNumber 400 | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-REGISTER-SOLO-004/B | STC-REGISTER-SOLO-004/B \| Invalid email 400 | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-REGISTER-SOLO-005/B | STC-REGISTER-SOLO-005/B \| Duplicate email 409 | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-REGISTER-SOLO-006/B | STC-REGISTER-SOLO-006/B \| Weak password 400 | All mapped requests passed | PASSED |  | No blocking issue observed. |

## 3. Testing Methodology

| Field | Value |
|---|---|
| **Testing Tools** | Postman, Newman |
| **Testing Approach** | Backend API functional testing based on Sprint 1 authentication user stories |
| **Evaluation Criteria** | Each STC is passed only if the HTTP status code, response body, token/profile behavior, and security expectations match the expected result. |

## 4. Bug Fix Summary

## 5. Test & Fixes Validation

| Role | Name | Signature | Value |
|---|---|---|---|
| **Reporter** | Oussema Karbia | **Signature** |  |
| **Quality Manager** | Mohamed Hedi Limem | **Signature** |  |
| **Tech Lead** | Ahmed Mrabet | **Signature** |  |

| **Release Decision** |  |  |  |
