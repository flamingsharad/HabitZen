"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

type CustomThemeProviderProps = ThemeProviderProps & {
  children: React.ReactNode;
};

// Custom hook to manage the data-theme attribute
function useDataTheme() {
  const { theme } = useNextTheme();

  React.useEffect(() => {
    if(theme === 'minimal' || theme === 'neon' || theme === 'nature') {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);
}


function CustomThemeEffect({ children }: { children: React.ReactNode }) {
    useDataTheme();
    return <>{children}</>;
}


export function ThemeProvider({ children, ...props }: CustomThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <CustomThemeEffect>
        {children}
      </CustomThemeEffect>
    </NextThemesProvider>
  )
}
