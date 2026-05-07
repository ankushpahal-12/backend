import api from '../utils/api';

/**
 * Google Authentication Service
 * Integration for Google OAuth 2.0
 */

export const loginWithGoogle = async (idToken: string) => {
    const response = await api.post('/auth/google', { idToken });
    return response.data;
};

export const signupWithGoogle = async (idToken: string) => {
    // Backend handles both signup and login in the same endpoint
    return loginWithGoogle(idToken);
};
