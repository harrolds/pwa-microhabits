import React, { useEffect } from 'react';
import { ShellTokens } from './LeftPanel';

export interface SheetViewModel {
  isOpen: boolean;
  headline?: string;
  subline?: string;
  content: React.ReactNode | null;
  size: 'auto' | 'full';
  dismissible: boolean;
  scrim: boolean;
}

interface BottomSheetProps {
  model: SheetViewModel;
  tokens: ShellTokens;
  onDismiss: () => void;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ model, tokens, onDismiss }) => {
  useEffect(() => {
    if (!model.isOpen || typeof document === 'undefined') {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [model.isOpen]);

  useEffect(() => {
    if (!model.isOpen) {
      return;
    }
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && model.dismissible) {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [model.isOpen, model.dismissible, onDismiss]);

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(5, 6, 12, 0.65)',
    backdropFilter: 'blur(6px)',
    opacity: model.isOpen ? 1 : 0,
    pointerEvents: model.isOpen && model.scrim ? 'auto' : 'none',
    transition: `opacity ${tokens.motion.durationShort}ms ease-out`,
    zIndex: tokens.zIndex.sheet - 1,
    border: 'none',
    padding: 0,
  };

  const heightValue =
    model.size === 'full'
      ? '100%'
      : `min(${tokens.layout.maxSheetHeight}px, calc(100vh - ${tokens.spacing.lg * 2}px))`;

  const sheetStyle: React.CSSProperties = {
    position: 'fixed',
    left: '50%',
    transform: `translate(-50%, ${model.isOpen ? '0%' : '100%'})`,
    bottom: 0,
    width: 'min(960px, 100%)',
    height: heightValue,
    backgroundColor: tokens.color.surface,
    borderRadius: `${tokens.radius.lg}px ${tokens.radius.lg}px 0 0`,
    boxShadow: tokens.shadow.overlay,
    padding: `${tokens.spacing.xl}px`,
    transition: `transform ${tokens.motion.durationLong}ms ${tokens.motion.easingStandard}`,
    zIndex: tokens.zIndex.sheet,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.md,
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: tokens.spacing.sm,
  };

  return (
    <>
      {model.scrim && (
        <button
          type="button"
          aria-label="Sluit sheet"
          onClick={model.dismissible ? onDismiss : undefined}
          style={overlayStyle}
        />
      )}
      <section
        aria-hidden={!model.isOpen}
        aria-live="polite"
        role="dialog"
        style={sheetStyle}
      >
        {(model.headline || model.subline) && (
          <header style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.xs }}>
            {model.headline && (
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 600,
                  color: tokens.color.textPrimary,
                }}
              >
                {model.headline}
              </h2>
            )}
            {model.subline && (
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: tokens.color.textSecondary,
                }}
              >
                {model.subline}
              </p>
            )}
          </header>
        )}
        <div style={{ flex: 1, overflowY: 'auto' }}>{model.content}</div>
        {model.dismissible && (
          <div style={actionsStyle}>
            <button
              type="button"
              onClick={onDismiss}
              style={{
                border: 'none',
                backgroundColor: tokens.color.accent,
                color: tokens.color.background,
                borderRadius: tokens.radius.md,
                padding: `${tokens.spacing.sm}px ${tokens.spacing.lg}px`,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Sluiten
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export default BottomSheet;
