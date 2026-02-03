'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface SearchContextValue {
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

/** Breakpoint for mobile vs desktop (matches Tailwind lg:) */
const MOBILE_BREAKPOINT = 1024;

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const openSearch = useCallback(() => {
    // On mobile (< 1024px), navigate to search page instead of opening modal
    if (typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT) {
      router.push('/search');
    } else {
      setIsSearchOpen(true);
    }
  }, [router]);

  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  const toggleSearch = useCallback(() => {
    // On mobile, navigate to/from search page
    if (typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT) {
      if (pathname === '/search') {
        router.back();
      } else {
        router.push('/search');
      }
    } else {
      setIsSearchOpen((prev) => !prev);
    }
  }, [router, pathname]);

  // Global keyboard shortcut: Ctrl+K (Windows/Linux) or Cmd+K (Mac)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        // Don't trigger if focused on an input or textarea
        const target = e.target as HTMLElement;
        const isInputFocused =
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable;

        // Allow shortcut from search input itself (to close)
        if (isInputFocused && !isSearchOpen && pathname !== '/search') {
          return;
        }

        e.preventDefault();
        toggleSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSearch, isSearchOpen, pathname]);

  return (
    <SearchContext.Provider
      value={{ isSearchOpen, openSearch, closeSearch, toggleSearch }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
