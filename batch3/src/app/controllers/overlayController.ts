import { useOverlayStore } from '../state/useOverlayStore'

export const pushOverlay=(id:string)=>{
  useOverlayStore.setState(s=>({stack:[...s.stack,id]}))
}

export const popOverlay=()=>{
  useOverlayStore.setState(s=>({stack:s.stack.slice(0,-1)}))
}
