import { Box, alpha, Stack, IconButton, Tooltip } from '@mui/material';
import type { ReactNode } from 'react';
import { Footer, Navbar, SmoothScroll } from '../landing';

import { useThemeContext } from '../../context/ThemeContext';
import { LightMode, DarkMode } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface LegalLayoutProps {
    children: ReactNode;
}

const LegalLayout = ({ children }: LegalLayoutProps) => {
    const { mode, toggleColorMode } = useThemeContext();

    return (
        <SmoothScroll>
            <Box
                sx={{
                    minHeight: '100vh',
                    bgcolor: 'slate.950',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'background-color 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                <Navbar />
            {/* Top Navigation Controls */}
            <Box sx={{
                position: 'absolute',
                top: { xs: 20, md: 30 },
                right: { xs: 20, md: 40 },
                zIndex: 10,
            }}>
                <Stack direction="row" spacing={2}>
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Tooltip title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                            <IconButton
                                onClick={toggleColorMode}
                                sx={{
                                    color: 'primary.main',
                                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid',
                                    borderColor: alpha('#FFF', 0.1),
                                    borderRadius: 3,
                                    width: 40,
                                    height: 40,
                                    '&:hover': {
                                        bgcolor: alpha('#6366F1', 0.1),
                                        borderColor: alpha('#6366F1', 0.3),
                                        transform: 'translateY(-1px)',
                                    }
                                }}
                            >
                                {mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                    </motion.div>
                </Stack>
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
                opacity: mode === 'dark' ? 1 : 0.4
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
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                pt: { xs: 8, md: 10 },
                pb: { xs: 12, md: 20 }
            }}>
                {children}
            </Box>

            <Footer />
            </Box>
        </SmoothScroll>
    );
};

export default LegalLayout;
