import { Box, Typography, Stack, alpha, Grid } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { AutoAwesome, ShutterSpeed, VerifiedUser } from '@mui/icons-material';

const scanline = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-15px) rotate(1deg); }
`;

const BrandingContainer = styled(Box)(({ theme }) => ({
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: theme.spacing(10, 8),
    background: 'radial-gradient(circle at 0% 0%, #0f172a 0%, #020617 100%)',
    color: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
    borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)`,
        animation: `${scanline} 8s linear infinite`,
        opacity: 0.3,
        zIndex: 1,
    },
}));

const HudCorner = styled(Box)(({ theme }) => ({
    position: 'absolute',
    width: '40px',
    height: '40px',
    border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    zIndex: 1,
}));

const BrandingSection = () => {
    return (
        <BrandingContainer>
            {/* HUD Elements */}
            <HudCorner sx={{ top: 20, left: 20, borderRight: 'none', borderBottom: 'none' }} />
            <HudCorner sx={{ top: 20, right: 20, borderLeft: 'none', borderBottom: 'none' }} />
            <HudCorner sx={{ bottom: 20, left: 20, borderRight: 'none', borderTop: 'none' }} />
            <HudCorner sx={{ bottom: 20, right: 20, borderLeft: 'none', borderTop: 'none' }} />

            <Box sx={{ position: 'relative', zIndex: 10, animation: `${float} 6s ease-in-out infinite` }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                    <Box sx={{
                        p: 1.5,
                        bgcolor: 'primary.main',
                        borderRadius: 2,
                        boxShadow: `0 0 20px ${alpha('#6366F1', 0.5)}`,
                        display: 'flex'
                    }}>
                        <AutoAwesome sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #FFF, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        FinTrack AI
                    </Typography>
                </Stack>

                <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, lineHeight: 1.2 }}>
                    The Intelligence Layer for Your <Box component="span" sx={{ color: 'primary.light' }}>Capital.</Box>
                </Typography>

                <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 480, mb: 6, fontSize: '1.1rem', lineHeight: 1.7 }}>
                    Experience real-time telemetry of your wealth. Our neural engine analyzes every transaction to provide predictive insights and automated optimizations.
                </Typography>

                <Grid container spacing={3} sx={{ maxWidth: 500 }}>
                    <Grid size={6}>
                        <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha('#FFF', 0.03), border: '1px solid rgba(255,255,255,0.05)' }}>
                            <ShutterSpeed sx={{ color: 'primary.light', mb: 1 }} />
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>0.4ms</Typography>
                            <Typography variant="caption" color="text.secondary">Latency</Typography>
                        </Box>
                    </Grid>
                    <Grid size={6}>
                        <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha('#FFF', 0.03), border: '1px solid rgba(255,255,255,0.05)' }}>
                            <VerifiedUser sx={{ color: 'secondary.main', mb: 1 }} />
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>AES-256</Typography>
                            <Typography variant="caption" color="text.secondary">Security</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Background Decorative Element */}
            <Box sx={{
                position: 'absolute',
                bottom: '-10%',
                right: '-10%',
                width: '60%',
                height: '60%',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
                filter: 'blur(60px)',
                zIndex: 0
            }} />
        </BrandingContainer>
    );
};

export default BrandingSection;
