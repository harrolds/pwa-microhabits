export interface PreprocessRequest {
  input: string;
  metadata?: Record<string, unknown>;
}

export interface PreprocessResult {
  normalized: string;
  tokens: string[];
  warnings: string[];
  isSafe: boolean;
}

const UNSUPPORTED_CHARS = /[\u0000-\u001f\u007f]/g;
const MULTI_WHITESPACE = /\s+/g;
const HTML_TAGS = /<script[\s\S]*?>[\s\S]*?<\/script>|<style[\s\S]*?>[\s\S]*?<\/style>/gi;

const SAFETY_KEYWORDS = [
  'malware',
  'exploit',
  'dox',
  'weapon',
  'sudo rm',
  'sqlmap',
];

const TOKEN_BOUNDARY = /\b/;

export const preprocessInput = (request: PreprocessRequest): PreprocessResult => {
  const warnings: string[] = [];
  const base = request.input ?? '';

  const stripped = base.replace(HTML_TAGS, ' ').replace(UNSUPPORTED_CHARS, ' ');
  const normalized = stripped.replace(MULTI_WHITESPACE, ' ').trim();
  if (!normalized.length) {
    warnings.push('input_empty_after_normalization');
  }

  const tokens = normalized.split(TOKEN_BOUNDARY).map((token) => token.trim()).filter(Boolean);

  const flagged = SAFETY_KEYWORDS.some((keyword) =>
    normalized.toLowerCase().includes(keyword.toLowerCase()),
  );
  if (flagged) {
    warnings.push('safety_keyword_detected');
  }

  const isSafe = !flagged;

  return {
    normalized,
    tokens,
    warnings,
    isSafe,
  };
};

export type PreprocessFn = (request: PreprocessRequest) => PreprocessResult;
