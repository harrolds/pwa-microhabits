import React,{ Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AppShell from './app/Shell/AppShell'
import './pwa/registerSW'
import { loadModule } from './app/modules/loader'

async function init(){
  await loadModule(()=> import('./app/modules/exampleModule'))
}

init()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Suspense fallback={<div>Loading...</div>}>
      <AppShell/>
    </Suspense>
  </BrowserRouter>
)
