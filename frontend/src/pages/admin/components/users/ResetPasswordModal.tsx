/**
 * ResetPasswordModal Component
 * Combines business logic and UI for resetting user password
 */

import { useEffect } from 'react';
import { Button, Stack, Alert, CircularProgress, TextField } from '@mui/material';
import Modal from '../../../../components/ui/Modal';
import { useResetPassword } from '../../hooks/useResetPassword';
import type { User } from '../../hooks/useFetchUsers';

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onPasswordReset?: () => void;
}

const ResetPasswordModal = ({ open, onClose, user, onPasswordReset }: ResetPasswordModalProps) => {
  const {
    formData,
    loading,
    errors,
    firstError,
    setFormField,
    resetPassword,
    resetForm,
  } = useResetPassword();

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  const handleSubmit = async () => {
    if (!user) return;
    const success = await resetPassword(user._id, user.name);
    if (success) {
      onPasswordReset?.();
      onClose();
    }
  };

  if (!user) return null;

  const getFieldError = (field: string): string | undefined => {
    return errors.find(e => e.field === field)?.message;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reset Password"
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
            sx={{ textTransform: 'none' }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : undefined}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        {firstError && <Alert severity="error">{firstError}</Alert>}

        <Alert severity="info">
          Resetting password for <strong>{user.name}</strong> ({user.email})
        </Alert>

        <TextField
          label="New Password"
          type="password"
          value={formData.newPassword}
          onChange={(e) => setFormField('newPassword', e.target.value)}
          fullWidth
          placeholder="Enter new password"
          error={!!getFieldError('newPassword')}
          helperText={getFieldError('newPassword') || 'Minimum 8 characters'}
          disabled={loading}
        />

        <TextField
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormField('confirmPassword', e.target.value)}
          fullWidth
          placeholder="Confirm new password"
          error={!!getFieldError('confirmPassword')}
          helperText={getFieldError('confirmPassword')}
          disabled={loading}
        />
      </Stack>
    </Modal>
  );
};

export default ResetPasswordModal;
