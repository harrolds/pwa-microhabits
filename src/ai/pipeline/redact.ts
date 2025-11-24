import type { PreprocessResult } from './preprocess';

export interface RedactionResult extends PreprocessResult {
  redacted: string;
  redactionSummary: Record<string, number>;
}

type RedactionPattern = {
  label: string;
  pattern: RegExp;
  token: string;
};

const PATTERNS: RedactionPattern[] = [
  {
    label: 'email',
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    token: '[REDACTED_EMAIL]',
  },
  {
    label: 'phone',
    pattern: /\+?\d[\d\s().-]{7,}\d/g,
    token: '[REDACTED_PHONE]',
  },
  {
    label: 'address',
    pattern: /\b\d{1,5}\s+[A-Z][A-Z\s]+\b/gi,
    token: '[REDACTED_ADDRESS]',
  },
  {
    label: 'number',
    pattern: /\b\d{4,}\b/g,
    token: '[REDACTED_NUMBER]',
  },
  {
    label: 'id',
    pattern: /\b[A-Z0-9]{3,}-[A-Z0-9-]{3,}\b/gi,
    token: '[REDACTED_ID]',
  },
];

export const redactSensitiveData = (payload: PreprocessResult): RedactionResult => {
  let redacted = payload.normalized;
  const summary: Record<string, number> = {};

  PATTERNS.forEach(({ label, pattern, token }) => {
    const matches = redacted.match(pattern);
    if (!matches) {
      return;
    }
    summary[label] = (summary[label] ?? 0) + matches.length;
    redacted = redacted.replace(pattern, token);
  });

  const warnings = payload.warnings.slice();
  if (Object.keys(summary).length > 0) {
    warnings.push('redaction_performed');
  }

  return {
    ...payload,
    redacted,
    redactionSummary: summary,
    warnings,
  };
};

export type RedactionFn = (payload: PreprocessResult) => RedactionResult;
