export function getEnv(key: string, fallback = ''): string {
  return process.env[key]?.trim() || fallback;
}

export function requireEnv(key: string): string {
  const value = getEnv(key);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function isCI(): boolean {
  return process.env.CI === 'true';
}
