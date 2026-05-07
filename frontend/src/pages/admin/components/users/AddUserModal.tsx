/**
 * AddUserModal Component
 * Combines business logic and UI for adding a new user
 */

import { useEffect } from 'react';
import { Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Alert, CircularProgress } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import Modal from '../../../../components/ui/Modal';
import { useAddUser } from '../../hooks/useAddUser';

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onUserCreated?: (email: string) => void;
}

const AddUserModal = ({ open, onClose, onUserCreated }: AddUserModalProps) => {
  const {
    formData,
    loading,
    errors,
    firstError,
    setFormField,
    submitForm,
    resetForm,
  } = useAddUser();

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  const handleSubmit = async () => {
    const success = await submitForm();
    if (success) {
      onUserCreated?.(formData.email);
      onClose();
    }
  };

  const getFieldError = (field: string): string | undefined => {
    return errors.find(e => e.field === field)?.message;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormField(name as 'name' | 'email', value);
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormField(name as 'role', value);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create New User"
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
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2.5} sx={{ pt: 1 }}>
        {firstError && <Alert severity="error">{firstError}</Alert>}

        <TextField
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleTextChange}
          fullWidth
          placeholder="Enter user's full name"
          error={!!getFieldError('name')}
          helperText={getFieldError('name')}
          disabled={loading}
        />

        <TextField
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleTextChange}
          fullWidth
          placeholder="Enter user's email"
          error={!!getFieldError('email')}
          helperText={getFieldError('email')}
          disabled={loading}
        />

        <FormControl fullWidth disabled={loading}>
          <InputLabel>Role</InputLabel>
          <Select
            name="role"
            value={formData.role}
            label="Role"
            onChange={handleSelectChange}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>

        <Alert severity="info">
          Verification OTP will be sent to the user's email. They will need to verify it and set their own password.
        </Alert>
      </Stack>
    </Modal>
  );
};

export default AddUserModal;