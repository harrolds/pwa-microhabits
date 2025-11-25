import type { ComponentType } from 'react';
import manifest from './module-manifest.json';

type ModuleManifestEntry = (typeof manifest.modules)[number];

const moduleImporters = import.meta.glob('../modules/**/*.tsx');

export class ModuleLoader {
  private modules = new Map<string, ModuleManifestEntry>();

  constructor() {
    manifest.modules.forEach((module) => this.modules.set(module.id, module));
  }

  async loadModule(moduleId: string): Promise<ComponentType | null> {
    const entry = this.modules.get(moduleId);
    if (!entry) {
      return null;
    }
    const importer = moduleImporters[`../modules/${entry.entry}.tsx`];
    if (!importer) {
      return null;
    }
    const module = (await importer()) as { default: ComponentType };
    return module.default;
  }
}

export const moduleLoader = new ModuleLoader();

