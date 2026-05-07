import { useState, useEffect } from 'react';
import * as authService from '../services/authService';

export const useEmailAvailability = (email: string) => {
    const [isRegistered, setIsRegistered] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkEmail = async () => {
            if (!email || !email.includes('@')) {
                setIsRegistered(false);
                setError(null);
                return;
            }

            setIsChecking(true);
            try {
                const response = await authService.checkEmail(email);
                setIsRegistered(response.data.isRegistered);
                setError(null);
            } catch (err: unknown) {
                console.error('Email check failed:', err);
                setError('Failed to check email availability');
            } finally {
                setIsChecking(false);
            }
        };

        const timeout = setTimeout(checkEmail, 500);
        return () => clearTimeout(timeout);
    }, [email]);

    return { isRegistered, isChecking, error };
};
