import { pushOverlay } from '@app/controllers/overlayController'
import { openPanel } from '@app/controllers/panelController'
import { openSheet } from '@app/controllers/sheetController'
import { addToast } from '@app/controllers/toastController'
import { useCommandNav } from '@app/Navigation/useCommandNav'

export default function Home() {
  const navigate = useCommandNav()

  return (
    <section className="screen">
      <h2>Welcome home</h2>
      <p>Kick the tyres of the shell subsystems from a single surface.</p>

      <div className="screen__actions">
        <button type="button" onClick={() => addToast('Synced micro habit!', 'success')}>
          Add toast
        </button>
        <button type="button" onClick={() => pushOverlay('welcome')}>
          Push overlay
        </button>
        <button type="button" onClick={() => openPanel('diagnostics')}>
          Open diagnostics panel
        </button>
        <button type="button" onClick={() => openSheet('changelog')}>
          Show changelog sheet
        </button>
        <button type="button" onClick={() => navigate('example')}>
          Navigate to example
        </button>
      </div>
    </section>
  )
}

