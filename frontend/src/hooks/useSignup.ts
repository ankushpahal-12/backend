import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLoading } from '../context/LoadingContext';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useInteractionMetrics } from './useInteractionMetrics';
import { useEmailAvailability } from './useEmailAvailability';
import * as authService from '../services/authService';
import { signupWithGoogle } from '../services/googleAuth';

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
            } as any);

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
