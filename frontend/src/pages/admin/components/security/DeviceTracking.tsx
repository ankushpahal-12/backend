import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface DeviceItem {
	id: string;
	user: string;
	device: string;
	browser: string;
	location: string;
	status: 'Trusted' | 'New Device' | 'Session Anomaly';
}

const devices: DeviceItem[] = [
	{ id: '1', user: 'John Doe', device: 'Windows 11', browser: 'Chrome 124', location: 'Bangalore, India', status: 'Trusted' },
	{ id: '2', user: 'Jane Smith', device: 'iPhone 15', browser: 'Safari', location: 'Mumbai, India', status: 'New Device' },
	{ id: '3', user: 'Mike Johnson', device: 'MacBook Pro', browser: 'Chrome 123', location: 'London, UK', status: 'Trusted' },
	{ id: '4', user: 'Emily Davis', device: 'Android Mobile', browser: 'Firefox', location: 'Toronto, Canada', status: 'Session Anomaly' },
	{ id: '5', user: 'Sarah Brown', device: 'Windows 10', browser: 'Edge', location: 'New York, USA', status: 'New Device' },
];

const statusColor = (status: DeviceItem['status']) => {
	if (status === 'Trusted') return { bg: '#dcfce7', color: '#16a34a' };
	if (status === 'New Device') return { bg: '#ffedd5', color: '#f97316' };
	return { bg: '#fee2e2', color: '#dc2626' };
};

const DeviceTracking = () => {
	return (
		<motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 240, damping: 20 }}>
			<Paper sx={{ borderRadius: 0, border: '1px solid #e2e8f0', p: 2.5, height: '100%' }}>
				<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
					<Box>
						<Typography sx={{ fontWeight: 800 }}>Device Tracking</Typography>
						<Typography variant="body2" color="text.secondary">
							Track devices, browsers, login location, and session anomalies per user.
						</Typography>
					</Box>
					<Chip label="New device detection" size="small" sx={{ borderRadius: 0, bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 800 }} />
				</Stack>

				<Stack spacing={1.25} sx={{ maxHeight: 390, overflow: 'auto', pr: 0.5, '&::-webkit-scrollbar': { width: 10 }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: 999 } }}>
					{devices.map((device) => {
						const tone = statusColor(device.status);
						return (
							<Box key={device.id} sx={{ p: 1.5, border: '1px solid #e2e8f0', borderRadius: 0, transition: 'transform 180ms ease, box-shadow 180ms ease', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 10px 22px rgba(15,23,42,0.08)' } }}>
								<Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
									<Box>
										<Typography sx={{ fontWeight: 800 }}>{device.user}</Typography>
										<Typography variant="body2" color="text.secondary">
											{device.device} • {device.browser}
										</Typography>
										<Typography variant="caption" color="text.secondary">{device.location}</Typography>
									</Box>
									<Chip label={device.status} size="small" sx={{ borderRadius: 0, bgcolor: tone.bg, color: tone.color, fontWeight: 800 }} />
								</Stack>
							</Box>
						);
					})}
				</Stack>
			</Paper>
		</motion.div>
	);
};

export default DeviceTracking;
