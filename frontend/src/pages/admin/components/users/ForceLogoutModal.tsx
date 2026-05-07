/**
 * ForceLogoutModal Component
 * Combines business logic and UI for force logging out a user
 */

import { Button, Stack, Alert, CircularProgress } from '@mui/material';
import Modal from '../../../../components/ui/Modal';
import { useForceLogout } from '../../hooks/useResetPassword';
import type { User } from '../../hooks/useFetchUsers';

interface ForceLogoutModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSessionTerminated?: () => void;
}

const ForceLogoutModal = ({ open, onClose, user, onSessionTerminated }: ForceLogoutModalProps) => {
  const { loading, error, forceLogout } = useForceLogout();

  const handleSubmit = async () => {
    if (!user) return;
    const success = await forceLogout(user._id, user.name);
    if (success) {
      onSessionTerminated?.();
      onClose();
    }
  };

  if (!user) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Force Logout"
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
            color="warning"
            sx={{ textTransform: 'none' }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : undefined}
          >
            {loading ? 'Logging out...' : 'Force Logout'}
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        <Alert severity="warning">
          ⚠️ Force logging out {user.name} will:
          <ul>
            <li>Terminate all active sessions</li>
            <li>Require re-authentication on next login</li>
            <li>Clear all device tokens</li>
          </ul>
        </Alert>

        <Stack sx={{ bgcolor: '#f0f0f0', p: 1.5, borderRadius: 1 }}>
          <p><strong>User:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </Stack>
      </Stack>
    </Modal>
  );
};

export default ForceLogoutModal;
