/**
 * useUserGlobal — All modal logic for user actions.
 *
 * Manages: form state, validation, submit handlers, config, and reset logic.
 * The UI component (UserActionModal) consumes the return value of this hook
 * and only handles rendering.
 */

import { useEffect, useState, useCallback } from 'react';
import {
  useUserManagement,
  type User,
  type UserEventLog,
} from './useUserManagement';

// ─── Types ──────────────────────────────────────────────────────────────────

export type UserActionType =
  | 'add-user'
  | 'block-user'
  | 'change-user-role'
  | 'delete-user'
  | 'edit-user'
  | 'force-logout-user'
  | 'reset-user-password'
  | 'unblock-user';

export interface ActionConfig {
  title: string;
  confirmLabel: string;
  loadingLabel: string;
  color?: 'error' | 'warning' | 'primary' | 'success';
}

export interface UseUserGlobalParams {
  open: boolean;
  type: UserActionType;
  user?: User | null;
  onClose: () => void;
  onSuccess?: (data?: Record<string, string>) => void;
}

// ─── Config Map ─────────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<UserActionType, ActionConfig> = {
  'add-user':            { title: 'Create New User',      confirmLabel: 'Create User',        loadingLabel: 'Creating...' },
  'edit-user':           { title: 'Edit User Details',    confirmLabel: 'Save Changes',       loadingLabel: 'Saving...' },
  'block-user':          { title: 'Block User',           confirmLabel: 'Block User',         loadingLabel: 'Blocking...',    color: 'error' },
  'unblock-user':        { title: 'Unblock User',         confirmLabel: 'Unblock User',       loadingLabel: 'Unblocking...',  color: 'success' },
  'change-user-role':    { title: 'Change User Role',     confirmLabel: 'Update Role',        loadingLabel: 'Updating...' },
  'delete-user':         { title: 'Delete User Account',  confirmLabel: 'Delete Permanently', loadingLabel: 'Deleting...',    color: 'error' },
  'reset-user-password': { title: 'Reset Password',       confirmLabel: 'Reset Password',     loadingLabel: 'Resetting...' },
  'force-logout-user':   { title: 'Force Logout',         confirmLabel: 'Force Logout',       loadingLabel: 'Logging out...', color: 'warning' },
};

// ─── Hook ───────────────────────────────────────────────────────────────────

export const useUserGlobal = ({ open, type, user, onClose, onSuccess }: UseUserGlobalParams) => {

  // ── Core user management API ─────────────────────────────────────────────
  const mgmt = useUserManagement();

  // ── Form state ───────────────────────────────────────────────────────────

  // Add / Edit user
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');

  // Block user
  const [blockReason, setBlockReason] = useState('');

  // Change role
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');

  // Delete user
  const [confirmText, setConfirmText] = useState('');

  // Reset password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Local error
  const [localError, setLocalError] = useState<string | null>(null);

  // ── Reset form when modal opens or type changes ──────────────────────────
  const resetForm = useCallback(() => {
    setName(user?.name ?? '');
    setEmail(user?.email ?? '');
    setRole((user?.role as 'user' | 'admin') ?? 'user');
    setBlockReason('');
    setNewRole((user?.role as 'user' | 'admin') ?? 'user');
    setConfirmText('');
    setNewPassword('');
    setConfirmPassword('');
    setLocalError(null);
  }, [user]);

  useEffect(() => {
    if (open) resetForm();
  }, [open, type, resetForm]);

  // ── Unified submit handler ───────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    setLocalError(null);
    let success = false;

    try {
      switch (type) {
        case 'add-user': {
          if (!name.trim()) { setLocalError('Name is required'); return; }
          if (!email.trim()) { setLocalError('Email is required'); return; }
          success = await mgmt.addUser({ name: name.trim(), email: email.trim(), role });
          if (success) onSuccess?.({ email });
          break;
        }

        case 'edit-user': {
          if (!user) return;
          if (!name.trim()) { setLocalError('Name is required'); return; }
          if (!email.trim()) { setLocalError('Email is required'); return; }
          onSuccess?.({ name: name.trim(), email: email.trim(), role });
          success = true;
          break;
        }

        case 'block-user': {
          if (!user) return;
          if (!blockReason.trim()) { setLocalError('Block reason is required'); return; }
          success = await mgmt.blockUser(user._id, blockReason.trim(), user.name);
          if (success) onSuccess?.();
          break;
        }

        case 'unblock-user': {
          if (!user) return;
          success = await mgmt.unblockUser(user._id, user.name);
          if (success) onSuccess?.();
          break;
        }

        case 'change-user-role': {
          if (!user) return;
          if (newRole === user.role) { setLocalError('Please select a different role'); return; }
          success = await mgmt.updateUserRole(user._id, newRole, user.name);
          if (success) onSuccess?.();
          break;
        }

        case 'delete-user': {
          if (!user) return;
          if (confirmText !== 'DELETE') { setLocalError('Type DELETE to confirm'); return; }
          success = await mgmt.deleteUser(user._id, user.name);
          if (success) onSuccess?.();
          break;
        }

        case 'reset-user-password': {
          if (!user) return;
          if (newPassword.length < 8) { setLocalError('Password must be at least 8 characters'); return; }
          if (newPassword !== confirmPassword) { setLocalError('Passwords do not match'); return; }
          success = await mgmt.resetPassword(user._id, user.name);
          if (success) onSuccess?.();
          break;
        }

        case 'force-logout-user': {
          if (!user) return;
          success = await mgmt.forceLogout(user._id, user.name);
          if (success) onSuccess?.();
          break;
        }
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }

    if (success) onClose();
  }, [type, user, name, email, role, blockReason, newRole, confirmText, newPassword, confirmPassword, mgmt, onSuccess, onClose]);

  // ── Computed values ──────────────────────────────────────────────────────
  const config = ACTION_CONFIG[type];

  const isConfirmDisabled = (() => {
    if (mgmt.loading) return true;
    if (type === 'delete-user' && confirmText !== 'DELETE') return true;
    if (type === 'change-user-role' && user && newRole === user.role) return true;
    return false;
  })();

  // ── Return ───────────────────────────────────────────────────────────────
  return {
    // Config
    config,
    isConfirmDisabled,
    localError,

    // Loading state
    loading: mgmt.loading,

    // Form values
    name,
    email,
    role,
    blockReason,
    newRole,
    confirmText,
    newPassword,
    confirmPassword,

    // Form setters
    setName,
    setEmail,
    setRole,
    setBlockReason,
    setNewRole,
    setConfirmText,
    setNewPassword,
    setConfirmPassword,

    // Actions
    handleSubmit,
    resetForm,

    // Pass-through from useUserManagement (for UsersPage and other consumers)
    users:        mgmt.users,
    error:        mgmt.error,
    page:         mgmt.page,
    limit:        mgmt.limit,
    total:        mgmt.total,
    eventLog:     mgmt.eventLog,
    fetchUsers:   mgmt.fetchUsers,
    refreshUsers: mgmt.refreshUsers,
    setPage:      mgmt.setPage,
    searchUsers:  mgmt.searchUsers,
    clearEventLog:  mgmt.clearEventLog,
    getLatestEvent: mgmt.getLatestEvent,
    clearError:     mgmt.clearError,
  };
};

// Re-export types
export type { User, UserEventLog };