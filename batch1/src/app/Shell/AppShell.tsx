import Header from './Header'
import Footer from './Footer'
import LeftPanel from './LeftPanel'
import RightPanel from './RightPanel'
import BottomSheetHost from './BottomSheetHost'
import ToastHost from './ToastHost'
import OverlayHost from './OverlayHost'

export default function AppShell(){
  return (
    <>
      <Header/>
      <LeftPanel/>
      <RightPanel/>
      <OverlayHost/>
      <ToastHost/>
      <BottomSheetHost/>
      <main>App Loaded</main>
      <Footer/>
    </>
  )
}