export function envNumber(key: string, fallback: number): number {
  const rawValue = process.env[key];
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return fallback;
  }
  const parsed = Number(rawValue);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function envString(key: string, fallback: string): string {
  const value = process.env[key];
  return value !== undefined && value !== null && value !== '' ? value : fallback;
}

export function envBool(key: string, fallback: boolean): boolean {
  const value = process.env[key];
  if (value === undefined || value === null || value === '') return fallback;
  const normalized = value.toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
  if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
  return fallback;
}

export function requireEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === null || value === '') {
    throw new Error(
      `Missing required environment variable "${key}". Set it in the runtime environment before starting the service.`,
    );
  }
  return value;
}
