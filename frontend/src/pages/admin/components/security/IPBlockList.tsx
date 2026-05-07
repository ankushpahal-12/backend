import { useMemo, useState } from 'react';
import { Box, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface BlockedIpItem {
	id: string;
	ip: string;
	location: string;
	status: 'Blocked' | 'Unblocked';
}

const initialBlockedIps: BlockedIpItem[] = [
	{ id: '1', ip: '152.58.125.8', location: 'New York, USA', status: 'Blocked' },
	{ id: '2', ip: '45.134.12.67', location: 'London, UK', status: 'Blocked' },
	{ id: '3', ip: '172.16.254.1', location: 'Mumbai, India', status: 'Blocked' },
	{ id: '4', ip: '98.248.23.45', location: 'Toronto, Canada', status: 'Blocked' },
];

const IPBlockList = () => {
	const [items, setItems] = useState(initialBlockedIps);
	const [ip, setIp] = useState('');
	const [location, setLocation] = useState('Unknown');
	const [viewOpen, setViewOpen] = useState(false);

	const blockedCount = useMemo(() => items.filter((item) => item.status === 'Blocked').length, [items]);

	const handleAdd = () => {
		if (!ip.trim()) return;
		setItems((prev) => [{ id: String(Date.now()), ip: ip.trim(), location: location.trim() || 'Unknown', status: 'Blocked' }, ...prev]);
		setIp('');
		setLocation('Unknown');
	};

	const handleUnblock = (id: string) => {
		setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'Unblocked' } : item)));
	};

	return (
		<motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 240, damping: 20 }}>
			<Paper sx={{ borderRadius: 0, border: '1px solid #e2e8f0', p: 2.5, height: '100%' }}>
				<Stack spacing={2} sx={{ mb: 2 }}>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Box>
							<Typography sx={{ fontWeight: 800 }}>IP Block List</Typography>
							<Typography variant="body2" color="text.secondary">
								Manage blocked IPs to prevent brute-force attacks and suspicious regions.
							</Typography>
						</Box>
						<Stack direction="row" spacing={1} alignItems="center">
							<Chip label={`${blockedCount} blocked`} size="small" sx={{ borderRadius: 0, bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 800 }} />
							<Button size="small" variant="outlined" onClick={() => setViewOpen(true)} sx={{ textTransform: 'none', borderRadius: 0 }}>
								View
							</Button>
						</Stack>
					</Stack>

					<Stack spacing={1.25}>
						<TextField size="small" label="Block new IP" value={ip} onChange={(e) => setIp(e.target.value)} placeholder="203.0.113.12" />
						<TextField size="small" label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Country / region" />
						<Button variant="contained" onClick={handleAdd} sx={{ textTransform: 'none', borderRadius: 0, boxShadow: 'none' }}>
							Block IP
						</Button>
					</Stack>
				</Stack>

				<TableContainer sx={{ maxHeight: 360, overflow: 'auto', '&::-webkit-scrollbar': { width: 10, height: 10 }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: 999 } }}>
					<Table size="small" stickyHeader>
							<TableHead>
								<TableRow>
									<TableCell sx={{ fontWeight: 800 }}>IP Address</TableCell>
								</TableRow>
								</TableHead>
							<TableBody>
								{items.map((item) => (
									<TableRow key={item.id} hover sx={{ '& .MuiTableCell-root': { py: 1.2 } }}>
										<TableCell sx={{ fontFamily: 'monospace' }}>{item.ip}</TableCell>
									</TableRow>
								))}
							</TableBody>
					</Table>
				</TableContainer>

				{/* View dialog showing all blocked IPs */}
				<Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
					<DialogTitle>Blocked IPs ({blockedCount})</DialogTitle>
					<DialogContent dividers sx={{ p: 0 }}>
						<List sx={{ maxHeight: 320, overflow: 'auto', '&::-webkit-scrollbar': { width: 10 }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: 999 } }}>
							{items.filter(i => i.status === 'Blocked').map((it) => (
								<ListItem key={it.id} divider secondaryAction={
									<Button size="small" onClick={() => handleUnblock(it.id)} sx={{ textTransform: 'none' }}>
										Unblock
									</Button>
								}>
									<ListItemText primary={it.ip} secondary={`${it.location} • ${it.status}`} sx={{ fontFamily: 'monospace' }} />
								</ListItem>
							))}
						</List>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setViewOpen(false)} sx={{ textTransform: 'none' }}>Close</Button>
						<Button color="error" onClick={() => { setItems((prev) => prev.filter((it) => it.status !== 'Blocked')); }} sx={{ textTransform: 'none' }}>
							Remove All
						</Button>
					</DialogActions>
				</Dialog>
			</Paper>
		</motion.div>
	);
};

export default IPBlockList;
