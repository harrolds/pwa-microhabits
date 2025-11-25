import { create } from 'zustand'

interface OverlayState {
  stack: string[]
}

export const useOverlayStore = create<OverlayState>(() => ({
  stack: []
}))

