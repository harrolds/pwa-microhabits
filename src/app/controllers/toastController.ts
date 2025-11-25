import { useToastStore } from '@app/state/useToastStore'

export const addToast = (message: string, tone: 'info' | 'success' | 'error' = 'info') => {
  const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)

  useToastStore.setState((state) => ({
    queue: [...state.queue, { id, message, tone }]
  }))

  window.setTimeout(() => removeToast(id), 4000)
}

export const removeToast = (id: string) => {
  useToastStore.setState((state) => ({
    queue: state.queue.filter((toast) => toast.id !== id)
  }))
}

