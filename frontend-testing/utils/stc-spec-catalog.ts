import fs from 'fs';
import path from 'path';

export interface StcSpecDefinition {
  stcId: string;
  title: string;
  priority: string;
  module: string;
  endpoint: string;
  testType: string;
  preconditions: string;
  postconditions: string;
  requiredTestData: string;
  steps: string[];
  expectedResult: string;
  acceptanceCriteria: string;
}

const DEFAULT_SPEC_PATH = path.resolve(
  __dirname,
  '../../Frontend to test/docs/STC-AUTH-Frontend-Integration-Tests - Copie.md'
);

let cachedCatalog: Map<string, StcSpecDefinition> | null = null;
let cachedSpecPath: string | null = null;

export function resolveStcSpecPath(): string {
  const fromEnv = process.env.STC_SPEC_PATH?.trim();
  if (fromEnv) {
    return path.isAbsolute(fromEnv) ? fromEnv : path.resolve(process.cwd(), fromEnv);
  }
  return DEFAULT_SPEC_PATH;
}

function normalizeText(text: string): string {
  return text
    .replace(/\uFFFD/g, '-')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}

function extractInlineField(block: string, label: string): string {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`\\*\\*${escaped}:\\*\\*\\s*(.+?)(?=\\n|$)`, 'i');
  const match = block.match(re);
  return match ? normalizeText(match[1]) : '';
}

function extractMultilineSection(block: string, label: string): string {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const headerRe = new RegExp(`\\*\\*${escaped}:\\*\\*`, 'i');
  const headerIndex = block.search(headerRe);
  if (headerIndex === -1) {
    return '';
  }

  const afterHeader = block.slice(headerIndex);
  const sameLine = afterHeader.match(/^\*\*[^*]+:\*\*(?:[ \t]+([^\r\n]+))?/);
  if (sameLine?.[1]?.trim()) {
    return normalizeText(sameLine[1]);
  }

  const multiline = afterHeader.match(
    /^\*\*[^*]+:\*\*\s*\n([\s\S]*?)(?=\n\*\*[A-Za-z0-9 /()`'-]+:\*\*|\n---\s*$|\n## )/i
  );
  return multiline ? normalizeText(multiline[1]) : '';
}

function extractSteps(block: string): string[] {
  const match = block.match(/\*\*Steps:\*\*\s*\n([\s\S]*?)(?=\n\*\*Expected Result:\*\*)/i);
  if (!match) {
    return [];
  }

  return match[1]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^\d+\.\s+/.test(line))
    .map((line) => normalizeText(line.replace(/^\d+\.\s+/, '')));
}

function extractExpectedResult(block: string): string {
  const match = block.match(
    /\*\*Expected Result:\*\*\s*\n([\s\S]*?)(?=\n\*\*Acceptance Criteria:\*\*|\n---\s*$|\n## )/i
  );
  return match ? normalizeText(match[1]) : '';
}

function extractAcceptanceCriteria(block: string): string {
  const match = block.match(
    /\*\*Acceptance Criteria:\*\*\s*\n([\s\S]*?)(?=\n---\s*$|\n## )/i
  );
  return match ? normalizeText(match[1]) : '';
}

function parseStcBlock(heading: string, body: string): StcSpecDefinition | null {
  const block = `${heading}\n${body}`.trim();
  const stcId =
    extractInlineField(block, 'STC ID') ||
    heading.replace(/^##\s*/, '').trim();

  if (!/^STC-[A-Z0-9-]+\/[FB]$/i.test(stcId)) {
    return null;
  }

  const steps = extractSteps(block);
  if (steps.length === 0) {
    return null;
  }

  const expectedResult = extractExpectedResult(block);
  const acceptanceCriteria = extractAcceptanceCriteria(block);

  return {
    stcId,
    title: extractInlineField(block, 'Title'),
    priority: extractInlineField(block, 'Priority'),
    module: extractInlineField(block, 'Module'),
    endpoint: extractInlineField(block, 'Endpoint'),
    testType: extractInlineField(block, 'Test Type'),
    preconditions: extractMultilineSection(block, 'Preconditions'),
    postconditions: extractMultilineSection(block, 'Postconditions'),
    requiredTestData: extractMultilineSection(block, 'Required Test Data'),
    steps,
    expectedResult,
    acceptanceCriteria,
  };
}

export function parseStcSpecDocument(content: string): Map<string, StcSpecDefinition> {
  const catalog = new Map<string, StcSpecDefinition>();
  const parts = content.split(/\n(?=## STC-)/);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed.startsWith('## STC-')) {
      continue;
    }

    const newline = trimmed.indexOf('\n');
    const heading = newline === -1 ? trimmed : trimmed.slice(0, newline);
    const body = newline === -1 ? '' : trimmed.slice(newline + 1);
    const spec = parseStcBlock(heading, body);

    if (spec) {
      catalog.set(spec.stcId, spec);
    }
  }

  return catalog;
}

export function loadStcSpecCatalog(specPath = resolveStcSpecPath()): Map<string, StcSpecDefinition> {
  if (cachedCatalog && cachedSpecPath === specPath) {
    return cachedCatalog;
  }

  if (!fs.existsSync(specPath)) {
    throw new Error(
      `STC specification not found at ${specPath}. Set STC_SPEC_PATH or add the integration test doc.`
    );
  }

  const content = fs.readFileSync(specPath, 'utf8');
  cachedCatalog = parseStcSpecDocument(content);
  cachedSpecPath = specPath;
  return cachedCatalog;
}

export function getStcSpec(stcId: string, catalog?: Map<string, StcSpecDefinition>): StcSpecDefinition | undefined {
  const map = catalog ?? loadStcSpecCatalog();
  return map.get(stcId) ?? map.get(stcId.toUpperCase());
}

export function clearStcSpecCache(): void {
  cachedCatalog = null;
  cachedSpecPath = null;
}

export function listStcIds(catalog?: Map<string, StcSpecDefinition>): string[] {
  const map = catalog ?? loadStcSpecCatalog();
  return [...map.keys()].sort();
}
