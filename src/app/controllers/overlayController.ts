import { useOverlayStore } from '@app/state/useOverlayStore'

export const pushOverlay = (id: string) => {
  useOverlayStore.setState((state) => ({
    stack: [...state.stack, id]
  }))
}

export const popOverlay = () => {
  useOverlayStore.setState((state) => ({
    stack: state.stack.slice(0, -1)
  }))
}

