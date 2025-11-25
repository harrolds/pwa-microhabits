import { registerModule } from './pluginRegistry'
import { commandRegistry } from '../Navigation/commandRegistry'

export async function loadModule(loader:()=>Promise<any>){
  const mod = await loader()
  if(mod.meta){
    registerModule(mod.meta)
    if(mod.meta.commands){
      mod.meta.commands.forEach(cmd=>{
        if(mod.commands?.[cmd]){
          commandRegistry[cmd] = mod.commands[cmd]
        }
      })
    }
  }
}
