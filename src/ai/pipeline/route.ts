import type { RedactionResult } from './redact';

export interface RouterConfig {
  drivers: LLMDriver[];
  fallbackDriver?: LLMDriver;
}

export interface RouterPayload extends RedactionResult {
  expectations?: {
    maxTokens?: number;
    temperature?: number;
  };
}

export interface RouteResult {
  driver: string;
  response: string;
  elapsedMs: number;
  metadata: Record<string, unknown>;
}

export interface LLMDriver {
  name: string;
  supports: (payload: RouterPayload) => boolean;
  invoke: (payload: RouterPayload) => Promise<string>;
}

class DeterministicLLMStub implements LLMDriver {
  name = 'deterministic-stub';

  supports(): boolean {
    return true;
  }

  async invoke(payload: RouterPayload): Promise<string> {
    return `[STUB:${this.name}] ${payload.redacted}`;
  }
}

class SafeFallbackLLMStub implements LLMDriver {
  name = 'safe-fallback-stub';

  supports(): boolean {
    return true;
  }

  async invoke(): Promise<string> {
    return '[STUB:safe-fallback] Unable to reach primary model, returning safe default.';
  }
}

const DEFAULT_ROUTER: RouterConfig = {
  drivers: [new DeterministicLLMStub()],
  fallbackDriver: new SafeFallbackLLMStub(),
};

export const routeRequest = async (
  payload: RouterPayload,
  config: RouterConfig = DEFAULT_ROUTER,
): Promise<RouteResult> => {
  const start = Date.now();
  const { drivers, fallbackDriver } = config;

  const chosen =
    drivers.find((driver) => driver.supports(payload)) ??
    fallbackDriver ??
    new SafeFallbackLLMStub();

  try {
    const response = await chosen.invoke(payload);
    return {
      driver: chosen.name,
      response,
      elapsedMs: Date.now() - start,
      metadata: {
        fallbackUsed: chosen === fallbackDriver,
      },
    };
  } catch (error) {
    if (!fallbackDriver || chosen === fallbackDriver) {
      throw error;
    }
    const response = await fallbackDriver.invoke(payload);
    return {
      driver: fallbackDriver.name,
      response,
      elapsedMs: Date.now() - start,
      metadata: {
        fallbackUsed: true,
        error: error instanceof Error ? error.message : 'unknown_error',
      },
    };
  }
};

export type RouteFn = (payload: RouterPayload, config?: RouterConfig) => Promise<RouteResult>;
