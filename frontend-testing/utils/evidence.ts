import fs from 'fs';
import path from 'path';
import type { TestInfo } from '@playwright/test';
import type { TestResult } from '@playwright/test/reporter';

const SCREENSHOTS_DIR = path.join(__dirname, '../screenshots');
const VIDEOS_DIR = path.join(__dirname, '../videos');
const TRACES_DIR = path.join(__dirname, '../traces');

export function ensureEvidenceDirs(): void {
  for (const dir of [SCREENSHOTS_DIR, VIDEOS_DIR, TRACES_DIR]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function copyFailureScreenshot(
  source: TestInfo | Pick<TestResult, 'attachments'>,
  stcId: string
): Promise<string | undefined> {
  const screenshot = source.attachments.find((a: { name: string }) => a.name === 'screenshot');
  if (!screenshot?.path) {
    return undefined;
  }

  ensureEvidenceDirs();
  const safeId = stcId.replace(/\//g, '-');
  const dest = path.join(SCREENSHOTS_DIR, `${safeId}-${Date.now()}.png`);
  fs.copyFileSync(screenshot.path, dest);
  return dest;
}
