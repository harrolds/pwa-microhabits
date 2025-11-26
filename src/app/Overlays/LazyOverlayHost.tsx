import { Suspense } from 'react'

import { useOverlayStore } from '@app/state/useOverlayStore'

import { overlayRegistry } from './overlayRegistry'

export default function LazyOverlayHost() {
  const stack = useOverlayStore((state) => state.stack)
  if (stack.length === 0) return null

  const activeId = stack[stack.length - 1]
  const OverlayComponent = overlayRegistry[activeId]?.component
  if (!OverlayComponent) return null

  return (
    <div className="app-shell__overlay-layer">
      <Suspense fallback={<div className="app-shell__overlay-fallback">Loading overlay…</div>}>
        <OverlayComponent />
      </Suspense>
    </div>
  )
}

