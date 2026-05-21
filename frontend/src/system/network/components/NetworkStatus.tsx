import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useSocket } from '../../../context/useSocket';
import { useConnectionSpeed,
	useHeartbeat, 
	useNetworkStatus,
	useRetryQueue }
	from '../hooks/useNetworkGlobal';
import OfflineModal from './OfflineModal';
import ReconnectToast from './ReconnectToast';
import SlowInternetBanner from './SlowInternetBanner';

const NetworkStatus: React.FC = () => {
	const { isConnected } = useSocket();
	const network = useNetworkStatus();
	const connection = useConnectionSpeed();
	const heartbeat = useHeartbeat();
	const retryQueue = useRetryQueue();

	const [offlineModalDismissed, setOfflineModalDismissed] = useState(false);
	const [toastState, setToastState] = useState<{ open: boolean; title: string; message?: string; tone: 'network' | 'backend' | 'websocket' }>({
		open: false,
		title: '',
		message: '',
		tone: 'network',
	});
	const [bannerVisible, setBannerVisible] = useState(true);

	const previousState = useRef({
		isOnline: network.isOnline,
		backendHealthy: heartbeat.backendHealthy,
		socketConnected: isConnected,
	});

	const modalMode = useMemo(() => {
		if (!network.isOnline) {
			return 'offline' as const;
		}

		if (!heartbeat.backendHealthy && !isConnected) {
			return 'server' as const;
		}

		return null;
	}, [heartbeat.backendHealthy, isConnected, network.isOnline]);

	const showOfflineModal = Boolean(modalMode) && !offlineModalDismissed;
	const showSlowBanner = connection.isSlow && network.isOnline && bannerVisible;

	useEffect(() => {
		const previous = previousState.current;

		if (!previous.isOnline && network.isOnline) {
			setToastState({
				open: true,
				title: 'You are back online',
				message: 'Network access has been restored. Syncing queued actions now.',
				tone: 'network',
			});
			setOfflineModalDismissed(false);
		}

		if (!previous.backendHealthy && heartbeat.backendHealthy) {
			setToastState({
				open: true,
				title: 'Server connection restored',
				message: 'The backend is responding again. Pending changes are being replayed.',
				tone: 'backend',
			});
		}

		if (!previous.socketConnected && isConnected) {
			setToastState({
				open: true,
				title: 'Realtime connection restored',
				message: 'WebSocket is connected and live updates are active again.',
				tone: 'websocket',
			});
		}

		previousState.current = {
			isOnline: network.isOnline,
			backendHealthy: heartbeat.backendHealthy,
			socketConnected: isConnected,
		};
	}, [heartbeat.backendHealthy, isConnected, network.isOnline]);

	useEffect(() => {
		if (network.isOnline && heartbeat.backendHealthy) {
			void retryQueue.flush();
		}
	}, [heartbeat.backendHealthy, network.isOnline]);

	const handleRetry = async () => {
		setOfflineModalDismissed(false);
		heartbeat.refreshHeartbeat();
		await retryQueue.flush();
	};

	return (
		<Box aria-live="polite" aria-atomic="true" sx={{ position: 'relative', zIndex: theme => theme.zIndex.snackbar }}>
			<OfflineModal
				open={showOfflineModal}
				mode={modalMode || 'offline'}
				onRetry={handleRetry}
				onClose={() => setOfflineModalDismissed(true)}
				actionLabel={network.isOnline ? 'Check again' : 'Retry connection'}
				secondaryLabel="Continue offline"
				details={heartbeat.errorMessage || (retryQueue.queueLength > 0 ? `${retryQueue.queueLength} action${retryQueue.queueLength === 1 ? '' : 's'} waiting to sync.` : undefined)}
			/>

			<ReconnectToast
				open={toastState.open}
				title={toastState.title}
				message={toastState.message}
				tone={toastState.tone}
				onClose={() => setToastState(previous => ({ ...previous, open: false }))}
			/>

			<SlowInternetBanner
				open={showSlowBanner}
				connection={connection}
				onDismiss={() => setBannerVisible(false)}
			/>
		</Box>
	);
};

export default NetworkStatus;
