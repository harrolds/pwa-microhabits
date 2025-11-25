import { Suspense } from 'react'
import { usePanelStore } from '../state/usePanelStore'
import { panelRegistry } from './panelRegistry'

export default function LazyPanelHost(){
  const current = usePanelStore(s=> s.current)
  if(!current) return null
  const PanelComponent = panelRegistry[current]?.component
  if(!PanelComponent) return null
  return <Suspense fallback={<div>Loading Panel...</div>}><PanelComponent/></Suspense>
}