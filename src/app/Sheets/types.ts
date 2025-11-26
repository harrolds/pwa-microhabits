import type { ComponentType, LazyExoticComponent } from 'react'

export type SheetComponent =
  | ComponentType<Record<string, unknown>>
  | LazyExoticComponent<ComponentType<Record<string, unknown>>>

export interface SheetDef {
  id: string
  component: SheetComponent
}

