export const getSafeAreaInset = (edge: 'top' | 'bottom' | 'left' | 'right'): string => {
  return `max(env(safe-area-inset-${edge}, 0px), 12px)`;
};

export const applySafeAreaPadding = (element: HTMLElement | null): void => {
  if (!element) return;
  element.style.setProperty('--safe-area-top', getSafeAreaInset('top'));
  element.style.setProperty('--safe-area-bottom', getSafeAreaInset('bottom'));
};

