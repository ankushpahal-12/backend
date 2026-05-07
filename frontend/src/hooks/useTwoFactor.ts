import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import QRCode from 'qrcode';
import * as authService from '../services/authService';
import { useNotification } from '../context/NotificationContext';

export const useTwoFactor = () => {
    const [searchParams] = useSearchParams();
    const { showNotification } = useNotification();

    const otpauthUrl = decodeURIComponent(searchParams.get('otpauthUrl') || '');
    const base32 = searchParams.get('base32') || '';
    const email = searchParams.get('email') || '';

    const [qrDataUrl, setQrDataUrl] = useState('');
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Generate QR code from otpauthUrl
    useEffect(() => {
        if (otpauthUrl) {
            QRCode.toDataURL(otpauthUrl, {
                width: 220,
                margin: 2,
                color: { dark: '#000000', light: '#ffffff' }
            })
                .then(setQrDataUrl)
                .catch(() => setError('Failed to generate QR code.'));
        }
    }, [otpauthUrl]);

    const handleCopy = () => {
        navigator.clipboard.writeText(base32).then(() => {
            setCopied(true);
            showNotification('Secret key copied to clipboard', 'success');
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleVerify = async () => {
        if (!token.trim() || token.length !== 6) {
            setError('Please enter the 6-digit code from your authenticator app.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await authService.confirm2FA(token.trim());
            setSuccess(true);
            showNotification('Two-factor authentication enabled successfully!', 'success');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                || 'Invalid code. Please try again.';
            setError(msg);
            showNotification(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleTokenChange = (value: string) => {
        setToken(value.replace(/\D/g, '').slice(0, 6));
        setError('');
    };

    return {
        // Params from URL
        otpauthUrl,
        base32,
        email,
        // State
        qrDataUrl,
        token,
        error,
        success,
        loading,
        copied,
        // Handlers
        handleCopy,
        handleVerify,
        handleTokenChange,
    };
};
