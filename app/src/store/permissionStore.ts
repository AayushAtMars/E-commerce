import { create } from 'zustand';

interface PermissionState {
  needsLocation: boolean;
  needsNotification: boolean;
  setNeedsLocation: (needed: boolean) => void;
  setNeedsNotification: (needed: boolean) => void;
}

export const usePermissionStore = create<PermissionState>((set) => ({
  needsLocation: false,
  needsNotification: false,
  setNeedsLocation: (needed) => set({ needsLocation: needed }),
  setNeedsNotification: (needed) => set({ needsNotification: needed }),
}));
