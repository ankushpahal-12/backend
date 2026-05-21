import {
    Box,
    Typography,
    Grid,
    Paper,
    Stack,
    TextField,
    Button,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    alpha,
    useTheme,
    LinearProgress,
    Tooltip,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider
} from '@mui/material';
import {
    Search,
    Refresh,
    Edit,
    Delete,
    FilterList,
    AdminPanelSettings,
    Person,
    Visibility,
    History,
    LocationOn,
    Devices,
    Fingerprint,
    AccessTime,
    InfoOutlined,
    Verified,
    Lock as LockIcon
} from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { useLoading } from '../../context/hooks/useLoading';
import { useNotification } from '../../context/NotificationContext';
import * as dataService from '../../services/dataService';

const AdminSettings: React.FC = () => {
    const theme = useTheme();
    const { startLoading, stopLoading, isLoading } = useLoading();
    const [searchTerm, setSearchTerm] = useState('');

    interface AdminUser {
        _id: string;
        name: string;
        email: string;
        role: string;
        isVerified: boolean;
        emailVerifiedBy?: 'user' | 'admin' | null;
        emailVerifiedAt?: string | null;
        createdAt: string;
        trustedDevices?: Array<{ userAgent: string; ip: string; lastLogin: string }>;
        activeSessions?: Array<{ sessionId: string; expiresAt: string }>;
        [key: string]: unknown;
    }

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // User Profile Modal State
    const [openProfile, setOpenProfile] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [newPassword, setNewPassword] = useState('');

    // Deletion Modal State
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

    const { showNotification } = useNotification();

    const handleTerminateSession = async (sessionId: string) => {
        if (!selectedUser) return;

        try {
            await dataService.terminateUserSession(selectedUser._id, sessionId);
            showNotification('Session terminated successfully', 'success');
            // Refresh local state
            if (selectedUser) {
                setSelectedUser({
                    ...selectedUser,
                    activeSessions: selectedUser.activeSessions?.filter((s) => s.sessionId !== sessionId)
                });
            }
        } catch (error) {
            showNotification('Failed to terminate session', 'error');
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassword || !selectedUser) return;

        startLoading('sync', 'Updating user password...');
        try {
            await dataService.updateUserPassword(selectedUser._id, { password: newPassword });
            showNotification('User password updated successfully', 'success');
            setNewPassword('');
        } catch (error) {
            showNotification('Failed to update user password', 'error');
        } finally {
            stopLoading();
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        startLoading('sync', 'Purging user and associated data...');
        try {
            await dataService.deleteUser(userToDelete._id);
            showNotification('User and all associated data purged successfully', 'success');
            setOpenDeleteConfirm(false);
            setUserToDelete(null);
            handleRefresh(); // Refresh table
        } catch (error) {
            showNotification('Failed to delete user', 'error');
        } finally {
            stopLoading();
        }
    };

    const handleViewProfile = async (id: string) => {
        startLoading('sync', 'Retriving secure user profile...');
        try {
            const response = await dataService.getUserDetails(id);
            setSelectedUser(response.data.user);
            setOpenProfile(true);
        } catch (error) {
            console.error('Failed to fetch user profile', error);
        } finally {
            stopLoading();
        }
    };

    const handleRefresh = async (page: number = 1) => {
        startLoading('sync', 'Fetching latest system data...');
        try {
            // NEW: getAllUsers now returns paginated response with metadata
            const response = await dataService.getAllUsers(page, pageSize);
            
            // Handle new pagination response format
            if (response.meta) {
                // New format: { meta: { total, page, totalPages, hasNextPage }, data: [...] }
                setUsers(response.data);
                setTotalUsers(response.meta.total);
                setTotalPages(response.meta.totalPages);
                setCurrentPage(response.meta.page);
            } else if (response.data?.users) {
                // Fallback for old format: { data: { users: [...] } }
                setUsers(response.data.users);
                setTotalUsers(response.data.users.length);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
            showNotification('Failed to fetch users', 'error');
        } finally {
            stopLoading();
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        handleRefresh(currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <MainLayout>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                    System Management
                </Typography>
                <Typography color="text.secondary">
                    Monitor system health and manage user accounts with real-time updates.
                </Typography>
            </Box>

            <Stack spacing={4}>
                {/* Search and Filters */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2
                    }}
                >
                    <TextField
                        size="small"
                        placeholder="Search by email ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ width: { xs: '100%', sm: 350 } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2 }
                        }}
                    />
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            startIcon={<FilterList />}
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                        >
                            Filters
                        </Button>
                        <IconButton
                            onClick={handleRefresh}
                            sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), color: 'primary.main' }}
                        >
                            <Refresh fontSize="small" sx={{ animation: isLoading ? 'spin 1.5s linear infinite' : 'none' }} />
                        </IconButton>
                    </Stack>
                </Paper>

                {/* User Table */}
                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.1),
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {isLoading && (
                        <LinearProgress
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 3,
                                zIndex: 1
                            }}
                        />
                    )}
                    <Table sx={{ minWidth: 700 }}>
                        <TableHead sx={{ bgcolor: alpha(theme.palette.divider, 0.02) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Joined Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontSize: '0.875rem' }}>
                                                {user.name.charAt(0)}
                                            </Avatar>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.name}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                                            {user?.isVerified && (
                                                <Tooltip title="Verified Email">
                                                    <Verified sx={{ fontSize: 16, color: 'success.main' }} />
                                                </Tooltip>
                                            )}
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={user.role === 'admin' ? <AdminPanelSettings fontSize="small" /> : <Person fontSize="small" />}
                                            label={user.role}
                                            size="small"
                                            variant="outlined"
                                            color={user.role === 'admin' ? 'primary' : 'default'}
                                            sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={
                                                user.isVerified
                                                    ? user.emailVerifiedBy === 'admin'
                                                        ? 'Verified by Admin'
                                                        : 'Verified by User'
                                                    : 'Pending'
                                            }
                                            size="small"
                                            sx={{
                                                fontWeight: 700,
                                                bgcolor: alpha(
                                                    user.isVerified
                                                        ? user.emailVerifiedBy === 'admin'
                                                            ? '#3b82f6'
                                                            : '#10b981'
                                                        : '#f59e0b',
                                                    0.1
                                                ),
                                                color: user.isVerified
                                                    ? user.emailVerifiedBy === 'admin'
                                                        ? '#2563eb'
                                                        : '#10916c'
                                                    : '#b45309',
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">{new Date(user.createdAt).toLocaleDateString()}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="View Profile">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleViewProfile(user._id)}
                                                >
                                                    <Visibility fontSize="inherit" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit User">
                                                <IconButton size="small"><Edit fontSize="inherit" /></IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete User">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => {
                                                        setUserToDelete(user);
                                                        setOpenDeleteConfirm(true);
                                                    }}
                                                >
                                                    <Delete fontSize="inherit" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                border: '1px solid',
                                borderColor: alpha(theme.palette.divider, 0.1),
                                bgcolor: alpha(theme.palette.primary.main, 0.02)
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>System Notifications</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Configure global alerts for all system events.</Typography>
                            <Button variant="contained" sx={{ borderRadius: 2 }}>Configure Alerts</Button>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                border: '1px solid',
                                borderColor: alpha(theme.palette.divider, 0.1)
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>API Access</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Manage your high-security system API credentials.</Typography>
                            <Button variant="outlined" sx={{ borderRadius: 2 }}>Manage API Keys</Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Stack>

            {/* User Investigation Modal */}
            <Dialog
                open={openProfile}
                onClose={() => setOpenProfile(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 4, bgcolor: 'background.paper' }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                            {selectedUser?.name?.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>{selectedUser?.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{selectedUser?.email}</Typography>
                        </Box>
                        <Box sx={{ flexGrow: 1 }} />
                        <Chip
                            label={selectedUser?.role}
                            color="primary"
                            variant="outlined"
                            size="small"
                            sx={{ textTransform: 'capitalize', fontWeight: 700 }}
                        />
                    </Stack>
                </DialogTitle>
                <Divider />
                <DialogContent>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <InfoOutlined fontSize="small" /> Account Overview
                            </Typography>
                            <List sx={{ bgcolor: alpha(theme.palette.divider, 0.03), borderRadius: 3 }}>
                                <ListItem>
                                    <ListItemIcon><AccessTime fontSize="small" /></ListItemIcon>
                                    <ListItemText
                                        primary="Registration Date"
                                        secondary={selectedUser?.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><Verified fontSize="small" /></ListItemIcon>
                                    <ListItemText
                                        primary="Verification Status"
                                        secondary={
                                            selectedUser?.isVerified
                                                ? `Verified by ${selectedUser.emailVerifiedBy === 'admin' ? 'Admin' : 'User'}${selectedUser.emailVerifiedAt ? ` on ${new Date(selectedUser.emailVerifiedAt).toLocaleString()}` : ''}`
                                                : 'Pending Verification'
                                        }
                                    />
                                    {selectedUser?.isVerified && (
                                        <Chip
                                            label={selectedUser.emailVerifiedBy === 'admin' ? 'Admin' : 'User'}
                                            size="small"
                                            sx={{
                                                fontWeight: 700,
                                                bgcolor: alpha(
                                                    selectedUser.emailVerifiedBy === 'admin' ? '#3b82f6' : '#10b981',
                                                    0.1
                                                ),
                                                color: selectedUser.emailVerifiedBy === 'admin' ? '#2563eb' : '#10916c',
                                            }}
                                        />
                                    )}
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><Fingerprint fontSize="small" /></ListItemIcon>
                                    <ListItemText
                                        primary="User ID"
                                        secondary={selectedUser?._id}
                                    />
                                </ListItem>
                            </List>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Devices fontSize="small" /> Recent Login Activity
                            </Typography>
                            <Box sx={{ maxHeight: 250, overflow: 'auto' }}>
                                {selectedUser?.trustedDevices && selectedUser.trustedDevices.length > 0 ? (
                                    selectedUser.trustedDevices.map((device, idx: number) => (
                                        <Paper key={idx} variant="outlined" sx={{ p: 1.5, mb: 1, borderRadius: 2 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>{device.userAgent}</Typography>
                                            <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    <LocationOn sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} /> {device.ip}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(device.lastLogin).toLocaleDateString()}
                                                </Typography>
                                            </Stack>
                                        </Paper>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', p: 2 }}>No activity logs found.</Typography>
                                )}
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, mt: 1, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LockIcon fontSize="small" /> Administrative Actions
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.error.main, 0.02), borderColor: alpha(theme.palette.error.main, 0.1) }}>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Reset User Password</Typography>
                                        <Stack direction="row" spacing={2}>
                                            <TextField
                                                size="small"
                                                type="password"
                                                placeholder="Enter new password..."
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                sx={{ flexGrow: 1 }}
                                            />
                                            <Button
                                                variant="contained"
                                                color="error"
                                                size="small"
                                                onClick={handleUpdatePassword}
                                                disabled={!newPassword}
                                                sx={{ borderRadius: 1.5, textTransform: 'none' }}
                                            >
                                                Update Password
                                            </Button>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, mt: 1, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <History fontSize="small" /> Active Sessions
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                {selectedUser?.activeSessions?.map((session, idx: number) => (
                                    <Chip
                                        key={idx}
                                        label={`Session ${session.sessionId.substring(0, 8)}... (Expires: ${new Date(session.expiresAt).toLocaleDateString()})`}
                                        variant="outlined"
                                        size="small"
                                        onDelete={() => handleTerminateSession(session.sessionId)}
                                        sx={{ borderRadius: 2 }}
                                    />
                                )) || <Typography variant="caption" color="text.secondary">No active sessions.</Typography>}
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenProfile(false)} variant="outlined" sx={{ borderRadius: 2 }}>Close</Button>
                    <Button variant="contained" sx={{ borderRadius: 2 }} color="error">Suspend Account</Button>
                </DialogActions>
            </Dialog>

            {/* Deletion Confirmation Dialog */}
            <Dialog
                open={openDeleteConfirm}
                onClose={() => setOpenDeleteConfirm(false)}
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>
                    Purge User Account?
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        This action is <strong>irreversible</strong>. This will permanently delete <strong>{userToDelete?.name}</strong> ({userToDelete?.email}) and purge all their associated transactions, budgets, and chat history.
                    </Typography>
                    <Typography variant="caption" sx={{ bgcolor: alpha(theme.palette.error.main, 0.05), p: 1, borderRadius: 1, display: 'block', color: 'error.main', fontWeight: 600 }}>
                        <InfoOutlined sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                        Security Protocol: Administrative purge bypasses standard retention policies.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setOpenDeleteConfirm(false)} variant="text" sx={{ borderRadius: 2, textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteUser}
                        variant="contained"
                        color="error"
                        sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                    >
                        Confirm Purge
                    </Button>
                </DialogActions>
            </Dialog>

            <style>
                {`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}
            </style>
        </MainLayout>
    );
};

export default AdminSettings;
