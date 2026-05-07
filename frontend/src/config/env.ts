const mode = import.meta.env.MODE || 'development';
const isProduction = mode === 'production';

const withFallback = (value: string | undefined, fallback: string) => {
    if (typeof value === 'string' && value.trim().length > 0) {
        return value;
    }
    return fallback;
};

const requiredInProduction = (name: string, value: string | undefined) => {
    if (isProduction && (!value || value.trim().length === 0)) {
        throw new Error(`[ENV] Missing required environment variable: ${name}`);
    }
    return value || '';
};

export const ENV = {
    mode,
    isProduction,
    apiUrl: withFallback(import.meta.env.VITE_API_URL, 'http://localhost:5000/api'),
    socketUrl: withFallback(import.meta.env.VITE_SOCKET_URL, 'http://localhost:5000'),
    googleClientId: requiredInProduction('VITE_GOOGLE_CLIENT_ID', import.meta.env.VITE_GOOGLE_CLIENT_ID),
};
