'use client';

import { create } from 'zustand';

interface SettingsStore {
  isOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

/**
 * Simple store for managing settings modal state.
 * Allows opening settings from anywhere in the app.
 */
export const useSettingsStore = create<SettingsStore>((set) => ({
  isOpen: false,
  openSettings: () => set({ isOpen: true }),
  closeSettings: () => set({ isOpen: false }),
}));
