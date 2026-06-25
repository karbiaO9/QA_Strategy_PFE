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
| **Raised On** | Jun 7, 2026 | **Closed On** |  |
| **Test Environment** | Backend API | **Release Decision** |  |
| **Executed Tests** | 57 | **Passed** | 34 |
| **Failed** | 23 | **Blocked** | 0 |
| **Total** | 57 |  |  |

## 2. Test Performed

| Test Case ID | Short Description | Result | Status (Passed/Failed) | Bug ID | Feedback |
|---|---|---|---|---|---|
| STC-AUTH-KINE-001/B | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/login accepte {email, password} • Vérification pas… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-AUTH-ADMIN-001/B | Cas nominal validé selon les AC du ticket : • POST /api/admin/v1/auth/login accepte {email, password} • Recherche dans… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-ADD-002/B | Cas nominal validé selon les AC du ticket : • POST /api/admin/v1/kines/:id/profilees accepte AddKineProfileDto + scope=… | At least one assertion failed or Excel status mismatch | FAILED | BUG-PROFILE-001 | Review linked bug report(s). |
| STC-PROFILE-ADD-005/B | • Response status code : HTTP 400 • Body contains : { "statusCode": 400, "error": "...", "code": "Bad Request (validati… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-ADD-006/B | • Response status code : HTTP 404 • Body contains : { "statusCode": 404, "error": "...", "code": "Not Found (ressource… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-ADD-007/B | • Response status code : HTTP 409 • Body contains : { "statusCode": 409, "error": "...", "code": "PROFILE_ALREADY_EXIST… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-ADD-008/B | • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "Forbidden (permission… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-VERIF-001/B | Cas nominal validé selon les AC du ticket : • PATCH /api/admin/v1/kines/:id/verification accepte {action: 'APPROVE'\|'RE… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-VERIF-006/B | • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'REJECTION_REASON_REQUIRED' } • verificationStatus reste inchan… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-VERIF-002/B | Cas nominal validé selon les AC du ticket : • Lien de re-soumission (renvoyer un nouveau justificatif) | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-VERIF-005/B | • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "Forbidden (permission… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-AUTH-KINE-003/B | • Response status code : HTTP 401 • Body contains : { "statusCode": 401, "error": "...", "code": "Unauthorized (token i… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-REGISTER-ADMIN-003/B | • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'PROFESSIONAL_NUMBER_REQUIRED' } | At least one assertion failed or Excel status mismatch | FAILED | BUG-REGISTER-001 | Review linked bug report(s). |
| STC-REGISTER-REMP-003/B | • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'PROFESSIONAL_NUMBER_REQUIRED' } | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-REGISTER-ADMIN-001/B | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/register accepte un payload RegisterAdminCabinetDt… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-REGISTER-STUD-001/B | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/register accepte un file multipart (PDF/JPG/PNG ≤… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-REGISTER-STUD-002/B | Cas nominal validé selon les AC du ticket : • À la création d'un profile STUDENT, lancement d'un job de duplication des… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-INVIT-GEN-001/B | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/invitations accepte {email, role, cabinetId} dans… | At least one assertion failed or Excel status mismatch | FAILED | BUG-INVIT-001 | Review linked bug report(s). |
| STC-INVIT-ASST-001/B | Cas nominal validé selon les AC du ticket : • Le payload d'invitation accepte role=ASSISTANT • Profil créé with profile… | At least one assertion failed or Excel status mismatch | FAILED | BUG-INVIT-002 | Review linked bug report(s). |
| STC-INVIT-GEN-002/B | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/invitations/preview accepte {invitationToken} • Vé… | At least one assertion failed or Excel status mismatch | FAILED | BUG-INVIT-003 | Review linked bug report(s). |
| STC-INVIT-GEN-005/B | • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "Forbidden (permission… | At least one assertion failed or Excel status mismatch | FAILED | BUG-INVIT-004 | Review linked bug report(s). |
| STC-INVIT-GEN-006/B | • Response status code : HTTP 401 • Body contains : { "statusCode": 401, "error": "...", "code": "Unauthorized (token i… | At least one assertion failed or Excel status mismatch | FAILED | BUG-INVIT-005 | Review linked bug report(s). |
| STC-INVIT-GEN-007/B | • Response status code : HTTP 409 • Body contains : { "statusCode": 409, "error": "...", "code": "Conflict (doublon, ét… | At least one assertion failed or Excel status mismatch | FAILED | BUG-INVIT-006 | Review linked bug report(s). |
| STC-INVIT-ATTACH-001/B | Cas nominal validé selon les AC du ticket : • POST /invitations/attach accepte {invitationToken, password} • Vérificati… | At least one assertion failed or Excel status mismatch | FAILED | BUG-INVIT-007 | Review linked bug report(s). |
| STC-INVIT-ATTACH-003/B | • Response status code : HTTP 401 • Body contains : { "statusCode": 401, "error": "...", "code": "Unauthorized (token i… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-INVIT-ATTACH-004/B | • Response status code : HTTP 409 • Body contains : { "statusCode": 409, "error": "...", "code": "Conflict (doublon, ét… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-INVIT-ACCEPT-007/B | • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'PROFESSIONAL_NUMBER_FORBIDDEN' } • Aucun Compte créé | At least one assertion failed or Excel status mismatch | FAILED | BUG-INVIT-008 | Review linked bug report(s). |
| STC-INVIT-ACCEPT-001/B | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/accept-invitation accepte {invitationToken, firstN… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-INVIT-ACCEPT-002/B | • Response status code : HTTP 401 • Body contains : { "statusCode": 401, "error": "...", "code": "Unauthorized (token i… | At least one assertion failed or Excel status mismatch | FAILED | BUG-INVIT-009 | Review linked bug report(s). |
| STC-INVIT-ACCEPT-005/B | • Response status code : HTTP 400 • Body contains : { "statusCode": 400, "error": "...", "code": "Bad Request (validati… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-INVIT-ACCEPT-006/B | • Response status code : HTTP 401 • Body contains : { "statusCode": 401, "error": "...", "code": "Unauthorized (token i… | At least one assertion failed or Excel status mismatch | FAILED | BUG-INVIT-010 | Review linked bug report(s). |
| STC-PROFILE-SELECT-001/B | Cas nominal validé selon les AC du ticket : • Header X-Profile-Id requis sur toutes les requêtes Kiné après login • Pro… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-SELECT-002/B | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/auth/select-profilee accepte {profileeId} • Vérificatio… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-SELECT-005/B | • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'PROFILE_ID_INVALID' } | At least one assertion failed or Excel status mismatch | FAILED | BUG-PROFILE-002 | Review linked bug report(s). |
| STC-PROFILE-SELECT-006/B | • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "PROFILE_INACTIVE" } •… | At least one assertion failed or Excel status mismatch | FAILED | BUG-PROFILE-003 | Review linked bug report(s). |
| STC-PROFILE-SELECT-007/B | • Response status code : HTTP 403 • Body contains : { "statusCode": 403, "error": "...", "code": "KINE_INACTIVE" } • No… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-ADD-001/B | Cas nominal validé selon les AC du ticket : • POST /api/v1/kine/profilees accepte un payload selon profileeType • Profi… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-ADD-010/B | • Profil LIBERAL créé • Aucun patient fictif cloné • La méthode cloneFictifTemplatesForStudent N'EST PAS appelée | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-ADD-004/B | • Response status code : HTTP 409 • Body contains : { "statusCode": 409, "error": "...", "code": "Conflict (doublon, ét… | At least one assertion failed or Excel status mismatch | FAILED | BUG-PROFILE-004 | Review linked bug report(s). |
| STC-PROFILE-ADD-009/B | • Profil STUDENT créé • N patients fictifs créés (1 par template) • Chaque clone : source=fictif, isTemplate=false, own… | At least one assertion failed or Excel status mismatch | FAILED | BUG-PROFILE-005 | Review linked bug report(s). |
| STC-PROFILE-UPDATE-001/B | Cas nominal validé selon les AC du ticket : • PATCH /api/v1/kine/profilees/:profileeId scoped au Compte authentifié • W… | At least one assertion failed or Excel status mismatch | FAILED | BUG-PROFILE-006 | Review linked bug report(s). |
| STC-PROFILE-UPDATE-002/B | • Response status code : HTTP 404 • Body contains : { "statusCode": 404, "error": "...", "code": "PROFILE_NOT_FOUND" }… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PROFILE-UPDATE-003/B | • Response status code : HTTP 400 • Body contains : { "statusCode": 400, "error": "...", "code": "PROFILE_ACTIVATION_AD… | At least one assertion failed or Excel status mismatch | FAILED | BUG-PROFILE-007 | Review linked bug report(s). |
| STC-PROFILE-UPDATE-004/B | • Response status code : HTTP 400 • Body contains : { "statusCode": 400, "error": "...", "code": "FIELD_NOT_APPLICABLE"… | At least one assertion failed or Excel status mismatch | FAILED | BUG-PROFILE-008 | Review linked bug report(s). |
| STC-AUTH-PAT-001/B | Cas nominal validé selon les AC du ticket : • POST /api/v1/patient/auth/login accepte {emailOrPhone, password} • Recher… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-AUTH-PAT-002/B | • Response status code : HTTP 401 • Body contains : { "statusCode": 401, "error": "...", "code": "Unauthorized (token i… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PWD-FORGOT-003/B | • HTTP 200 OK (toujours) • Body: { message: 'Si un account existe, un code a été envoyé.' } • Email INEXISTANT : aucun… | At least one assertion failed or Excel status mismatch | FAILED | BUG-PWD-001 | Review linked bug report(s). |
| STC-PWD-FORGOT-004/B | • Appels 1-5 : HTTP 200 OK • Appel 6+ : HTTP 429 Too Many Requests • Body: { statusCode: 429, code: 'RATE_LIMIT_EXCEEDE… | At least one assertion failed or Excel status mismatch | FAILED | BUG-PWD-002 | Review linked bug report(s). |
| STC-PWD-FORGOT-001/B | Cas nominal validé selon les AC du ticket : • POST /auth/forgot-password accepte {email} • Génération code 6 chiffres •… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PWD-VERIFY-001/B | Cas nominal validé selon les AC du ticket : • POST /auth/verify-code accepte {email, code} • Vérification du code contr… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PWD-VERIFY-003/B | • Response status code : HTTP 400 • Body contains : { "statusCode": 400, "error": "...", "code": "CODE_INVALID" } • No… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PWD-VERIFY-004/B | • Response status code : HTTP 400 • Body contains : { "statusCode": 400, "error": "...", "code": "CODE_EXPIRED" } • No… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PWD-VERIFY-005/B | • Tentatives 1-3 : HTTP 400 CODE_INVALID + incrément attempts • Tentative 4+ : HTTP 400 CODE_TOO_MANY_ATTEMPTS • Code i… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PWD-RESET-001/B | Cas nominal validé selon les AC du ticket : • POST /auth/reset-password accepte {resetToken, newPassword} • Validation… | All mapped requests passed | PASSED |  | No blocking issue observed. |
| STC-PWD-CHANGE-002/B | • HTTP 400 Bad Request • Body: { statusCode: 400, code: 'PASSWORD_SAME_AS_OLD' } • Le password in database reste inchan… | At least one assertion failed or Excel status mismatch | FAILED | BUG-PWD-003 | Review linked bug report(s). |
| STC-PWD-CHANGE-001/B | Cas nominal validé selon les AC du ticket : • POST /auth/change-password : ancien + nouveau password • Application robu… | At least one assertion failed or Excel status mismatch | FAILED | BUG-PWD-004 | Review linked bug report(s). |
| STC-HEALTHZ-001/B | Cas nominal validé selon les AC du ticket : • Toutes les configs critiques en variables d'env • Validation des env vars… | All mapped requests passed | PASSED |  | No blocking issue observed. |

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
