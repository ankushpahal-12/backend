import api from '../../../utils/api';
import axios, { type AxiosError } from 'axios';

const API_BASE = '/api/admin';

interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
  timestamp?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  isBlocked: boolean;
  blockedReason?: string;
  blockedAt?: string;
  createdAt: string;
}

interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

interface Stats {
  totalUsers: number;
  verifiedUsers: number;
  financialVolume: string;
  securityThreats: number;
}

/**
 * Retry helper with exponential backoff for rate-limited requests (429)
 */
const retryWithBackoff = async <T,>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> => {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if it's a 429 error and we have retries left
      if (axios.isAxiosError(error) && error.response?.status === 429 && attempt < maxRetries) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        console.warn(`Rate limited (429). Retrying in ${delayMs}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        throw error;
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
};

// Get all users with pagination
export const getAllUsers = async (page: number = 1, limit: number = 10): Promise<PaginatedUsers> => {
  return retryWithBackoff(async () => {
    const url = `${API_BASE}/users?page=${page}&limit=${limit}`;
    const response = await api.get<ApiResponse<User[]>>(url);
    const users = response.data.data || [];
    const total = response.data.meta?.total || 0;

    return { users, total, page, limit };
  }, 3, 1000).catch(error => {
    console.error(`API Error in getAllUsers:`, error);
    throw handleApiError(error);
  });
};

// Get single user
export const getUser = async (userId: string): Promise<User> => {
  try {
    const response = await api.get<ApiResponse<{ user: User }>>(
      `${API_BASE}/users/${userId}`
    );
    const user = response.data.data?.user;
    if (!user) throw new Error('Failed to fetch user');
    return user;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Create new user (step 1: sends OTP email)
export const createUser = async (data: {
  name: string;
  email: string;
  role?: string;
}): Promise<User> => {
  try {
    const response = await api.post<ApiResponse<{ user: User }>>(
      `${API_BASE}/users`,
      data
    );
    const user = response.data.data?.user;
    if (!user) throw new Error('Failed to create user');
    return user;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update user password
export const resetUserPassword = async (userId: string, password: string): Promise<void> => {
  try {
    await api.patch(`${API_BASE}/users/${userId}/password`, { password });
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update user role
export const updateUserRole = async (userId: string, role: string): Promise<User> => {
  try {
    const response = await api.patch<ApiResponse<{ user: User }>>(
      `${API_BASE}/users/${userId}/role`,
      { role }
    );
    const user = response.data.data?.user;
    if (!user) throw new Error('Failed to update user role');
    return user;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Block user
export const blockUser = async (userId: string, reason?: string): Promise<void> => {
  try {
    await api.patch(`${API_BASE}/users/${userId}/block`, { reason });
  } catch (error) {
    throw handleApiError(error);
  }
};

// Unblock user
export const unblockUser = async (userId: string): Promise<void> => {
  try {
    await api.patch(`${API_BASE}/users/${userId}/unblock`);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Terminate session
export const terminateSession = async (userId: string, sessionId: string): Promise<void> => {
  try {
    await api.delete(`${API_BASE}/users/${userId}/sessions/${sessionId}`);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Force logout user from all sessions
export const forceLogoutUser = async (userId: string): Promise<void> => {
  try {
    await api.post(`${API_BASE}/users/${userId}/force-logout`);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Delete user
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await api.delete(`${API_BASE}/users/${userId}`);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get system stats
export const getSystemStats = async (): Promise<Stats> => {
  try {
    const response = await api.get<ApiResponse<{ stats: Stats }>>(
      `${API_BASE}/stats`
    );
    return response.data.data?.stats || {
      totalUsers: 0,
      verifiedUsers: 0,
      financialVolume: '₹0',
      securityThreats: 0,
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

// Email verification endpoints
export const verifyEmailOTP = async (email: string, otp: string): Promise<{ userId: string; email: string }> => {
  try {
    const response = await api.post<ApiResponse<{ userId: string; email: string }>>(
      `${API_BASE}/verify-email-otp`,
      { email, otp }
    );
    return response.data.data || { userId: '', email: '' };
  } catch (error) {
    throw handleApiError(error);
  }
};

export const setPasswordAfterVerification = async (userId: string, password: string): Promise<User> => {
  try {
    const response = await api.post<ApiResponse<{ user: User }>>(
      `${API_BASE}/set-password`,
      { userId, password }
    );
    const user = response.data.data?.user;
    if (!user) throw new Error('Failed to set password');
    return user;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Error handler
const handleApiError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    const message = axiosError.response?.data?.message || axiosError.message || 'An error occurred';
    return new Error(message);
  }
  return error instanceof Error ? error : new Error('An unknown error occurred');
};
