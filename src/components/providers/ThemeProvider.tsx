'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes';

/**
 * Theme provider wrapper that configures next-themes for Tailwind dark mode.
 *
 * Settings:
 * - attribute="class": Uses class-based theming for Tailwind dark: classes
 * - defaultTheme="dark": Dark mode is the default per requirements
 * - enableSystem: Respects OS preference when set to "system"
 * - disableTransitionOnChange: Prevents jarring color transitions during switch
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
