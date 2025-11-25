import { create } from 'zustand'
interface State { current: string|null }
export const usePanelStore=create<State>(()=>({current:null}))