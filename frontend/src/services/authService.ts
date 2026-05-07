import api from '../utils/api';
import type {
    LoginCredentials,
    RegisterData,
    VerifyEmailData,
    ForgotPasswordData,
    ResetPasswordData,
    VerifyLoginOTPData
} from '../types/auth.types';

export const login = async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const initAuthSession = async (type: 'login' | 'signup'): Promise<string> => {
    const response = await api.post('/auth/init-session', { type });
    return response.data.data.sid;
};

export const forceLogin = async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/force-login', credentials);
    return response.data;
};

export const register = async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
};

export const verifyEmail = async (data: VerifyEmailData) => {
    const response = await api.post('/auth/verify-email', data);
    return response.data;
};

export const resendOTP = async (email: string) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
};

export const forgotPassword = async (data: ForgotPasswordData) => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
};

export const resetPassword = async (data: ResetPasswordData) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
};

export const adminLogin = async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/admin/login', credentials);
    return response.data;
};

export const adminVerify2FA = async (data: VerifyEmailData) => {
    const response = await api.post('/auth/admin/verify-2fa', data);
    return response.data;
};

export const verifyLoginOTP = async (data: VerifyLoginOTPData) => {
    const response = await api.post('/auth/verify-login-otp', data);
    return response.data;
};

export const logout = async () => {
    const response = await api.post('/auth/logout');
    return response.data;
};

export const getWeb3Nonce = async (address: string) => {
    // VULN-11 FIX: Always URL-encode untrusted values before interpolating into query strings
    const response = await api.get(`/auth/web3/nonce?address=${encodeURIComponent(address)}`);
    return response.data;
};

export const verifyWeb3 = async (address: string, signature: string) => {
    const response = await api.post('/auth/web3/verify', { address, signature });
    return response.data;
};

export const checkEmail = async (email: string) => {
    const response = await api.post('/auth/check-email', { email });
    return response.data;
};

// ─── TOTP 2FA ────────────────────────────────────────────────────────────────

export const setup2FA = async () => {
    const response = await api.post('/auth/2fa/setup');
    return response.data;
};

export const confirm2FA = async (token: string) => {
    const response = await api.post('/auth/2fa/confirm', { token });
    return response.data;
};

export const disable2FA = async (token: string) => {
    const response = await api.post('/auth/2fa/disable', { token });
    return response.data;
};

export const verifyTOTPLogin = async (email: string, token: string) => {
    const response = await api.post('/auth/2fa/verify-login', { email, token });
    return response.data;
};
