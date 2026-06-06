import type { StcAnnotation } from '../utils/types';

export function stcAnnotations(meta: StcAnnotation): Array<{ type: string; description: string }> {
  const annotations: Array<{ type: string; description: string }> = [
    { type: 'stc', description: meta.stcId },
  ];

  if (meta.module) {
    annotations.push({ type: 'module', description: meta.module });
  }
  if (meta.priority) {
    annotations.push({ type: 'priority', description: meta.priority });
  }
  if (meta.endpoint) {
    annotations.push({ type: 'endpoint', description: meta.endpoint });
  }
  if (meta.testType) {
    annotations.push({ type: 'testType', description: meta.testType });
  }

  return annotations;
}
