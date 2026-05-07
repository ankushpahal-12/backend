/**
 * DeleteUserModal Component
 * Combines business logic and UI for deleting a user
 */

import { useState } from 'react';
import { Button, Stack, Alert, CircularProgress, TextField } from '@mui/material';
import Modal from '../../../../components/ui/Modal';
import { useDeleteUser } from '../../hooks/useDeleteUser';
import type { User } from '../../hooks/useFetchUsers';

interface DeleteUserModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onUserDeleted?: () => void;
}

const DeleteUserModal = ({ open, onClose, user, onUserDeleted }: DeleteUserModalProps) => {
  const [confirmText, setConfirmText] = useState('');
  const { loading, error, deleteUser } = useDeleteUser();

  const handleSubmit = async () => {
    if (!user || confirmText !== 'DELETE') return;
    const success = await deleteUser(user._id, user.name);
    if (success) {
      onUserDeleted?.();
      onClose();
      setConfirmText('');
    }
  };

  if (!user) return null;

  const isConfirmed = confirmText === 'DELETE';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete User"
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
            disabled={loading || !isConfirmed}
            startIcon={loading ? <CircularProgress size={18} /> : undefined}
          >
            {loading ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        <Alert severity="warning">
          ⚠️ This action cannot be undone. All user data will be permanently deleted.
        </Alert>

        <Stack>
          <strong>User to Delete:</strong>
          <p>{user.name} ({user.email})</p>
        </Stack>

        <TextField
          label="Confirm by typing DELETE"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          fullWidth
          placeholder="Type DELETE to confirm"
          disabled={loading}
        />
      </Stack>
    </Modal>
  );
};

export default DeleteUserModal;
