import { Box, alpha, Stack, IconButton, Tooltip } from '@mui/material';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useThemeContext } from '../../context/ThemeContext';
import { Home, DarkMode, LightMode, Menu, Close } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthLayoutProps {
    children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
    const { mode, toggleColorMode } = useThemeContext();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const onClickOutside = (event: MouseEvent) => {
            if (!menuRef.current) return;
            if (!menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };

        const onEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', onClickOutside);
        document.addEventListener('keydown', onEscape);

        return () => {
            document.removeEventListener('mousedown', onClickOutside);
            document.removeEventListener('keydown', onEscape);
        };
    }, []);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: mode === 'light' ? '#F3F7FF' : 'background.default',
                backgroundImage: mode === 'light' ? 'linear-gradient(160deg, #F7FAFF 0%, #EEF4FF 100%)' : 'none',
                position: 'relative',
                overflow: 'hidden',
                p: { xs: 2, md: 3 },
                transition: 'background-color 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
        >
            {/* Top Navigation Controls */}
            <Box sx={{
                position: 'absolute',
                top: { xs: 20, md: 40 },
                right: { xs: 20, md: 40 },
                zIndex: 10,
            }} ref={menuRef}>
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Tooltip title={menuOpen ? 'Close Menu' : 'Open Menu'}>
                        <IconButton
                            onClick={() => setMenuOpen(prev => !prev)}
                            aria-label={menuOpen ? 'Close quick menu' : 'Open quick menu'}
                            aria-expanded={menuOpen}
                            aria-controls="auth-quick-menu"
                            sx={{
                                color: 'primary.main',
                                bgcolor: mode === 'dark' ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.75)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid',
                                borderColor: alpha(mode === 'dark' ? '#FFF' : '#6366F1', 0.14),
                                borderRadius: 3,
                                width: 46,
                                height: 46,
                                boxShadow: mode === 'dark' ? 'none' : `0 6px 16px ${alpha('#6366F1', 0.12)}`,
                                '&:hover': {
                                    bgcolor: alpha('#6366F1', 0.12),
                                    borderColor: alpha('#6366F1', 0.35),
                                }
                            }}
                        >
                            <motion.div
                                initial={false}
                                animate={{ rotate: menuOpen ? 90 : 0, scale: menuOpen ? 1.05 : 1 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                style={{ display: 'flex' }}
                            >
                                {menuOpen ? <Close fontSize="small" /> : <Menu fontSize="small" />}
                            </motion.div>
                        </IconButton>
                    </Tooltip>
                </motion.div>

                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            id="auth-quick-menu"
                            initial={{ opacity: 0, y: -10, scale: 0.96 }}
                            animate={{ opacity: 1, y: 10, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                            style={{
                                position: 'absolute',
                                top: 46,
                                right: 0,
                                width: 'fit-content',
                            }}
                        >
                            <Stack
                                direction="column"
                                spacing={0.75}
                                sx={{
                                    mt: 1,
                                    p: 0.5,
                                    borderRadius: 3,
                                    bgcolor: mode === 'dark' ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(14px)',
                                    border: '1px solid',
                                    borderColor: alpha(mode === 'dark' ? '#FFF' : '#6366F1', 0.14),
                                    boxShadow: mode === 'dark' ? '0 14px 32px rgba(2, 6, 23, 0.55)' : `0 14px 32px ${alpha('#312E81', 0.15)}`,
                                    alignItems: 'center',
                                }}
                            >
                                <Tooltip title="Home">
                                    <IconButton
                                        component={RouterLink}
                                        to="/"
                                        onClick={() => setMenuOpen(false)}
                                        aria-label="Go to home"
                                        size="small"
                                        sx={{
                                            width: 34,
                                            height: 34,
                                            color: 'text.primary',
                                            bgcolor: alpha('#6366F1', 0.08),
                                            border: '1px solid',
                                            borderColor: alpha('#6366F1', 0.18),
                                            '&:hover': {
                                                bgcolor: alpha('#6366F1', 0.16),
                                            }
                                        }}
                                    >
                                        <Home sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
                                    <IconButton
                                        onClick={() => {
                                            toggleColorMode();
                                            setMenuOpen(false);
                                        }}
                                        aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                                        size="small"
                                        sx={{
                                            width: 34,
                                            height: 34,
                                            color: 'text.primary',
                                            bgcolor: alpha('#6366F1', 0.08),
                                            border: '1px solid',
                                            borderColor: alpha('#6366F1', 0.18),
                                            '&:hover': {
                                                bgcolor: alpha('#6366F1', 0.16),
                                            }
                                        }}
                                    >
                                        {mode === 'dark' ? <LightMode sx={{ fontSize: 18 }} /> : <DarkMode sx={{ fontSize: 18 }} />}
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>

            {/* Cyber-Grid Background */}
            <Box sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `linear-gradient(${alpha('#6366F1', mode === 'dark' ? 0.03 : 0.04)} 1px, transparent 1px), linear-gradient(90deg, ${alpha('#6366F1', mode === 'dark' ? 0.03 : 0.04)} 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                zIndex: 0,
                pointerEvents: 'none',
                opacity: mode === 'dark' ? 1 : 0.5
            }} />

            {/* Background Decorative Mesh */}
            <Box sx={{
                position: 'fixed',
                top: '10%',
                left: '20%',
                width: '60vw',
                height: '60vw',
                borderRadius: '50%',
                background: mode === 'dark'
                    ? 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 60%)'
                    : 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 60%)',
                filter: 'blur(80px)',
                zIndex: 0,
                pointerEvents: 'none',
                animation: 'meshPulse 15s infinite alternate ease-in-out'
            }} />

            <Box sx={{
                position: 'fixed',
                bottom: '10%',
                right: '10%',
                width: '50vw',
                height: '50vw',
                borderRadius: '50%',
                background: mode === 'dark'
                    ? 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 60%)'
                    : 'radial-gradient(circle, rgba(16, 185, 129, 0.04) 0%, transparent 60%)',
                filter: 'blur(80px)',
                zIndex: 0,
                pointerEvents: 'none',
                animation: 'meshPulse 20s infinite alternate-reverse ease-in-out'
            }} />

            <style>
                {`
                    @keyframes meshPulse {
                        from { transform: translate(-5%, -5%) scale(1); }
                        to { transform: translate(5%, 5%) scale(1.1); }
                    }
                `}
            </style>

            <Box sx={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: '1440px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}>
                {children}
            </Box>
        </Box>
    );
};

export default AuthLayout;
