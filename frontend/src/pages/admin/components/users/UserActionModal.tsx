/**
 * UserActionModal — Pure UI component for ALL user actions.
 *
 * All logic (form state, validation, submit, config) lives in useUserGlobal.
 * This component only handles rendering the modal shell and action-specific fields.
 */

import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import Modal from '../../../../components/ui/Modal';
import { useUserGlobal, type UserActionType } from '../../hooks/useUserGlobal';
import type { User } from '../../hooks/useUserManagement';

// ─── Props ──────────────────────────────────────────────────────────────────

export type { UserActionType };

export interface UserActionModalProps {
  open: boolean;
  onClose: () => void;
  type: UserActionType;
  user?: User | null;
  onSuccess?: (data?: Record<string, string>) => void;
}

// ─── Component (Pure UI — zero logic) ───────────────────────────────────────

const UserActionModal = ({ open, onClose, type, user, onSuccess }: UserActionModalProps) => {

  // Everything comes from the hook — no local state here
  const {
    config,
    isConfirmDisabled,
    localError,
    loading,
    name, email, role,
    blockReason, newRole, confirmText,
    newPassword, confirmPassword,
    setName, setEmail, setRole,
    setBlockReason, setNewRole, setConfirmText,
    setNewPassword, setConfirmPassword,
    handleSubmit,
  } = useUserGlobal({ open, type, user, onClose, onSuccess });

  const { title, confirmLabel, loadingLabel, color } = config;

  // ── Render helpers (one per action) ──────────────────────────────────────

  const renderAddUserFields = () => (
    <>
      <TextField
        label="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        placeholder="Enter user's full name"
        disabled={loading}
      />
      <TextField
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        placeholder="Enter user's email"
        disabled={loading}
      />
      <FormControl fullWidth disabled={loading}>
        <InputLabel>Role</InputLabel>
        <Select
          value={role}
          label="Role"
          onChange={(e: SelectChangeEvent) => setRole(e.target.value as 'user' | 'admin')}
        >
          <MenuItem value="user">User</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </Select>
      </FormControl>
      <Alert severity="info">
        Verification OTP will be sent to the user's email. They will need to verify it and set their own password.
      </Alert>
    </>
  );

  const renderEditUserFields = () => (
    <>
      <Typography variant="body2" color="text.secondary">
        Update user information below.
      </Typography>
      <TextField
        label="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        placeholder="Enter full name"
        disabled={loading}
      />
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        placeholder="Enter email address"
        disabled={loading}
      />
      <FormControl fullWidth disabled={loading}>
        <InputLabel>Role</InputLabel>
        <Select
          value={role}
          label="Role"
          onChange={(e: SelectChangeEvent) => setRole(e.target.value as 'user' | 'admin')}
        >
          <MenuItem value="user">User</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </Select>
      </FormControl>
    </>
  );

  const renderBlockUserFields = () => (
    <>
      <Alert severity="warning">
        Blocking {user?.name} will:
        <ul>
          <li>Prevent login</li>
          <li>Terminate all active sessions</li>
          <li>Hide their profile</li>
        </ul>
      </Alert>
      <TextField
        label="Reason for Blocking"
        value={blockReason}
        onChange={(e) => setBlockReason(e.target.value)}
        fullWidth
        multiline
        rows={3}
        placeholder="Enter the reason for blocking this user..."
        disabled={loading}
      />
    </>
  );

  const renderUnblockUserFields = () => (
    <>
      {user?.blockedAt && (
        <Alert severity="info">
          <strong>Blocked on:</strong> {new Date(user.blockedAt).toLocaleString()}
          {user.blockedReason && (
            <>
              <br />
              <strong>Reason:</strong> {user.blockedReason}
            </>
          )}
        </Alert>
      )}
      <Alert severity="success">
        User {user?.name} will be able to login again after unblocking.
      </Alert>
    </>
  );

  const renderChangeRoleFields = () => (
    <>
      <Alert severity="info">
        Current role: <strong>{user?.role}</strong>
      </Alert>
      <FormControl fullWidth disabled={loading}>
        <InputLabel>New Role</InputLabel>
        <Select
          value={newRole}
          label="New Role"
          onChange={(e) => setNewRole(e.target.value as 'user' | 'admin')}
        >
          <MenuItem value="user">User</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </Select>
      </FormControl>
      <Alert severity="warning">
        Changing role to <strong>{newRole}</strong> will update {user?.name}'s permissions immediately.
      </Alert>
    </>
  );

  const renderDeleteUserFields = () => (
    <>
      <Alert severity="warning">
        This action cannot be undone. All user data will be permanently deleted.
      </Alert>
      <Stack>
        <strong>User to Delete:</strong>
        <p>{user?.name} ({user?.email})</p>
      </Stack>
      <TextField
        label="Confirm by typing DELETE"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        fullWidth
        placeholder="Type DELETE to confirm"
        disabled={loading}
      />
    </>
  );

  const renderResetPasswordFields = () => (
    <>
      <Alert severity="info">
        Resetting password for <strong>{user?.name}</strong> ({user?.email})
      </Alert>
      <TextField
        label="New Password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        fullWidth
        placeholder="Enter new password"
        helperText="Minimum 8 characters"
        disabled={loading}
      />
      <TextField
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        fullWidth
        placeholder="Confirm new password"
        disabled={loading}
      />
    </>
  );

  const renderForceLogoutFields = () => (
    <>
      <Alert severity="warning">
        Force logging out {user?.name} will:
        <ul>
          <li>Terminate all active sessions</li>
          <li>Require re-authentication on next login</li>
          <li>Clear all device tokens</li>
        </ul>
      </Alert>
      <Stack sx={{ bgcolor: '#f0f0f0', p: 1.5, borderRadius: 1 }}>
        <p><strong>User:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
      </Stack>
    </>
  );

  // Map action type → render function
  const contentMap: Record<UserActionType, () => React.ReactNode> = {
    'add-user':            renderAddUserFields,
    'edit-user':           renderEditUserFields,
    'block-user':          renderBlockUserFields,
    'unblock-user':        renderUnblockUserFields,
    'change-user-role':    renderChangeRoleFields,
    'delete-user':         renderDeleteUserFields,
    'reset-user-password': renderResetPasswordFields,
    'force-logout-user':   renderForceLogoutFields,
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      actions={
        <Stack direction="row" spacing={1.5} sx={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{ textTransform: 'none' }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color={color ?? 'primary'}
            sx={{ textTransform: 'none' }}
            disabled={isConfirmDisabled}
            startIcon={loading ? <CircularProgress size={18} /> : undefined}
          >
            {loading ? loadingLabel : confirmLabel}
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2.5} sx={{ pt: 1 }}>
        {localError && <Alert severity="error">{localError}</Alert>}
        {contentMap[type]()}
      </Stack>
    </Modal>
  );
};

export default UserActionModal;