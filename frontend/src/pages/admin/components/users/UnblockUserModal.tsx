/**
 * UnblockUserModal Component
 * Combines business logic and UI for unblocking a user
 */

import { Button, Stack, Alert, CircularProgress } from '@mui/material';
import Modal from '../../../../components/ui/Modal';
import { useUnblockUser } from '../../hooks/useBanUser';
import type { User } from '../../hooks/useFetchUsers';

interface UnblockUserModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onUserUnblocked?: () => void;
}

const UnblockUserModal = ({ open, onClose, user, onUserUnblocked }: UnblockUserModalProps) => {
  const { loading, error, unblockUser } = useUnblockUser();

  const handleSubmit = async () => {
    if (!user) return;
    const success = await unblockUser(user._id, user.name);
    if (success) {
      onUserUnblocked?.();
      onClose();
    }
  };

  if (!user) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Unblock User"
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
            {loading ? 'Unblocking...' : 'Unblock User'}
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        {user.blockedAt && (
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
          User {user.name} will be able to login again after unblocking.
        </Alert>
      </Stack>
    </Modal>
  );
};

export default UnblockUserModal;
