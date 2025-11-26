import { addToast } from '@app/controllers/toastController'

export default function Example() {
  return (
    <section className="screen">
      <h2>Example module</h2>
      <p>This route is contributed via the plugin loader.</p>
      <button type="button" onClick={() => addToast('Example module says hi!', 'info')}>
        Ping shell
      </button>
    </section>
  )
}

