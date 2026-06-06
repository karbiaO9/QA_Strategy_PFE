const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OLD_DIR = path.join(ROOT, 'sprint1 files');
const NEW_DIR = path.join(ROOT, 'sprint1');

const SOURCE_COLLECTION = path.join(OLD_DIR, 'physio-postman-collection.json');
const SOURCE_ENV = path.join(OLD_DIR, 'physio-postman-environment.json');
const MAPPING_TABLE = path.join(OLD_DIR, 'tables', 'new-20260430151902.md');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function requestUrlString(request) {
  if (!request || !request.url) return '';
  if (typeof request.url === 'string') return request.url;
  if (request.url.raw) return request.url.raw;
  return '';
}

function roleForRequest(request) {
  const url = requestUrlString(request).toLowerCase();
  if (url.includes('/api/admin/')) return 'admin';
  if (url.includes('/api/v1/patient/')) return 'patient';
  if (url.includes('/api/v1/kine/')) return 'kine';
  return null;
}

function rewriteTokenVars(node, role) {
  if (!node || typeof node !== 'object') return;
  const tokenVar = role === 'admin' ? 'adminAccessToken' : role === 'patient' ? 'patientAccessToken' : 'kineAccessToken';

  Object.keys(node).forEach((key) => {
    const value = node[key];
    if (typeof value === 'string') {
      node[key] = value
        .replaceAll('{{accessToken}}', `{{${tokenVar}}}`)
        .replaceAll('{{adminAccessToken}}', role === 'admin' ? '{{adminAccessToken}}' : `{{${tokenVar}}}`)
        .replaceAll('{{patientAccessToken}}', role === 'patient' ? '{{patientAccessToken}}' : `{{${tokenVar}}}`);
    } else if (Array.isArray(value)) {
      value.forEach((item) => rewriteTokenVars(item, role));
    } else if (value && typeof value === 'object') {
      rewriteTokenVars(value, role);
    }
  });
}

function normalizeTestScriptForRole(testScriptExec, role) {
  const tokenVar = role === 'admin' ? 'adminAccessToken' : role === 'patient' ? 'patientAccessToken' : 'kineAccessToken';
  return testScriptExec.map((line) => {
    if (typeof line !== 'string') return line;
    return line
      .replaceAll("pm.environment.set('accessToken', json.accessToken);", '')
      .replaceAll('pm.environment.set("accessToken", json.accessToken);', '')
      .replaceAll("pm.environment.set('patientAccessToken', json.accessToken);", `pm.environment.set('${tokenVar}', json.accessToken);`)
      .replaceAll('pm.environment.set("patientAccessToken", json.accessToken);', `pm.environment.set("${tokenVar}", json.accessToken);`)
      .replaceAll("pm.environment.set('adminAccessToken', json.accessToken);", `pm.environment.set('${tokenVar}', json.accessToken);`)
      .replaceAll('pm.environment.set("adminAccessToken", json.accessToken);', `pm.environment.set("${tokenVar}", json.accessToken);`);
  });
}

function collectRequestsForRole(items, role) {
  const out = [];
  for (const item of items || []) {
    if (item.request) {
      if (roleForRequest(item.request) === role) {
        const cloned = deepClone(item);
        rewriteTokenVars(cloned, role);
        if (Array.isArray(cloned.event)) {
          cloned.event = cloned.event.map((evt) => {
            if (evt.listen === 'test' && evt.script && Array.isArray(evt.script.exec)) {
              evt.script.exec = normalizeTestScriptForRole(evt.script.exec, role);
            }
            return evt;
          });
        }
        out.push(cloned);
      }
      continue;
    }

    const childRequests = collectRequestsForRole(item.item || [], role);
    if (childRequests.length) {
      out.push({
        ...deepClone(item),
        item: childRequests
      });
    }
  }
  return out;
}

function flattenRequestItems(items, acc = []) {
  for (const item of items || []) {
    if (item.request) acc.push(item);
    else flattenRequestItems(item.item || [], acc);
  }
  return acc;
}

function findFirstRequestByMatcher(items, predicate) {
  const flat = flattenRequestItems(items);
  return flat.find(predicate) || null;
}

function buildAuthBootstrap(role, allItems) {
  const matcherByRole = {
    admin: (req) => requestUrlString(req.request).includes('/api/admin/v1/auth/login') && req.request.method === 'POST',
    patient: (req) => requestUrlString(req.request).includes('/api/v1/patient/auth/login') && req.request.method === 'POST',
    kine: (req) => requestUrlString(req.request).includes('/api/v1/kine/auth/login') && req.request.method === 'POST' && (req.name || '').includes('RBAC-001')
  };
  const source = findFirstRequestByMatcher(allItems, matcherByRole[role]) || findFirstRequestByMatcher(allItems, (req) => roleForRequest(req.request) === role);
  if (!source) return null;

  const tokenVar = role === 'admin' ? 'adminAccessToken' : role === 'patient' ? 'patientAccessToken' : 'kineAccessToken';
  const authReq = deepClone(source);
  authReq.name = `[AUTH-BOOTSTRAP] ${role.toUpperCase()} login and token setup`;
  rewriteTokenVars(authReq, role);
  authReq.event = [
    {
      listen: 'test',
      script: {
        exec: [
          "pm.test('Status is 200', function () { pm.response.to.have.status(200); });",
          `const json = pm.response.json(); if (json.accessToken) { pm.environment.set('${tokenVar}', json.accessToken); } if (json.refreshToken) pm.environment.set('refreshToken', json.refreshToken);`
        ]
      }
    }
  ];

  return {
    name: '00 - Auth bootstrap',
    item: [authReq]
  };
}

function roleCollectionName(role) {
  return role === 'admin' ? 'XXXConnect Sprint1 - Admin' : role === 'patient' ? 'XXXConnect Sprint1 - Patient' : 'XXXConnect Sprint1 - Kine';
}

function roleDescription(role) {
  return `Role-specific Sprint 1 collection for ${role.toUpperCase()} endpoints. Token isolation enabled at collection/environment level.`;
}

function buildCollection(sourceCollection, role) {
  const roleItems = collectRequestsForRole(sourceCollection.item || [], role);
  const bootstrap = buildAuthBootstrap(role, sourceCollection.item || []);
  const finalItems = bootstrap ? [bootstrap, ...roleItems] : roleItems;

  return {
    info: {
      ...deepClone(sourceCollection.info),
      _postman_id: undefined,
      name: roleCollectionName(role),
      description: roleDescription(role)
    },
    variable: deepClone(sourceCollection.variable || []),
    item: finalItems
  };
}

function buildEnvironment(sourceEnvironment, role) {
  const tokenVar = role === 'admin' ? 'adminAccessToken' : role === 'patient' ? 'patientAccessToken' : 'kineAccessToken';
  const values = (sourceEnvironment.values || []).map((v) => {
    const copy = { ...v };
    if (['accessToken', 'adminAccessToken', 'patientAccessToken', 'kineAccessToken'].includes(copy.key)) {
      copy.value = '';
    }
    return copy;
  });

  if (!values.some((v) => v.key === tokenVar)) {
    values.push({ key: tokenVar, value: '', enabled: true });
  }

  return {
    ...deepClone(sourceEnvironment),
    id: undefined,
    name: `XXXConnect Sprint1 ${role.toUpperCase()} Environment`,
    values
  };
}

function writeMappingCopy() {
  const tablesDir = path.join(NEW_DIR, 'tables');
  fs.mkdirSync(tablesDir, { recursive: true });
  if (fs.existsSync(MAPPING_TABLE)) {
    fs.copyFileSync(MAPPING_TABLE, path.join(tablesDir, 'new-20260430151902.md'));
  }
}

function main() {
  if (!fs.existsSync(SOURCE_COLLECTION)) throw new Error(`Missing source collection: ${SOURCE_COLLECTION}`);
  if (!fs.existsSync(SOURCE_ENV)) throw new Error(`Missing source environment: ${SOURCE_ENV}`);

  const sourceCollection = readJson(SOURCE_COLLECTION);
  const sourceEnvironment = readJson(SOURCE_ENV);

  if (fs.existsSync(NEW_DIR)) {
    fs.rmSync(NEW_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(NEW_DIR, { recursive: true });

  ['admin', 'patient', 'kine'].forEach((role) => {
    const collection = buildCollection(sourceCollection, role);
    const environment = buildEnvironment(sourceEnvironment, role);

    writeJson(path.join(NEW_DIR, `${role}-collection.postman_collection.json`), collection);
    writeJson(path.join(NEW_DIR, `${role}-environment.postman_environment.json`), environment);
  });

  writeMappingCopy();

  // User explicitly asked to delete old sprint1 folder and replace by the new one.
  fs.rmSync(OLD_DIR, { recursive: true, force: true });

  console.log('Created split collections in sprint1/: admin, patient, kine');
  console.log('Removed old sprint1 files/ directory');
}

main();
