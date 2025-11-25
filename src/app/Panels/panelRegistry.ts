import { lazy } from 'react'

import type { PanelDef } from './types'

const DiagnosticsPanel = lazy(() => import('./views/DiagnosticsPanel'))

export const panelRegistry: Record<string, PanelDef> = {
  diagnostics: {
    id: 'diagnostics',
    component: DiagnosticsPanel
  }
}

