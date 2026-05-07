import api from '../utils/api';

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
}

export interface PaginatedResponse<T> {
    status: string;
    meta: PaginationMeta;
    data: T[];
}

export const getAdminStats = async () => {
    const response = await api.get('/admin/stats');
    return response.data;
};

/**
 * Get all users with pagination support
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 20)
 */
export const getAllUsers = async (page: number = 1, limit: number = 20): Promise<PaginatedResponse<any>> => {
    const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
    return response.data;
};

export const getUserDetails = async (id: string) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
};

export const updateUserPassword = async (id: string, data: { password: string }) => {
    const response = await api.patch(`/admin/users/${id}/password`, data);
    return response.data;
};

/**
 * Update user profile (FIXED: Changed from /users/update-me to /users/me with PATCH)
 */
export const updateProfile = async (data: { name?: string; email?: string }) => {
    const response = await api.patch('/users/me', data);
    return response.data;
};

/**
 * Change password (FIXED: Changed from /users/update-password to /users/password with PATCH)
 */
export const changePassword = async (data: Record<string, unknown>) => {
    const response = await api.patch('/users/password', data);
    return response.data;
};

export const getMySessions = async () => {
    const response = await api.get('/users/sessions');
    return response.data;
};

export const terminateSession = async (sessionId: string) => {
    const response = await api.delete(`/users/sessions/${sessionId}`);
    return response.data;
};

export const terminateUserSession = async (userId: string, sessionId: string) => {
    const response = await api.delete(`/admin/users/${userId}/sessions/${sessionId}`);
    return response.data;
};

export const deleteUser = async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get('/users/me');
    return response.data;
};

// --- Secure Account Purge (Recovery Codes) ---

/**
 * Request OTP for recovery code operation (FIXED: Changed from /users/purge-otp to /users/recovery-codes with POST)
 */
export const requestRecoveryCodes = async () => {
    const response = await api.post('/users/recovery-codes');
    return response.data;
};

/**
 * Verify recovery code operation (FIXED: Changed to /users/recovery-codes/verify with POST)
 */
export const verifyRecoveryCodeOperation = async (otp: string) => {
    const response = await api.post('/users/recovery-codes/verify', { otp });
    return response.data;
};

/**
 * Delete recovery codes (FIXED: Changed from /users/purge-account to /users/recovery-codes with DELETE)
 */
export const deleteRecoveryCodes = async (password: string) => {
    // Note: Axios DELETE with data body - use config object syntax
    const response = await api.delete('/users/recovery-codes', { 
        data: { password } 
    });
    return response.data;
};

/**
 * Deactivate account (FIXED: Changed from /users/deactivate-account to /users/deactivate with DELETE)
 */
export const deactivateAccount = async (password: string) => {
    // Note: Axios DELETE with data body - use config object syntax
    const response = await api.delete('/users/deactivate', { 
        data: { password } 
    });
    return response.data;
};

// Backward compatibility aliases (DEPRECATED - use new names above)
export const requestPurgeOtp = requestRecoveryCodes;
export const verifyPurgeOtp = verifyRecoveryCodeOperation;
export const purgeAccount = deleteRecoveryCodes;
