
import { create } from 'zustand';

interface PanelState { id: string | null; open: (id: string)=>void; close: ()=>void; }

export const usePanelHost = create<PanelState>((set)=>({
  id: null,
  open: (id)=> set({id}),
  close: ()=> set({id:null})
}));
