import { commandRegistry } from './commandRegistry'

export function resolveCommandFromPath(path:string){
  const entry = Object.values(commandRegistry).find(c=> c.path===path)
  return entry ?? null
}
