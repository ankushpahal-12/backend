import { Box, Chip, Grid, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import type { ReactNode } from 'react';

export interface RiskMetric {
	id: string;
	title: string;
	value: string;
	delta: string;
	deltaDirection: 'up' | 'down';
	icon: ReactNode;
	color: string;
	trend: number[];
}

interface RiskScoreCardProps {
	metrics: RiskMetric[];
}

const RiskScoreCard = ({ metrics }: RiskScoreCardProps) => {
	const theme = useTheme();

	return (
		<Grid container spacing={2}>
			{metrics.map((metric) => (
				<Grid key={metric.id} size={{ xs: 12, sm: 6, lg: 2.4 }}>
					<Paper
						sx={{
							p: 1.5,
							borderRadius: 0,
							border: `1px solid ${alpha(metric.color, 0.18)}`,
							height: '100%',
							background: `linear-gradient(180deg, ${alpha(metric.color, 0.08)} 0%, ${alpha(
								theme.palette.background.paper,
								0.95
							)} 65%)`,
							transition: 'transform .24s cubic-bezier(.2,.8,.2,1), box-shadow .24s ease',
							cursor: 'pointer',
							'&:hover': {
								transform: 'translateY(-6px)',
								boxShadow: `0 14px 30px ${alpha(metric.color, 0.14)}, 0 0 24px ${alpha(metric.color, 0.07)}`,
							},
						}}
					>
						<Stack spacing={1}>
							<Stack direction="row" alignItems="center" justifyContent="space-between">
								<Box
									sx={{
										width: 32,
										height: 32,
										borderRadius: 2,
										display: 'grid',
										placeItems: 'center',
										color: metric.color,
										bgcolor: alpha(metric.color, 0.14),
									}}
								>
									{metric.icon}
								</Box>
								<Chip
									size="small"
									label={`${metric.deltaDirection === 'up' ? '+' : '-'}${metric.delta}`}
									sx={{
										fontSize: '0.65rem',
										height: 20,
										fontWeight: 700,
										color:
											metric.deltaDirection === 'up'
												? theme.palette.success.dark
												: theme.palette.error.dark,
										bgcolor:
											metric.deltaDirection === 'up'
												? alpha(theme.palette.success.main, 0.12)
												: alpha(theme.palette.error.main, 0.12),
									}}
								/>
							</Stack>

							<Box>
								<Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
									{metric.title}
								</Typography>
								<Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.15, mt: 0.2 }}>
									{metric.value}
								</Typography>
							</Box>

							<Stack direction="row" spacing={0.5} alignItems="flex-end" sx={{ minHeight: 28 }}>
								{metric.trend.map((point, index) => (
									<Box
										key={`${metric.id}-${index}`}
										sx={{
											flex: 1,
											borderRadius: 99,
											height: `${point}px`,
											bgcolor: alpha(metric.color, 0.9),
										}}
									/>
								))}
							</Stack>
						</Stack>
					</Paper>
				</Grid>
			))}
		</Grid>
	);
};

export default RiskScoreCard;
