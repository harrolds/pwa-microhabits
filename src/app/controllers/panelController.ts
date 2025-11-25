import { usePanelStore } from '@app/state/usePanelStore'

export const openPanel = (id: string) => {
  usePanelStore.setState({ current: id })
}

export const closePanel = () => {
  usePanelStore.setState({ current: null })
}

