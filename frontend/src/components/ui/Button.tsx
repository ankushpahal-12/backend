import { Button as MuiButton, type ButtonProps as MuiButtonProps, styled } from '@mui/material';

interface CustomButtonProps extends MuiButtonProps {
    gradient?: boolean;
}

const StyledButton = styled(MuiButton, {
    shouldForwardProp: (prop) => prop !== 'gradient',
})<CustomButtonProps>(({ theme, gradient, variant, color }) => ({
    borderRadius: 12,
    padding: '10px 24px',
    boxShadow: 'none',
    fontSize: '0.9375rem',
    transition: 'all 0.2s ease-in-out',

    '&:hover': {
        boxShadow: variant === 'contained' ? `0 8px 16px -4px ${theme.palette.primary.main}40` : 'none',
        transform: 'translateY(-1px)',
    },

    '&:active': {
        transform: 'translateY(0)',
    },

    ...(gradient && variant === 'contained' && color === 'primary' && {
        background: 'linear-gradient(135deg, #0061FF 0%, #60A5FA 100%)',
        '&:hover': {
            background: 'linear-gradient(135deg, #0056E0 0%, #4B91E2 100%)',
        },
    }),
}));

const Button = ({ children, ...props }: CustomButtonProps) => {
    return (
        <StyledButton {...props}>
            {children}
        </StyledButton>
    );
};

export default Button;
