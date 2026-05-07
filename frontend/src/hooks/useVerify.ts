import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import { useLoading } from '../context/LoadingContext';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

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

    const isLockedOut = lockoutTime > Date.now();

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
