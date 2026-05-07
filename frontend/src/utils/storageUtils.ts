const OBSOLETE_KEYS = [
    'access_token',
    'admin_token',
    'jwt',
    'impersonation_session_id',
    'user_session',
    'username',
    'admin_info',
    'token_type',
    'user'
];

export const cleanupLegacyStorage = () => {
    OBSOLETE_KEYS.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
        }
    });
};
