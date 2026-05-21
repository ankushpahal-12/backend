
import { useCallback, useMemo, useState, useEffect } from 'react';
import {
	Box,
	Paper,
	Stack,
	Typography,
	TextField,
	Button,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Avatar,
	TableContainer,
	IconButton,
	Divider,
	TablePagination,
} from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import Sidebar from '../../../components/layouts/SideBar';


import UserActionModal, { type UserActionType } from '../components/users/UserActionModal';

import EmailVerificationModal from '../components/users/EmailVerificationModal';
import UserDetails from '../components/users/UserDetails';
import UserTable from '../components/users/UserTable';
import { useUserManagement, type User } from '../hooks/useUserManagement';
import {
	Add,
	Search,
	BlockOutlined,
	CheckCircleOutline,
	NotificationsNone,
	KeyboardArrowDown,
	PersonOffOutlined,
	Groups2Outlined,
	FilterAltOutlined,
	Download,
} from '@mui/icons-material';

const UsersPage = () => {
	const sidebarWidth = 248;

	// ============================================================
	// CONSOLIDATED HOOK - All user operations in one hook
	// ============================================================
	const {
		users,
		fetchUsers,
		refreshUsers,
		searchUsers,
	} = useUserManagement();

	// State for UI
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
	const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	// Modal states — single unified modal
	const [modalOpen, setModalOpen] = useState(false);
	const [modalType, setModalType] = useState<UserActionType>('add-user');
	const [emailVerificationOpen, setEmailVerificationOpen] = useState(false);
	const [userDetailsOpen, setUserDetailsOpen] = useState(false);
	const [newUserEmail, setNewUserEmail] = useState<string>('');

	// Helper to open the unified modal
	const openModal = useCallback((type: UserActionType, user?: User) => {
		if (user) setSelectedUser(user);
		setModalType(type);
		setModalOpen(true);
	}, []);

	// ============================================================
	// LOAD USERS ON MOUNT
	// ============================================================
	useEffect(() => {
		console.log('UsersPage mounted - loading users');
		const loadUsers = async () => {
			try {
				await fetchUsers(0, 10);
			} catch (err) {
				console.error('Failed to load users:', err);
			}
		};
		loadUsers();
	}, [fetchUsers]);

	// Filter and search users
	const filteredUsers = useMemo(() => {
		let result = users;

		// Apply search
		if (searchTerm.trim()) {
			result = searchUsers(searchTerm);
		}

		// Apply role filter
		if (roleFilter !== 'all') {
			result = result.filter(user => user.role === roleFilter);
		}

		// Apply status filter
		if (statusFilter === 'blocked') {
			result = result.filter(user => user.isBlocked);
		} else if (statusFilter === 'active') {
			result = result.filter(user => !user.isBlocked);
		}

		return result;
	}, [users, searchTerm, roleFilter, statusFilter, searchUsers]);

	// Calculate stats
	const stats = useMemo(() => ({
		total: users.length,
		active: users.filter(u => !u.isBlocked).length,
		blocked: users.filter(u => u.isBlocked).length,
		admins: users.filter(u => u.role === 'admin').length,
	}), [users]);

	// Calculate paginated users
	const paginatedUsers = useMemo(() => {
		const startIndex = page * rowsPerPage;
		const endIndex = startIndex + rowsPerPage;
		return filteredUsers.slice(startIndex, endIndex);
	}, [filteredUsers, page, rowsPerPage]);

	// Transform User to UserRow format for table display
	const tableUsers = useMemo(() => {
		return paginatedUsers.map(user => ({
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			status: user.isBlocked ? ('Blocked' as const) : ('Active' as const),
			joinedOn: new Date(user.createdAt).toLocaleDateString(),
			lastActive: new Date(user.updatedAt).toLocaleDateString(),
			avatarColor: user.role === 'admin' ? '#2563eb' : '#6366f1',
			userId: user._id,
			phone: '',
			lastLoginIp: '',
			lastLoginLocation: '',
			twoFactorEnabled: false,
			device: '',
			failedLoginAttempts: 0,
		}));
	}, [paginatedUsers]);

	// Modal handlers
	const handleModalSuccess = useCallback((data?: Record<string, string>) => {
		if (modalType === 'add-user' && data?.email) {
			setNewUserEmail(data.email);
			setEmailVerificationOpen(true);
		}
		refreshUsers();
	}, [modalType, refreshUsers]);

	const handleDelete = useCallback((user: User) => openModal('delete-user', user), [openModal]);
	const handleResetPassword = useCallback((user: User) => openModal('reset-user-password', user), [openModal]);
	const handleForceLogout = useCallback((user: User) => openModal('force-logout-user', user), [openModal]);
	const handleChangeRole = useCallback((user: User) => openModal('change-user-role', user), [openModal]);

	const handleToggleBlock = useCallback((user: User) => {
		openModal(user.isBlocked ? 'unblock-user' : 'block-user', user);
	}, [openModal]);

	const handleView = useCallback((user: User) => {
		setSelectedUser(user);
		setUserDetailsOpen(true);
	}, []);

	const handleEdit = useCallback((user: User) => openModal('edit-user', user), [openModal]);

	const handleViewLogs = useCallback((user: User) => {
		console.log('View logs for user:', user);
	}, []);

	const handleViewTests = useCallback((user: User) => {
		console.log('View tests for user:', user);
	}, []);

	const handleRefresh = useCallback(() => {
		refreshUsers();
		setPage(0);
	}, [refreshUsers]);



	return (
		<Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fb' }}>
			<Sidebar open onClose={() => undefined} width={sidebarWidth} />

			<Box sx={{ ml: { xs: 0, lg: `${sidebarWidth}px` }, px: { xs: 2, md: 3 }, py: { xs: 2, md: 2.5 } }}>
				<Stack spacing={2.5}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
						<Stack spacing={0.5}>
							<Typography sx={{ fontWeight: 800, fontSize: 28, lineHeight: 1.1 }}>Users</Typography>
							<Typography variant="body2" color="text.secondary">Dashboard &nbsp;›&nbsp; Users</Typography>
						</Stack>

						<Stack direction="row" spacing={1.25} alignItems="center" sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
							<Paper sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, minWidth: { xs: '100%', sm: 340 }, borderRadius: 2, border: '1px solid #dbe4ee', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)' }}>
								<Search sx={{ color: '#94a3b8', fontSize: 20 }} />
								<TextField
									variant="standard"
									placeholder="Search anything..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									InputProps={{ disableUnderline: true }}
									sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: 14, py: 0 } }}
								/>
							</Paper>
							<IconButton sx={{ bgcolor: '#ffffff', border: '1px solid #dbe4ee', width: 42, height: 42 }}>
								<NotificationsNone sx={{ fontSize: 20, color: '#0f172a' }} />
							</IconButton>
							<Paper sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.25, py: 0.75, borderRadius: 999, border: '1px solid #dbe4ee' }}>
								<Avatar sx={{ width: 34, height: 34, bgcolor: '#2563eb', fontSize: 14, fontWeight: 800 }}>AU</Avatar>
								<Box>
									<Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1 }}>Admin User</Typography>
									<Typography sx={{ fontSize: 11, color: '#64748b' }}>Super Admin</Typography>
								</Box>
								<KeyboardArrowDown sx={{ color: '#64748b' }} />
							</Paper>
						</Stack>
					</Box>

				<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
					<motion.div whileHover={{ y: -6, scale: 1.01 }} whileTap={{ scale: 0.99 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
						<Paper sx={{ p: 2.25, borderRadius: 0, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)', transition: 'box-shadow 180ms ease' }}>
							<Stack direction="row" spacing={1.5} alignItems="center">
								<Box sx={{ width: 52, height: 52, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: '#e0ecff', color: '#2563eb' }}>
									<Groups2Outlined />
								</Box>
								<Box>
									<Typography sx={{ fontSize: 13, color: '#64748b' }}>Total Users</Typography>
									<Typography sx={{ fontSize: 24, fontWeight: 800, lineHeight: 1.1 }}>{stats.total.toLocaleString()}</Typography>
									<Typography sx={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>↑ 12.5% this month</Typography>
								</Box>
							</Stack>
						</Paper>
					</motion.div>

					<motion.div whileHover={{ y: -6, scale: 1.01 }} whileTap={{ scale: 0.99 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
						<Paper sx={{ p: 2.25, borderRadius: 0, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)' }}>
							<Stack direction="row" spacing={1.5} alignItems="center">
								<Box sx={{ width: 52, height: 52, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: '#e9f9ee', color: '#16a34a' }}>
									<CheckCircleOutline />
								</Box>
								<Box>
									<Typography sx={{ fontSize: 13, color: '#64748b' }}>Active Users</Typography>
									<Typography sx={{ fontSize: 24, fontWeight: 800, lineHeight: 1.1 }}>{stats.active.toLocaleString()}</Typography>
									<Typography sx={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>↑ 8.3% this month</Typography>
								</Box>
							</Stack>
						</Paper>
					</motion.div>

					<motion.div whileHover={{ y: -6, scale: 1.01 }} whileTap={{ scale: 0.99 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
						<Paper sx={{ p: 2.25, borderRadius: 0, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)' }}>
							<Stack direction="row" spacing={1.5} alignItems="center">
								<Box sx={{ width: 52, height: 52, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: '#fff4e5', color: '#f59e0b' }}>
									<PersonOffOutlined />
								</Box>
								<Box>
									<Typography sx={{ fontSize: 13, color: '#64748b' }}>Blocked Users</Typography>
									<Typography sx={{ fontSize: 24, fontWeight: 800, lineHeight: 1.1 }}>{stats.blocked.toLocaleString()}</Typography>
									<Typography sx={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>↓ 4.2% this month</Typography>
								</Box>
							</Stack>
						</Paper>
					</motion.div>

					<motion.div whileHover={{ y: -6, scale: 1.01 }} whileTap={{ scale: 0.99 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
						<Paper sx={{ p: 2.25, borderRadius: 0, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)' }}>
							<Stack direction="row" spacing={1.5} alignItems="center">
								<Box sx={{ width: 52, height: 52, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: '#fee4e4', color: '#ef4444' }}>
									<BlockOutlined />
								</Box>
								<Box>
									<Typography sx={{ fontSize: 13, color: '#64748b' }}>Admin Users</Typography>
									<Typography sx={{ fontSize: 24, fontWeight: 800, lineHeight: 1.1 }}>{stats.admins.toLocaleString()}</Typography>
									<Typography sx={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>↓ 1.1% this month</Typography>
								</Box>
							</Stack>
						</Paper>
					</motion.div>
				</Box>

					<Paper sx={{ p: 2.5, borderRadius: 0, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)' }}>
						<Stack spacing={2.5}>
							<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
								<Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
									<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flex: 1, flexWrap: 'wrap' }}>
										<Paper sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75, minWidth: { xs: '100%', md: 300 }, borderRadius: 2, border: '1px solid #dbe4ee' }}>
										<Search sx={{ color: '#94a3b8', fontSize: 18 }} />
										<TextField
											variant="standard"
											placeholder="Search users by name, email or ID..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											InputProps={{ disableUnderline: true }}
											sx={{ flex: 1 }}
										/>
									</Paper>

									<FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 } }}>
										<InputLabel>All Roles</InputLabel>
										<Select value={roleFilter} label="All Roles" onChange={(e) => setRoleFilter(e.target.value as 'all' | 'user' | 'admin')}>
											<MenuItem value="all">All Roles</MenuItem>
											<MenuItem value="user">User</MenuItem>
											<MenuItem value="admin">Admin</MenuItem>
										</Select>
									</FormControl>

									<FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 } }}>
										<InputLabel>All Status</InputLabel>
										<Select value={statusFilter} label="All Status" onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'blocked')}>
											<MenuItem value="all">All Status</MenuItem>
											<MenuItem value="active">Active</MenuItem>
											<MenuItem value="blocked">Blocked</MenuItem>
										</Select>
									</FormControl>

									<Button variant="outlined" startIcon={<FilterAltOutlined />} sx={{ textTransform: 'none', borderRadius: 2, minWidth: { xs: '100%', sm: 140 } }}>More Filters</Button>
								</Stack>

								<Stack direction="row" spacing={1.25} alignItems="center">
									<Button variant="outlined" startIcon={<Download />} sx={{ textTransform: 'none', borderRadius: 2, minWidth: 120 }}>Export</Button>
									<Button variant="contained" startIcon={<Add />} onClick={() => openModal('add-user')} sx={{ textTransform: 'none', borderRadius: 2, px: 2.5, boxShadow: 'none' }}>
										Add User
									</Button>
								</Stack>
								</Stack>
							</motion.div>

							<Divider />

							<TableContainer sx={{ maxHeight: 430, overflow: 'auto', borderRadius: 0, '&::-webkit-scrollbar': { width: 10, height: 10 }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: 999 }, '&::-webkit-scrollbar-track': { backgroundColor: '#f8fafc' } }}>
								<UserTable
									users={tableUsers}
									onView={(userRow) => {
										const user = paginatedUsers.find(u => u._id === userRow.id);
										if (user) handleView(user);
									}}
									onEdit={(userRow) => {
										const user = paginatedUsers.find(u => u._id === userRow.id);
										if (user) handleEdit(user);
									}}
									onViewLogs={(userRow) => {
										const user = paginatedUsers.find(u => u._id === userRow.id);
										if (user) handleViewLogs(user);
									}}
									onViewTests={(userRow) => {
										const user = paginatedUsers.find(u => u._id === userRow.id);
										if (user) handleViewTests(user);
									}}
									onResetPassword={(userRow) => {
										const user = paginatedUsers.find(u => u._id === userRow.id);
										if (user) handleResetPassword(user);
									}}
									onForceLogout={(userRow) => {
										const user = paginatedUsers.find(u => u._id === userRow.id);
										if (user) handleForceLogout(user);
									}}
									onToggleBlock={(userRow) => {
										const user = paginatedUsers.find(u => u._id === userRow.id);
										if (user) handleToggleBlock(user);
									}}
									onChangeRole={(userRow) => {
										const user = paginatedUsers.find(u => u._id === userRow.id);
										if (user) handleChangeRole(user);
									}}
									onDelete={(userRow) => {
										const user = paginatedUsers.find(u => u._id === userRow.id);
										if (user) handleDelete(user);
									}}
								/>
							</TableContainer>

							<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
								<Typography variant="body2" color="text.secondary">
									Showing {filteredUsers.length ? page * rowsPerPage + 1 : 0} to {Math.min((page + 1) * rowsPerPage, filteredUsers.length)} of {filteredUsers.length.toLocaleString()} users
								</Typography>
								<TablePagination
									component="div"
									count={filteredUsers.length}
									page={page}
									onPageChange={(_, nextPage) => setPage(nextPage)}
									rowsPerPage={rowsPerPage}
									onRowsPerPageChange={(e) => setRowsPerPage(Number(e.target.value))}
									rowsPerPageOptions={[8, 10, 20]}
									sx={{ borderBottom: 'none' }}
								/>
							</Stack>
						</Stack>
					</Paper>
				</Stack>
			</Box>

			<UserActionModal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				type={modalType}
				user={selectedUser}
				onSuccess={handleModalSuccess}
			/>

			<EmailVerificationModal 
				open={emailVerificationOpen} 
				onClose={() => setEmailVerificationOpen(false)} 
				user={null}
				userEmail={newUserEmail}
			/>

		<UserDetails
			open={userDetailsOpen}
			user={selectedUser ? {
				id: selectedUser._id,
				name: selectedUser.name,
				email: selectedUser.email,
				role: selectedUser.role,
				status: selectedUser.isBlocked ? ('Blocked' as const) : ('Active' as const),
				joinedOn: new Date(selectedUser.createdAt).toLocaleDateString(),
				lastActive: new Date(selectedUser.updatedAt).toLocaleDateString(),
				avatarColor: selectedUser.role === 'admin' ? '#2563eb' : '#6366f1',
				userId: selectedUser._id,
				phone: '',
				lastLoginIp: '',
				lastLoginLocation: '',
				twoFactorEnabled: false,
				device: '',
				failedLoginAttempts: 0,
			} : null}
			onClose={() => setUserDetailsOpen(false)}
			onEdit={(user) => {
				const fullUser = users.find(u => u._id === user.id);
				if (fullUser) handleEdit(fullUser);
			}}
			onResetPassword={(user) => {
				const fullUser = users.find(u => u._id === user.id);
				if (fullUser) handleResetPassword(fullUser);
			}}
			onForceLogout={(user) => {
				const fullUser = users.find(u => u._id === user.id);
				if (fullUser) handleForceLogout(fullUser);
			}}
			onToggleBlock={(user) => {
				const fullUser = users.find(u => u._id === user.id);
				if (fullUser) handleToggleBlock(fullUser);
			}}
			onChangeRole={(user) => {
				const fullUser = users.find(u => u._id === user.id);
				if (fullUser) handleChangeRole(fullUser);
			}}
			onDelete={(user) => {
				const fullUser = users.find(u => u._id === user.id);
				if (fullUser) handleDelete(fullUser);
			}}
		/>

		<ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop pauseOnHover />
	</Box>
	);
};

export default UsersPage;
