import type { CommandDef } from '@app/Navigation/types'

export interface ModuleMeta {
  id: string
  title: string
  commands?: string[]
}

export interface ModuleDefinition {
  meta: ModuleMeta
  commands?: Record<string, CommandDef>
}

export type ModuleLoader = () => Promise<ModuleDefinition>

