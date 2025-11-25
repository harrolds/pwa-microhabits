import type { ComponentType, LazyExoticComponent } from 'react'

export type PanelComponent =
  | ComponentType<Record<string, unknown>>
  | LazyExoticComponent<ComponentType<Record<string, unknown>>>

export interface PanelDef {
  id: string
  component: PanelComponent
}

