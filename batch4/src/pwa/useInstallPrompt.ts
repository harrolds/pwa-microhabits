import { useEffect, useState } from 'react'

export function useInstallPrompt(){
  const [evt,setEvt]=useState<any>(null)
  useEffect(()=>{
    const handler=(e:any)=>{ e.preventDefault(); setEvt(e) }
    window.addEventListener('beforeinstallprompt',handler)
    return ()=> window.removeEventListener('beforeinstallprompt',handler)
  },[])
  return evt
}
