import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Slide, Stack, Typography } from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

export type OfflineModalMode = 'offline' | 'server';

export interface OfflineModalProps {
	open: boolean;
	mode?: OfflineModalMode;
	title?: string;
	description?: string;
	details?: string;
	actionLabel?: string;
	secondaryLabel?: string;
	onRetry: () => void | Promise<void>;
	onClose?: () => void;
}

// ── Exponential backoff helper ───────────────────────────────────────────────
const getBackoffSeconds = (attempt: number): number => {
	// 10s, 15s, 22s, 33s, 50s … capped at 60s
	return Math.min(Math.round(10 * Math.pow(1.5, attempt)), 60);
};

// ── Animated pulsing dot ─────────────────────────────────────────────────────
const PulsingDot: React.FC<{ color: string }> = ({ color }) => (
	<Box
		component="span"
		sx={{
			display: 'inline-block',
			width: 8,
			height: 8,
			borderRadius: '50%',
			background: color,
			flexShrink: 0,
			'@keyframes pulse': {
				'0%, 100%': { opacity: 1, transform: 'scale(1)' },
				'50%': { opacity: 0.4, transform: 'scale(0.75)' },
			},
			animation: 'pulse 1.4s ease-in-out infinite',
		}}
	/>
);

// ── Spinning loader circle ───────────────────────────────────────────────────
const SpinnerCircle: React.FC<{ color: string }> = ({ color }) => (
	<Box
		sx={{
			width: 16,
			height: 16,
			borderRadius: '50%',
			border: `2.5px solid ${color}33`,
			borderTopColor: color,
			flexShrink: 0,
			'@keyframes spin': { to: { transform: 'rotate(360deg)' } },
			animation: 'spin 0.8s linear infinite',
		}}
	/>
);

// ── Transition ───────────────────────────────────────────────────────────────
const Transition = React.forwardRef(function Transition(
	props: TransitionProps & { children: React.ReactElement<any, any> },
	ref: React.Ref<unknown>,
) {
	return <Slide direction="up" ref={ref} {...props} />;
});

// ── WiFi-off SVG icon ────────────────────────────────────────────────────────
const WifiOffIcon: React.FC<{ size?: number; color?: string }> = ({ size = 52, color = '#EF4444' }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
		<line x1="1" y1="1" x2="23" y2="23" />
		<path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
		<path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
		<path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
		<path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
		<path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
		<circle cx="12" cy="20" r="1" fill={color} stroke="none" />
	</svg>
);

// ── Server/Database SVG icon ─────────────────────────────────────────────────
const ServerOffIcon: React.FC<{ size?: number; color?: string }> = ({ size = 52, color = '#F59E0B' }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
		<ellipse cx="12" cy="5" rx="9" ry="3" />
		<path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
		<path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
		<line x1="3" y1="3" x2="21" y2="21" stroke={color} strokeOpacity="0.55" />
	</svg>
);

// ── Refresh icon ─────────────────────────────────────────────────────────────
const RefreshIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
		<polyline points="23 4 23 10 17 10" />
		<polyline points="1 20 1 14 7 14" />
		<path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
	</svg>
);

// ── Main component ────────────────────────────────────────────────────────────
const OfflineModal: React.FC<OfflineModalProps> = ({
	open,
	mode = 'offline',
	title,
	description,
	details,
	actionLabel,
	secondaryLabel,
	onRetry,
	onClose,
}) => {
	const isServerMode = mode === 'server';

	// ── Countdown + exponential backoff ──────────────────────────────────────
	const [countdown, setCountdown] = useState<number>(getBackoffSeconds(0));
	const [attempt, setAttempt] = useState(0);
	const [checking, setChecking] = useState(false);
	const countdownRef = useRef<number | null>(null);
	const attemptRef = useRef(0);

	const clearCountdown = useCallback(() => {
		if (countdownRef.current) {
			window.clearInterval(countdownRef.current);
			countdownRef.current = null;
		}
	}, []);

	const startCountdown = useCallback((seconds: number) => {
		clearCountdown();
		setCountdown(seconds);

		countdownRef.current = window.setInterval(() => {
			setCountdown(previous => {
				if (previous <= 1) {
					return 0;
				}
				return previous - 1;
			});
		}, 1000);
	}, [clearCountdown]);

	// Auto-fire retry when countdown reaches 0 (server mode only)
	useEffect(() => {
		if (!isServerMode || !open || countdown !== 0 || checking) {
			return;
		}

		const fireAutoRetry = async () => {
			clearCountdown();
			setChecking(true);
			try {
				await onRetry();
			} finally {
				setChecking(false);
				// Advance attempt and schedule next backoff
				const nextAttempt = attemptRef.current + 1;
				attemptRef.current = nextAttempt;
				setAttempt(nextAttempt);
				startCountdown(getBackoffSeconds(nextAttempt));
			}
		};

		void fireAutoRetry();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [countdown, isServerMode, open]);

	// Start/stop countdown when modal opens/closes/mode changes
	useEffect(() => {
		if (open && isServerMode) {
			attemptRef.current = 0;
			setAttempt(0);
			startCountdown(getBackoffSeconds(0));
		} else {
			clearCountdown();
			setChecking(false);
		}

		return clearCountdown;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, isServerMode]);

	// ── Manual retry (Check Now) ──────────────────────────────────────────────
	const handleManualRetry = async () => {
		clearCountdown();
		setChecking(true);
		try {
			await onRetry();
		} finally {
			setChecking(false);
			const nextAttempt = attemptRef.current + 1;
			attemptRef.current = nextAttempt;
			setAttempt(nextAttempt);
			if (isServerMode) {
				startCountdown(getBackoffSeconds(nextAttempt));
			}
		}
	};

	// ── Content ───────────────────────────────────────────────────────────────
	const accentColor = isServerMode ? '#F59E0B' : '#EF4444';
	const accentBg   = isServerMode ? 'rgba(245,158,11,0.10)' : 'rgba(239,68,68,0.09)';
	const accentRing = isServerMode ? 'rgba(245,158,11,0.22)' : 'rgba(239,68,68,0.18)';
	const gradientBg = isServerMode
		? 'linear-gradient(160deg, rgba(245,158,11,0.06) 0%, transparent 50%)'
		: 'linear-gradient(160deg, rgba(239,68,68,0.06) 0%, transparent 50%)';

	const resolvedTitle = title || (isServerMode ? 'Server Unavailable' : 'No Internet Connection');
	const resolvedDescription = description || (isServerMode
		? 'We are having trouble connecting to our servers.\nPlease try again in a few moments.'
		: 'It looks like you are offline. Please check your\ninternet connection and try again.');

	const resolvedActionLabel = actionLabel || (isServerMode ? 'Check Now' : 'Try Again');
	const resolvedSecondaryLabel = secondaryLabel || 'Retry';

	return (
		<Dialog
			open={open}
			TransitionComponent={Transition}
			PaperProps={{
				elevation: 0,
				className: "bg-transparent shadow-none overflow-visible w-full max-w-md mx-4 rounded-none",
				sx: { background: 'transparent', boxShadow: 'none' } // Keep minimal sx for Dialog specific overrides
			}}
			slotProps={{
				backdrop: {
					className: "bg-slate-900/40 backdrop-blur-md",
				},
			}}
		>
			<DialogContent className="p-0 overflow-visible rounded-none">
				{/* ── Card ── */}
				<div className="relative bg-white/90 backdrop-blur-xl shadow-2xl border border-slate-200/50 rounded-none overflow-hidden">
					{/* Gradient tint overlay */}
					<div 
						className="absolute inset-0 pointer-events-none opacity-50"
						style={{ background: gradientBg }} 
					/>

					{/* Close × button */}
					{onClose && (
						<button
							onClick={onClose}
							aria-label="Dismiss"
							className="absolute top-4 right-4 w-8 h-8 rounded-none border border-slate-200/50 bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 flex items-center justify-center text-sm transition-all z-10"
						>
							✕
						</button>
					)}

					{/* Body */}
					<div className="flex flex-col items-center px-6 sm:px-8 pt-10 pb-8 relative z-0">
						{/* Icon box */}
						<div 
							className={`
								w-24 h-24 rounded-none border-[1.5px] flex items-center justify-center mb-6 relative
								${open ? 'animate-[iconPop_0.4s_cubic-bezier(0.34,1.56,0.64,1)_both]' : ''}
							`}
							style={{ background: accentBg, borderColor: accentRing }}
						>
							{isServerMode
								? <ServerOffIcon size={48} color={accentColor} />
								: <WifiOffIcon size={48} color={accentColor} />
							}
						</div>

						{/* Title */}
						<h2 className="font-extrabold text-[1.4rem] text-slate-900 tracking-tight text-center mb-3">
							{resolvedTitle}
						</h2>

						{/* Description */}
						<p className="text-slate-500 text-[0.95rem] leading-relaxed text-center whitespace-pre-line max-w-[320px] mb-6">
							{resolvedDescription}
						</p>

						{/* Details / error pill */}
						{details && (
							<div 
								className="px-4 py-2 rounded-none border mb-6 max-w-full"
								style={{ background: accentBg, borderColor: accentRing }}
							>
								<p className={`text-[0.85rem] font-semibold text-center ${isServerMode ? 'text-amber-800' : 'text-rose-800'}`}>
									{details}
								</p>
							</div>
						)}

						{/* ── Server mode: countdown bar + auto-retry status ── */}
						{isServerMode && (
							<div className="w-full flex items-center gap-3 mb-6 px-4 py-3 rounded-none bg-slate-100/80 border border-slate-200/50">
								{checking
									? <SpinnerCircle color="#F59E0B" />
									: <PulsingDot color="#F59E0B" />
								}
								<span className="text-[0.9rem] text-slate-600 font-semibold">
									{checking
										? 'Checking connection…'
										: `Trying to reconnect in ${countdown}s…`
									}
								</span>
								{attempt > 0 && (
									<span className="ml-auto text-[0.8rem] text-slate-400 font-medium shrink-0">
										Attempt {attempt + 1}
									</span>
								)}
							</div>
						)}

						{/* ── Buttons ── */}
						<div className="w-full flex flex-col sm:flex-row gap-3">
							{(isServerMode ? onClose : true) && (
								<button
									onClick={isServerMode ? onClose : handleManualRetry}
									className="flex-1 py-3 px-4 rounded-none border border-slate-300 bg-transparent text-slate-700 font-bold text-[0.95rem] hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center justify-center gap-2"
								>
									{!isServerMode && <RefreshIcon size={16} />}
									{resolvedSecondaryLabel}
								</button>
							)}
							<button
								onClick={handleManualRetry}
								disabled={checking}
								className={`
									flex-1 py-3 px-4 rounded-none font-bold text-[0.95rem] text-white flex items-center justify-center gap-2 transition-all shadow-lg
									${checking ? 'opacity-80 cursor-not-allowed' : 'hover:shadow-xl hover:-translate-y-0.5'}
								`}
								style={{
									background: isServerMode 
										? 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)' 
										: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
									boxShadow: isServerMode 
										? '0 8px 20px -4px rgba(245,158,11,0.4)' 
										: '0 8px 20px -4px rgba(59,130,246,0.4)',
								}}
							>
								{checking ? 'Checking…' : (
									<>
										{!isServerMode && (
											<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
												<path d="M5 12.55a11 11 0 0 1 14.08 0" />
												<path d="M1.42 9a16 16 0 0 1 21.16 0" />
												<path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
												<circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
											</svg>
										)}
										{isServerMode && <RefreshIcon size={16} />}
										{resolvedActionLabel}
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default OfflineModal;
