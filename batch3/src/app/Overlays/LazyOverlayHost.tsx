import { Suspense } from 'react'
import { useOverlayStore } from '../state/useOverlayStore'
import { overlayRegistry } from './overlayRegistry'

export default function LazyOverlayHost(){
  const stack = useOverlayStore(s=> s.stack)
  if(stack.length===0) return null
  const top = stack[stack.length-1]
  const Component = overlayRegistry[top]?.component
  if(!Component) return null
  return <Suspense fallback={<div>Loading Overlay...</div>}><Component/></Suspense>
}