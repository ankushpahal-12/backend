import { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Stack, Tooltip } from '@mui/material';
import {
  MoreVert,
  Visibility,
  Edit,
  History,
  MenuBook,
  LockReset,
  PowerSettingsNew,
  Block,
  SwapHoriz,
  Delete,
} from '@mui/icons-material';

export interface UserActionHandlers {
  onView?: () => void;
  onEdit?: () => void;
  onViewLogs?: () => void;
  onViewTests?: () => void;
  onResetPassword?: () => void;
  onForceLogout?: () => void;
  onToggleBlock?: () => void;
  onChangeRole?: () => void;
  onDelete?: () => void;
}

const UserActions = ({
  onView,
  onEdit,
  onViewLogs,
  onViewTests,
  onResetPassword,
  onForceLogout,
  onToggleBlock,
  onChangeRole,
  onDelete,
}: UserActionHandlers) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
      <Tooltip title="View Profile">
        <IconButton size="small" onClick={() => onView?.()} sx={{ color: '#2563eb' }}>
          <Visibility fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Edit User">
        <IconButton size="small" onClick={() => onEdit?.()} sx={{ color: '#2563eb' }}>
          <Edit fontSize="small" />
        </IconButton>
      </Tooltip>

      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: '#64748b' }}>
        <MoreVert fontSize="small" />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onView?.();
          }}
        >
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Profile</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onEdit?.();
          }}
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onViewLogs?.();
          }}
        >
          <ListItemIcon>
            <History fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Logs</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onViewTests?.();
          }}
        >
          <ListItemIcon>
            <MenuBook fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Tests</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onResetPassword?.();
          }}
        >
          <ListItemIcon>
            <LockReset fontSize="small" />
          </ListItemIcon>
          <ListItemText>Reset Password</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onForceLogout?.();
          }}
        >
          <ListItemIcon>
            <PowerSettingsNew fontSize="small" />
          </ListItemIcon>
          <ListItemText>Force Logout</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onToggleBlock?.();
          }}
        >
          <ListItemIcon>
            <Block fontSize="small" />
          </ListItemIcon>
          <ListItemText>Block / Unblock</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onChangeRole?.();
          }}
        >
          <ListItemIcon>
            <SwapHoriz fontSize="small" />
          </ListItemIcon>
          <ListItemText>Change Role</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onDelete?.();
          }}
        >
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete User</ListItemText>
        </MenuItem>
      </Menu>
    </Stack>
  );
};

export default UserActions;
