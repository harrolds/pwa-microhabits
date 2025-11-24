import { preprocessInput, type PreprocessFn, type PreprocessRequest } from './pipeline/preprocess';
import { redactSensitiveData, type RedactionFn, type RedactionResult } from './pipeline/redact';
import {
  routeRequest,
  type RouteFn,
  type RouteResult,
  type RouterConfig,
  type RouterPayload,
} from './pipeline/route';
import { postprocessResponse, type PostprocessFn, type PostprocessResult } from './pipeline/postprocess';

export interface AIRequest extends PreprocessRequest {
  expectations?: RouterPayload['expectations'];
}

export interface AIResponse extends PostprocessResult {
  meta: {
    preprocess: ReturnType<PreprocessFn>;
    redaction: RedactionResult;
    route: RouteResult;
  };
}

export interface AIRuntime {
  preprocess?: PreprocessFn;
  redact?: RedactionFn;
  route?: RouteFn;
  postprocess?: PostprocessFn;
  routerConfig?: RouterConfig;
}

export const runAI = async (request: AIRequest, runtime: AIRuntime = {}): Promise<AIResponse> => {
  const preprocess = runtime.preprocess ?? preprocessInput;
  const redact = runtime.redact ?? redactSensitiveData;
  const route = runtime.route ?? routeRequest;
  const postprocess = runtime.postprocess ?? postprocessResponse;

  const preprocessed = preprocess(request);
  if (!preprocessed.isSafe) {
    return {
      output: '[blocked]',
      blocked: true,
      notes: ['blocked_by_preprocess'],
      driver: 'none',
      meta: {
        preprocess: preprocessed,
        redaction: {
          ...preprocessed,
          redacted: preprocessed.normalized,
          redactionSummary: {},
        },
        route: {
          driver: 'none',
          response: '[blocked]',
          elapsedMs: 0,
          metadata: { skipped: true },
        },
      },
    };
  }

  const redacted = redact(preprocessed);
  const routed = await route(
    {
      ...redacted,
      expectations: request.expectations,
    },
    runtime.routerConfig,
  );
  const postprocessed = postprocess(routed);

  return {
    ...postprocessed,
    meta: {
      preprocess: preprocessed,
      redaction: redacted,
      route: routed,
    },
  };
};

export type { PreprocessFn, RedactionFn, RouteFn, PostprocessFn };
