import { usePluginRegistry } from '@app/modules/pluginRegistry'

export default function RightPanel() {
  const modules = usePluginRegistry()

  return (
    <aside className="app-shell__panel app-shell__panel--right" aria-label="Module insights">
      <h3>Modules</h3>
      <ul>
        {modules.map((module) => (
          <li key={module.id}>{module.title}</li>
        ))}
      </ul>
    </aside>
  )
}

