import { create } from 'zustand'
interface State { current:string|null }
export const useSheetStore=create<State>(()=>({current:null}))