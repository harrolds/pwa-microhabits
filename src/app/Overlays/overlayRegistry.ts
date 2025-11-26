import { lazy } from 'react'

import type { OverlayItem } from './types'

const WelcomeOverlay = lazy(() => import('./views/WelcomeOverlay'))

export const overlayRegistry: Record<string, OverlayItem> = {
  welcome: {
    id: 'welcome',
    component: WelcomeOverlay
  }
}

