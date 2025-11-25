let scrollLockCount = 0;
let previousOverflow = '';

export const lockBodyScroll = (): void => {
  if (scrollLockCount === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  scrollLockCount += 1;
};

export const unlockBodyScroll = (): void => {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.overflow = previousOverflow;
  }
};

