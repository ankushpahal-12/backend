// Legacy hooks (still available)
export { useUserManagement, type UserEvent, type UserEventLog } from './useUserManagement';
export { useToast } from './useToast';

// New specialized hooks for separate logic
export { useFetchUsers } from './useFetchUsers';
export type { User } from './useFetchUsers';

export { useAddUser } from './useAddUser';

export { useDeleteUser } from './useDeleteUser';

export { useChangeRole } from './useChangeRole';

export { useBanUser, useUnblockUser } from './useBanUser';

export { useResetPassword, useForceLogout } from './useResetPassword';

// Email verification hooks
export { useVerifyEmailOTP } from './useVerifyEmailOTP';

export { useSetPassword } from './useSetPassword';
