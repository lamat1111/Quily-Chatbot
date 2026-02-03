'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

interface SidebarContextValue {
  /** Whether the expanded sidebar is open */
  isOpen: boolean;
  /** Open the expanded sidebar */
  open: () => void;
  /** Close the expanded sidebar (collapse to icons on desktop) */
  close: () => void;
  /** Toggle the expanded sidebar */
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

/**
 * Provider for sidebar open/close state.
 *
 * Desktop (lg+): Sidebar is open by default and pushes content
 * Mobile (<lg): Sidebar is closed by default and opens as overlay
 */
export function SidebarProvider({ children }: { children: ReactNode }) {
  // Start with false to avoid hydration mismatch, will set based on screen size after mount
  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // On mount, set initial state based on screen size
  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    setIsOpen(isDesktop);
    setHasMounted(true);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Don't render children until we've determined the correct initial state
  // This prevents a flash of wrong layout
  if (!hasMounted) {
    return null;
  }

  return (
    <SidebarContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
