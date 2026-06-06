# Service 1 — Identity, Fundamentals & Billing

Microservice foundational de la plateforme **XXX & Connect**.
Centralise l'identite, l'authentification, l'autorisation CASL multi-tenant,
et les fondamentaux RBAC (actions / modules / permissions / roles).

- **Port :** `3001`
- **Swagger :** <http://localhost:3001/api/docs>
- **Queue RabbitMQ :** `identity_queue`
- **Base MongoDB :** `physio_identity`

---

## Sommaire

1. [Responsabilites fonctionnelles](#1-responsabilites-fonctionnelles)
2. [Stack technique](#2-stack-technique)
3. [Architecture du code](#3-architecture-du-code)
4. [Pipeline de securite (JwtAuthGuard + PoliciesGuard)](#4-pipeline-de-securite)
5. [Modele RBAC CASL](#5-modele-rbac-casl)
6. [Demarrage — etape par etape](#6-demarrage--etape-par-etape)
7. [Scripts npm](#7-scripts-npm)
8. [Comptes de test (seed)](#8-comptes-de-test-seed)
9. [Tester via Swagger](#9-tester-via-swagger)
10. [Tests unitaires — inventaire et statut](#10-tests-unitaires--inventaire-et-statut)
11. [Codes d'erreur](#11-codes-derreur)
12. [Documentation complementaire](#12-documentation-complementaire)

---

## 1. Responsabilites fonctionnelles

| Domaine | Description |
|---|---|
| **Identity** | Cycle de vie `kines`, `kineprofiles` (collection separee — voir architecture L1/L2 ci-dessous), `patients`, `admins` (5 collections au total) + `cabinets`. |
| **Authentification** | 3 controllers separes (kine / patient / admin). JWT 24h + refresh token 7j (Redis) + password reset par code 6 chiffres (TTL 10 min). |
| **Autorisation** | RBAC **CASL** — 11 actions, 22 subjects, 33 permissions, 4 roles systeme, heritage `parentRoleId`, scopes `OWN`/`ALL`. |
| **Multi-tenant** | Isolation `cabinetId` injectee automatiquement dans toutes les conditions CASL (sauf SUPER_ADMIN). |
| **Fundamentals** | CRUD admin sur `actions`, `modules`, `permissions`, `roles`. |
| **Billing** | Schemas `plans`, `subscriptions`, `invoices` (schemas Sprint 1, logique Sprint 2). |
| **Freemium STUDENT — sandbox fictif** | A l'inscription d'un profil `STUDENT`, le systeme provisionne 5 patients fictifs (`source: 'fictif'`) appartenant au kine. Ces patients sont indissociables des patients reels via les permissions CASL existantes (ils sont possedes par le kine), mais filtrables via `?source=real|fictif|all` sur `GET /kine/patients`. Les 5 templates master vivent dans la collection `patients` avec `isTemplate: true` et sont invisibles partout (pre-find hook Mongoose). |

---

## 2. Stack technique

| Couche | Techno | Version |
|---|---|---|
| Framework | NestJS | 11 |
| Langage | TypeScript | 5.7 |
| HTTP | Express | 5 |
| Microservice | RabbitMQ via `@nestjs/microservices` | 11 |
| DB | MongoDB + Mongoose | 7 / 8 |
| Cache & tokens | Redis (ioredis) | 7 |
| Autorisation | `@casl/ability` + `@casl/mongoose` | 6 / 8 |
| Validation | `class-validator` + `class-transformer` | 0.14 |
| Hashing | bcrypt | 6 |
| Docs | `@nestjs/swagger` | 11 |
| Tests | Jest + `@nestjs/testing` + `ioredis-mock` | 30 |

---

## 3. Architecture du code

Arborescence **plate** sous `src/modules/` : chaque feature module (identite,
RBAC, auth) est un dossier direct, sans regroupement intermediaire
`identity/` ou `access/`. Le dossier `common/` regroupe tout ce qui est
transverse (CASL, guards, decorators, filtres). Il n'y a **pas** de
`src/dto/` ni `src/interfaces/` au niveau racine — tout DTO ou interface
partage vit sous `common/dto` ou `common/interfaces`, et tout DTO/interface
specifique a un module reste dans le dossier du module (`modules/.../dto/`).

```
src/
├── main.ts                        # bootstrap HTTP + hybrid microservice + Swagger
├── app.module.ts                  # wiring global + APP_GUARD/APP_FILTER
├── app.controller.ts              # GET /
│
├── common/                        # transverse — partage entre tous les modules
│   ├── casl/
│   │   ├── casl.module.ts
│   │   ├── casl-ability.factory.ts    # construit l'ability + cache Redis
│   │   └── tenant-scope.util.ts       # resolveCabinetScope(user)
│   ├── context/
│   │   ├── tenant-context.service.ts      # CLS — tenant actif
│   │   └── tenant-context.interceptor.ts  # injecte le tenant dans CLS
│   ├── decorators/
│   │   ├── check-policies.decorator.ts    # @CheckPolicies
│   │   ├── current-user.decorator.ts      # @CurrentUser (+ JwtUser)
│   │   └── public.decorator.ts            # @Public
│   ├── enums/
│   │   ├── casl-action.enum.ts            # 11 actions
│   │   └── casl-subject.enum.ts           # 22 subjects
│   ├── exceptions/
│   │   └── auth-error-codes.ts            # enum des codes d'erreur
│   ├── filters/
│   │   └── http-exception.filter.ts       # format d'erreur unifie
│   ├── guards/
│   │   ├── jwt-auth.guard.ts              # etape 1 du pipeline
│   │   └── policies.guard.ts              # etape 2 du pipeline
│   ├── mongoose/
│   │   └── tenant-scope.plugin.ts         # plugin cabinetId automatique
│   └── redis/
│       └── redis.module.ts                # provider ioredis global
│   # dto/         → a creer uniquement si un DTO est partage par 2+ modules
│   # interfaces/  → idem (ex: PaginatedResponse, JwtPayload)
│
├── modules/                       # tous les feature modules a plat
│   ├── auth/                              # QUI EST CONNECTE — authentification
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts                # orchestrateur login/register/reset
│   │   ├── controllers/
│   │   │   ├── admin-auth.controller.ts
│   │   │   ├── kine-auth.controller.ts
│   │   │   └── patient-auth.controller.ts
│   │   ├── services/
│   │   │   ├── tokens.service.ts          # access JWT + refresh Redis
│   │   │   └── unique-code.service.ts     # code 12 char patients
│   │   └── dto/                           # login / register / refresh / reset
│   │
│   ├── admins/                    # QUI EST QUI — utilisateurs + tenants
│   ├── kines/
│   ├── patients/
│   ├── cabinets/                          # service uniquement (pas d'API publique)
│   │
│   ├── actions/                   # QUI A LE DROIT — fondamentaux RBAC
│   │                                      # 11 verbes (READ, CREATE, ASSIGN, ...)
│   ├── modules/                           # 22 sujets (PATIENT, PROGRAM, ...)
│   ├── permissions/                       # 33 permissions (action + sujet)
│   └── roles/                             # 4 roles systeme + custom (heritage)
│
│   # (billing et autres microservices : voir services 2/3/4)
│
└── seeds/
    └── seed.ts                            # bootstrap MongoDB (roles, perms, users, cabinets)
```

### Convention DTO / interfaces partages

- **Specifique a un module** → reste dans `modules/.../dto/` ou
  `modules/.../interfaces/`. C'est le cas par defaut.
- **Partage par 2+ modules** → creer `common/dto/<name>.dto.ts` ou
  `common/interfaces/<name>.interface.ts`. Exemples typiques :
  `PaginationDto`, `IdParamDto`, `PaginatedResponse<T>`, `JwtPayload`.
- Nommage : `<name>.dto.ts` pour les DTOs, `<name>.interface.ts` pour
  les interfaces (convention NestJS, coherente avec l'existant).

Regle : ne **rien** mettre dans `common/dto` ou `common/interfaces`
"au cas ou". On y deplace une seule fois le besoin reel d'etre partage.

### Flux d'une requete authentifiee

```
Client ──Authorization: Bearer <JWT>──► Nest
                                         │
    1. JwtAuthGuard (APP_GUARD)          │
       ├─ si @Public  → passe            │
       └─ sinon: verify JWT              │
             → request.user = payload    │
                                         ▼
    2. PoliciesGuard (APP_GUARD)         │
       ├─ si pas de @CheckPolicies → passe
       └─ sinon: CaslAbilityFactory
             ├─ cache Redis perms:{userId} (TTL 1h)
             └─ sinon: MongoDB
                    ├─ Role.findOne({ slug, isActive })
                    ├─ populate parent (heritage)
                    ├─ populate permissions → modules + actions
                    └─ build ability avec conditions :
                         cabinetId: user.cabinetId       (multi-tenant)
                         ownershipField: user.sub       (si OWN)
             → request.ability = built
                                         ▼
    3. Controller handler
    4. ExceptionFilter → format JSON homogene
    5. Response
```

---

## 4. Pipeline de securite

### Global, pas manuel

Dans `src/app.module.ts` :

```ts
providers: [
  AppService,
  { provide: APP_GUARD, useClass: JwtAuthGuard },   // etape 1
  { provide: APP_GUARD, useClass: PoliciesGuard },  // etape 2
  { provide: APP_FILTER, useClass: HttpExceptionFilter },
],
```

→ **Toutes** les routes sont protegees par defaut. Pas besoin de
`@UseGuards(...)`. Les 2 guards s'executent dans l'ordre d'enregistrement.

### Matrice de protection

| Decorateurs sur la route | JWT | Policies | Usage |
|---|---|---|---|
| `@Public()` | skip | no-op | `login`, `register`, `forgot/verify/reset-password` |
| *(aucun)* | **requis** | no-op | `/me`, `/logout`, `/refresh` (personnels) |
| `@CheckPolicies((a) => a.can(ACTION, SUBJECT))` | **requis** | **applique** | CRUD admin back-office |

### JwtAuthGuard (`src/common/guards/jwt-auth.guard.ts`)

1. Lit `@Public()` via `Reflector` → skip si present.
2. Extrait le header `Authorization: Bearer <token>`.
3. `jwtService.verifyAsync(token)` avec le secret `.env`.
4. Pose `request.user = { sub, email, type, cabinetId, roleSlug }`.
5. Throw `UnauthorizedException` avec code `TOKEN_MISSING` / `TOKEN_INVALID`
   / `TOKEN_EXPIRED`.

### PoliciesGuard (`src/common/guards/policies.guard.ts`)

1. Lit `@CheckPolicies()` → si vide, `return true`.
2. Recupere `request.user` (pose par JwtAuthGuard).
3. `CaslAbilityFactory.createForUser(user)` :
   - Cache Redis `perms:{userId}` (TTL 1h, JSON.stringify des rules + flat).
   - Sinon : MongoDB → role + parentRoleId → permissions → modules + actions.
   - Fusionne parent ∪ enfant (enfant gagne, `ALL` > `OWN`).
   - `SUPER_ADMIN` → `can('manage', 'all')` (wildcards CASL natifs, lowercase).
   - Sinon : toujours `cabinetId: user.cabinetId` + `ownershipField: sub` si OWN.
4. Execute tous les handlers `@CheckPolicies`. Tous doivent renvoyer `true`,
   sinon `ForbiddenException({ code: PERMISSION_DENIED })`.
5. Pose `request.ability` pour usage downstream.

---

## 5. Modele RBAC CASL

### Actions (11) — `src/common/enums/casl-action.enum.ts`

Natives : `MANAGE`, `CREATE`, `READ`, `UPDATE`, `DELETE`.
Custom : `ASSIGN`, `EXPORT`, `SCHEDULE`, `IMPORT`, `BULK_ACTION`, `MANAGE_STATUS`.

### Subjects (22) — `src/common/enums/casl-subject.enum.ts`

| Microservice | Subjects |
|---|---|
| identity | `ADMIN`, `KINE`, `PATIENT`, `CABINET`, `ROLE`, `PERMISSION` |
| core | `EXERCISE`, `SESSION`, `PROGRAM`, `ASSIGNED_PROGRAM`, `SCHEDULED_SESSION`, `SESSION_EXECUTION`, `BILAN`, `KINE_NOTE`, `PATIENT_NOTE` |
| analytics | `BILAN_AI_CONFIG`, `SUPPORT_TICKET`, `FAQ` |
| billing | `PLAN`, `SUBSCRIPTION`, `INVOICE` |
| notification | `NOTIFICATION` |

### Roles systeme (4)

| Slug | Cabinet ? | Scope | Description |
|---|---|---|---|
| `SUPER_ADMIN` | non | `can('manage', 'all')` (wildcard natif CASL) | Admin plateforme, tous cabinets |
| `KINE_ADMIN` | oui | herite KINE + gestion cabinet | Admin du cabinet |
| `KINE` | oui | `OWN`/`ALL` selon permissions | Kine standard |
| `PATIENT` | (propre compte) | filtre `patientId = user.sub` | Acces lecture limite |

### Scopes

- **ALL** → voit tout dans son cabinet.
- **OWN** → condition = `moduleDoc.ownershipField = user.sub` (ex :
  `assignedKineId` pour PATIENT, `ownerId` pour EXERCISE, `kineId` pour BILAN).

### Cache

- Cle Redis : `perms:{userId}` — TTL **1h**.
- Invalide sur `RolesService.update/remove` (via `invalidateAll`).

### Tenant scoping (isolation par cabinet)

`@CheckPolicies((a) => a.can(ACTION, SUBJECT))` repond **"l'utilisateur a-t-il
ce droit ?"** mais **ne filtre pas** les lignes retournees par la DB. Sans
filtre explicite cote service, un `KINE_ADMIN` qui a `READ PATIENT` voit
tous les patients de tous les cabinets.

Les regles CASL contiennent bien la condition `{ cabinetId: user.cabinetId }`,
mais elles ne sont appliquees aux requetes Mongo que si on les thread
manuellement dans le service. D'ou le pattern suivant, obligatoire sur toute
entite tenant-scoped (`Patient`, `Kine`, ...) :

**Controller** — extraire la portee via `resolveCabinetScope(user)` :

```ts
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { resolveCabinetScope } from '../../common/casl/tenant-scope.util';

@Get()
@CheckPolicies((a) => a.can(CaslAction.READ, CaslSubject.PATIENT))
findAll(@CurrentUser() user: JwtUser) {
  return this.patientsService.findAll(resolveCabinetScope(user));
}
```

**Service** — accepter `cabinetId: string | null` et filtrer :

```ts
async findAll(cabinetId: string | null) {
  const filter: any = { isActive: true };
  if (cabinetId) filter.cabinetId = cabinetId;
  return this.patientModel.find(filter).populate('roleId').exec();
}

async findOne(id: string, cabinetId: string | null) {
  const filter: any = { _id: id };
  if (cabinetId) filter.cabinetId = cabinetId;
  const doc = await this.patientModel.findOne(filter)...;
  if (!doc) throw new NotFoundException(...);  // 404 si cabinet mismatch
  return doc;
}
```

`resolveCabinetScope` (`src/common/casl/tenant-scope.util.ts`) retourne :
- `null` si `roleSlug === 'SUPER_ADMIN'` → pas de filtre, acces plateforme.
- `user.cabinetId` sinon → filtre Mongo strict sur `cabinetId`.

Regles importantes :
- `create` → force `cabinetId = user.cabinetId` (sauf SUPER_ADMIN), peu
  importe le DTO, pour empecher qu'un KINE_ADMIN cree dans un autre cabinet.
- `update` → supprime `dto.cabinetId` avant le patch pour qu'un kine ne
  puisse pas deplacer une ressource vers un autre cabinet.
- `findOne` / `update` / `remove` → le filtre contient `_id` **ET**
  `cabinetId` ; un mismatch renvoie `404`, pas `403`, pour ne pas reveler
  l'existence de la ressource.
- Les appels internes (auth/register, `findAnyById`) passent `null` (portee
  plateforme) : le service fait confiance a l'appelant.

Entites plateforme (`Admin`, `Role`, `Permission`, `Action`, `Module`) n'ont
pas de `cabinetId`. Seul `SUPER_ADMIN` a la permission dans le seed, donc
`ability.can(...)` suffit — pas besoin de scope.

---

## 6. Demarrage — etape par etape

### 6.1 Prerequis

- Node.js >= 20
- npm >= 10
- Docker Desktop

### 6.2 Installation

```bash
cd physioandconnect_backend_service1
npm install
```

### 6.3 Infrastructure (Mongo + Redis + RabbitMQ)

```bash
docker compose up -d mongodb rabbitmq redis
docker ps   # verifier 3 conteneurs "Up"
```

### 6.4 Fichier `.env`

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/physio_identity
RABBITMQ_URL=amqp://localhost:5672
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-change-me
JWT_EXPIRES_IN=24h
```

### 6.5 Seed la base

```bash
npm run seed
```

Cree : 11 actions, 22 modules, 33 permissions, 4 roles, 2 cabinets, 8 users.

### 6.6 Lancer le service

```bash
npm run start:dev
```

Attendu :

```
Identity Service is running on port: 3001
Swagger docs: http://localhost:3001/api/docs
```

### 6.7 Lancer les tests

```bash
npm test          # voir section 10
```

---

## 7. Scripts npm

| Script | Commande | Role |
|---|---|---|
| `start:dev` | `nest start --watch` | Dev avec hot-reload |
| `start:prod` | `node dist/main` | Prod |
| `build` | `nest build` | Compile `dist/` |
| `seed` | `ts-node ... src/seeds/seed.ts` | Seed MongoDB |
| `test` | `jest` | Tests unitaires |
| `test:watch` | `jest --watch` | Watch |
| `test:cov` | `jest --coverage` | Couverture |
| `test:e2e` | `jest --config test/jest-e2e.json` | E2E |
| `lint` | `eslint ... --fix` | Lint |
| `format` | `prettier --write` | Format |

---

## 8. Comptes de test (seed)

### Plateforme

| Email | Password | Role |
|---|---|---|
| `admin@physioconnect.com` | `Admin123!` | `SUPER_ADMIN` |

### Cabinet Paris

| Email | Password | Role | Lien |
|---|---|---|---|
| `sophie.martin@cabinet-paris.fr` | `KineAdmin123!` | `KINE_ADMIN` | admin du cabinet |
| `ali.dupont@cabinet-paris.fr` | `Kine123!` | `KINE` | praticien de Marie |
| `lea.bernard@cabinet-paris.fr` | `Kine123!` | `KINE` | praticien de Paul |
| `marie.durand@patient.fr` | `Patient123!` | `PATIENT` | assignedKine = Ali |
| `paul.martin@patient.fr` | `Patient123!` | `PATIENT` | assignedKine = Lea |

### Cabinet Lyon

| Email | Password | Role | Lien |
|---|---|---|---|
| `pierre.roux@cabinet-lyon.fr` | `KineAdmin123!` | `KINE_ADMIN` | admin du cabinet |
| `camille.petit@cabinet-lyon.fr` | `Kine123!` | `KINE` | praticien de Lucas |
| `lucas.moreau@patient.fr` | `Patient123!` | `PATIENT` | assignedKine = Camille |

### Patients fictifs (templates STUDENT freemium sandbox)

Le seed cree **5 patients templates** (`isTemplate: true`, `source: 'fictif'`,
`ownerId: null`) qui ne sont jamais retournes par les requetes applicatives
(un pre-find hook injecte `{ isTemplate: { $ne: true } }` par defaut).

| `templateCode` | Profil clinique |
|---|---|
| `fictif-lowerback-001` | Lombalgie chronique |
| `fictif-postopknee-001` | Post-op genou |
| `fictif-sciatica-001` | Sciatique L5-S1 |
| `fictif-shoulder-001` | Conflit sous-acromial |
| `fictif-cervical-001` | Cervicalgie de tension |

**Provisionnement automatique** : a chaque ajout d'un profil `STUDENT`
(via `POST /kine/auth/register-kine` ou `addProfileToKine`),
`AuthService.provisionFictifSandboxForStudent` clone ces 5 templates en
patients reels possedes par le kine (`ownerId = kineId`, `source: 'fictif'`,
`isTemplate: false`, email synthetique `sandbox-{kineIdSuffix}-{i}@sandbox.physioandconnect.local`).
Le hook est idempotent : un kine qui possede deja >= 1 patient fictif est
ignore. Les echecs de clone sont logges (`[fictif-clone] FAILED ...`) mais
ne bloquent jamais l'inscription. Au boot, `PatientsService.onModuleInit`
warn si aucun template n'existe en DB.

**Filtrage cote API** : `GET /api/v1/kine/patients?source=real|fictif|all`
permet a la UI d'afficher un onglet "Bac a sable" separe.

---

## 9. Tester via Swagger

1. Ouvre <http://localhost:3001/api/docs>.
2. `POST /api/admin/v1/auth/login` → copie `accessToken`.
3. Clique **Authorize** en haut → colle le token → **Authorize**.
4. Teste les endpoints proteges (tous `@ApiBearerAuth('access-token')`).

### Scenarios cles

| Scenario | Resultat attendu |
|---|---|
| Sans Authorization → `GET /api/admin/v1/kines` | 401 `TOKEN_MISSING` |
| Token bricole | 401 `TOKEN_INVALID` |
| Login PATIENT puis `POST /api/admin/v1/kines` | 403 `PERMISSION_DENIED` |
| Login KINE Paris → `GET /api/admin/v1/patients` | 200, **uniquement** patients Paris |
| Login SUPER_ADMIN → idem | 200, **tous** cabinets |
| Login Ali (KINE) → `PATCH /patients/{marie.id}` | 200 (Marie = son patient, scope OWN) |
| Login Ali (KINE) → `PATCH /patients/{paul.id}` | 403 (Paul = patient de Lea, pas le sien) |

Guide detaille : [`docs/RUN-AND-TEST-GUIDE.md`](docs/RUN-AND-TEST-GUIDE.md)

---

## 10. Tests unitaires — inventaire et statut

### Detail par suite

La logique de password-reset a ete inlinee dans `AuthService`
(plus de `password-reset.service.ts` standalone) ; les specs associees
sont couvertes par `auth.service.spec.ts`.

| # | Suite | Fichier | Statut |
|---|---|---|---|
| 1 | `AuthService` | `modules/auth/auth.service.spec.ts` | ✅ |
| 2 | `CaslAbilityFactory` | `common/casl/casl-ability.factory.spec.ts` | ✅ |
| 3 | `AdminsService` | `modules/admins/admins.service.spec.ts` | ✅ |
| 4 | `KinesService` | `modules/kines/kines.service.spec.ts` | ✅ |
| 5 | `PatientsService` | `modules/patients/patients.service.spec.ts` | ✅ |
| 6 | `TokensService` | `modules/auth/services/tokens.service.spec.ts` | ✅ |
| 7 | `PoliciesGuard` | `common/guards/policies.guard.spec.ts` | ✅ |
| 8 | `RolesService` | `modules/roles/roles.service.spec.ts` | ✅ |
| 9 | `JwtAuthGuard` | `common/guards/jwt-auth.guard.spec.ts` | ✅ |
| 10 | `PermissionsService` | `modules/permissions/permissions.service.spec.ts` | ✅ |
| 11 | `ModulesService` | `modules/modules/modules.service.spec.ts` | ✅ |
| 12 | `ActionsService` | `modules/actions/actions.service.spec.ts` | ✅ |
| 13 | `AppController` | `app.controller.spec.ts` | ✅ |

### Couverture par couche

- **Guards** — JwtAuthGuard : skip `@Public`, token missing/invalid/expired, pose `request.user`. PoliciesGuard : handlers vides, user absent, build ability, evaluation multi-handlers, flag `request.ability`.
- **CASL** — SUPER_ADMIN wildcard, role sans perms, heritage `parentRoleId`, condition `cabinetId`, condition `ownershipField` (OWN), cache Redis hit/miss/invalidate, fusion ALL > OWN.
- **Auth** — `AuthService` : register{Kine,Patient}, login{Kine,Patient,Admin}, refresh, logout, `buildMe`, password-reset 3 etapes (forgot / verify / reset). `TokensService` : generation access/refresh, rotation, revocation Redis.
- **Services RBAC** — Roles (heritage, protection roles systeme, invalidation cache), Permissions, Actions, Modules.
- **Services users** — Admins (status, soft-delete), Kines (scope cabinet, hash password), Patients (uniqueCode, scope).

### Lancer une suite en particulier

```bash
npx jest jwt-auth.guard           # 5 tests
npx jest casl-ability.factory     # 13 tests
npx jest auth.service.spec        # 14 tests
```

### E2E

`test/app.e2e-spec.ts` present. Lancer avec `npm run test:e2e`
(necessite Mongo/Redis up).

---

## 11. Codes d'erreur

| Code | HTTP | Source |
|---|---|---|
| `TOKEN_MISSING` | 401 | JwtAuthGuard |
| `TOKEN_INVALID` | 401 | JwtAuthGuard |
| `TOKEN_EXPIRED` | 401 | JwtAuthGuard |
| `INVALID_CREDENTIALS` | 401 | AuthService |
| `PERMISSION_DENIED` | 403 | PoliciesGuard |
| `EMAIL_ALREADY_USED` | 409 | AuthService |
| `CODE_INVALID` | 400 | PasswordResetService |
| `CODE_EXPIRED` | 400 | PasswordResetService |
| `CODE_TOO_MANY_ATTEMPTS` | 400 | PasswordResetService |

Format homogene (via `HttpExceptionFilter`) :

```json
{ "statusCode": 401, "code": "TOKEN_EXPIRED", "message": "Token expire" }
```

---

## 12. Documentation complementaire

| Fichier | Contenu |
|---|---|
| [`docs/Architecture_CASL_Auth_Flows.pdf`](docs/Architecture_CASL_Auth_Flows.pdf) | Vue d'ensemble PDF : arborescence, CASL (OWN/ALL), login/register/reset, seed |
| [`docs/CASL_Flow_Login_to_Update.pdf`](docs/CASL_Flow_Login_to_Update.pdf) | Diagramme swimlane : login -> PATCH patient (happy path + 403), internals CASL |
| [`docs/CASL_Rules_Optimization.pdf`](docs/CASL_Rules_Optimization.pdf) | Expose `rules` dans login/me + alternative session tout-en-un dans Redis |
| [`docs/FRONTEND-CASL-INTEGRATION.md`](docs/FRONTEND-CASL-INTEGRATION.md) | Guide frontend : comment consommer `rules` + checks par ligne |
| [`docs/ATLAS-SETUP.md`](docs/ATLAS-SETUP.md) | Passer du Mongo local a MongoDB Atlas (M0 free) |
| [`docs/RUN-AND-TEST-GUIDE.md`](docs/RUN-AND-TEST-GUIDE.md) | Guide run + Swagger pas a pas + audit endpoints |
| [`docs/SWAGGER-TESTING-GUIDE.md`](docs/SWAGGER-TESTING-GUIDE.md) | Scenarios Swagger detailles |
| [`docs/list_api.md`](docs/list_api.md) | Liste exhaustive des endpoints |
| [`docs/mogodb_models.md`](docs/mogodb_models.md) | Schemas MongoDB |
| [`docs/casl-permissions-implementation-report.md`](docs/casl-permissions-implementation-report.md) | Rapport d'implementation CASL |
| [`docs/implementation-plan-casl-permissions.md`](docs/implementation-plan-casl-permissions.md) | Plan d'implementation |
| [`docs/COMPATIBILITY-ANALYSIS.md`](docs/COMPATIBILITY-ANALYSIS.md) | Compatibilite APIs / modeles |
| [`docs/SENIOR-REVIEW-SPRINT1-V2.md`](docs/SENIOR-REVIEW-SPRINT1-V2.md) | Revue senior Sprint 1 |
| [`docs/SPRINT1-V2-IMPLEMENTATION-REPORT.md`](docs/SPRINT1-V2-IMPLEMENTATION-REPORT.md) | Rapport Sprint 1 v2 |

---

## Deploiement

`docker-compose.yml` lance l'ensemble (Mongo + RabbitMQ + Redis + service) :

```bash
docker compose up -d
```

`Dockerfile` multi-stage optimise pour production.
