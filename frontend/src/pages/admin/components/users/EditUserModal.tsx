import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, FormControl, InputLabel, Select, Typography, Stack } from '@mui/material';
import type { UserRow } from './UserTable';

interface EditUserModalProps {
  open: boolean;
  user?: UserRow | null;
  onClose: () => void;
  onConfirm: (data: { name: string; email: string; role: string }) => void;
}

const EditUserModal = ({ open, user, onClose, onConfirm }: EditUserModalProps) => {
  const [formData, setFormData] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    role: user?.role ?? 'Student',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfirm = () => {
    onConfirm(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Update user information below.
          </Typography>
          
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter full name"
          />
          
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
          />
          
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              label="Role"
            >
              <MenuItem value="Student">Student</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Instructor">Instructor</MenuItem>
              <MenuItem value="Moderator">Moderator</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="primary" variant="contained" onClick={handleConfirm}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserModal;
