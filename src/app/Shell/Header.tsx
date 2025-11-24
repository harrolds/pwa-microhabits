import React from 'react';
import { ShellTokens } from './LeftPanel';

interface HeaderProps {
  tokens: ShellTokens;
  title?: string;
  navigation?: React.ReactNode;
  leadingSlot?: React.ReactNode;
  trailingSlot?: React.ReactNode;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  onToggleLeftPanel?: () => void;
  onToggleRightPanel?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  tokens,
  title,
  navigation,
  leadingSlot,
  trailingSlot,
  leftPanelOpen,
  rightPanelOpen,
  onToggleLeftPanel,
  onToggleRightPanel,
}) => {
  const baseStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: tokens.zIndex.header,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    height: tokens.layout.headerHeight,
    padding: `0 ${tokens.spacing.lg}px`,
    background: `linear-gradient(90deg, ${tokens.color.surface} 0%, ${tokens.color.surfaceAlt} 100%)`,
    borderBottom: `1px solid ${tokens.color.border}`,
  };

  const actionButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    minWidth: 40,
    borderRadius: tokens.radius.sm,
    border: `1px solid ${tokens.color.border}`,
    backgroundColor: 'transparent',
    color: tokens.color.textPrimary,
    fontWeight: 600,
    cursor: 'pointer',
    transition: `background-color ${tokens.motion.durationShort}ms ${tokens.motion.easingStandard}`,
    padding: `0 ${tokens.spacing.sm}px`,
  };

  return (
    <header style={baseStyle}>
      <div style={{ display: 'flex', gap: tokens.spacing.sm }}>
        {onToggleLeftPanel && (
          <button
            type="button"
            onClick={onToggleLeftPanel}
            aria-pressed={leftPanelOpen}
            aria-label="Wissel navigatiepaneel"
            style={actionButtonStyle}
          >
            ☰
          </button>
        )}
        {leadingSlot}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: `0 ${tokens.spacing.sm}px`,
        }}
      >
        {title && (
          <span
            style={{
              color: tokens.color.textPrimary,
              fontSize: 18,
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            {title}
          </span>
        )}
        {navigation && (
          <div
            style={{
              marginTop: tokens.spacing.xs,
              color: tokens.color.textSecondary,
              fontSize: 13,
              display: 'flex',
              gap: tokens.spacing.sm,
              alignItems: 'center',
            }}
          >
            {navigation}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: tokens.spacing.sm, justifyContent: 'flex-end' }}>
        {trailingSlot}
        {onToggleRightPanel && (
          <button
            type="button"
            onClick={onToggleRightPanel}
            aria-pressed={rightPanelOpen}
            aria-label="Wissel utilitypaneel"
            style={actionButtonStyle}
          >
            ⋮
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
