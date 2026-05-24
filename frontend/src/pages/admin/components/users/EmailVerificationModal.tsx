/**
 * EmailVerificationModal Component
 * Combines OTP verification and password setup for newly created users
 */

import { useEffect, useState } from 'react';
import { Button, Stack, Alert, CircularProgress, TextField, Box, Typography, Stepper, Step, StepLabel } from '@mui/material';
import Modal from '../../../../components/ui/modal';
import { useVerifyEmailOTP } from '../../hooks/useVerifyEmailOTP';
import { useSetPassword } from '../../hooks/useSetPassword';
import type { User } from '../../hooks/useUserManagement';

interface EmailVerificationModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  userEmail?: string;
}

type VerificationStep = 'otp' | 'password' | 'complete';

const EmailVerificationModal = ({ open, onClose, user, userEmail }: EmailVerificationModalProps) => {
  const [step, setStep] = useState<VerificationStep>('otp');
  const otpHook = useVerifyEmailOTP();
  const passwordHook = useSetPassword();

  // Reset when modal closes - only depend on 'open' flag
  useEffect(() => {
    if (!open) {
      otpHook.reset();
      passwordHook.reset();
      setStep('otp');
    }
  }, [open]); // FIXED: Only depend on 'open', not the hook objects

  const email = userEmail || user?.email || '';

  const handleVerifyOTP = async () => {
    const verified = await otpHook.verifyOTP(email);
    if (verified) {
      setStep('password');
    }
  };

  const handleSetPassword = async () => {
    if (!otpHook.userId) {
      return;
    }
    const success = await passwordHook.setPassword(otpHook.userId);
    if (success) {
      setStep('complete');
    }
  };

  const handleComplete = () => {
    onClose();
  };

  const getStepLabel = (stepName: VerificationStep): string => {
    switch (stepName) {
      case 'otp':
        return 'Verify Email';
      case 'password':
        return 'Set Password';
      case 'complete':
        return 'Complete';
      default:
        return '';
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Account Verification & Setup"
      maxWidth="sm"
      actions={
        <Stack direction="row" spacing={1.5} sx={{ width: '100%', justifyContent: 'flex-end' }}>
          {step !== 'complete' && (
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{ textTransform: 'none' }}
              disabled={otpHook.loading || passwordHook.loading}
            >
              Cancel
            </Button>
          )}
          {step === 'otp' && (
            <Button
              onClick={handleVerifyOTP}
              variant="contained"
              sx={{ textTransform: 'none' }}
              disabled={otpHook.loading || !otpHook.otp}
              startIcon={otpHook.loading ? <CircularProgress size={18} /> : undefined}
            >
              {otpHook.loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          )}
          {step === 'password' && (
            <Button
              onClick={handleSetPassword}
              variant="contained"
              sx={{ textTransform: 'none' }}
              disabled={passwordHook.loading || !passwordHook.password}
              startIcon={passwordHook.loading ? <CircularProgress size={18} /> : undefined}
            >
              {passwordHook.loading ? 'Setting...' : 'Set Password'}
            </Button>
          )}
          {step === 'complete' && (
            <Button
              onClick={handleComplete}
              variant="contained"
              sx={{ textTransform: 'none' }}
            >
              Close
            </Button>
          )}
        </Stack>
      }
    >
      <Stack spacing={3} sx={{ pt: 2 }}>
        {/* Stepper */}
        <Stepper activeStep={step === 'otp' ? 0 : step === 'password' ? 1 : 2}>
          <Step>
            <StepLabel>Verify Email</StepLabel>
          </Step>
          <Step>
            <StepLabel>Set Password</StepLabel>
          </Step>
          <Step>
            <StepLabel>Complete</StepLabel>
          </Step>
        </Stepper>

        {/* OTP Verification Step */}
        {step === 'otp' && (
          <Stack spacing={2}>
            <Alert severity="info">
              An OTP has been sent to <strong>{email}</strong>. Enter it below to verify your email.
            </Alert>

            {otpHook.error && <Alert severity="error">{otpHook.error}</Alert>}

            <TextField
              label="Verification Code (6 digits)"
              value={otpHook.otp}
              onChange={(e) => otpHook.setOTP(e.target.value)}
              fullWidth
              placeholder="000000"
              disabled={otpHook.loading}
              inputProps={{
                maxLength: 6,
                pattern: '[0-9]*',
              }}
              error={!!otpHook.error}
            />

            <Alert severity="warning">
              The OTP expires in 10 minutes. If you don't receive it, check your spam folder.
            </Alert>
          </Stack>
        )}

        {/* Password Setup Step */}
        {step === 'password' && (
          <Stack spacing={2}>
            <Alert severity="success">
              Email verified successfully! Now set your account password.
            </Alert>

            {passwordHook.firstError && <Alert severity="error">{passwordHook.firstError}</Alert>}

            <TextField
              label="Password"
              type="password"
              value={passwordHook.password}
              onChange={(e) => passwordHook.setField('password', e.target.value)}
              fullWidth
              placeholder="At least 8 characters"
              disabled={passwordHook.loading}
              error={!!passwordHook.getFieldError('password')}
              helperText={passwordHook.getFieldError('password')}
            />

            <TextField
              label="Confirm Password"
              type="password"
              value={passwordHook.confirmPassword}
              onChange={(e) => passwordHook.setField('confirmPassword', e.target.value)}
              fullWidth
              placeholder="Re-enter your password"
              disabled={passwordHook.loading}
              error={!!passwordHook.getFieldError('confirmPassword')}
              helperText={passwordHook.getFieldError('confirmPassword')}
            />

            <Box sx={{ fontSize: '12px', color: '#64748B', lineHeight: 1.6 }}>
              <strong>Password requirements:</strong>
              <ul style={{ margin: '8px 0 0 16px' }}>
                <li>At least 8 characters</li>
                <li>Mix of letters and numbers</li>
                <li>At least one special character</li>
              </ul>
            </Box>
          </Stack>
        )}

        {/* Complete Step */}
        {step === 'complete' && (
          <Stack spacing={2} alignItems="center" sx={{ py: 2 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
                fontSize: '24px',
              }}
            >
              ✓
            </Box>

            <Typography variant="h6" sx={{ textAlign: 'center' }}>
              Account Setup Complete!
            </Typography>

            <Alert severity="success">
              Your account has been successfully activated. You can now log in with your email and password.
            </Alert>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
};

export default EmailVerificationModal;
