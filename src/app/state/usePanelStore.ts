import { create } from 'zustand'

interface PanelState {
  current: string | null
}

export const usePanelStore = create<PanelState>(() => ({
  current: null
}))

