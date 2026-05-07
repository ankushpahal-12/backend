import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import toast from 'react-hot-toast';
import { useLoading } from '../context/LoadingContext';
import { useSocket } from '../context/SocketContext';

export const useReset = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { startLoading, stopLoading, isLoading } = useLoading();
    const { connectPublic } = useSocket();
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [logoutAll, setLogoutAll] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [countdown, setCountdown] = useState(10);
    const [email, setEmail] = useState<string>(location.state?.email || '');

    // Extract email/otp from URL query params (magic link support)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const emailParam = params.get('email');
        const otpParam = params.get('otp');
        if (emailParam) setEmail(emailParam);
        if (otpParam) setOtp(otpParam);
    }, [location.search]);

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
