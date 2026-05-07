import { useState } from 'react';
import { Box, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Paper, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { LineChart, Line, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const requestData = [
	{ endpoint: '/api/login', requests: 120, limit: 100 },
	{ endpoint: '/api/exams', requests: 80, limit: 90 },
	{ endpoint: '/api/tests', requests: 145, limit: 110 },
	{ endpoint: '/api/reports', requests: 92, limit: 100 },
	{ endpoint: '/api/users', requests: 168, limit: 120 },
	{ endpoint: '/api/security', requests: 104, limit: 100 },
];

const sparkData = [
	{ label: 'Mon', value: 28 },
	{ label: 'Tue', value: 34 },
	{ label: 'Wed', value: 31 },
	{ label: 'Thu', value: 52 },
	{ label: 'Fri', value: 45 },
	{ label: 'Sat', value: 61 },
	{ label: 'Sun', value: 56 },
];

const RateLimitMonitor = () => {
	const [requests, setRequests] = useState(requestData);
	const [viewOpen, setViewOpen] = useState(false);

	return (
		<motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 240, damping: 20 }}>
			<Paper sx={{ borderRadius: 0, border: '1px solid #e2e8f0', p: 2.5, height: '100%' }}>
				<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
					<Box>
						<Typography sx={{ fontWeight: 800 }}>Rate Limit Monitor</Typography>
						<Typography variant="body2" color="text.secondary">
							Monitor request spikes, threshold violations, and endpoint-specific limits.
						</Typography>
					</Box>
					<Stack direction="row" spacing={1} alignItems="center">
						<Chip label="Alert enabled" size="small" sx={{ borderRadius: 0, bgcolor: '#ffedd5', color: '#f97316', fontWeight: 800 }} />
						<Button size="small" variant="outlined" onClick={() => setViewOpen(true)} sx={{ textTransform: 'none', borderRadius: 0 }}>
							View
						</Button>
					</Stack>
				</Stack>

				<Box sx={{ height: 190, mb: 2 }}>
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={sparkData}>
							<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
							<XAxis dataKey="label" tick={{ fontSize: 12 }} />
							<YAxis tick={{ fontSize: 12 }} />
							<Tooltip />
							<Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />
						</LineChart>
					</ResponsiveContainer>
				</Box>

				<Stack spacing={1.1}>
					{requests.map((item) => (
						<Stack key={item.endpoint} direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1.25, border: '1px solid #e2e8f0', borderRadius: 0, bgcolor: '#fff' }}>
							<Box>
								<Typography sx={{ fontWeight: 700 }}>{item.endpoint}</Typography>
							</Box>
						</Stack>
					))}
				</Stack>

				<Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
					<DialogTitle>Rate Limit Entries ({requests.length})</DialogTitle>
					<DialogContent dividers sx={{ p: 0 }}>
						<List sx={{ maxHeight: 320, overflow: 'auto', '&::-webkit-scrollbar': { width: 10 }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: 999 } }}>
							{requests.map((r) => {
								const exceeded = r.requests > r.limit;
								return (
									<ListItem key={r.endpoint} divider secondaryAction={
										<Chip label={exceeded ? 'Exceeded' : 'Normal'} size="small" sx={{ borderRadius: 0, bgcolor: exceeded ? '#fee2e2' : '#dcfce7', color: exceeded ? '#dc2626' : '#16a34a', fontWeight: 800 }} />
									}>
										<ListItemText primary={r.endpoint} secondary={`Requests: ${r.requests} • Limit: ${r.limit}/min`} />
									</ListItem>
								);
							})}
						</List>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setViewOpen(false)} sx={{ textTransform: 'none' }}>Close</Button>
						<Button color="error" onClick={() => { setRequests([]); }} sx={{ textTransform: 'none' }}>Clear All</Button>
					</DialogActions>
				</Dialog>
			</Paper>
		</motion.div>
	);
};

export default RateLimitMonitor;
