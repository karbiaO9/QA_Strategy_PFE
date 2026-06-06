import type { TestInfo } from '@playwright/test';
import type { StcAnnotation } from './types';

const STC_ID_PATTERN = /STC-[A-Z0-9-]+\/[FB]/i;

export function extractStcId(testInfo: TestInfo): string | undefined {
  const fromAnnotation = testInfo.annotations.find((a) => a.type === 'stc')?.description;
  if (fromAnnotation) {
    return fromAnnotation;
  }

  const match = testInfo.title.match(STC_ID_PATTERN);
  return match?.[0];
}

export function getStcMetadataFromCase(test: {
  title: string;
  annotations: TestInfo['annotations'];
}): StcAnnotation {
  const testInfo = { title: test.title, annotations: test.annotations } as TestInfo;
  return getStcMetadata(testInfo);
}

export function getStcMetadata(testInfo: TestInfo): StcAnnotation {
  const stcId = extractStcId(testInfo) ?? 'STC-UNKNOWN';
  const module = testInfo.annotations.find((a) => a.type === 'module')?.description;
  const priority = testInfo.annotations.find((a) => a.type === 'priority')?.description;
  const endpoint = testInfo.annotations.find((a) => a.type === 'endpoint')?.description;
  const testType = testInfo.annotations.find((a) => a.type === 'testType')?.description;

  return {
    stcId,
    title: testInfo.title,
    module: module ?? 'Authentication',
    priority: priority ?? 'P1',
    testType: testType ?? 'Frontend integration',
    endpoint,
  };
}
