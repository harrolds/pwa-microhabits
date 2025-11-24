import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Header from './Header';
import Footer from './Footer';
import LeftPanel, { PanelViewModel, ShellTokens } from './LeftPanel';
import RightPanel from './RightPanel';
import BottomSheet, { SheetViewModel } from './BottomSheet';
import ToastHost, { ToastMessage } from './ToastHost';

type PanelPosition = 'left' | 'right';

export interface PanelController {
  readonly id: PanelPosition;
  readonly state: PanelViewModel;
  open(content?: ReactNode, options?: Partial<PanelViewModel>): void;
  close(): void;
  toggle(content?: ReactNode, options?: Partial<PanelViewModel>): void;
  configure(options: Partial<PanelViewModel>): void;
  setContent(content: ReactNode | null): void;
}

export interface SheetController {
  readonly state: SheetViewModel;
  present(content: ReactNode, options?: Partial<SheetViewModel>): void;
  update(options: Partial<SheetViewModel>): void;
  dismiss(): void;
}

export interface ToastController {
  readonly toasts: ToastMessage[];
  push(toast: Omit<ToastMessage, 'id' | 'createdAt'> & { id?: string }): string;
  dismiss(id: string): void;
  clear(): void;
}

export interface ModalHost {
  present(node: ReactNode, options?: Partial<SheetViewModel>): void;
  dismiss(): void;
  isActive: boolean;
}

export interface ShellControllers {
  panels: Record<PanelPosition, PanelController>;
  sheet: SheetController;
  toasts: ToastController;
  modalHost: ModalHost;
}

interface ShellRootProps {
  children: ReactNode;
  title?: string;
  navigation?: ReactNode;
  headerActionStart?: ReactNode;
  headerActionEnd?: ReactNode;
  footerContent?: ReactNode;
  footerStatus?: ReactNode;
  initialPanels?: Partial<Record<PanelPosition, Partial<PanelViewModel>>>;
  onShellReady?: (controllers: ShellControllers) => void;
}

const randomId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `shell-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
};

const UX_TOKENS: ShellTokens = {
  color: {
    background: '#05060A',
    surface: '#0F111A',
    surfaceAlt: '#151926',
    accent: '#4F7AFE',
    accentMuted: '#A6BAFF',
    border: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#F5F7FF',
    textSecondary: '#A7AEC4',
    danger: '#FF6B6B',
    success: '#2CE59B',
    warning: '#FFD166',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 20,
  },
  shadow: {
    overlay: '0 24px 60px rgba(5, 6, 15, 0.55)',
    toast: '0 14px 30px rgba(0, 0, 0, 0.45)',
  },
  layout: {
    headerHeight: 72,
    footerHeight: 56,
    panelWidth: 320,
    maxSheetHeight: 720,
  },
  motion: {
    durationShort: 140,
    durationMedium: 220,
    durationLong: 320,
    easingStandard: 'cubic-bezier(0.2, 0, 0.2, 1)',
  },
  zIndex: {
    header: 10,
    panels: 20,
    sheet: 30,
    toast: 40,
    overlay: 25,
  },
};

const ShellControllersContext = createContext<ShellControllers | null>(null);

export const useShellControllers = () => {
  const context = useContext(ShellControllersContext);
  if (!context) {
    throw new Error('ShellControllersContext is not available outside ShellRoot.');
  }
  return context;
};

export const usePanelController = (position: PanelPosition) => {
  const controllers = useShellControllers();
  return controllers.panels[position];
};

export const useSheetController = () => useShellControllers().sheet;

export const useToastHost = () => useShellControllers().toasts;

export const useModalHost = () => useShellControllers().modalHost;

const usePanelRuntime = (
  anchor: PanelPosition,
  overrides?: Partial<PanelViewModel>,
): PanelController => {
  const [state, setState] = useState<PanelViewModel>(() => ({
    anchor,
    ariaLabel: anchor === 'left' ? 'Primaire navigatie' : 'Contextpaneel',
    backdrop: anchor === 'left',
    content: null,
    isOpen: false,
    mode: 'overlay',
    width: UX_TOKENS.layout.panelWidth,
    ...overrides,
  }));

  const open = useCallback(
    (content?: ReactNode, options?: Partial<PanelViewModel>) => {
      setState((prev) => ({
        ...prev,
        ...options,
        content: content ?? prev.content,
        isOpen: true,
      }));
    },
    [],
  );

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const toggle = useCallback(
    (content?: ReactNode, options?: Partial<PanelViewModel>) => {
      setState((prev) => ({
        ...prev,
        ...options,
        content: content ?? prev.content,
        isOpen: !prev.isOpen,
      }));
    },
    [],
  );

  const configure = useCallback((options: Partial<PanelViewModel>) => {
    setState((prev) => ({ ...prev, ...options }));
  }, []);

  const setContent = useCallback((content: ReactNode | null) => {
    setState((prev) => ({ ...prev, content }));
  }, []);

  return useMemo<PanelController>(
    () => ({
      id: anchor,
      state,
      open,
      close,
      toggle,
      configure,
      setContent,
    }),
    [anchor, state, open, close, toggle, configure, setContent],
  );
};

const useSheetRuntime = (): SheetController => {
  const [state, setState] = useState<SheetViewModel>({
    isOpen: false,
    content: null,
    headline: undefined,
    subline: undefined,
    size: 'auto',
    dismissible: true,
    scrim: true,
  });

  const present = useCallback((content: ReactNode, options?: Partial<SheetViewModel>) => {
    setState((prev) => ({
      ...prev,
      ...options,
      content,
      isOpen: true,
    }));
  }, []);

  const update = useCallback((options: Partial<SheetViewModel>) => {
    setState((prev) => ({ ...prev, ...options }));
  }, []);

  const dismiss = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
      content: null,
      headline: prev.headline,
      subline: prev.subline,
    }));
  }, []);

  return useMemo(
    () => ({
      state,
      present,
      update,
      dismiss,
    }),
    [state, present, update, dismiss],
  );
};

const useToastRuntime = (): ToastController => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const push = useCallback(
    (toast: Omit<ToastMessage, 'id' | 'createdAt'> & { id?: string }) => {
      const id = toast.id ?? randomId();
      setToasts((prev) => [
        ...prev,
        {
          id,
          createdAt: Date.now(),
          autoDismissAfter: 6000,
          dismissible: true,
          ...toast,
        },
      ]);
      return id;
    },
    [],
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clear = useCallback(() => setToasts([]), []);

  return useMemo(
    () => ({
      toasts,
      push,
      dismiss,
      clear,
    }),
    [toasts, push, dismiss, clear],
  );
};

const ShellRoot: React.FC<ShellRootProps> = ({
  children,
  title,
  navigation,
  headerActionStart,
  headerActionEnd,
  footerContent,
  footerStatus,
  initialPanels,
  onShellReady,
}) => {
  const leftPanel = usePanelRuntime('left', initialPanels?.left);
  const rightPanel = usePanelRuntime('right', {
    backdrop: false,
    ...initialPanels?.right,
  });
  const sheet = useSheetRuntime();
  const toastController = useToastRuntime();

  const controllers = useMemo<ShellControllers>(
    () => ({
      panels: {
        left: leftPanel,
        right: rightPanel,
      },
      sheet,
      toasts: toastController,
      modalHost: {
        present: sheet.present,
        dismiss: sheet.dismiss,
        isActive: sheet.state.isOpen,
      },
    }),
    [leftPanel, rightPanel, sheet, toastController],
  );

  useEffect(() => {
    if (onShellReady) {
      onShellReady(controllers);
    }
  }, [controllers, onShellReady]);

  const rootStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: UX_TOKENS.color.background,
    color: UX_TOKENS.color.textPrimary,
    display: 'flex',
    flexDirection: 'column',
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    padding: `${UX_TOKENS.spacing.lg}px`,
    paddingTop: UX_TOKENS.spacing.xl,
    paddingBottom: UX_TOKENS.spacing.xl,
  };

  return (
    <ShellControllersContext.Provider value={controllers}>
      <div style={rootStyle}>
        <Header
          tokens={UX_TOKENS}
          title={title}
          navigation={navigation}
          leadingSlot={headerActionStart}
          trailingSlot={headerActionEnd}
          leftPanelOpen={leftPanel.state.isOpen}
          rightPanelOpen={rightPanel.state.isOpen}
          onToggleLeftPanel={() => leftPanel.toggle()}
          onToggleRightPanel={() => rightPanel.toggle()}
        />
        <main style={mainStyle}>{children}</main>
        <Footer tokens={UX_TOKENS} content={footerContent} status={footerStatus} />
      </div>
      <LeftPanel model={leftPanel.state} tokens={UX_TOKENS} onClose={leftPanel.close} />
      <RightPanel model={rightPanel.state} tokens={UX_TOKENS} onClose={rightPanel.close} />
      <BottomSheet model={sheet.state} tokens={UX_TOKENS} onDismiss={sheet.dismiss} />
      <ToastHost tokens={UX_TOKENS} items={toastController.toasts} onDismiss={toastController.dismiss} />
    </ShellControllersContext.Provider>
  );
};

export default ShellRoot;
