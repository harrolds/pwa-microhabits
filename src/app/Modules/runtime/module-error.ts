import type { ReactElement } from 'react';
import type { ModuleDescriptor } from '../ModuleLoader';
import { moduleManifest } from '../ModuleLoader';

type ModuleEntryType = 'runtime' | 'fallback';

type ModuleEntry<TMetadata = Record<string, unknown>> = {
  id: `factory.${string}`;
  type: ModuleEntryType;
  mount: () => ReactElement | null;
  preload: () => Promise<void>;
  metadata?: TMetadata;
};

type ErrorModuleMetadata = {
  descriptor: ModuleDescriptor | null;
  manifestVersion: string;
  loaderFallback: true;
  reason: string;
  lastError?: string;
};

const descriptor =
  moduleManifest.registry.modules.find((entry) => entry.entryPoint === './runtime/module-error.ts') ?? null;

const moduleError: ModuleEntry<ErrorModuleMetadata> = {
  id: 'factory.runtime.module-error',
  type: 'fallback',
  mount: () => null,
  preload: async () => undefined,
  metadata: {
    descriptor,
    manifestVersion: moduleManifest.version,
    loaderFallback: true,
    reason: 'unhandled-runtime-error',
  },
};

export default moduleError;

