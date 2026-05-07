/**
 * Public Email Verification Page
 * Users receive an email link and verify OTP + set password here
 * Path: /verify-email?email=user@example.com&token=xyz
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Stack,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Container,
} from '@mui/material';
import { CheckCircle, ErrorOutline } from '@mui/icons-material';
import api from '../../utils/api';
import { toastNotify } from '../../pages/admin/utils/toastNotify';

type VerificationStep = 'otp' | 'password' | 'complete';

export const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const email = searchParams.get('email') || '';
  const tokenParam = searchParams.get('token') || '';

  // If token is present in URL (admin-created user flow), skip OTP step
  // and go directly to password setup. The combined endpoint handles OTP verification.
  const [step, setStep] = useState<VerificationStep>(tokenParam ? 'password' : 'otp');
  
  // OTP step (only used for self-registered users without a token in URL)
  const [otp, setOtp] = useState(tokenParam);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  
  // Password step
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Track failed OTP attempts
  const trackFailedAttempt = (email: string) => {
    const bruteForceKey = `otp_attempts_${email}`;
    const bruteForceData = sessionStorage.getItem(bruteForceKey);
    
    if (bruteForceData) {
      const { count, timestamp } = JSON.parse(bruteForceData);
      const timeDiff = Date.now() - timestamp;
      
      if (timeDiff > 900000) {
        sessionStorage.setItem(bruteForceKey, JSON.stringify({ count: 1, timestamp: Date.now() }));
      } else {
        sessionStorage.setItem(bruteForceKey, JSON.stringify({ count: count + 1, timestamp }));
      }
    } else {
      sessionStorage.setItem(bruteForceKey, JSON.stringify({ count: 1, timestamp: Date.now() }));
    }
  };

  useEffect(() => {
    if (!email) {
      setOtpError('Invalid verification link. Email address is missing.');
    }
  }, [email]);

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setOtpError('Please enter the OTP');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      const response = await api.post('/auth/verify-email', {
        email,
        otp: otp.trim(),
      });

      if (response.data.status === 'success') {
        toastNotify.success('OTP verified successfully!', 'Moving to password setup');
        setStep('password');
      } else {
        trackFailedAttempt(email);
        setOtpError(response.data.message || 'Failed to verify OTP');
      }
    } catch (err: any) {
      trackFailedAttempt(email);
      const message = err.response?.data?.message || err.message || 'Failed to verify OTP';
      setOtpError(message);
      toastNotify.error(message, 'OTP Verification Failed');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSetPassword = async () => {
    // Validate passwords
    if (!password.trim()) {
      setPasswordError('Please enter a password');
      return;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');

    try {
      const response = await api.post('/auth/verify-email-and-set-password', {
        email,
        otp: otp.trim(),
        password,
      });

      if (response.data.status === 'success') {
        toastNotify.success('Email verified and password set!', 'You can now log in');
        setStep('complete');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/user/login');
        }, 3000);
      } else {
        setPasswordError(response.data.message || 'Failed to set password');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to set password';
      setPasswordError(message);
      toastNotify.error(message, 'Password Setup Failed');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Stack spacing={3}>
            {/* Header */}
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600, textAlign: 'center' }}>
              Verify Your Email
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
              Completing setup for: <strong>{email}</strong>
            </Typography>

            {/* Stepper */}
            <Stepper activeStep={step === 'complete' ? 2 : step === 'password' ? 1 : 0}>
              <Step>
                <StepLabel>Verify OTP</StepLabel>
              </Step>
              <Step>
                <StepLabel>Set Password</StepLabel>
              </Step>
              <Step>
                <StepLabel>Complete</StepLabel>
              </Step>
            </Stepper>

            {/* OTP Step */}
            {step === 'otp' && (
              <Stack spacing={2}>
                {otpError && (
                  <Alert severity="error" icon={<ErrorOutline />}>
                    {otpError}
                  </Alert>
                )}

                <TextField
                  label="Enter OTP"
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setOtpError('');
                  }}
                  placeholder="6-digit code from your email"
                  fullWidth
                  disabled={otpLoading}
                  variant="outlined"
                />

                <Button
                  onClick={handleVerifyOTP}
                  variant="contained"
                  fullWidth
                  disabled={otpLoading || !otp.trim()}
                  startIcon={otpLoading ? <CircularProgress size={20} /> : undefined}
                >
                  {otpLoading ? 'Verifying...' : 'Verify OTP'}
                </Button>
              </Stack>
            )}

            {/* Password Step */}
            {step === 'password' && (
              <Stack spacing={2}>
                {passwordError && (
                  <Alert severity="error" icon={<ErrorOutline />}>
                    {passwordError}
                  </Alert>
                )}

                <TextField
                  label="Create Password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="At least 8 characters"
                  fullWidth
                  disabled={passwordLoading}
                  variant="outlined"
                />

                <TextField
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Re-enter your password"
                  fullWidth
                  disabled={passwordLoading}
                  variant="outlined"
                />

                <Button
                  onClick={handleSetPassword}
                  variant="contained"
                  fullWidth
                  disabled={passwordLoading || !password.trim() || !confirmPassword.trim()}
                  startIcon={passwordLoading ? <CircularProgress size={20} /> : undefined}
                >
                  {passwordLoading ? 'Setting up...' : 'Complete Setup'}
                </Button>
              </Stack>
            )}

            {/* Complete Step */}
            {step === 'complete' && (
              <Stack spacing={2} sx={{ textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 64, color: 'success.main', mx: 'auto' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                  Email Verified!
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Your email has been verified by you. Redirecting to login...
                </Typography>
                <CircularProgress sx={{ mx: 'auto', mt: 2 }} />
              </Stack>
            )}
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default EmailVerificationPage;
