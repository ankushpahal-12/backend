import React, { useEffect, useRef } from 'react';
import { Box, Slide, Stack, Typography } from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';

export type ReconnectToastTone = 'network' | 'backend' | 'websocket';

export interface ReconnectToastProps {
	open: boolean;
	title: string;
	message?: string;
	tone?: ReconnectToastTone;
	onClose: () => void;
}

const AUTO_HIDE_MS = 4800;

// ── Tone config ───────────────────────────────────────────────────────────────
const TONE_CONFIG = {
	network: {
		accent: '#16A34A',
		iconBg: '#DCFCE7',
		icon: (
			<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M5 12.55a11 11 0 0 1 14.08 0" />
				<path d="M1.42 9a16 16 0 0 1 21.16 0" />
				<path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
				<circle cx="12" cy="20" r="1.5" fill="#16A34A" stroke="none" />
			</svg>
		),
	},
	backend: {
		accent: '#F59E0B',
		iconBg: '#FEF3C7',
		icon: (
			<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M22 12h-4l-3 9L9 3l-3 9H2" />
			</svg>
		),
	},
	websocket: {
		accent: '#6366F1',
		iconBg: '#EEF2FF',
		icon: (
			<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
				<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
			</svg>
		),
	},
};

// ── Transition (slide in from top) ────────────────────────────────────────────
const Transition = React.forwardRef(function Transition(
	props: TransitionProps & { children: React.ReactElement<any, any> },
	ref: React.Ref<unknown>,
) {
	return <Slide direction="down" ref={ref} {...props} />;
});

// ── Component ─────────────────────────────────────────────────────────────────
const ReconnectToast: React.FC<ReconnectToastProps> = ({
	open,
	title,
	message,
	tone = 'network',
	onClose,
}) => {
	const config = TONE_CONFIG[tone];
	const timerRef = useRef<number | null>(null);

	// Auto-hide after AUTO_HIDE_MS
	useEffect(() => {
		if (open) {
			timerRef.current = window.setTimeout(onClose, AUTO_HIDE_MS);
		}
		return () => {
			if (timerRef.current) {
				window.clearTimeout(timerRef.current);
			}
		};
	}, [open, onClose]);

	return (
		// Portal-style fixed container — always mounted, animated in/out
		<Box
			sx={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				display: 'flex',
				justifyContent: 'center',
				zIndex: 9999,
				pointerEvents: 'none',
				pt: 1.5,
				px: 2,
			}}
		>
			<Transition in={open} unmountOnExit>
				<Box
					role="alert"
					aria-live="assertive"
					sx={{
						pointerEvents: 'auto',
						width: '100%',
						maxWidth: 420,
						borderRadius: '16px',
						background: '#FFFFFF',
						boxShadow: '0 8px 32px rgba(15,23,42,0.16), 0 0 0 1px rgba(15,23,42,0.06)',
						overflow: 'hidden',
						display: 'flex',
						alignItems: 'stretch',
					}}
				>
					{/* Left accent bar */}
					<Box
						sx={{
							width: 4,
							flexShrink: 0,
							background: config.accent,
							borderRadius: '16px 0 0 16px',
						}}
					/>

					{/* Content */}
					<Stack
						direction="row"
						alignItems="center"
						spacing={1.5}
						sx={{ flex: 1, px: 2, py: 1.75 }}
					>
						{/* Icon circle */}
						<Box
							sx={{
								width: 40,
								height: 40,
								borderRadius: '50%',
								background: config.iconBg,
								display: 'grid',
								placeItems: 'center',
								flexShrink: 0,
							}}
						>
							{config.icon}
						</Box>

						{/* Text */}
						<Box sx={{ flex: 1, minWidth: 0 }}>
							<Typography
								sx={{
									fontWeight: 700,
									fontSize: '0.92rem',
									color: '#0F172A',
									lineHeight: 1.3,
								}}
							>
								{title}
							</Typography>
							{message && (
								<Typography
									sx={{
										fontSize: '0.8rem',
										color: '#64748B',
										mt: 0.35,
										lineHeight: 1.45,
									}}
								>
									{message}
								</Typography>
							)}
						</Box>

						{/* Close button */}
						<Box
							component="button"
							onClick={onClose}
							aria-label="Dismiss notification"
							sx={{
								width: 32,
								height: 32,
								borderRadius: '50%',
								border: '1.5px solid rgba(15,23,42,0.1)',
								background: 'rgba(241,245,249,0.9)',
								display: 'grid',
								placeItems: 'center',
								cursor: 'pointer',
								flexShrink: 0,
								fontSize: 14,
								color: '#94A3B8',
								lineHeight: 1,
								transition: 'background 0.15s',
								'&:hover': { background: '#E2E8F0', color: '#475569' },
							}}
						>
							✕
						</Box>
					</Stack>
				</Box>
			</Transition>
		</Box>
	);
};

export default ReconnectToast;
