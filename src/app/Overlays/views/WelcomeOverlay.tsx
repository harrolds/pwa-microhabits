import { popOverlay } from '@app/controllers/overlayController'

export default function WelcomeOverlay() {
  return (
    <div className="app-overlay-card">
      <h2>Overlay</h2>
      <p>Overlays float above the shell and can be stacked.</p>
      <button type="button" onClick={popOverlay}>
        Close overlay
      </button>
    </div>
  )
}

