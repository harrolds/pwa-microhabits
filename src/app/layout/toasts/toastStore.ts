
import { create } from 'zustand';

interface Toast { id:string; text:string; variant:'info'|'success'|'warning'|'error'; }
interface ToastState { items:Toast[]; push:(t:Toast)=>void; remove:(id:string)=>void; }

export const useToastHost = create<ToastState>((set)=>({
  items:[],
  push:(t)=>set((s)=>({items:[...s.items,t]})),
  remove:(id)=>set((s)=>({items:s.items.filter(x=>x.id!==id)}))
}));
