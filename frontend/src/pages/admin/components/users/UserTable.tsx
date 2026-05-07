import { Avatar, Box, Checkbox, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import UserActions from './UserActions';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Blocked';
  joinedOn: string;
  lastActive: string;
  avatarColor?: string;
  userId?: string;
  phone?: string;
  lastLoginIp?: string;
  lastLoginLocation?: string;
  twoFactorEnabled?: boolean;
  device?: string;
  failedLoginAttempts?: number;
}

interface UserTableProps {
  users: UserRow[];
  onView: (u: UserRow) => void;
  onEdit: (u: UserRow) => void;
  onViewLogs: (u: UserRow) => void;
  onViewTests: (u: UserRow) => void;
  onResetPassword: (u: UserRow) => void;
  onForceLogout: (u: UserRow) => void;
  onToggleBlock: (u: UserRow) => void;
  onChangeRole: (u: UserRow) => void;
  onDelete: (u: UserRow) => void;
}

const UserTable = ({ users, onView, onEdit, onViewLogs, onViewTests, onResetPassword, onForceLogout, onToggleBlock, onChangeRole, onDelete }: UserTableProps) => {
  return (
    <Table size="small" stickyHeader sx={{ minWidth: 980 }}>
      <TableHead>
        <TableRow
          sx={{
            '& .MuiTableCell-head': {
              bgcolor: '#f8fafc',
              color: '#334155',
              fontSize: 12,
              fontWeight: 700,
              borderBottom: '1px solid #e2e8f0',
              py: 1.5,
            },
          }}
        >
          <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
          <TableCell>User</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Role</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Joined On</TableCell>
          <TableCell>Last Active</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {users.map((u) => (
          <TableRow
            key={u.id}
            hover
            sx={{
              '& .MuiTableCell-body': {
                borderBottom: '1px solid #edf2f7',
                py: 1.25,
              },
            }}
          >
            <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
            <TableCell>
              <Box display="flex" alignItems="center" gap={1.25}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: u.avatarColor ?? '#c7d2fe', fontWeight: 700 }}>{u.name.charAt(0)}</Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{u.name}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.1 }}>
                    {u.userId || (u.id ? `ID: ${u.id.toUpperCase()}` : 'Unknown')}
                  </Typography>
                </Box>
              </Box>
            </TableCell>
            <TableCell>
              <Typography variant="body2" sx={{ color: '#475569' }}>{u.email}</Typography>
            </TableCell>
            <TableCell>
              <Chip
                label={u.role}
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: u.role === 'Admin' ? '#f5e8ff' : u.role === 'Teacher' ? '#efe7ff' : '#e0ecff',
                  color: u.role === 'Admin' ? '#a855f7' : u.role === 'Teacher' ? '#7c3aed' : '#2563eb',
                }}
              />
            </TableCell>
            <TableCell>
              <Chip
                label={u.status}
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: u.status === 'Active' ? '#e6f8ec' : u.status === 'Blocked' ? '#fee2e2' : '#ffedd5',
                  color: u.status === 'Active' ? '#16a34a' : u.status === 'Blocked' ? '#dc2626' : '#f97316',
                }}
              />
            </TableCell>
            <TableCell>
              <Typography variant="body2" sx={{ color: '#334155' }}>{u.joinedOn}</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2" color="text.secondary">{u.lastActive}</Typography>
            </TableCell>
            <TableCell align="right">
              <UserActions
                onView={() => onView(u)}
                onEdit={() => onEdit(u)}
                onViewLogs={() => onViewLogs(u)}
                onViewTests={() => onViewTests(u)}
                onResetPassword={() => onResetPassword(u)}
                onForceLogout={() => onForceLogout(u)}
                onToggleBlock={() => onToggleBlock(u)}
                onChangeRole={() => onChangeRole(u)}
                onDelete={() => onDelete(u)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserTable;
