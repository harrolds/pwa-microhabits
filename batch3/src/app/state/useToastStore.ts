import { create } from 'zustand'
import { ToastItem } from '../Toasts/types'

interface State { queue:ToastItem[] }
export const useToastStore=create<State>(()=>({queue:[]}))