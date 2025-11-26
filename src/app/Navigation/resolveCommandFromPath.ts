import { listCommands } from './commandRegistry'

export function resolveCommandFromPath(path: string) {
  return listCommands().find((command) => command.path === path) ?? null
}

