import React, { StrictMode, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { AppShell } from '@app/Shell/AppShell'
import { loadModule } from '@app/modules/loader'
// import '@pwa/registerSW'

async function bootstrap() {
  await loadModule(() =>
    import('@app/modules/exampleModule').then((mod) => mod.default)
  )
}

bootstrap()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<div className="app-loading">Loading experience…</div>}>
        <AppShell />
      </Suspense>
    </BrowserRouter>
  </StrictMode>
)

