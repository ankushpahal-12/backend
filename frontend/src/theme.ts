import { alpha } from '@mui/material';
import type { PaletteMode, ThemeOptions } from '@mui/material';

// ── Premium Color Tokens ──────────────────────────────────────────────
const palette = {
    indigo: {
        50: '#EEF2FF',
        100: '#E0E7FF',
        200: '#C7D2FE',
        300: '#A5B4FC',
        400: '#818CF8',
        500: '#6366F1',
        600: '#4F46E5',
        700: '#4338CA',
        800: '#3730A3',
        900: '#312E81',
    },
    emerald: {
        50: '#ECFDF5',
        100: '#D1FAE5',
        200: '#A7F3D0',
        300: '#6EE7B7',
        400: '#34D399',
        500: '#10B981',
        600: '#059669',
        700: '#047857',
    },
    slate: {
        50: '#F8FAFC',
        100: '#F1F5F9',
        200: '#E2E8F0',
        300: '#CBD5E1',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
        700: '#334155',
        800: '#1E293B',
        900: '#0F172A',
        950: '#020617',
    },
    rose: {
        400: '#FB7185',
        500: '#F43F5E',
    },
    amber: {
        400: '#FBBF24',
        500: '#F59E0B',
    },
};

// ── Dark-specific tokens ──────────────────────────────────────────────
const dark = {
    bg: {
        base: '#06080F',
        surface: '#0D1117',
        elevated: '#161B26',
        overlay: alpha('#0D1117', 0.92),
    },
    border: {
        subtle: alpha('#374151', 0.35),
        default: alpha('#374151', 0.5),
        accent: alpha(palette.indigo[500], 0.3),
    },
    glow: {
        indigo: `0 0 60px ${alpha(palette.indigo[500], 0.12)}, 0 0 120px ${alpha(palette.indigo[600], 0.06)}`,
        emerald: `0 0 40px ${alpha(palette.emerald[500], 0.15)}`,
        card: `0 8px 32px ${alpha('#000000', 0.4)}, 0 2px 8px ${alpha('#000000', 0.3)}`,
    },
};

// ── Light-specific tokens ─────────────────────────────────────────────
const light = {
    bg: {
        base: '#F3F4F6',
        surface: '#FFFFFF',
        elevated: '#FFFFFF',
        overlay: alpha('#FFFFFF', 0.95),
    },
    border: {
        subtle: alpha(palette.indigo[200], 0.4),
        default: alpha(palette.indigo[300], 0.3),
        accent: alpha(palette.indigo[500], 0.2),
    },
    glow: {
        indigo: `0 0 60px ${alpha(palette.indigo[200], 0.3)}, 0 0 120px ${alpha(palette.indigo[100], 0.15)}`,
        emerald: `0 0 40px ${alpha(palette.emerald[200], 0.3)}`,
        card: `0 10px 40px -10px rgba(0, 0, 0, 0.08)`,
    },
};

// ── Theme Factory ─────────────────────────────────────────────────────
const getTheme = (mode: PaletteMode): ThemeOptions => {
    const isDark = mode === 'dark';
    const tokens = isDark ? dark : light;

    return {
        palette: {
            mode,
            primary: {
                main: palette.indigo[500],
                light: palette.indigo[400],
                dark: palette.indigo[600],
                contrastText: '#FFFFFF',
            },
            secondary: {
                main: palette.rose[500],
                light: palette.rose[400],
                dark: '#BE123C',
            },
            error: {
                main: palette.rose[500],
                light: palette.rose[400],
            },
            warning: {
                main: palette.amber[500],
                light: palette.amber[400],
            },
            background: {
                default: tokens.bg.base,
                paper: tokens.bg.surface,
            },
            text: {
                primary: isDark ? palette.slate[50] : palette.slate[900],
                secondary: isDark ? palette.slate[400] : palette.slate[500],
            },
            divider: tokens.border.subtle,
            action: {
                hover: alpha(palette.indigo[500], isDark ? 0.1 : 0.06),
                selected: alpha(palette.indigo[500], isDark ? 0.18 : 0.1),
                focus: alpha(palette.indigo[500], isDark ? 0.14 : 0.08),
            },
        },
        shape: {
            borderRadius: 20,
        },
        typography: {
            fontFamily: '"Outfit", "Inter", system-ui, -apple-system, sans-serif',
            h1: { fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 1.1 },
            h2: { fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.15 },
            h3: { fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 },
            h4: { fontWeight: 800, letterSpacing: '-0.015em' },
            h5: { fontWeight: 800, letterSpacing: '-0.01em' },
            h6: { fontWeight: 700, letterSpacing: '-0.005em' },
            subtitle1: { fontWeight: 700, letterSpacing: '0.01em' },
            subtitle2: { fontWeight: 700, letterSpacing: '0.01em', fontSize: '0.8125rem' },
            body1: { lineHeight: 1.65, fontWeight: 500 },
            body2: { lineHeight: 1.6, fontSize: '0.875rem', fontWeight: 500 },
            button: {
                textTransform: 'none' as const,
                fontWeight: 800,
                letterSpacing: '0.02em',
            },
            caption: { letterSpacing: '0.03em', fontWeight: 500 },
            overline: { letterSpacing: '0.08em', fontWeight: 700, fontSize: '0.6875rem' },
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        backgroundColor: tokens.bg.base,
                        scrollbarWidth: 'thin',
                        transition: 'background-color 0.5s cubic-bezier(0.4,0,0.2,1), color 0.3s ease',
                        '&::-webkit-scrollbar': { width: '6px' },
                        '&::-webkit-scrollbar-track': { background: 'transparent' },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: alpha(
                                isDark ? palette.slate[600] : palette.indigo[300],
                                isDark ? 0.3 : 0.25
                            ),
                            borderRadius: '10px',
                            '&:hover': {
                                backgroundColor: alpha(
                                    isDark ? palette.slate[500] : palette.indigo[400],
                                    0.5
                                ),
                            },
                        },
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        backgroundColor: alpha(
                            tokens.bg.surface,
                            isDark ? 0.7 : 0.8
                        ),
                        border: `1px solid ${alpha('#ffffff', isDark ? 0.1 : 0.5)}`,
                        backdropFilter: 'blur(20px) saturate(1.2)',
                        boxShadow: tokens.glow.card,
                        transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                        '&:hover': {
                            borderColor: tokens.border.accent,
                        },
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 20,
                        overflow: 'hidden',
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        padding: '10px 22px',
                        fontSize: '0.875rem',
                        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                        '&:hover': {
                            transform: 'translateY(-1px)',
                        },
                        '&:active': {
                            transform: 'translateY(0) scale(0.98)',
                        },
                    },
                    containedPrimary: {
                        background: `linear-gradient(135deg, ${palette.indigo[500]} 0%, ${palette.indigo[600]} 100%)`,
                        boxShadow: `0 4px 14px ${alpha(palette.indigo[500], 0.35)}`,
                        '&:hover': {
                            background: `linear-gradient(135deg, ${palette.indigo[400]} 0%, ${palette.indigo[500]} 100%)`,
                            boxShadow: `0 6px 20px ${alpha(palette.indigo[500], 0.45)}`,
                        },
                    },
                    outlined: {
                        borderColor: tokens.border.default,
                        '&:hover': {
                            borderColor: palette.indigo[500],
                            backgroundColor: alpha(palette.indigo[500], 0.06),
                        },
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 12,
                            '& fieldset': {
                                borderColor: tokens.border.default,
                                transition: 'border-color 0.3s ease',
                            },
                            '&:hover fieldset': {
                                borderColor: alpha(palette.indigo[500], 0.5),
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: palette.indigo[500],
                                borderWidth: 2,
                                boxShadow: `0 0 0 3px ${alpha(palette.indigo[500], isDark ? 0.15 : 0.1)}`,
                            },
                        },
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        letterSpacing: '0.02em',
                    },
                },
            },
            MuiTooltip: {
                styleOverrides: {
                    tooltip: {
                        backdropFilter: 'blur(12px)',
                        backgroundColor: alpha(isDark ? palette.slate[800] : palette.slate[900], 0.92),
                        borderRadius: 10,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        padding: '8px 14px',
                        border: `1px solid ${alpha(palette.slate[600], 0.2)}`,
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: 24,
                        backdropFilter: 'blur(24px)',
                        backgroundColor: alpha(tokens.bg.surface, isDark ? 0.9 : 0.97),
                        border: `1px solid ${tokens.border.default}`,
                        boxShadow: isDark
                            ? `0 24px 80px ${alpha('#000', 0.6)}`
                            : `0 24px 80px ${alpha(palette.indigo[900], 0.12)}`,
                    },
                },
            },
            MuiAlert: {
                styleOverrides: {
                    root: {
                        borderRadius: 14,
                    },
                },
            },
            MuiLinearProgress: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        height: 6,
                        backgroundColor: alpha(palette.indigo[500], isDark ? 0.12 : 0.08),
                    },
                },
            },
            MuiAvatar: {
                styleOverrides: {
                    root: {
                        border: `2px solid ${tokens.border.accent}`,
                    },
                },
            },
        },
    };
};

// ── Exported helpers for use in custom components ─────────────────────
export { palette, dark as darkTokens, light as lightTokens };
export default getTheme;
