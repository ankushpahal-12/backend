import React from 'react';
import { Box, Collapse, Stack, Typography } from '@mui/material';
import type { ConnectionSpeedState } from '../hooks/useNetworkGlobal';

export interface SlowInternetBannerProps {
	open: boolean;
	connection: ConnectionSpeedState;
	onDismiss: () => void;
}

// ── Speed pill badge ──────────────────────────────────────────────────────────
const SpeedBadge: React.FC<{ label: string; slow?: boolean }> = ({ label, slow }) => (
	<Box
		component="span"
		sx={{
			display: 'inline-flex',
			alignItems: 'center',
			px: 1.1,
			py: 0.2,
			borderRadius: '6px',
			fontSize: '0.75rem',
			fontWeight: 800,
			letterSpacing: '0.03em',
			background: slow ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.12)',
			color: slow ? '#92400E' : '#065F46',
			border: slow ? '1px solid rgba(245,158,11,0.28)' : '1px solid rgba(16,185,129,0.2)',
		}}
	>
		{label}
	</Box>
);

// ── Row for a connection detail ───────────────────────────────────────────────
const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
	<Stack direction="row" justifyContent="space-between" alignItems="center">
		<Typography sx={{ fontSize: '0.83rem', color: '#78716C', fontWeight: 500 }}>{label}</Typography>
		<Typography sx={{ fontSize: '0.83rem', color: '#0F172A', fontWeight: 700 }}>{value}</Typography>
	</Stack>
);

// ── WiFi slow icon ─────────────────────────────────────────────────────────────
const SlowWifiIcon = () => (
	<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
		<path d="M5 12.55a11 11 0 0 1 14.08 0" />
		<path d="M1.42 9a16 16 0 0 1 21.16 0" />
		<circle cx="12" cy="20" r="1.2" fill="#D97706" stroke="none" />
	</svg>
);

// ── Lightbulb icon ─────────────────────────────────────────────────────────────
const TipIcon = () => (
	<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
		<circle cx="12" cy="12" r="10" />
		<line x1="12" y1="8" x2="12" y2="12" />
		<line x1="12" y1="16" x2="12.01" y2="16" />
	</svg>
);

// ── Main component ─────────────────────────────────────────────────────────────
const SlowInternetBanner: React.FC<SlowInternetBannerProps> = ({ open, connection, onDismiss }) => {
	const isVerySlow = connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
	const typeLabel  = connection.effectiveType ? connection.effectiveType.toUpperCase() : 'Unknown';

	return (
		<Collapse in={open} unmountOnExit>
			<div className="fixed top-3 left-1/2 -translate-x-1/2 z-[8888] w-full max-w-[520px] px-4 pointer-events-none">
				<div className="pointer-events-auto bg-white/80 backdrop-blur-xl border border-amber-500/20 shadow-2xl rounded-none overflow-hidden flex flex-col relative">
					{/* Gradient top indicator */}
					<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
					
					{/* ── Header row ── */}
					<div className="flex items-center gap-3 px-5 pt-5 pb-1">
						<div className="w-9 h-9 rounded-none bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
							<SlowWifiIcon />
						</div>

						<div className="flex-1">
							<div className="flex items-center gap-2">
								<h3 className="font-extrabold text-[0.95rem] text-slate-900 leading-tight">
									Slow Internet Connection
								</h3>
								<SpeedBadge label={typeLabel} slow={isVerySlow} />
							</div>
							<p className="text-[0.8rem] text-slate-500 mt-0.5 leading-snug">
								Your connection is slow ({typeLabel}). Some features may take longer.
							</p>
						</div>

						{/* Dismiss × */}
						<button
							onClick={onDismiss}
							aria-label="Dismiss slow network warning"
							className="w-7 h-7 rounded-none border-[1.5px] border-slate-200/50 bg-slate-100/90 hover:bg-slate-200/90 text-slate-400 hover:text-slate-600 flex items-center justify-center text-xs transition-colors shrink-0"
						>
							✕
						</button>
					</div>

					{/* ── Divider ── */}
					<div className="h-[1px] bg-amber-500/10 mx-5 my-3" />

					{/* ── Connection detail table ── */}
					<div className="flex flex-col gap-1 px-5 pb-1">
						<h4 className="text-[0.75rem] font-bold text-amber-700 tracking-widest uppercase mb-1">
							Connection Details
						</h4>

						<DetailRow
							label="Effective Type"
							value={<SpeedBadge label={typeLabel} slow={isVerySlow} />}
						/>
						<DetailRow
							label="Downlink"
							value={connection.downlinkLabel}
						/>
						<DetailRow
							label="RTT"
							value={connection.latencyLabel}
						/>
						<DetailRow
							label="Save Data"
							value={connection.saveData ? 'Enabled' : 'Not enabled'}
						/>
					</div>

					{/* ── Tip ── */}
					<div className="mx-5 my-4 px-4 py-3 rounded-none bg-amber-50/60 border border-amber-500/15 flex items-start gap-2">
						<TipIcon />
						<p className="text-[0.8rem] text-amber-800 leading-snug font-medium">
							<strong>Tip:</strong> Consider switching to a better network for a smoother experience.
						</p>
					</div>
				</div>
			</div>
		</Collapse>
	);
};

export default SlowInternetBanner;
