import { useToastStore } from '../state/useToastStore'

export const addToast=(message:string)=>{
  const id = Math.random().toString(36).slice(2)
  useToastStore.setState(s=>({queue:[...s.queue,{id,message}]}))
}

export const removeToast=(id:string)=>{
  useToastStore.setState(s=>({queue:s.queue.filter(t=> t.id!==id)}))
}
