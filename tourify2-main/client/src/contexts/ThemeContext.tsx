import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  draggingIcon: string | null;
  setDraggingIcon: (icon: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [draggingIcon, setDraggingIcon] = useState<string | null>(null);

  // Update CSS variables when primary color changes
  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primaryColor);
    // Convert hex to HSL for proper CSS variable format
    const hsl = hexToHsl(primaryColor);
    document.documentElement.style.setProperty('--primary', `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`);
  }, [primaryColor]);

  const value = {
    primaryColor,
    setPrimaryColor,
    draggingIcon,
    setDraggingIcon,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Helper function to convert hex to HSL
function hexToHsl(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}