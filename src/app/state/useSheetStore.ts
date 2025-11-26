import { create } from 'zustand'

interface SheetState {
  current: string | null
}

export const useSheetStore = create<SheetState>(() => ({
  current: null
}))

