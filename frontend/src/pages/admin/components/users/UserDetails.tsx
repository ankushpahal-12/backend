import { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Stack,
  Avatar,
  Divider,
  Chip,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Button,
} from '@mui/material';
import {
  Close,
  EditOutlined,
  KeyOutlined,
  LogoutOutlined,
  BlockOutlined,
  PersonOutline,
  DeleteOutline,
  LocationOnOutlined,
  ShieldOutlined,
} from '@mui/icons-material';
import type { UserRow } from './UserTable';

interface UserDetailsProps {
  open: boolean;
  user?: UserRow | null;
  onClose: () => void;
  onEdit?: (user: UserRow) => void;
  onResetPassword?: (user: UserRow) => void;
  onForceLogout?: (user: UserRow) => void;
  onToggleBlock?: (user: UserRow) => void;
  onChangeRole?: (user: UserRow) => void;
  onDelete?: (user: UserRow) => void;
  onViewLogs?: (user: UserRow) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 0 }}>{children}</Box>}
    </div>
  );
}

const ActionButton = ({
  icon,
  label,
  color = 'primary',
  onClick,
  fullWidth = false,
}: {
  icon: React.ReactNode;
  label: string;
  color?: 'primary' | 'error' | 'success';
  onClick: () => void;
  fullWidth?: boolean;
}) => {
  const bgColors: Record<string, Record<string, string>> = {
    primary: { bg: '#ffffff', hover: '#f8fafc', text: '#334155', border: '#dbe4ee' },
    error: { bg: '#fff5f5', hover: '#fee2e2', text: '#dc2626', border: '#fecaca' },
    success: { bg: '#f0fdf4', hover: '#dcfce7', text: '#16a34a', border: '#bbf7d0' },
  };

  const colors = bgColors[color];

  return (
    <Paper
      onClick={onClick}
      sx={{
        p: 1.5,
        cursor: 'pointer',
        bgcolor: colors.bg,
        border: '1px solid',
        borderColor: colors.border,
        borderRadius: 2,
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: colors.hover,
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 20px rgba(15, 23, 42, 0.08)',
        },
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center" justifyContent={fullWidth ? 'flex-start' : 'center'}>
        <Box sx={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 1.5, bgcolor: '#fff', color: colors.text }}>
          {icon}
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 700, color: colors.text }}>
          {label}
        </Typography>
      </Stack>
    </Paper>
  );
};

const infoRow = (label: string, value: React.ReactNode, rightSide?: React.ReactNode) => (
  <Box>
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
      <Typography variant="body2" sx={{ color: '#64748b', fontSize: 13 }}>
        {label}
      </Typography>
      {rightSide ?? (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', textAlign: 'right' }}>
          {value}
        </Typography>
      )}
    </Stack>
  </Box>
);

const UserDetails = ({ open, user, onClose, onEdit, onResetPassword, onForceLogout, onToggleBlock, onChangeRole, onDelete, onViewLogs }: UserDetailsProps) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    if (status === 'Active') return 'success';
    if (status === 'Blocked') return 'error';
    return 'default';
  };

  const userId = user?.userId ?? '#USR-1248';
  const phone = user?.phone ?? '+91 98765 43210';
  const lastLoginIp = user?.lastLoginIp ?? '103.21.244.12';
  const location = user?.lastLoginLocation ?? 'Bangalore, India';
  const device = user?.device ?? 'Windows 11 • Chrome 124.0';
  const twoFactorEnabled = user?.twoFactorEnabled ?? true;
  const failedLoginAttempts = user?.failedLoginAttempts ?? 2;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 420, md: 430 },
          bgcolor: '#f8fafc',
          borderLeft: '1px solid #e2e8f0',
        },
      }}
    >
      <Box sx={{ height: '100%', overflow: 'auto' }}>
        {user ? (
          <>
            <Box sx={{ px: 2.5, pt: 2.5, pb: 2, bgcolor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>User Details</Typography>
                <IconButton onClick={onClose} size="small" sx={{ color: '#64748b' }}>
                  <Close fontSize="small" />
                </IconButton>
              </Stack>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ width: 64, height: 64, bgcolor: user.avatarColor ?? '#c7d2fe', fontSize: 26, fontWeight: 800 }}>
                  {user.name.charAt(0)}
                </Avatar>
                <Box flex={1}>
                  <Typography sx={{ fontWeight: 800, fontSize: 20, lineHeight: 1.15 }}>{user.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: 13 }}>
                    {user.email}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip label={user.status} size="small" color={getStatusColor(user.status)} sx={{ height: 24, fontWeight: 700 }} />
                    <Chip label={user.role} size="small" sx={{ height: 24, fontWeight: 700, bgcolor: '#dbeafe', color: '#2563eb' }} />
                  </Stack>
                </Box>
              </Stack>
            </Box>

            <Box sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="user details tabs"
                sx={{
                  px: 2,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: 12,
                    color: '#64748b',
                    minHeight: 44,
                    '&.Mui-selected': {
                      color: '#2563eb',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#2563eb',
                  },
                }}
              >
                <Tab label="Overview" id="user-tab-0" aria-controls="user-tabpanel-0" />
                <Tab label="Activity Logs" id="user-tab-1" aria-controls="user-tabpanel-1" />
                <Tab label="Test History" id="user-tab-2" aria-controls="user-tabpanel-2" />
                <Tab label="Security" id="user-tab-3" aria-controls="user-tabpanel-3" />
              </Tabs>
            </Box>

            <Box sx={{ p: 2.5 }}>
              <TabPanel value={tabValue} index={0}>
                <Stack spacing={2.2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Basic Information</Typography>
                    <Button size="small" variant="outlined" startIcon={<EditOutlined fontSize="small" />} onClick={() => onEdit?.(user)} sx={{ textTransform: 'none', borderRadius: 2 }}>
                      Edit
                    </Button>
                  </Stack>
                  {infoRow('User ID', userId)}
                  <Divider />
                  {infoRow('Phone', phone)}
                  <Divider />
                  {infoRow('Joined On', user.joinedOn)}
                  <Divider />
                  {infoRow('Last Active', user.lastActive)}
                  <Divider />
                  {infoRow('Role', user.role)}
                  <Divider />
                  {infoRow('Status', <Chip label={user.status} size="small" color={getStatusColor(user.status)} sx={{ height: 22, fontWeight: 700 }} />)}
                </Stack>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Stack spacing={2.2}>
                  <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Security & Activity</Typography>
                  {infoRow('Failed Login Attempts', failedLoginAttempts)}
                  <Divider />
                  {infoRow('Last Login IP', lastLoginIp)}
                  <Divider />
                  {infoRow('Last Login Location', location, <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="flex-end"><LocationOnOutlined sx={{ fontSize: 16, color: '#f59e0b' }} /><Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>{location}</Typography></Stack>)}
                  <Divider />
                  {infoRow('Device', device)}
                </Stack>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Stack spacing={2.2}>
                  <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Test History</Typography>
                  {infoRow('Total Tests Taken', 24)}
                  <Divider />
                  {infoRow('Average Score', '82.5%')}
                  <Divider />
                  {infoRow('Last Test', '12 Apr 2024')}
                </Stack>
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                <Stack spacing={2.2}>
                  <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Security</Typography>
                  {infoRow('Two-Factor Authentication', <Chip label={twoFactorEnabled ? 'Enabled' : 'Disabled'} size="small" color={twoFactorEnabled ? 'success' : 'default'} sx={{ height: 22, fontWeight: 700 }} />)}
                  <Divider />
                  {infoRow('Last Password Change', '12 Apr 2024')}
                  <Divider />
                  {infoRow('Active Sessions', '3 devices')}
                </Stack>
              </TabPanel>
            </Box>

            <Box sx={{ p: 2.5, bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
              <Typography sx={{ mb: 1.5, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Quick Actions</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
                <ActionButton
                  icon={<EditOutlined fontSize="small" />}
                  label="Edit User"
                  onClick={() => onEdit?.(user)}
                />
                <ActionButton
                  icon={<KeyOutlined fontSize="small" />}
                  label="Reset Password"
                  onClick={() => onResetPassword?.(user)}
                />
                <ActionButton
                  icon={<LogoutOutlined fontSize="small" />}
                  label="Force Logout"
                  onClick={() => onForceLogout?.(user)}
                />
                <ActionButton
                  icon={<PersonOutline fontSize="small" />}
                  label="Change Role"
                  onClick={() => onChangeRole?.(user)}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
                {user.status === 'Blocked' ? (
                  <ActionButton
                    icon={<ShieldOutlined fontSize="small" />}
                    label="Unblock User"
                    color="success"
                    onClick={() => onToggleBlock?.(user)}
                  />
                ) : (
                  <ActionButton
                    icon={<BlockOutlined fontSize="small" />}
                    label="Block User"
                    color="error"
                    onClick={() => onToggleBlock?.(user)}
                  />
                )}
                <ActionButton
                  icon={<DeleteOutline fontSize="small" />}
                  label="Delete User"
                  color="error"
                  onClick={() => onDelete?.(user)}
                />
              </Box>

              <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={() => onDelete?.(user)}
                startIcon={<DeleteOutline fontSize="small" />}
                sx={{ textTransform: 'none', borderRadius: 2, mt: 0.5 }}
              >
                Delete User
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ p: 3 }}>
            <Typography>No user selected</Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default UserDetails;
