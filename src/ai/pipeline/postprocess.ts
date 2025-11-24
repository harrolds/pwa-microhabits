import type { RouteResult } from './route';

export interface PostprocessResult {
  output: string;
  blocked: boolean;
  notes: string[];
  driver: string;
}

const DISALLOWED_SNIPPETS = ['<script', '{%'];

const sanitizeOutput = (value: string): string =>
  value.replace(/\s+/g, ' ').replace(/[^\x09\x0a\x0d\x20-\x7e]/g, '').trim();

export const postprocessResponse = (result: RouteResult): PostprocessResult => {
  const notes: string[] = [];
  const sanitized = sanitizeOutput(result.response);

  if (sanitized !== result.response) {
    notes.push('output_normalized');
  }

  const blocked = DISALLOWED_SNIPPETS.some((snippet) =>
    sanitized.toLowerCase().includes(snippet.toLowerCase()),
  );
  if (blocked) {
    notes.push('blocked_for_html_like_content');
  }

  const heuristicLengthLimit = 3000;
  let finalOutput = sanitized;
  if (sanitized.length > heuristicLengthLimit) {
    finalOutput = sanitized.slice(0, heuristicLengthLimit) + '…';
    notes.push('truncated_for_length');
  }

  if (!finalOutput.length) {
    finalOutput = '[no-output]';
    notes.push('empty_response_substituted');
  }

  return {
    output: finalOutput,
    blocked,
    notes,
    driver: result.driver,
  };
};

export type PostprocessFn = (result: RouteResult) => PostprocessResult;
