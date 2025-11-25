import { closePanel } from '@app/controllers/panelController'

export default function DiagnosticsPanel() {
  return (
    <div>
      <h3>Diagnostics panel</h3>
      <p>Panels live alongside the main canvas.</p>
      <button type="button" onClick={closePanel}>
        Close panel
      </button>
    </div>
  )
}

