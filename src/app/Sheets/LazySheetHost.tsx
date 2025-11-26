import { Suspense } from 'react'

import { useSheetStore } from '@app/state/useSheetStore'

import { sheetRegistry } from './sheetRegistry'

export default function LazySheetHost() {
  const current = useSheetStore((state) => state.current)
  if (!current) return null

  const SheetComponent = sheetRegistry[current]?.component
  if (!SheetComponent) return null

  return (
    <div className="app-shell__sheet">
      <Suspense fallback={<div>Loading sheet…</div>}>
        <SheetComponent />
      </Suspense>
    </div>
  )
}

