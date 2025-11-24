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

type DefaultModuleMetadata = {
  descriptor: ModuleDescriptor | null;
  manifestVersion: string;
  loaderFallback: true;
  reason: string;
};

const descriptor =
  moduleManifest.registry.modules.find((entry) => entry.entryPoint === './runtime/module-default.ts') ?? null;

const moduleDefault: ModuleEntry<DefaultModuleMetadata> = {
  id: 'factory.runtime.module-default',
  type: 'fallback',
  mount: () => null,
  preload: async () => undefined,
  metadata: {
    descriptor,
    manifestVersion: moduleManifest.version,
    loaderFallback: true,
    reason: descriptor ? 'registered-default-runtime' : 'unregistered-default-runtime',
  },
};

export default moduleDefault;

