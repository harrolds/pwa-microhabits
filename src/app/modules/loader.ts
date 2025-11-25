import { registerCommand } from '@app/Navigation/commandRegistry'

import { registerModule } from './pluginRegistry'
import type { ModuleDefinition, ModuleLoader } from './types'

export async function loadModule(loader: ModuleLoader) {
  const mod: ModuleDefinition = await loader()
  registerModule(mod.meta)

  const commandIds = mod.meta.commands ?? Object.keys(mod.commands ?? {})
  commandIds.forEach((commandId) => {
    const command = mod.commands?.[commandId]
    if (command) {
      registerCommand(command)
    }
  })
}

