
import { create } from 'zustand';

interface OverlayState { open:boolean; show:()=>void; hide:()=>void; }

export const useOverlayHost = create<OverlayState>((set)=>({
  open:false, show:()=>set({open:true}), hide:()=>set({open:false})
}));
