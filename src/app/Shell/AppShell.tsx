import React from 'react';
import { Outlet } from 'react-router-dom';

// Legacy shell components
import { Header } from './Header';
import { Footer } from './Footer';

// Layout subsystems
import { StickyHeader } from '@app/layout/sticky/StickyHeader';
import { StickyFooter } from '@app/layout/sticky/StickyFooter';

import { LeftPanelHost } from '@app/layout/panels/LeftPanelHost';
import { RightPanelHost } from '@app/layout/panels/RightPanelHost';

import { SheetHost } from '@app/layout/sheets/SheetHost';
import { OverlayHost as BatchOverlayHost } from '@app/layout/overlays/OverlayHost';
import { ToastHost as BatchToastHost } from '@app/layout/toasts/ToastHost';

import { CommandPalette } from '@app/commands/palette/CommandPalette';

import { DebugLayer } from '../../debug/DebugLayer';

// Global tokens & CSS
import '@app/tokens/tokens.css';
import './AppShell.css';
import '@app/layout/panels/panel.css';
import '@app/layout/sheets/sheet.css';
import '@app/layout/overlays/overlay.css';
import '@app/layout/toasts/toast.css';
import '@app/commands/palette/palette.css';
import '@app/layout/sticky/sticky.css';

export const AppShell: React.FC = () => {
  return (
    <div className="app-shell">

      {/* Sticky Header */}
      <StickyHeader>
        <Header />
      </StickyHeader>

      {/* Main content */}
      <div className="app-shell__body">
        <Outlet />
      </div>

      {/* Sticky Footer */}
      <StickyFooter>
        <Footer />
      </StickyFooter>

      {/* Global hosts */}
      <LeftPanelHost />
      <RightPanelHost />
      <SheetHost />
      <BatchOverlayHost />
      <BatchToastHost />

      {/* Commands & Debug */}
      <CommandPalette />
      <DebugLayer />
    </div>
  );
};
