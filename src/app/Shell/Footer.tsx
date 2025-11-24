import React from 'react';
import { ShellTokens } from './LeftPanel';

interface FooterProps {
  tokens: ShellTokens;
  content?: React.ReactNode;
  status?: React.ReactNode;
}

const Footer: React.FC<FooterProps> = ({ tokens, content, status }) => {
  const style: React.CSSProperties = {
    position: 'sticky',
    bottom: 0,
    height: tokens.layout.footerHeight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `0 ${tokens.spacing.lg}px`,
    background: `linear-gradient(90deg, ${tokens.color.surfaceAlt} 0%, ${tokens.color.surface} 100%)`,
    borderTop: `1px solid ${tokens.color.border}`,
    color: tokens.color.textSecondary,
    fontSize: 13,
    letterSpacing: 0.2,
  };

  return (
    <footer style={style}>
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.md }}>{content}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm }}>{status}</div>
    </footer>
  );
};

export default Footer;
