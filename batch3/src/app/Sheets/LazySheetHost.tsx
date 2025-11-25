import { Suspense } from 'react'
import { useSheetStore } from '../state/useSheetStore'
import { sheetRegistry } from './sheetRegistry'

export default function LazySheetHost(){
  const current = useSheetStore(s=> s.current)
  if(!current) return null
  const SheetComponent = sheetRegistry[current]?.component
  if(!SheetComponent) return null
  return <Suspense fallback={<div>Loading Sheet...</div>}><SheetComponent/></Suspense>
}