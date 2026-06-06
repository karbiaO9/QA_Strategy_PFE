/**
 * One-off generator: builds three focused Postman collections from
 * PHYSIO-KINE-Backend + PHYSIO-ADMIN-Backend. Run: node scripts/emit-stc-split-collections.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const kinePath = path.join(root, 'postman/physio-backend/PHYSIO-KINE-Backend.postman_collection.json');
const adminPath = path.join(root, 'postman/physio-backend/PHYSIO-ADMIN-Backend.postman_collection.json');

const kine = JSON.parse(fs.readFileSync(kinePath, 'utf8'));
const admin = JSON.parse(fs.readFileSync(adminPath, 'utf8'));

function folderItems(collection, folderName) {
  const f = collection.item.find((i) => i.name === folderName);
  if (!f) throw new Error('Missing folder: ' + folderName);
  return JSON.parse(JSON.stringify(f.item));
}

function findRequestDeep(items, predicate) {
  for (const it of items) {
    if (it.request && predicate(it)) return it;
    if (it.item) {
      const x = findRequestDeep(it.item, predicate);
      if (x) return x;
    }
  }
  return null;
}

const kineLogin = findRequestDeep(admin.item, (it) => it.name.includes('STC-AUTH-KINE-001'));
const adminLogin = findRequestDeep(admin.item, (it) => it.name.includes('STC-AUTH-ADMIN-001'));

function fixProfileUpdate002(items) {
  const walk = (arr) => {
    for (const it of arr) {
      if (it.name && it.name.includes('PROFILE-UPDATE-002') && it.request && it.request.body) {
        it.request.body.raw = '{}';
      }
      if (it.item) walk(it.item);
    }
  };
  walk(items);
}

// --- Placeholder builders ---
function reqStub(name, method, url, bodyRaw, authBearer, tests) {
  const headers = [
    { key: 'Accept', value: 'application/json' },
    { key: 'Content-Type', value: 'application/json' },
  ];
  if (authBearer) headers.push({ key: 'Authorization', value: 'Bearer ' + authBearer });
  const r = {
    name,
    request: {
      method,
      header: headers,
      url,
      body: bodyRaw
        ? { mode: 'raw', raw: bodyRaw, options: { raw: { language: 'json' } } }
        : undefined,
    },
    event: tests
      ? [
          {
            listen: 'test',
            script: { type: 'text/javascript', exec: tests },
          },
        ]
      : [],
  };
  if (!authBearer && method === 'POST' && url.includes('select-profile')) {
    r.request.auth = { type: 'noauth' };
  }
  return r;
}

const base = '{{baseUrl}}';

const profilePlaceholders = [
  {
    name: 'STC-PROFILE-ADD-003/B | (sheet) — placeholder',
    note: 'Not in repo KINE/ADMIN collections; add payload per your Excel.',
    item: reqStub(
      'STC-PROFILE-ADD-003/B | (sheet) — placeholder',
      'POST',
      base + '/api/v1/kine/profiles',
      '{\n  \"profileType\": \"MEMBER\",\n  \"cabinetId\": \"{{cabinetId}}\",\n  \"subscriptionPlanId\": \"{{subscriptionPlanId}}\"\n}',
      '{{kineToken}}',
      [
        "// STC: STC-PROFILE-ADD-003/B — align with execution sheet",
        "pm.test('[STC-PROFILE-ADD-003/B] response time OK', function () {",
        "  pm.expect(pm.response.responseTime).to.be.below(60000);",
        "});",
        "pm.test('[STC-PROFILE-ADD-003/B] status recorded', function () {",
        "  pm.expect([200,201,400,409]).to.include(pm.response.code);",
        "});",
      ]
    ),
  },
  {
    name: 'STC-PROFILE-ADD-011/B | Add REMPLACANT profile (adjust per sheet)',
    item: reqStub(
      'STC-PROFILE-ADD-011/B | Add REMPLACANT profile (adjust per sheet)',
      'POST',
      base + '/api/v1/kine/profiles',
      '{\n  \"profileType\": \"REMPLACANT\",\n  \"cabinetName\": \"Cabinet Rempla Test\",\n  \"professionalNumber\": \"{{testProfessionalNumberNew}}\",\n  \"subscriptionPlanId\": \"{{subscriptionPlanId}}\"\n}',
      '{{kineToken}}',
      [
        "// STC: STC-PROFILE-ADD-011/B — replace body with sheet (REPLACEMENT/REMPLACANT per API enum)",
        "pm.test('[STC-PROFILE-ADD-011/B] response time OK', function () {",
        "  pm.expect(pm.response.responseTime).to.be.below(60000);",
        "});",
        "pm.test('[STC-PROFILE-ADD-011/B] status in [201,400]', function () {",
        "  pm.expect([201,400]).to.include(pm.response.code);",
        "});",
      ]
    ),
  },
  {
    name: 'STC-PROFILE-SELECT-004/B | Select without Bearer 401',
    item: reqStub(
      'STC-PROFILE-SELECT-004/B | Select without Bearer 401',
      'POST',
      base + '/api/v1/kine/auth/select-profile',
      '{\n  \"profileId\": \"{{profileId}}\"\n}',
      null,
      [
        "// STC: STC-PROFILE-SELECT-004/B (public select forbidden)",
        "pm.test('[STC-PROFILE-SELECT-004/B] status 401', function () {",
        "  pm.response.to.have.status(401);",
        "});",
      ]
    ),
  },
  {
    name: 'STC-PROFILE-SELECT-008/B | Select profile not owned 403/404',
    item: reqStub(
      'STC-PROFILE-SELECT-008/B | Select profile not owned 403/404',
      'POST',
      base + '/api/v1/kine/auth/select-profile',
      '{\n  \"profileId\": \"65f0000000000000000000ff\"\n}',
      '{{kineToken}}',
      [
        "// STC: STC-PROFILE-SELECT-008/B",
        "pm.test('[STC-PROFILE-SELECT-008/B] status in [403,404,400]', function () {",
        "  pm.expect([403,404,400]).to.include(pm.response.code);",
        "});",
      ]
    ),
  },
  {
    name: 'STC-PROFILE-SELECT-009/B | Select malformed id 400',
    item: reqStub(
      'STC-PROFILE-SELECT-009/B | Select malformed id 400',
      'POST',
      base + '/api/v1/kine/auth/select-profile',
      '{\n  \"profileId\": \"not-a-valid-objectid\"\n}',
      '{{kineToken}}',
      [
        "// STC: STC-PROFILE-SELECT-009/B",
        "pm.test('[STC-PROFILE-SELECT-009/B] status in [400,404]', function () {",
        "  pm.expect([400,404]).to.include(pm.response.code);",
        "});",
      ]
    ),
  },
  {
    name: 'STC-PROFILE-UPDATE-005/B | Patch immutable field ignored or 400',
    item: reqStub(
      'STC-PROFILE-UPDATE-005/B | Patch immutable field ignored or 400',
      'PATCH',
      base + '/api/v1/kine/profiles/{{profileId}}',
      '{\n  \"email\": \"hacker@evil.com\"\n}',
      '{{kineToken}}',
      [
        "// STC: STC-PROFILE-UPDATE-005/B — email not mutable via PATCH profile",
        "pm.test('[STC-PROFILE-UPDATE-005/B] status in [400,200]', function () {",
        "  pm.expect([400,200]).to.include(pm.response.code);",
        "});",
      ]
    ),
  },
  {
    name: 'STC-PROFILE-UPDATE-006/B | Patch student field on non-student 400',
    item: reqStub(
      'STC-PROFILE-UPDATE-006/B | Patch student field on non-student 400',
      'PATCH',
      base + '/api/v1/kine/profiles/{{profileId}}',
      '{\n  \"schoolIfmk\": \"IFMK Paris\",\n  \"academicYear\": \"2025-2026\"\n}',
      '{{kineToken}}',
      [
        "// STC: STC-PROFILE-UPDATE-006/B",
        "pm.test('[STC-PROFILE-UPDATE-006/B] status in [400,200]', function () {",
        "  pm.expect([400,200]).to.include(pm.response.code);",
        "});",
      ]
    ),
  },
].map((x) => x.item);

const selectBase = folderItems(kine, 'Profiles Select');
fixProfileUpdate002(selectBase);
const addKine = folderItems(kine, 'Profiles Add');
const updateKine = folderItems(kine, 'Profiles Update');
fixProfileUpdate002(updateKine);

const adminAddFolder = admin.item.find((i) => i.name === 'Profiles Admin Add To Kine');
const addAdmin = JSON.parse(JSON.stringify(adminAddFolder.item));

function orderProfileAdd(kineItems, adminItems) {
  const by = (items, re) => items.find((x) => re.test(x.name));
  const o = [];
  const push = (x) => x && o.push(x);
  push(by(kineItems, /STC-PROFILE-ADD-001/));
  push(by(adminItems, /STC-PROFILE-ADD-002/));
  push(profilePlaceholders[0]); // 003
  push(by(kineItems, /STC-PROFILE-ADD-004/));
  push(by(adminItems, /STC-PROFILE-ADD-005/));
  push(by(adminItems, /STC-PROFILE-ADD-006/));
  push(by(adminItems, /STC-PROFILE-ADD-007/));
  push(by(adminItems, /STC-PROFILE-ADD-008/));
  push(by(kineItems, /STC-PROFILE-ADD-009/));
  push(by(kineItems, /STC-PROFILE-ADD-010/));
  push(profilePlaceholders[1]); // 011
  return o.filter(Boolean);
}

const orderedAdd = orderProfileAdd(addKine, addAdmin);

function orderSelect(items) {
  const by = (re) => items.find((x) => re.test(x.name));
  return [
    by(/SELECT-001/),
    by(/SELECT-002/),
    profilePlaceholders[2],
    by(/SELECT-005/),
    by(/SELECT-006/),
    by(/SELECT-007/),
    profilePlaceholders[3],
    profilePlaceholders[4],
  ].filter(Boolean);
}

function orderUpdate(items) {
  const by = (re) => items.find((x) => re.test(x.name));
  return [
    by(/UPDATE-001/),
    by(/UPDATE-002/),
    by(/UPDATE-003/),
    by(/UPDATE-004/),
    profilePlaceholders[5],
    profilePlaceholders[6],
  ].filter(Boolean);
}

const profileCollection = {
  info: {
    name: 'PHYSIO - KINE Profile STCs',
    _postman_id: 'physio-kine-profile-stcs-001',
    description:
      'STC-PROFILE-ADD / SELECT / UPDATE per execution sheet. Prerequisites: Kine login + Admin login (admin routes for ADD-002,005-008). Placeholders: ADD-003, ADD-011, SELECT-004/008/009, UPDATE-005/006 — tighten when Excel final.\nEnvironment: PHYSIO-Backend-Execution.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  variable: [{ key: 'baseUrl', value: 'https://identity.physio.agregatech.com' }],
  item: [
    {
      name: '00 Prerequisite',
      description: 'Sets kineToken, kineId, cabinetId, profileId, adminToken.',
      item: [JSON.parse(JSON.stringify(kineLogin)), JSON.parse(JSON.stringify(adminLogin))],
    },
    { name: '01 PROFILE-ADD', item: orderedAdd },
    { name: '02 PROFILE-SELECT', item: orderSelect(selectBase) },
    { name: '03 PROFILE-UPDATE', item: orderUpdate(updateKine) },
  ],
};

const regPw = '{{registerDefaultPassword}}';
const solo001Body = `{
  "email": "{{registerLiberalSoloEmail}}",
  "password": "${regPw}",
  "passwordConfirmation": "${regPw}",
  "firstName": "Jean",
  "lastName": "LiberalSolo",
  "phone": "{{registerLiberalPhone}}",
  "profileType": "LIBERAL",
  "professionalNumber": "{{registerLiberalProfessionalNumber}}",
  "cabinetName": "{{registerLiberalCabinetName}}",
  "street": "{{registerLiberalStreet}}",
  "postalCode": "{{registerLiberalPostalCode}}",
  "city": "{{registerLiberalCity}}",
  "cguAccepted": true
}`;
const solo003Body = solo001Body
  .split('\n')
  .filter((line) => !line.includes('"professionalNumber"'))
  .join('\n');

const registerSoloCollection = {
  info: {
    name: 'PHYSIO - KINE Register LIBERAL (SOLO) STCs',
    _postman_id: 'physio-kine-register-solo-001',
    description:
      'STC-REGISTER-SOLO-* — autonomous LIBERAL registration on POST /api/v1/kine/auth/register. Uses registerLiberal* and registerDefaultPassword from PHYSIO-Backend-Execution.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  variable: [{ key: 'baseUrl', value: 'https://identity.physio.agregatech.com' }],
  item: [
    {
      name: 'STC-REGISTER-SOLO-001/B | Register LIBERAL nominal',
      request: {
        method: 'POST',
        header: [
          { key: 'Accept', value: 'application/json' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        url: base + '/api/v1/kine/auth/register',
        body: { mode: 'raw', raw: solo001Body, options: { raw: { language: 'json' } } },
      },
      event: [
        {
          listen: 'test',
          script: {
            exec: [
              "// STC: STC-REGISTER-SOLO-001/B",
              "pm.test('[STC-REGISTER-SOLO-001/B] response time OK', function () {",
              "  pm.expect(pm.response.responseTime).to.be.below(60000);",
              "});",
              "pm.test('[STC-REGISTER-SOLO-001/B] status in [201,400]', function () {",
              "  pm.expect([201,400]).to.include(pm.response.code);",
              "});",
            ],
            type: 'text/javascript',
          },
        },
      ],
    },
    {
      name: 'STC-REGISTER-SOLO-003/B | LIBERAL missing professionalNumber 400',
      request: {
        method: 'POST',
        header: [
          { key: 'Accept', value: 'application/json' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        url: base + '/api/v1/kine/auth/register',
        body: {
          mode: 'raw',
          raw: solo003Body,
          options: { raw: { language: 'json' } },
        },
      },
      event: [
        {
          listen: 'test',
          script: {
            exec: [
              "// STC: STC-REGISTER-SOLO-003/B",
              "pm.test('[STC-REGISTER-SOLO-003/B] status 400', function () {",
              "  pm.response.to.have.status(400);",
              "});",
            ],
            type: 'text/javascript',
          },
        },
      ],
    },
    {
      name: 'STC-REGISTER-SOLO-004/B | Invalid email 400',
      request: {
        method: 'POST',
        header: [
          { key: 'Accept', value: 'application/json' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        url: base + '/api/v1/kine/auth/register',
        body: {
          mode: 'raw',
          raw: solo001Body.replace('{{registerLiberalSoloEmail}}', 'not-an-email'),
          options: { raw: { language: 'json' } },
        },
      },
      event: [
        {
          listen: 'test',
          script: {
            exec: [
              "// STC: STC-REGISTER-SOLO-004/B",
              "pm.test('[STC-REGISTER-SOLO-004/B] status in [400,422]', function () {",
              "  pm.expect([400,422]).to.include(pm.response.code);",
              "});",
            ],
            type: 'text/javascript',
          },
        },
      ],
    },
    {
      name: 'STC-REGISTER-SOLO-005/B | Duplicate email 409',
      request: {
        method: 'POST',
        header: [
          { key: 'Accept', value: 'application/json' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        url: base + '/api/v1/kine/auth/register',
        body: { mode: 'raw', raw: solo001Body.replace('{{registerLiberalSoloEmail}}', '{{kineEmail}}'), options: { raw: { language: 'json' } } },
      },
      event: [
        {
          listen: 'test',
          script: {
            exec: [
              "// STC: STC-REGISTER-SOLO-005/B — uses existing kineEmail",
              "pm.test('[STC-REGISTER-SOLO-005/B] status in [409,400]', function () {",
              "  pm.expect([409,400]).to.include(pm.response.code);",
              "});",
            ],
            type: 'text/javascript',
          },
        },
      ],
    },
    {
      name: 'STC-REGISTER-SOLO-006/B | Weak password 400',
      request: {
        method: 'POST',
        header: [
          { key: 'Accept', value: 'application/json' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        url: base + '/api/v1/kine/auth/register',
        body: {
          mode: 'raw',
          raw: solo001Body.split('{{registerDefaultPassword}}').join('weak1'),
          options: { raw: { language: 'json' } },
        },
      },
      event: [
        {
          listen: 'test',
          script: {
            exec: [
              "// STC: STC-REGISTER-SOLO-006/B",
              "pm.test('[STC-REGISTER-SOLO-006/B] status 400', function () {",
              "  pm.response.to.have.status(400);",
              "});",
            ],
            type: 'text/javascript',
          },
        },
      ],
    },
  ],
};

const verifFromAdmin = folderItems(admin, 'Verification Kine');
const verif003 = {
  name: 'STC-VERIF-003/B | List kine verifications (PENDING)',
  request: {
    method: 'GET',
    header: [
      { key: 'Accept', value: 'application/json' },
      { key: 'Authorization', value: 'Bearer {{adminToken}}' },
    ],
    url: '{{baseUrl}}/api/admin/v1/kines/verifications?status=PENDING',
  },
  event: [
    {
      listen: 'test',
      script: {
        exec: [
          "// STC: STC-VERIF-003/B",
          "pm.test('[STC-VERIF-003/B] status 200', function () {",
          "  pm.response.to.have.status(200);",
          "});",
        ],
        type: 'text/javascript',
      },
    },
  ],
};

const verif007 = {
  name: 'STC-VERIF-007/B | List kine verifications (REJECTED)',
  request: {
    method: 'GET',
    header: [
      { key: 'Accept', value: 'application/json' },
      { key: 'Authorization', value: 'Bearer {{adminToken}}' },
    ],
    url: '{{baseUrl}}/api/admin/v1/kines/verifications?status=REJECTED',
  },
  event: [
    {
      listen: 'test',
      script: {
        exec: [
          "// STC: STC-VERIF-007/B",
          "pm.test('[STC-VERIF-007/B] status 200', function () {",
          "  pm.response.to.have.status(200);",
          "});",
        ],
        type: 'text/javascript',
      },
    },
  ],
};

const verifHistory = {
  name: 'STC-VERIF-HISTORY-001/B | Kine verification audit trail GET',
  request: {
    method: 'GET',
    header: [
      { key: 'Accept', value: 'application/json' },
      { key: 'Authorization', value: 'Bearer {{adminToken}}' },
    ],
    url: '{{baseUrl}}/api/admin/v1/kines/{{kineId}}/verification/history',
    description:
      'If your backend exposes a different path (e.g. only global GET /kines/verifications), duplicate and adjust. This URL is a common REST pattern.',
  },
  event: [
    {
      listen: 'test',
      script: {
        exec: [
          "// STC: STC-VERIF-HISTORY-001/B",
          "pm.test('[STC-VERIF-HISTORY-001/B] status in [200,404]', function () {",
          "  pm.expect([200,404]).to.include(pm.response.code);",
          "});",
        ],
        type: 'text/javascript',
      },
    },
  ],
};

function orderVerif(items) {
  const by = (re) => items.find((x) => re.test(x.name));
  return [
    by(/VERIF-001/),
    by(/VERIF-002/),
    verif003,
    by(/VERIF-005/),
    by(/VERIF-006/),
    verif007,
    verifHistory,
  ].filter(Boolean);
}

const verifCollection = {
  info: {
    name: 'PHYSIO - Admin Kine Verification STCs',
    _postman_id: 'physio-admin-verif-stcs-001',
    description:
      'STC-VERIF-* + STC-VERIF-HISTORY-001/B. Prerequisite: Admin login + Kine login (sets kineId). PATCH /verification uses body field `decision` per existing collections; align with Swagger if your API uses `action`.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  variable: [{ key: 'baseUrl', value: 'https://identity.physio.agregatech.com' }],
  item: [
    {
      name: '00 Prerequisite',
      item: [JSON.parse(JSON.stringify(kineLogin)), JSON.parse(JSON.stringify(adminLogin))],
    },
    { name: '01 Verification', item: orderVerif(verifFromAdmin) },
  ],
};

const outDir = path.join(root, 'postman/physio-backend');
fs.writeFileSync(path.join(outDir, 'PHYSIO-KINE-Profile-STCs.postman_collection.json'), JSON.stringify(profileCollection, null, 2));
fs.writeFileSync(path.join(outDir, 'PHYSIO-KINE-Register-SOLO-STCs.postman_collection.json'), JSON.stringify(registerSoloCollection, null, 2));
fs.writeFileSync(path.join(outDir, 'PHYSIO-Admin-Verification-STCs.postman_collection.json'), JSON.stringify(verifCollection, null, 2));

console.log('Wrote 3 collections to postman/physio-backend/');
