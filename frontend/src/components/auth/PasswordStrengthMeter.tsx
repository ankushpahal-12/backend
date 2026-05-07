import { useMemo } from 'react';
import { Box, Typography, alpha, Stack } from '@mui/material';
import { CheckCircleOutline, Cancel } from '@mui/icons-material';

interface PasswordStrengthMeterProps {
    password: string;
    showRules?: boolean;
}

interface Rule {
    label: string;
    test: (pw: string) => boolean;
}

const RULES: Rule[] = [
    { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
    { label: 'Uppercase letter (A-Z)', test: (pw) => /[A-Z]/.test(pw) },
    { label: 'Lowercase letter (a-z)', test: (pw) => /[a-z]/.test(pw) },
    { label: 'Number (0-9)', test: (pw) => /[0-9]/.test(pw) },
    { label: 'Special character (!@#$...)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

const STRENGTH_LABELS = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const STRENGTH_COLORS = ['#EF4444', '#F97316', '#FBBF24', '#34D399', '#10B981'];

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password, showRules = true }) => {
    const { score, passed } = useMemo(() => {
        const results = RULES.map((r) => r.test(password));
        return { score: results.filter(Boolean).length, passed: results };
    }, [password]);

    if (!password) return null;

    const pct = (score / RULES.length) * 100;
    const color = STRENGTH_COLORS[score - 1] || STRENGTH_COLORS[0];
    const label = STRENGTH_LABELS[score - 1] || STRENGTH_LABELS[0];

    return (
        <Box sx={{ mt: 1.5 }}>
            {/* Progress Bar */}
            <Box sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: alpha('#FFF', 0.06),
                overflow: 'hidden',
                mb: 1
            }}>
                <Box sx={{
                    height: '100%',
                    width: `${pct}%`,
                    bgcolor: color,
                    borderRadius: 2,
                    transition: 'width 0.4s ease, background-color 0.4s ease',
                }} />
            </Box>

            {/* Label */}
            <Typography variant="caption" sx={{ fontWeight: 700, color, mb: 1, display: 'block' }}>
                {label}
            </Typography>

            {/* Rules Checklist */}
            {showRules && (
                <Stack spacing={0.5}>
                    {RULES.map((rule, i) => (
                        <Stack key={i} direction="row" spacing={1} alignItems="center">
                            {passed[i]
                                ? <CheckCircleOutline sx={{ fontSize: 14, color: '#10B981' }} />
                                : <Cancel sx={{ fontSize: 14, color: alpha('#FFF', 0.2) }} />
                            }
                            <Typography variant="caption" sx={{
                                color: passed[i] ? 'text.secondary' : alpha('#FFF', 0.3),
                                fontWeight: passed[i] ? 600 : 400,
                                fontSize: '0.7rem',
                            }}>
                                {rule.label}
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
            )}
        </Box>
    );
};

export default PasswordStrengthMeter;
