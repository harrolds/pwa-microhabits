import { create } from 'zustand';

interface SheetState {
  id: string | null;
  open: (id: string) => void;
  close: () => void;
}

export const useSheetHost = create<SheetState>((set) => ({
  id: null,
  open: (id) => set({ id }),
  close: () => set({ id: null }),
}));
