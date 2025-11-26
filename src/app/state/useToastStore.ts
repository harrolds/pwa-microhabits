import { create } from 'zustand'

import type { ToastItem } from '@app/Toasts/types'

interface ToastState {
  queue: ToastItem[]
}

export const useToastStore = create<ToastState>(() => ({
  queue: []
}))

