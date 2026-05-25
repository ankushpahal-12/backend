import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Typography,
    styled,
    alpha
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { ReactNode } from 'react';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-container': {
        justifyContent: 'center',
        alignItems: 'center',
    },
    '& .MuiDialog-paper': {
        borderRadius: 24,
        padding: theme.spacing(1),
        margin: theme.spacing(2),
        width: 'calc(100% - 32px)',
        maxHeight: 'calc(100% - 32px)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        overflow: 'hidden',
    },
}));

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    actions?: ReactNode;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    fullWidth?: boolean;
}

const Modal = ({
    open,
    onClose,
    title,
    children,
    actions,
    maxWidth = 'sm',
    fullWidth = true
}: ModalProps) => {
    return (
        <StyledDialog
            open={open}
            onClose={onClose}
            maxWidth={maxWidth}
            fullWidth={fullWidth}
            scroll="paper"
        >
            {title && (
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                        {title}
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
            )}
            <DialogContent sx={{ p: title ? 2 : 3 }}>
                {children}
            </DialogContent>
            {actions && (
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    {actions}
                </DialogActions>
            )}
        </StyledDialog>
    );
};

export default Modal;
