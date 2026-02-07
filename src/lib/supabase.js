const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const { createClient } = require('@supabase/supabase-js');
const { DB_SCHEMA } = require('../config');

let supabaseUrl = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
}
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  throw new Error('SUPABASE_URL must be https://YOUR_PROJECT_REF.supabase.co (no trailing slash)');
}
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase URL loaded:', supabaseUrl.startsWith('https://') ? 'https://***.supabase.co' : '(invalid)');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const getSupabase = () => supabase.schema(DB_SCHEMA);

const toSnakeCaseKey = (key) => {
  let snake = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  snake = snake.replace(/([a-z])(\d)/g, '$1_$2');
  return snake;
};

const toSnakeCase = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((item) => (typeof item === 'object' && item !== null ? toSnakeCase(item) : item));
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = toSnakeCaseKey(key);
    acc[snakeKey] =
      typeof obj[key] === 'object' &&
      obj[key] !== null &&
      !Array.isArray(obj[key]) &&
      !(obj[key] instanceof Date)
        ? toSnakeCase(obj[key])
        : obj[key];
    return acc;
  }, {});
};

function formatFetchError(err) {
  const c = err.cause;
  const cause = c ? (c.code || c.message || c.errno || String(c)) : '';
  const msg = cause ? `${err.message} — ${cause}` : err.message;
  const hint = /fetch failed|ECONNREFUSED|ENOTFOUND|ETIMEDOUT/i.test(err.message + cause)
    ? ' Check SUPABASE_URL, network, firewall.'
    : '';
  return msg + hint;
}

async function selectAll(tableName) {
  try {
    const sb = getSupabase();
    const { data, error } = await sb.from(tableName).select('*');
    if (error) throw error;
    return { rows: data || [] };
  } catch (err) {
    if (err.message && err.message !== 'fetch failed') throw err;
    throw new Error(formatFetchError(err));
  }
}

async function testConnection() {
  try {
    const sb = getSupabase();
    const { error } = await sb.from('market_data').select('id').limit(1);
    if (error) return { ok: false, error: error.message || error.hint || String(error) };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: formatFetchError(err) };
  }
}

async function close() {
  return Promise.resolve();
}

module.exports = {
  supabase,
  getSupabase,
  toSnakeCase,
  SCHEMA: DB_SCHEMA,
  selectAll,
  testConnection,
  close
};
