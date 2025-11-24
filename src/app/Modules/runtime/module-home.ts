import React from 'react';
import HomePage from '../../Home/HomePage';
import type { ModuleDescriptor } from '../ModuleLoader';
import { moduleManifest } from '../ModuleLoader';

type ModuleEntryType = 'runtime' | 'fallback';

type ModuleEntry<TMetadata = Record<string, unknown>> = {
  id: `factory.${string}`;
  type: ModuleEntryType;
  mount: () => React.ReactElement | null;
  preload: () => Promise<void>;
  metadata?: TMetadata;
};

type HomeModuleMetadata = {
  descriptor: ModuleDescriptor | null;
  manifestVersion: string;
  loaderFallback: false;
};

const descriptor =
  moduleManifest.registry.modules.find((entry) => entry.entryPoint === './runtime/module-home.ts') ?? null;

const moduleHome: ModuleEntry<HomeModuleMetadata> = {
  id: 'factory.runtime.module-home',
  type: 'runtime',
  mount: () => <HomePage />,
  preload: async () => undefined,
  metadata: {
    descriptor,
    manifestVersion: moduleManifest.version,
    loaderFallback: false,
  },
};

export default moduleHome;

