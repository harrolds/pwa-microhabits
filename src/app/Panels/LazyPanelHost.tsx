import { Suspense } from 'react'

import { usePanelStore } from '@app/state/usePanelStore'

import { panelRegistry } from './panelRegistry'

export default function LazyPanelHost() {
  const current = usePanelStore((state) => state.current)
  if (!current) return <p>No panel mounted</p>

  const PanelComponent = panelRegistry[current]?.component
  if (!PanelComponent) return <p>Panel not registered</p>

  return (
    <Suspense fallback={<div>Loading panel…</div>}>
      <PanelComponent />
    </Suspense>
  )
}

