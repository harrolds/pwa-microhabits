import { ModuleMeta } from './types'

export const pluginRegistry:ModuleMeta[] = []

export function registerModule(meta:ModuleMeta){
  pluginRegistry.push(meta)
}
