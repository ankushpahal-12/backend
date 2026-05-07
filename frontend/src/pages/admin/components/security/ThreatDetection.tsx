import { Box, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { motion } from 'framer-motion';

type ThreatLevel = 'High' | 'Medium' | 'Low';
type ThreatStatus = 'Blocked' | 'Detected';

interface ThreatItem {
	id: string;
	time: string;
	user: string;
	threatType: string;
	riskLevel: ThreatLevel;
	status: ThreatStatus;
	ip: string;
}

const threatRows: ThreatItem[] = [
	{ id: '1', time: '10:24 AM', user: 'Priya Sharma', threatType: 'Suspicious Login', riskLevel: 'High', status: 'Blocked', ip: '152.58.125.8' },
	{ id: '2', time: '09:47 AM', user: 'Rohan Mehta', threatType: 'Multiple Login Attempts', riskLevel: 'Medium', status: 'Detected', ip: '45.134.12.67' },
	{ id: '3', time: '09:21 AM', user: 'Sneha Patel', threatType: 'Cheating Detection', riskLevel: 'Medium', status: 'Detected', ip: '172.16.254.1' },
	{ id: '4', time: '08:58 AM', user: 'Arjun Singh', threatType: 'Session Hijacking', riskLevel: 'High', status: 'Blocked', ip: '98.248.23.45' },
	{ id: '5', time: '08:31 AM', user: 'System', threatType: 'Unauthorized Device', riskLevel: 'Low', status: 'Detected', ip: '203.0.113.52' },
];

const getRiskChip = (riskLevel: ThreatLevel) => {
	if (riskLevel === 'High') return { bg: '#fee2e2', color: '#dc2626' };
	if (riskLevel === 'Medium') return { bg: '#ffedd5', color: '#f97316' };
	return { bg: '#dcfce7', color: '#16a34a' };
};

const getStatusChip = (status: ThreatStatus) => {
	if (status === 'Blocked') return { bg: '#fee2e2', color: '#dc2626' };
	return { bg: '#dbeafe', color: '#2563eb' };
};

const ThreatDetection = () => {
	return (
		<motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 240, damping: 20 }}>
			<Paper sx={{ borderRadius: 0, border: '1px solid #e2e8f0', p: 2.5, height: '100%' }}>
				<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
					<Box>
						<Typography sx={{ fontWeight: 800 }}>Threat Detection</Typography>
						<Typography variant="body2" color="text.secondary">
							Detect suspicious login, multiple attempts, cheating and hijacking events.
						</Typography>
					</Box>
					<Chip label="Live feed" size="small" sx={{ borderRadius: 0, bgcolor: '#eef2ff', color: '#4f46e5', fontWeight: 700 }} />
				</Stack>

				<TableContainer sx={{ maxHeight: 360, overflow: 'auto', '&::-webkit-scrollbar': { width: 10, height: 10 }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: 999 } }}>
					<Table size="small" stickyHeader>
						<TableHead>
							<TableRow>
								<TableCell sx={{ fontWeight: 800 }}>Time</TableCell>
								<TableCell sx={{ fontWeight: 800 }}>User</TableCell>
								<TableCell sx={{ fontWeight: 800 }}>Threat Type</TableCell>
								<TableCell sx={{ fontWeight: 800 }}>Risk</TableCell>
								<TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{threatRows.map((row) => {
								const risk = getRiskChip(row.riskLevel);
								const status = getStatusChip(row.status);
								return (
									<TableRow key={row.id} hover sx={{ '& .MuiTableCell-root': { py: 1.2 }, transition: 'background-color 180ms ease', '&:hover': { bgcolor: '#f8fafc' } }}>
										<TableCell>{row.time}</TableCell>
										<TableCell>
											<Stack spacing={0}>
												<Typography sx={{ fontWeight: 700 }}>{row.user}</Typography>
												<Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>{row.ip}</Typography>
											</Stack>
										</TableCell>
										<TableCell>{row.threatType}</TableCell>
										<TableCell>
											<Chip label={row.riskLevel} size="small" sx={{ borderRadius: 0, bgcolor: risk.bg, color: risk.color, fontWeight: 800 }} />
										</TableCell>
										<TableCell>
											<Chip label={row.status} size="small" sx={{ borderRadius: 0, bgcolor: status.bg, color: status.color, fontWeight: 800 }} />
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>
		</motion.div>
	);
};

export default ThreatDetection;
