import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import toast from 'react-hot-toast';
import { useLoading } from '../context/hooks/useLoading';
import { useSocket } from '../context/useSocket';

export const useForgot = () => {
    const navigate = useNavigate();
    const { startLoading, stopLoading, isLoading } = useLoading();
    const { connectPublic } = useSocket();

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Connect socket for real-time loading updates
        const newRid = startLoading('general', 'Processing request...');
        if (newRid) connectPublic(newRid);

        try {
            await authService.forgotPassword({ email });
            await stopLoading(800);
            toast.success('Password reset code sent to your email!');
            navigate('/user/reset-password', { state: { email } });
        } catch (err: unknown) {
            await stopLoading(400);
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                || 'Something went wrong';
            setError(msg);
            toast.error(msg);
        }
    };

    return {
        email, setEmail,
        error,
        isLoading,
        handleSubmit,
    };
};
export default useForgot;