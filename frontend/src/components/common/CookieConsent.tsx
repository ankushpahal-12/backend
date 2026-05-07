import React, { useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

const CookieConsent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(() => {
        return !document.cookie.split('; ').some(row => row.startsWith('cookieConsent='));
    });

    const handleAccept = () => {
        document.cookie = "cookieConsent=accepted; path=/; max-age=31536000"; // 1 year expiry
        setIsVisible(false);
    };

    const handleReject = () => {
        document.cookie = "cookieConsent=rejected; path=/; max-age=31536000"; // 1 year expiry
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <Paper
            elevation={3}
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                p: 2,
                zIndex: 9999,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'background.paper',
                borderRadius: 0,
                borderTop: 1,
                borderColor: 'divider',
            }}
        >
            <Box sx={{ mb: { xs: 2, sm: 0 }, mr: { sm: 2 } }}>
                <Typography variant="body1">
                    We use cookies to improve your experience on our site, personalize content, and analyze our traffic.
                    By clicking "Accept", you consent to our use of cookies.
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                <Button variant="outlined" color="primary" onClick={handleReject}>
                    Reject All
                </Button>
                <Button variant="contained" color="primary" onClick={handleAccept}>
                    Accept All
                </Button>
            </Box>
        </Paper>
    );
};

export default CookieConsent;
