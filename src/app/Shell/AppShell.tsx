import BottomSheetHost from './BottomSheetHost'
import Footer from './Footer'
import Header from './Header'
import LeftPanel from './LeftPanel'
import OverlayHost from './OverlayHost'
import RightPanel from './RightPanel'
import ToastHost from './ToastHost'

import AppRoutes from '@app/Navigation/AppRoutes'

export default function AppShell() {
  return (
    <div className="app-shell">
      <Header />

      <div className="app-shell__body">
        <LeftPanel />
        <main className="app-shell__content" role="main">
          <AppRoutes />
        </main>
        <RightPanel />
      </div>

      <Footer />

      <OverlayHost />
      <ToastHost />
      <BottomSheetHost />
    </div>
  )
}

