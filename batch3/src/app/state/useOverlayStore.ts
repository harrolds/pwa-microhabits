import { create } from 'zustand'
interface State { stack:string[] }
export const useOverlayStore=create<State>(()=>({stack:[]}))