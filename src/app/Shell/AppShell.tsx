import React from 'react';
import { Outlet } from 'react-router-dom';

// Legacy shell components that remain valid
import { Header } from './Header';
import { Footer } from './Footer';

// New v3.0 subsystems (Batch-5)
import { StickyHeader } from '@app/layout/sticky/StickyHeader';
import { StickyFooter } from '@app/layout/sticky/StickyFooter';

import { LeftPanelHost } from '@app/layout/panels/LeftPanelHost';
import { RightPanelHost } from '@app/layout/panels/RightPanelHost';

import { SheetHost } from '@app/layout/sheets/SheetHost';
import { OverlayHost as BatchOverlayHost } from '@app/layout/overlays/OverlayHost';
import { ToastHost as BatchToastHost } from '@app/layout/toasts/ToastHost';

import { CommandPalette } from '@app/commands/palette/CommandPalette';

// Global tokens
import '@app/tokens/tokens.css';

// Global layout styles for shell (optional if you use a shared stylesheet)
import './AppShell.css';

export const AppShell: React.FC = () => {
  return (
    <div className="app-shell">

      {/* Sticky Header (top) */}
      <StickyHeader>
        <Header />
      </StickyHeader>

      {/* Main Application Body */}
      <div className="app-shell__body">
        <Outlet />
      </div>

      {/* Sticky Footer (bottom) */}
      <StickyFooter>
        <Footer />
      </StickyFooter>

      {/* Global UI Hosts */}
      <LeftPanelHost />
      <RightPanelHost />

      <SheetHost />
      <BatchOverlayHost />
      <BatchToastHost />

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
};
