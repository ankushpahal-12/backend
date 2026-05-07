import { Card as MuiCard, type CardProps, styled, alpha } from '@mui/material';

const StyledCard = styled(MuiCard)(({ theme }) => ({
    borderRadius: 24,
    boxShadow: theme.palette.mode === 'dark' 
        ? '0 20px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)' 
        : '0 20px 40px -10px rgba(0, 0, 0, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)',
    border: 'none', // Removed solid border for inset shadow & precise border trick
    position: 'relative',
    backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.2 : 0.45),
    backdropFilter: 'blur(40px) saturate(1.5)',
    overflow: 'visible',
    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
    '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: 24,
        padding: '1px',
        background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        pointerEvents: 'none',
    },
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.palette.mode === 'dark' 
            ? '0 30px 60px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)' 
            : '0 30px 60px -12px rgba(99, 102, 241, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
    }
}));

const Card = ({ children, ...props }: CardProps) => {
    return (
        <StyledCard {...props}>
            {children}
        </StyledCard>
    );
};

export default Card;
