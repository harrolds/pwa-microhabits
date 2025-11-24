import React, { useEffect } from 'react';
import { ShellTokens } from './LeftPanel';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  kind: 'neutral' | 'positive' | 'warning' | 'negative';
  autoDismissAfter?: number;
  createdAt: number;
  dismissible: boolean;
}

interface ToastHostProps {
  tokens: ShellTokens;
  items: ToastMessage[];
  onDismiss: (id: string) => void;
}

const kindColor = (tokens: ShellTokens, kind: ToastMessage['kind']) => {
  switch (kind) {
    case 'positive':
      return tokens.color.success;
    case 'warning':
      return tokens.color.warning;
    case 'negative':
      return tokens.color.danger;
    default:
      return tokens.color.accent;
  }
};

const ToastHost: React.FC<ToastHostProps> = ({ tokens, items, onDismiss }) => {
  useEffect(() => {
    const timers = items.map((toast) => {
      if (!toast.autoDismissAfter) {
        return undefined;
      }
      const elapsed = Date.now() - toast.createdAt;
      const remaining = Math.max(toast.autoDismissAfter - elapsed, 0);
      const timeout = window.setTimeout(() => onDismiss(toast.id), remaining);
      return () => window.clearTimeout(timeout);
    });
    return () => {
      timers.forEach((clear) => clear && clear());
    };
  }, [items, onDismiss]);

  if (items.length === 0) {
    return null;
  }

  const hostStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: tokens.spacing.xl,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.sm,
    zIndex: tokens.zIndex.toast,
  };

  return (
    <div role="region" aria-live="polite" style={hostStyle}>
      {items.map((toast) => {
        const accent = kindColor(tokens, toast.kind);
        return (
          <article
            key={toast.id}
            style={{
              minWidth: 280,
              maxWidth: 440,
              backgroundColor: tokens.color.surfaceAlt,
              borderRadius: tokens.radius.md,
              border: `1px solid ${tokens.color.border}`,
              boxShadow: tokens.shadow.toast,
              padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`,
              color: tokens.color.textPrimary,
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing.xs,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: tokens.spacing.sm }}>
              <span style={{ fontWeight: 600, color: accent }}>{toast.title}</span>
              {toast.dismissible && (
                <button
                  type="button"
                  onClick={() => onDismiss(toast.id)}
                  aria-label="Sluit melding"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: tokens.color.textSecondary,
                    cursor: 'pointer',
                    fontSize: 16,
                  }}
                >
                  ×
                </button>
              )}
            </div>
            {toast.description && (
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.4,
                  color: tokens.color.textSecondary,
                }}
              >
                {toast.description}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
};

export default ToastHost;
