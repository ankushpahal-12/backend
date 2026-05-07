import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material';
import type { PaletteMode, ThemeOptions } from '@mui/material';
import getTheme from '../theme';

interface ThemeContextType {
    mode: PaletteMode;
    toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    mode: 'dark',
    toggleColorMode: () => { },
});

// eslint-disable-next-line react-refresh/only-export-components
export const useThemeContext = () => useContext(ThemeContext);

export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<PaletteMode>(() => {
        const savedMode = localStorage.getItem('themeMode');
        return (savedMode as PaletteMode) || 'dark';
    });

    useEffect(() => {
        localStorage.setItem('themeMode', mode);
        // Also update HTML data-theme for Tailwind support if needed
        document.documentElement.setAttribute('data-theme', mode);
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [mode]);

    const themeContextValue = useMemo(() => ({
        mode,
        toggleColorMode: () => {
            setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
        },
    }), [mode]);

    const theme = useMemo(() => createTheme(getTheme(mode) as ThemeOptions), [mode]);

    return (
        <ThemeContext.Provider value={themeContextValue}>
            <MUIThemeProvider theme={theme}>
                {children}
            </MUIThemeProvider>
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
