import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import { useNotification } from '../context/NotificationContext';
import { useInteractionMetrics } from './useInteractionMetrics';
import { useLoading } from '../context/hooks/useLoading';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/useSocket';

export const useAdminLogin = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const { packageMetrics } = useInteractionMetrics();
    const { startLoading, stopLoading, isLoading } = useLoading();
    const { connectPublic } = useSocket();
    const { login } = useAuth();

    const [step, setStep] = useState(1); // 1: Credentials, 2: 2FA
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');

    const preventDefault = (e: React.ClipboardEvent) => {
        e.preventDefault();
        showNotification('Administrative Security: Clipboard actions restricted.', 'warning');
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newRid = startLoading('login', 'Authorized access requested. Verifying administrative clearance...');
        if (newRid) connectPublic(newRid);

        try {
            const metrics = packageMetrics();
                await authService.adminLogin({ email, password, metrics, requestId: newRid } as any);
                await stopLoading();
                showNotification('Primary authentication successful. Please enter 2FA code.', 'info');
                toast('Primary authentication successful — 2FA sent to your admin email', { icon: '✉️' });
                setStep(2);
        } catch (err: unknown) {
            await stopLoading();
            showNotification(
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed. Security protocol engaged.',
                'error'
            );
            throw err; // Rethrow to allow outer handler to catch network/server errors states to execute appropriate UI feedback
            
        }
    };

    const handle2FASubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newRid = startLoading('verifying', 'Verifying secondary security tokens...');
        if (newRid) connectPublic(newRid);

        try {
            const response = await authService.adminVerify2FA({ email, otp, requestId: newRid } as any);
            await stopLoading();
            login(response.data.user, response.token);
            showNotification('Otp Verifies Successfully. Welcome to the Admin Dashboard.', 'success');
            toast.success('Admin access granted. Welcome back..!');
            navigate('/admin/dashboard');
        } catch (err: unknown) {
            await stopLoading();
            showNotification(
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid 2FA code.',
                'error'
            );
            toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid 2FA code.');
            throw err; // Rethrow to allow outer handler to catch network/server errors states to execute appropriate UI feedback
        }
    };

    return {
        step, setStep,
        showPassword, setShowPassword,
        email, setEmail,
        password, setPassword,
        otp, setOtp,
        isLoading,
        preventDefault,
        handleLoginSubmit,
        handle2FASubmit,
    };
};
