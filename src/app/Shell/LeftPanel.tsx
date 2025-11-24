import React, { ReactNode } from 'react';

export interface ShellTokens {
  readonly color: {
    background: string;
    surface: string;
    surfaceAlt: string;
    accent: string;
    accentMuted: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    danger: string;
    success: string;
    warning: string;
  };
  readonly spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  readonly radius: {
    sm: number;
    md: number;
    lg: number;
  };
  readonly shadow: {
    overlay: string;
    toast: string;
  };
  readonly layout: {
    headerHeight: number;
    footerHeight: number;
    panelWidth: number;
    maxSheetHeight: number;
  };
  readonly motion: {
    durationShort: number;
    durationMedium: number;
    durationLong: number;
    easingStandard: string;
  };
  readonly zIndex: {
    header: number;
    panels: number;
    sheet: number;
    toast: number;
    overlay: number;
  };
}

export interface PanelViewModel {
  anchor: 'left' | 'right';
  mode: 'overlay' | 'inline';
  isOpen: boolean;
  width: number;
  ariaLabel: string;
  content: ReactNode | null;
  backdrop: boolean;
}

interface PanelProps {
  model: PanelViewModel;
  tokens: ShellTokens;
  onClose: () => void;
}

const LeftPanel: React.FC<PanelProps> = ({ model, tokens, onClose }) => {
  const isOverlay = model.mode === 'overlay';
  const hidden = !model.isOpen && isOverlay;
  const panelStyle: React.CSSProperties = {
    position: isOverlay ? 'fixed' : 'relative',
    top: isOverlay ? tokens.layout.headerHeight : 0,
    bottom: isOverlay ? tokens.layout.footerHeight : 0,
    left: 0,
    width: model.width,
    backgroundColor: tokens.color.surface,
    borderRight: `1px solid ${tokens.color.border}`,
    boxShadow: model.isOpen ? tokens.shadow.overlay : 'none',
    transform: model.isOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: `transform ${tokens.motion.durationMedium}ms ${tokens.motion.easingStandard}, opacity ${tokens.motion.durationShort}ms ${tokens.motion.easingStandard}`,
    opacity: model.isOpen ? 1 : isOverlay ? 0 : 1,
    zIndex: tokens.zIndex.panels,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    pointerEvents: hidden ? 'none' : 'auto',
  };

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(3, 5, 10, 0.65)',
    backdropFilter: 'blur(4px)',
    opacity: model.isOpen ? 1 : 0,
    pointerEvents: model.isOpen ? 'auto' : 'none',
    transition: `opacity ${tokens.motion.durationShort}ms ease-out`,
    zIndex: tokens.zIndex.overlay,
    border: 'none',
    padding: 0,
  };

  return (
    <>
      {model.backdrop && isOverlay && (
        <button
          type="button"
          aria-label="Sluit navigatiepaneel"
          onClick={onClose}
          style={backdropStyle}
        />
      )}
      <section
        role="complementary"
        aria-label={model.ariaLabel}
        aria-hidden={hidden}
        style={panelStyle}
      >
        {model.content}
      </section>
    </>
  );
};

export default LeftPanel;
