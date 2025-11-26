import React from 'react';
import { createPortal } from 'react-dom';

interface StickyHeaderProps {
  children: React.ReactNode;
}

export const StickyHeader: React.FC<StickyHeaderProps> = ({ children }) => {
  const root = document.getElementById('sticky-root');

  if (!root) {
    console.warn('[StickyHeader] #sticky-root not found');
    return null;
  }

  return createPortal(
    <header className="sticky-header">
      {children}
    </header>,
    root
  );
};
