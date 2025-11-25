import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from './ShellRoot.module.css';
import { Header } from './Header';
import { Footer } from './Footer';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { PanelController, usePanelState } from '../Panels/PanelController';
import { useAppState } from '../StateMachine/state';
import { BottomSheet } from '../BottomSheet/BottomSheet';
import { ToastHost } from '../Toasts/ToastHost';
import { useToast } from '../Toasts/useToast';
import { applySafeAreaPadding } from '../utils/safeArea';

type ShellRootProps = {
  children: React.ReactNode;
};

export const ShellRoot = ({ children }: ShellRootProps) => {
  const overlay = useAppState((state) => state.overlays);
  const panels = usePanelState();
  const { showToast } = useToast();
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    applySafeAreaPadding(shellRef.current);
  }, []);

  return (
    <div className={styles.shell} ref={shellRef}>
      <Header
        className={styles.header}
        onMenu={() => PanelController.openLeft()}
        onActions={() => {
          PanelController.openRight();
          showToast('Right panel opened', 'info');
        }}
      />
      <main className={styles.main}>{children}</main>
      <Footer className={styles.footer} />

      <div className={styles.panels} aria-hidden="true">
        <div className={clsx(styles.panel, styles.leftPanel, panels.leftOpen && styles.leftOpen)}>
          <LeftPanel onClose={() => PanelController.closeAll()} />
        </div>
        <div className={clsx(styles.panel, styles.rightPanel, panels.rightOpen && styles.rightOpen)}>
          <RightPanel onClose={() => PanelController.closeAll()} />
        </div>
      </div>

      <button
        type="button"
        aria-label="Close panels"
        className={clsx(styles.backdrop, overlay.active && styles.backdropVisible)}
        onClick={() => PanelController.closeAll()}
      />

      <BottomSheet>
        <h3>Quick Planner</h3>
        <p>Organize your next micro habit streak or stack.</p>
      </BottomSheet>
      <ToastHost />
    </div>
  );
};

