import { Box, Grid, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface SecurityStatusItem {
	id: string;
	label: string;
	value: string;
	status: 'online' | 'healthy' | 'warning';
	icon: ReactNode;
}

interface SecurityOverviewProps {
	items: SecurityStatusItem[];
}

const SecurityOverview = ({ items }: SecurityOverviewProps) => {
	const theme = useTheme();

	const getStatusColor = (status: SecurityStatusItem['status']) => {
		if (status === 'warning') {
			return theme.palette.warning.main;
		}
		if (status === 'healthy') {
			return theme.palette.success.main;
		}
		return theme.palette.info.main;
	};

	return (
		<Paper
			sx={{
				p: 2.2,
				borderRadius: 0,
				border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
				transition: 'transform .22s ease, box-shadow .22s ease',
				cursor: 'pointer',
				'&:hover': {
					transform: 'translateY(-6px)',
					boxShadow: `0 16px 36px ${alpha(theme.palette.primary.main, 0.06)}, 0 0 20px ${alpha(
						theme.palette.primary.main,
						0.03
					)}`,
				},
			}}
		>
			<Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
				System Security Overview
			</Typography>

			<Grid container spacing={2.25}>
				{items.map((item) => {
					const accent = getStatusColor(item.status);

					return (
						<Grid key={item.id} size={{ xs: 12, sm: 6, md: 2.4 }}>
							<motion.div whileHover={{ y: -5, scale: 1.01 }} whileTap={{ scale: 0.99 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
								<Paper
									sx={{
										p: 2,
										borderRadius: 0,
										border: `1px solid ${alpha(accent, 0.2)}`,
										background: `linear-gradient(180deg, ${alpha(accent, 0.1)} 0%, ${alpha(
											theme.palette.background.paper,
											0.98
										)} 64%)`,
										transition: 'transform .22s ease, box-shadow .22s ease',
										cursor: 'pointer',
										'&:hover': {
											transform: 'translateY(-6px)',
											boxShadow: `0 12px 30px ${alpha(accent, 0.12)}, 0 0 16px ${alpha(accent, 0.06)}`,
										},
									}}
								>
									<Stack direction="row" spacing={1.2} alignItems="center">
										<Box
											sx={{
												width: 36,
												height: 36,
												borderRadius: 0,
												display: 'grid',
												placeItems: 'center',
												color: accent,
												bgcolor: alpha(accent, 0.14),
											}}
										>
											{item.icon}
										</Box>

										<Box>
											<Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
												{item.label}
											</Typography>
											<Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
												{item.value}
											</Typography>
										</Box>
									</Stack>
								</Paper>
							</motion.div>
						</Grid>
					);
				})}
			</Grid>
		</Paper>
	);
};

export default SecurityOverview;
