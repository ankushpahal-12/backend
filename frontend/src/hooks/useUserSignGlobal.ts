
import QRCode from 'qrcode';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef, useMemo } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useSocket } from '../context/useSocket';
import { useLoading } from '../context/hooks/useLoading';
import * as authService from '../services/authService';
import { useEmailAvailability } from './useEmailAvailability';
import { useInteractionMetrics } from './useInteractionMetrics';
import { useNotification } from '../context/NotificationContext';
import { signupWithGoogle ,loginWithGoogle } from '../services/googleAuth';
import { useNavigate, useSearchParams,useLocation } from 'react-router-dom';


const DT_HINT_KEY = '_dt_hint';


/*User Signup*/
export const useSignup = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sid = searchParams.get('sid') || '';
    const { startLoading, stopLoading, isLoading } = useLoading();
    const { login } = useAuth();
    const { connectPublic } = useSocket();
    const { packageMetrics } = useInteractionMetrics();

    const [authMethod, setAuthMethod] = useState<'selection' | 'email'>('selection');
    const [showPassword, setShowPassword] = useState(false);
    const [isBreached, setIsBreached] = useState(false);
    const [isCheckingBreach, setIsCheckingBreach] = useState(false);
    const [honeypot, setHoneypot] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const { isRegistered: isEmailRegistered } = useEmailAvailability(formData.email);

    const preventDefault = (e: React.ClipboardEvent) => {
        e.preventDefault();
        toast('Security Protocol: Data entry must be manual for profile initialization.', { icon: '⚠️' });
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const checkBreach = async (pwd: string) => {
        if (!pwd || pwd.length < 4) {
            setIsBreached(false);
            return;
        }
        setIsCheckingBreach(true);
        try {
            const msgUint8 = new TextEncoder().encode(pwd);
            const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
            const prefix = hashHex.substring(0, 5);
            const suffix = hashHex.substring(5);
            const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
            const text = await response.text();
            const lines = text.split('\n');
            const isFound = lines.some(line => line.split(':')[0] === suffix);
            setIsBreached(isFound);
        } catch {
            // Breach check failed silently
        } finally {
            setIsCheckingBreach(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (formData.password) checkBreach(formData.password);
            else setIsBreached(false);
        }, 800);
        return () => clearTimeout(timeout);
    }, [formData.password]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }
        if (isBreached) {
            toast.error('Please use a secure, non-compromised password.');
            return;
        }
        if (isEmailRegistered) {
            toast.error('This email is already registered. Please use a different one.');
            return;
        }

        const newRid = startLoading('register', 'Creating Account...');
        if (newRid) connectPublic(newRid);

        try {
            const metrics = packageMetrics();
            await authService.register({
                name: formData.fullName,
                email: formData.email,
                password: formData.password,
                sid,
                _website_sync_token: honeypot,
                metrics,
                requestId: newRid
            } as Parameters<typeof authService.register>[0] & { sid?: string; requestId?: string });

            stopLoading();
            toast.success('Registration successful! Please verify your email.');
            navigate('/user/verify-email', { state: { email: formData.email } });
        } catch (err: unknown) {
            stopLoading();
            toast.error(
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed.'
            );
        }
    };

    const handleGoogleLoginSuccess = async (credentialResponse: { credential?: string }) => {
        if (!credentialResponse.credential) return;
        startLoading('google', 'Provisioning Google Node...');
        try {
            const data = await signupWithGoogle(credentialResponse.credential);
            if (data.status === 'success') {
                toast.success('Google Node Provisioned Successfully');
                login(data.data.user);
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
        showPassword,
        isBreached,
        isCheckingBreach,
        honeypot, setHoneypot,
        termsAccepted, setTermsAccepted,
        formData,
        isEmailRegistered,
        isLoading,
        // Handlers
        preventDefault,
        handleClickShowPassword,
        handleChange,
        handleSubmit,
        handleGoogleLoginSuccess,
        handleGoogleLoginError,
    };
};

/*User Login*/
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
            const response = await authService.forceLogin({ email, password, _dtHint } as { email: string; password: string; _dtHint: string | null });
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
            toast.success('Login Successful!');
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
/*User Verify Email*/

export const useVerify = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { startLoading, stopLoading, isLoading } = useLoading();
    const { login } = useAuth();

    const email: string = location.state?.email;
    const initialApiKey: string | undefined = location.state?.apiKey;

    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
    const [showOtp, setShowOtp] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [resendTimer, setResendTimer] = useState(0);
    const [resendAttempts, setResendAttempts] = useState(() =>
        parseInt(localStorage.getItem(`resend_attempts_${email}`) || '0')
    );
    const [lockoutTime, setLockoutTime] = useState(() =>
        parseInt(localStorage.getItem(`lockout_${email}`) || '0')
    );
    const [isVerified, setIsVerified] = useState(false);
    const [copied, setCopied] = useState(false);
    const [now, setNow] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [setNow]);

    const isLockedOut = useMemo(() => lockoutTime > now, [lockoutTime, now]);

    // Redirect if no email in state
    useEffect(() => {
        if (!email) {
            navigate('/');
        }
    }, [email, navigate]);

    // Resend countdown timer
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (resendTimer > 0) {
            timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [resendTimer]);

    // Track page reloads for anti-abuse
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (resendAttempts >= 3) {
                const reloadCount = parseInt(localStorage.getItem(`reload_count_${email}`) || '0');
                localStorage.setItem(`reload_count_${email}`, (reloadCount + 1).toString());
                localStorage.setItem(`resend_attempts_${email}`, '0');
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [resendAttempts, email]);

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newValues = [...otpValues];
        newValues[index] = value.slice(-1);
        setOtpValues(newValues);
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        toast('Security Protocol: Data entry must be manual for profile initialization.', { icon: '⚠️' });
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const otp = otpValues.join('');
        if (otp.length < 6) return;

        if (isLockedOut) {
            toast.error('Account temporarily locked. Please try again later.');
            return;
        }

        startLoading('verifying', 'Verifying your account...');
        try {
            const response = await authService.verifyEmail({ email, otp });
            await stopLoading(1200);
            login(response.data.user, response.token);
            toast.success('Email verified successfully!');
            setIsVerified(true);
            if (!initialApiKey) {
                setTimeout(() => navigate('/user/dashboard'), 2000);
            }
        } catch (err: unknown) {
            await stopLoading(500);
            toast.error(
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Verification failed'
            );
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0 || isLockedOut) return;

        if (resendAttempts >= 3) {
            const reloadCount = parseInt(localStorage.getItem(`reload_count_${email}`) || '0');
            if (reloadCount >= 1) {
                const lockout = Date.now() + 10 * 60 * 1000;
                setLockoutTime(lockout);
                localStorage.setItem(`lockout_${email}`, lockout.toString());
                toast.error('Too many attempts. Please try again after 10 minutes.');
            } else {
                toast('Please reload the window and try again.', { icon: '⚠️' });
            }
            return;
        }

        startLoading('general', 'Resending verification code...');
        try {
            await authService.resendOTP(email);
            await stopLoading(800);
            const newAttempts = resendAttempts + 1;
            setResendAttempts(newAttempts);
            localStorage.setItem(`resend_attempts_${email}`, newAttempts.toString());
            toast.success('New verification code sent!');
            setResendTimer(60);
        } catch (err: unknown) {
            await stopLoading(400);
            toast.error(
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to resend code'
            );
        }
    };

    const copyToClipboard = () => {
        if (!initialApiKey) return;
        navigator.clipboard.writeText(initialApiKey);
        setCopied(true);
        toast.success('API Key copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    return {
        // State
        email,
        initialApiKey,
        otpValues,
        showOtp, setShowOtp,
        inputRefs,
        resendTimer,
        resendAttempts,
        lockoutTime,
        isVerified,
        copied,
        isLockedOut,
        isLoading,
        // Handlers
        handleOtpChange,
        handleKeyDown,
        handlePaste,
        handleVerify,
        handleResend,
        copyToClipboard,
    };
};

/*User Reset Password*/
export const useReset = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { startLoading, stopLoading, isLoading } = useLoading();
    const { connectPublic } = useSocket();
    
    // Extract initial values from URL params or location state
    const getInitialEmail = () => {
        const params = new URLSearchParams(location.search);
        return params.get('email') || location.state?.email || '';
    };
    
    const getInitialOtp = () => {
        const params = new URLSearchParams(location.search);
        return params.get('otp') || '';
    };
    
    const [otp, setOtp] = useState(getInitialOtp());
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [logoutAll, setLogoutAll] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [countdown, setCountdown] = useState(10);
    const email = getInitialEmail();

    // Redirect back if no email present
    useEffect(() => {
        if (!email && !isLoading) {
            const params = new URLSearchParams(location.search);
            if (!params.get('email')) {
                navigate('/user/forgot-password');
            }
        }
    }, [email, navigate, isLoading, location.search]);

    // Countdown timer after successful reset
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (showSuccess && countdown > 0) {
            timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
        } else if (showSuccess && countdown === 0) {
            navigate('/');
        }
        return () => clearInterval(timer);
    }, [showSuccess, countdown, navigate]);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error('Please enter the 6-digit reset code');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        const newRid = startLoading('general', 'Updating security credentials...');
        if (newRid) connectPublic(newRid);
        try {
            await authService.resetPassword({ email, otp, password, logoutAll });
            await stopLoading(1200);
            setShowSuccess(true);
        } catch (err: unknown) {
            await stopLoading(500);
            toast.error(
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to reset password'
            );
        }
    };

    return {
        otp, setOtp,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        logoutAll, setLogoutAll,
        showPassword, setShowPassword,
        showSuccess,
        countdown,
        email,
        isLoading,
        handleReset,
    };
};

/* Two factor Authentication */
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
