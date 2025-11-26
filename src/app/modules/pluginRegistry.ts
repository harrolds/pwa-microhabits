import { useSyncExternalStore } from 'react'

import type { ModuleMeta } from './types'

const registry: ModuleMeta[] = []
const listeners = new Set<() => void>()
let snapshot: ModuleMeta[] = []

function emit() {
  listeners.forEach((listener) => listener())
}

export function registerModule(meta: ModuleMeta) {
  const existingIndex = registry.findIndex((entry) => entry.id === meta.id)
  if (existingIndex >= 0) {
    registry[existingIndex] = meta
  } else {
    registry.push(meta)
  }
  snapshot = [...registry]
  emit()
}

export function listModules() {
  return snapshot
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function usePluginRegistry() {
  return useSyncExternalStore(subscribe, listModules, listModules)
}

