export interface InteractionMetrics {
    eventCount: number;
    activityLoad: number;
    inputVariance: number;
    runtimeFlag: boolean;
    timestamp: number;
}

export interface LoginCredentials {
    email: string;
    password: string;
    _website_sync_token?: string;
    metrics?: InteractionMetrics;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    _website_sync_token?: string;
    metrics?: InteractionMetrics;
}

export interface VerifyEmailData {
    email: string;
    otp: string;
}

export interface ForgotPasswordData {
    email: string;
}

export interface ResetPasswordData {
    email: string;
    otp: string;
    password: string;
    logoutAll?: boolean;
}

export interface VerifyLoginOTPData {
    email: string;
    otp: string;
    trustDevice?: boolean;
    requestId?: string;
}
