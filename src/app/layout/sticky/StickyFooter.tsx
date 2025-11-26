import React from 'react';
import { createPortal } from 'react-dom';

interface StickyFooterProps {
  children: React.ReactNode;
}

export const StickyFooter: React.FC<StickyFooterProps> = ({ children }) => {
  const root = document.getElementById('sticky-root');

  if (!root) {
    console.warn('[StickyFooter] #sticky-root not found');
    return null;
  }

  return createPortal(
    <footer className="sticky-footer">
      {children}
    </footer>,
    root
  );
};
