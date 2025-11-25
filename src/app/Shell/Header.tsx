type HeaderProps = {
  onMenu: () => void;
  onActions: () => void;
  className?: string;
};

export const Header = ({ onMenu, onActions, className }: HeaderProps) => (
  <header className={className}>
    <div>
      <p style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.7rem' }}>PWA</p>
      <h1 style={{ margin: 0, fontSize: '1.6rem' }}>Micro Habits</h1>
    </div>
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      <button type="button" onClick={onMenu}>
        Panels
      </button>
      <button type="button" onClick={onActions}>
        Actions
      </button>
    </div>
  </header>
);

