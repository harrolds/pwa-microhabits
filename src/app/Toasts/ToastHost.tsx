import { removeToast } from '@app/controllers/toastController'
import { useToastStore } from '@app/state/useToastStore'

export default function ToastHost() {
  const queue = useToastStore((state) => state.queue)

  if (queue.length === 0) return null

  return (
    <div className="app-shell__toast-layer" role="status" aria-live="polite">
      {queue.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.tone ?? 'info'}`}>
          <span>{toast.message}</span>
          <button type="button" onClick={() => removeToast(toast.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

