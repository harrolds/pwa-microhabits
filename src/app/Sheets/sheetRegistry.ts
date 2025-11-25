import { lazy } from 'react'

import type { SheetDef } from './types'

const ChangelogSheet = lazy(() => import('./views/ChangelogSheet'))

export const sheetRegistry: Record<string, SheetDef> = {
  changelog: {
    id: 'changelog',
    component: ChangelogSheet
  }
}

