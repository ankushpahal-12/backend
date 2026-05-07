import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box,
    Stack
} from '@mui/material';
import { Warning as WarningIcon, Devices as DevicesIcon, Close as CloseIcon } from '@mui/icons-material';
import Button from '../ui/Button';

interface ConcurrentSessionModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    activeSessionsCount: number;
}

const ConcurrentSessionModal = ({ open, onClose, onConfirm, activeSessionsCount }: ConcurrentSessionModalProps) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    p: 2,
                    maxWidth: 400,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                }
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
                <Box sx={{
                    width: 64,
                    height: 64,
                    bgcolor: 'rgba(255, 153, 0, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    mb: 2
                }}>
                    <WarningIcon sx={{ color: '#ff9900', fontSize: 32 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Active Session Detected
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    You are already logged in on {activeSessionsCount > 1 ? `${activeSessionsCount} other devices` : 'another device'}.
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Would you like to start a new session here and logout from all other locations?
                </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Stack spacing={2} sx={{ width: '100%' }}>
                    <Button
                        fullWidth
                        variant="contained"
                        gradient
                        onClick={onConfirm}
                        startIcon={<DevicesIcon />}
                    >
                        Use Here & Logout Others
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={onClose}
                        startIcon={<CloseIcon />}
                        sx={{ color: 'text.secondary', borderColor: 'divider' }}
                    >
                        Logout from this tab
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

export default ConcurrentSessionModal;
