// src/debug/DebugLayer.tsx
import React from 'react';
import { useDebug } from './useDebug';

export const DebugLayer: React.FC = () => {
  // Shell mount log
  useDebug({ name: 'AppShell mounted' });

  // CSS presence checks
  const cssChecks = {
    sticky: !!document.querySelector('.sticky-header'),
    panels: !!document.querySelector('.panel-host'),
    sheets: !!document.querySelector('.sheet-host'),
    overlays: !!document.querySelector('.overlay-host'),
    toasts: !!document.querySelector('.toast-host'),
    palette: !!document.querySelector('.command-palette-host'),
  };

  useDebug({ name: 'CSS Hosts detected', state: cssChecks });

  return null; // zichtbaar maakt niets
};
