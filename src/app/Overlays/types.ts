import type { ComponentType, LazyExoticComponent } from 'react'

export type OverlayComponent =
  | ComponentType<Record<string, unknown>>
  | LazyExoticComponent<ComponentType<Record<string, unknown>>>

export interface OverlayItem {
  id: string
  component: OverlayComponent
}

