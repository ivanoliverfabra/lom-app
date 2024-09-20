import { createStore } from 'zustand/vanilla';

export type Dialogs = 'create-profile' | 'update-profile';

export type DialogData<T extends Dialogs> = T extends 'create-profile'
  ? { name: string }
  : T extends 'update-profile'
    ? { id: number; name: string }
    : never;

export type DialogState<T extends Dialogs = Dialogs> = {
  isOpen: T | null;
  data: DialogData<T> | null;
};

export type DialogActions = {
  open: <T extends Dialogs>(dialog: T, data?: DialogData<T>) => void;
  close: () => void;
};

export type DialogStore = DialogState & DialogActions;

export const defaultInitState: DialogState = {
  isOpen: null,
  data: null,
};

export const createDialogStore = (initState: DialogState = defaultInitState) => {
  return createStore<DialogStore>()((set) => ({
    ...initState,
    close: () => {
      set({ isOpen: null, data: null });
    },
    open: <T extends Dialogs>(dialog: T, data?: DialogData<T>) => {
      set({ isOpen: dialog, data: data || null });
    },
  }));
};
