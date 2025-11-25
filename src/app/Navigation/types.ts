import type { ComponentType, LazyExoticComponent } from 'react'

export interface CommandDef {
  id: string
  path: string
  title: string
}

export interface RouteDef {
  path: string
  component: LazyExoticComponent<ComponentType<unknown>>
  preload?: () => Promise<unknown>
}

export type CommandRegistry = Record<string, CommandDef>

