/**
 * ChangeRoleModal Component
 * Combines business logic and UI for changing user role
 */

import { useState, useEffect } from 'react';
import { Button, Stack, Alert, CircularProgress, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import Modal from '../../../../components/ui/Modal';
import { useChangeRole } from '../../hooks/useChangeRole';
import type { User } from '../../hooks/useFetchUsers';

interface ChangeRoleModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onRoleChanged?: () => void;
}

const ChangeRoleModal = ({ open, onClose, user, onRoleChanged }: ChangeRoleModalProps) => {
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const { loading, error, updateRole } = useChangeRole();

  useEffect(() => {
    if (open && user) {
      setNewRole(user.role as 'user' | 'admin');
    }
  }, [open, user]);

  const handleSubmit = async () => {
    if (!user) return;
    const success = await updateRole(user._id, newRole, user.name);
    if (success) {
      onRoleChanged?.();
      onClose();
    }
  };

  if (!user) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change User Role"
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
            disabled={loading || newRole === user.role}
            startIcon={loading ? <CircularProgress size={18} /> : undefined}
          >
            {loading ? 'Updating...' : 'Update Role'}
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        <Alert severity="info">
          Current role: <strong>{user.role}</strong>
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
          Changing role to <strong>{newRole}</strong> will update {user.name}'s permissions immediately.
        </Alert>
      </Stack>
    </Modal>
  );
};

export default ChangeRoleModal;
