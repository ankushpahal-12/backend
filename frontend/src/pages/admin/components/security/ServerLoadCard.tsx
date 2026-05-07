import { Paper, Stack, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

const ServerLoadCard = () => {
	return (
		<motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 240, damping: 20 }}>
			<Paper sx={{ borderRadius: 0, border: '1px solid #e2e8f0', p: 2.5, height: '100%' }}>
				<Stack spacing={1}>
					<Typography sx={{ fontWeight: 800 }}>Server Load</Typography>
					<Typography variant="body2" color="text.secondary">CPU, memory and load average overview (placeholder).</Typography>
					<Box sx={{ mt: 1, height: 80, bgcolor: '#f8fafc', border: '1px dashed #e2e8f0', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<Typography color="text.secondary">(chart placeholder)</Typography>
					</Box>
				</Stack>
			</Paper>
		</motion.div>
	);
};

export default ServerLoadCard;
