import { useSyncExternalStore } from 'react'

import type { CommandDef, CommandRegistry } from './types'

type Listener = () => void

const registry: CommandRegistry = {
  home: {
    id: 'home',
    path: '/',
    title: 'Home'
  }
}

const listeners = new Set<Listener>()
let snapshot = Object.values(registry)

function emit() {
  listeners.forEach((listener) => listener())
}

export function getCommand(id: string) {
  return registry[id] ?? null
}

export function listCommands() {
  return snapshot
}

export function registerCommand(def: CommandDef) {
  registry[def.id] = def
  snapshot = Object.values(registry)
  emit()
}

export function registerCommands(defs: CommandDef[]) {
  defs.forEach(registerCommand)
}

export function subscribeCommands(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useCommandList() {
  return useSyncExternalStore(subscribeCommands, listCommands, listCommands)
}

