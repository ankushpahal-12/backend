import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as authService from '../services/authService';
import { loginWithGoogle } from '../services/googleAuth';
import { useLoading } from '../context/LoadingContext';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useInteractionMetrics } from './useInteractionMetrics';

// ── Device hint helpers ────────────────────────────────────────────────────────
// A stable, per-browser random ID stored in localStorage.
// Used as a fallback when the `dt` HttpOnly cookie cannot be read (cookie consent off).
const DT_HINT_KEY = '_dt_hint';

function getOrCreateDtHint(): string {
    let hint = localStorage.getItem(DT_HINT_KEY);
    if (!hint) {
        hint = `dth-${Math.random().toString(36).substring(2)}-${Date.now()}`;
        localStorage.setItem(DT_HINT_KEY, hint);
    }
    return hint;
}

function saveDtHint(value: string) {
    localStorage.setItem(DT_HINT_KEY, value);
}

export const useLogin = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sid = searchParams.get('sid') || '';
    const { login } = useAuth();
    const { packageMetrics } = useInteractionMetrics();
    const { startLoading, stopLoading, isLoading } = useLoading();
    const { connectPublic } = useSocket();

    // Auth flow states
    const [authMethod, setAuthMethod] = useState<'selection' | 'email' | 'google'>('selection');
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [conflictOpen, setConflictOpen] = useState(false);
    const [activeCount, setActiveCount] = useState(0);
    const [honeypot, setHoneypot] = useState('');
    const [lockoutSeconds, setLockoutSeconds] = useState(0);
    const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

    // Field states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [totpCode, setTotpCode] = useState('');
    const [trustDevice, setTrustDevice] = useState(true);

    const preventDefault = (e: React.ClipboardEvent) => {
        e.preventDefault();
        toast('Security Protocol: Copy/Paste disabled for credential security.', { icon: '⚠️' });
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleCredentialsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newRid = startLoading('login', 'Authenticating...');
        if (newRid) connectPublic(newRid);

        try {
            const metrics = packageMetrics();
            // Send the localStorage device hint as a cookie-bypass fallback
            const _dtHint = getOrCreateDtHint();

            const response = await authService.login({
                email,
                password,
                sid,
                _website_sync_token: honeypot,
                _dtHint,
                metrics,
                requestId: newRid
            } as Parameters<typeof authService.login>[0]);

            stopLoading();

            if (response.requireOTP) {
                toast(response.message, { icon: 'ℹ️' });
                setStep(2);
            } else if (response.requireTOTP) {
                toast(response.message, { icon: 'ℹ️' });
                setStep(3);
            } else {
                login(response.data.user, response.token);
                toast.success('Login Successful');
                await stopLoading();
                navigate('/user/dashboard');
            }
        } catch (err: unknown) {
            stopLoading();
            const error = err as { response?: { status?: number; data?: { message?: string; activeSessionsCount?: number } } };

            if (error.response?.status === 409) {
                setActiveCount(error.response.data?.activeSessionsCount || 1);
                setConflictOpen(true);
                return;
            }

            toast.error(error.response?.data?.message || 'Authentication failed.');

            if (error.response?.status === 423) {
                const msg = error.response?.data?.message || '';
                const mins = msg.match(/(\d+) minute/);
                if (mins) setLockoutSeconds(parseInt(mins[1]) * 60);
            }

            const msg = error.response?.data?.message || '';
            const match = msg.match(/(\d+) attempt/);
            if (match) setRemainingAttempts(parseInt(match[1]));
        }
    };

    const handleForceLogin = async () => {
        setConflictOpen(false);
        startLoading('login', 'Synchronizing nodes...');
        try {
            const _dtHint = getOrCreateDtHint();
            const response = await authService.forceLogin({ email, password, _dtHint } as any);
            await stopLoading();
            login(response.data.user, response.token);
            toast.success('Session Sync Complete.');
            navigate('/user/dashboard');
        } catch {
            stopLoading();
            toast.error('Sync failed.');
        }
    };

    const handleOTPSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newRid = startLoading('verifying', 'Validating Token...');
        if (newRid) connectPublic(newRid);

        try {
            const response = await authService.verifyLoginOTP({ email, otp, trustDevice, requestId: newRid });
            await stopLoading();

            // If user chose to trust this device, save the new device hint from server
            // The server sets the dt cookie; we also persist a localStorage hint for fallback
            if (trustDevice) {
                // Regenerate hint on successful OTP so it changes per-session (rotation)
                const newHint = `dth-${Math.random().toString(36).substring(2)}-${Date.now()}`;
                saveDtHint(newHint);
            }

            login(response.data.user, response.token);
            toast.success('Identity Confirmed.');
            navigate('/user/dashboard');
        } catch {
            await stopLoading();
            toast.error('Invalid code.');
        }
    };

    const handleTOTPSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startLoading('verifying', 'Verifying authenticator code...');
        try {
            const response = await authService.verifyTOTPLogin(email, totpCode.trim());
            await stopLoading();
            login(response.data.user, response.token);
            toast.success('Access Granted.');
            navigate('/user/dashboard');
        } catch (err: unknown) {
            await stopLoading();
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Invalid authenticator code.');
        }
    };

    const handleGoogleLoginSuccess = async (credentialResponse: { credential?: string }) => {
        if (!credentialResponse.credential) return;
        startLoading('google', 'Synchronizing Google Node...');
        try {
            const data = await loginWithGoogle(credentialResponse.credential);
            if (data.status === 'success') {
                toast.success('Google Identity Sync Successful');
                login(data.data.user, data.token);
                navigate('/user/dashboard');
            }
        } catch (err: unknown) {
            toast.error(
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Google Synchronization failed.'
            );
        } finally {
            stopLoading();
        }
    };

    const handleGoogleLoginError = () => {
        toast.error('Google Identity Provisioning Failed.');
    };

    return {
        // State
        authMethod, setAuthMethod,
        step, setStep,
        showPassword,
        conflictOpen, setConflictOpen,
        activeCount,
        honeypot, setHoneypot,
        lockoutSeconds,
        remainingAttempts,
        email, setEmail,
        password, setPassword,
        otp, setOtp,
        totpCode, setTotpCode,
        trustDevice, setTrustDevice,
        isLoading,
        // Handlers
        preventDefault,
        handleClickShowPassword,
        handleCredentialsSubmit,
        handleForceLogin,
        handleOTPSubmit,
        handleTOTPSubmit,
        handleGoogleLoginSuccess,
        handleGoogleLoginError,
    };
};
