/**
 * BanUserModal Component
 * Combines business logic and UI for blocking a user
 */

import { useState } from 'react';
import { Button, Stack, Alert, CircularProgress, TextField } from '@mui/material';
import Modal from '../../../../components/ui/Modal';
import { useBanUser } from '../../hooks/useBanUser';
import type { User } from '../../hooks/useFetchUsers';

interface BanUserModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onUserBlocked?: () => void;
}

const BanUserModal = ({ open, onClose, user, onUserBlocked }: BanUserModalProps) => {
  const [reason, setReason] = useState('');
  const { loading, error, blockUser } = useBanUser();

  const handleSubmit = async () => {
    if (!user) return;
    const success = await blockUser(user._id, reason, user.name);
    if (success) {
      onUserBlocked?.();
      onClose();
      setReason('');
    }
  };

  if (!user) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Block User"
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
            color="error"
            sx={{ textTransform: 'none' }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : undefined}
          >
            {loading ? 'Blocking...' : 'Block User'}
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        <Alert severity="warning">
          ⚠️ Blocking {user.name} will:
          <ul>
            <li>Prevent login</li>
            <li>Terminate all active sessions</li>
            <li>Hide their profile</li>
          </ul>
        </Alert>

        <TextField
          label="Reason for Blocking"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          fullWidth
          multiline
          rows={3}
          placeholder="Enter the reason for blocking this user..."
          disabled={loading}
        />
      </Stack>
    </Modal>
  );
};

export default BanUserModal;
