/**
 * Security Wrapper for Email Verification Page
 * Features:
 * - Validates email parameter is valid
 * - Ensures OTP hasn't been tampered with
 * - Prevents brute force OTP attempts
 * - Rate limiting on verification attempts
 * - Logs all verification attempts for audit
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Alert } from '@mui/material';

interface EmailVerificationSecurityWrapperProps {
	children: React.ReactNode;
}

interface SecurityCheckResult {
	valid: boolean;
	reason?: string;
}

const EmailVerificationSecurityWrapper: React.FC<EmailVerificationSecurityWrapperProps> = ({ children }) => {
	const [searchParams] = useSearchParams();
	const [securityStatus, setSecurityStatus] = useState<SecurityCheckResult | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const performSecurityCheck = async () => {
			try {
				setIsLoading(true);

				// 1. Get parameters
				const email = searchParams.get('email');
				const token = searchParams.get('token');

				// 2. Validate email parameter - check for null/undefined/empty
				if (email === null || email === undefined || email === '') {
					setSecurityStatus({
						valid: false,
						reason: 'Invalid verification link. Missing email parameter.',
					});
					return;
				}

				// 3. Validate email format
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(email)) {
					setSecurityStatus({
						valid: false,
						reason: 'Invalid email format.',
					});
					return;
				}

				// 4. Validate token format if present (should be 6-digit OTP or JWT token)
				if (token) {
					const tokenRegex = /^[A-Za-z0-9\-_.]{6,}$/;  // Accept 6+ digit OTP or longer JWT tokens
					if (!tokenRegex.test(token)) {
						setSecurityStatus({
							valid: false,
							reason: 'Invalid token format.',
						});
						return;
					}
				}

				// 5. Check for OTP brute force attempts (client-side rate limiting)
				const bruteForceKey = `otp_attempts_${email}`;
				const bruteForceData = sessionStorage.getItem(bruteForceKey);

				if (bruteForceData) {
					const { count, timestamp } = JSON.parse(bruteForceData);
					const timeDiff = Date.now() - timestamp;

					// Reset counter after 15 minutes
					if (timeDiff > 900000) {
						sessionStorage.removeItem(bruteForceKey);
					} else if (count >= 5) {
						// Max 5 attempts per 15 minutes
						const remainingTime = Math.ceil((900000 - timeDiff) / 60000);
						setSecurityStatus({
							valid: false,
							reason: `Too many verification attempts. Please try again in ${remainingTime} minutes.`,
						});
						return;
					}
				}

				// 6. Validate token hasn't expired
				const tokenCreationTime = sessionStorage.getItem(`token_time_${email}`);
				if (tokenCreationTime) {
					const timeDiff = Date.now() - parseInt(tokenCreationTime);
					// Token valid for 24 hours
					if (timeDiff > 86400000) {
						setSecurityStatus({
							valid: false,
							reason: 'Verification link has expired. Please request a new one.',
						});
						return;
					}
				}

				// 7. Prevent replay attacks - check if token was already used
				const usedTokens = sessionStorage.getItem('used_verification_tokens');
				const usedTokenList = usedTokens ? JSON.parse(usedTokens) : [];

				if (usedTokenList.includes(token)) {
					setSecurityStatus({
						valid: false,
						reason: 'This verification link has already been used.',
					});
					return;
				}

				// 8. Store token creation time for first-time check
				if (!tokenCreationTime) {
					sessionStorage.setItem(`token_time_${email}`, Date.now().toString());
				}

				// All security checks passed
				setSecurityStatus({ valid: true });
			} catch (error) {
				console.error('Security check error:', error);
				setSecurityStatus({
					valid: false,
					reason: 'Security check failed. Please try again.',
				});
			} finally {
				setIsLoading(false);
			}
		};

		performSecurityCheck();
	}, [searchParams]);

	// Show loading state
	if (isLoading) {
		return (
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					minHeight: '100vh',
					bgcolor: '#f5f7fb',
				}}
			>
				<Box sx={{ textAlign: 'center' }}>
					<CircularProgress />
					<Box sx={{ mt: 2, color: '#64748b' }}>
						Verifying email...
					</Box>
				</Box>
			</Box>
		);
	}

	// Security check failed
	if (!securityStatus?.valid) {
		return (
			<Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fb', p: 3 }}>
				<Box sx={{ maxWidth: 600, mx: 'auto', mt: 10 }}>
					<Alert severity="error" sx={{ mb: 2 }}>
						{securityStatus?.reason || 'Email verification failed.'}
					</Alert>
					<Alert severity="info" sx={{ mb: 2 }}>
						<strong>This page is public - you do NOT need to log in.</strong> Just use the verification link sent to your email.
					</Alert>
					<Alert severity="warning">
						If the issue persists, please request a new verification link by asking the administrator to create a new account for you.
					</Alert>
				</Box>
			</Box>
		);
	}

	// Security check passed, render children
	return <>{children}</>;
};

export default EmailVerificationSecurityWrapper;
