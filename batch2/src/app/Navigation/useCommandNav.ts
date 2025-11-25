import { useNavigate } from 'react-router-dom'
import { commandRegistry } from './commandRegistry'

export function useCommandNav(){
  const nav = useNavigate()
  return (cmdId:string)=>{
    const cmd = commandRegistry[cmdId]
    if (cmd) nav(cmd.path)
  }
}
