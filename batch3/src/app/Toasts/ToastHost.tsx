import { useToastStore } from '../state/useToastStore'

export default function ToastHost(){
  const queue = useToastStore(s=> s.queue)
  return (
    <div style={{position:'fixed',bottom:20,right:20}}>
      {queue.map(t=> <div key={t.id} style={{margin:'6px',padding:'10px',background:'#333',color:'#fff'}}>{t.message}</div>)}
    </div>
  )
}