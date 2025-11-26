import LazyPanelHost from '@app/Panels/LazyPanelHost'

export default function LeftPanel() {
  return (
    <aside className="app-shell__panel app-shell__panel--left" aria-label="Dynamic panel">
      <LazyPanelHost />
    </aside>
  )
}

