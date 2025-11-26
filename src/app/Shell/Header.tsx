import { useMemo } from 'react';

import { useCommandList } from '@app/Navigation/commandRegistry';
import { useCommandNav } from '@app/Navigation/useCommandNav';
import { useInstallPrompt } from '@pwa/useInstallPrompt';

// ✔ Named export — required by AppShell.tsx
export const Header = () => {
  const navigate = useCommandNav();
  const commands = useCommandList();
  const installPrompt = useInstallPrompt();

  const sortedCommands = useMemo(
    () => [...commands].sort((a, b) => a.title.localeCompare(b.title)),
    [commands]
  );

  return (
    <header className="app-shell__header">
      <div>
        <h1>PWA Factory Skeleton</h1>
        <p>Composable navigation, modular plugins and adaptive surfaces.</p>
      </div>

      <nav className="app-shell__nav" aria-label="Primary commands">
        {sortedCommands.map((cmd) => (
          <button
            key={cmd.id}
            type="button"
            onClick={() => navigate(cmd.id)}
            className="app-shell__nav-btn"
          >
            {cmd.title}
          </button>
        ))}
      </nav>

      {installPrompt.canInstall && (
        <button
          type="button"
          className="app-shell__install-btn"
          onClick={installPrompt.install}
          disabled={installPrompt.installing}
        >
          {installPrompt.installing ? 'Installing…' : 'Install PWA'}
        </button>
      )}
    </header>
  );
};
