import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Maximize, Mail, Lock, RefreshCw } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAttempt } from '../hooks/useAttempt';
import { useTimer } from '../hooks/useTimer';
import { useAntiCheat } from '../hooks/useAntiCheat';
import { AttemptLayout } from '../components/AttemptLayout';
import { AttemptModal, type ModalType } from '../components/AttemptModal';
import { useThemeContext } from '../../../../context/ThemeContext';
import { getQuestionStatusArray } from '../utils/attemptHelpers';
import { previewTest } from '../services/attemptApi';
import toast from 'react-hot-toast';
import axios from 'axios';

export const AttemptPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const { mode } = useThemeContext();
  const isLightMode = mode === 'light';

  const { 
    test, attempt, answers, reviewFlags, visitedQuestions, 
    startAttempt, saveAnswer, submitTest, toggleReviewFlag, markVisited 
  } = useAttempt();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: ModalType; message?: string }>({ 
    isOpen: false, type: 'submit' 
  });
  
  const [lobbyState, setLobbyState] = useState<'loading' | 'preview' | 'countdown' | 'started'>('loading');
  const [previewData, setPreviewData] = useState<any>(null);
  const [countdown, setCountdown] = useState(10);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  
  // Email verification modal state - OTP based flow
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [emailVerifyStep, setEmailVerifyStep] = useState<'email' | 'otp'>('email');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verificationId, setVerificationId] = useState<string>('');
  const [otpInput, setOtpInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [otpExpiry, setOtpExpiry] = useState<number>(0);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  const startTimeRef = useRef(Date.now());

  const handleTimeUp = useCallback(async () => {
    setModalState({ isOpen: true, type: 'timeout' });
    await submitTest();
    navigate(`/attempt/result/${attempt?._id}`);
  }, [submitTest, navigate, attempt?._id]);

  const { timeLeft, isWarning, startTimer, stopTimer } = useTimer(test?.durationMinutes ? test.durationMinutes * 60 : 0, handleTimeUp);

  const handleViolation = useCallback((type: string) => {
    let msg = '';
    if (type === 'tab_switch') msg = 'You switched tabs or minimized the window. This has been recorded.';
    if (type === 'right_click') msg = 'Right-clicking is disabled during the test.';
    if (type === 'copy_paste') msg = 'Copying and pasting is disabled during the test.';
    
    setModalState({ isOpen: true, type: 'warning', message: msg });
  }, []);

  const { startAntiCheat, stopAntiCheat } = useAntiCheat(handleViolation);

  useEffect(() => {
    if (shareToken && lobbyState === 'loading' && !previewData) {
      previewTest(shareToken).then(res => {
        if (res.success && res.data) {
          setPreviewData(res.data);
          
          // Check if user is blocked
          if (res.data.isBlocked) {
            setBlockedMessage(res.data.blockedMessage || 'You have been blocked from this test. Please contact the admin to unblock you.');
            setLobbyState('preview');
          } 
          // Check if email verification is required (private test without authentication)
          else if (res.data.requiresEmailVerification) {
            setShowEmailVerification(true);
            setEmailVerified(false);
            setLobbyState('preview');
          }
          else {
            setLobbyState('preview');
          }
        } else {
          // Even if preview fails, if it's a private test error (403), try to show email verification
          if (res.status === 403 || (res.error && res.error.includes('email'))) {
            // This is likely a private test - try to show email verification anyway
            setPreviewData({ 
              requiresEmailVerification: true,
              visibility: 'private'
            } as any);
            setShowEmailVerification(true);
            setLobbyState('preview');
          } else {
            toast.error(res.error || 'Failed to load test');
            navigate('/dashboard');
          }
        }
      });
    }
  }, [shareToken, lobbyState, previewData, navigate]);

  useEffect(() => {
    if (lobbyState === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setLobbyState('loading');
        if (shareToken) {
          // For unregistered candidates who verified their email, pass the email
          // For authenticated users, the API will use their JWT token instead
          const candidateEmail = verifiedEmail || (verifyEmail && verificationToken ? verifyEmail : undefined);
          console.log('📊 Starting test with:', { 
            verifyEmail, 
            verifiedEmail,
            verificationToken: verificationToken ? 'SET' : 'NOT SET',
            candidateEmail,
            emailVerified 
          });
          startAttempt(shareToken, candidateEmail).then(success => {
            if (success) {
              setLobbyState('started');
            } else {
              navigate('/dashboard');
            }
          });
        }
      }
    }
  }, [lobbyState, countdown, shareToken, startAttempt, navigate, verifyEmail, verificationToken]);

  const handleStartResumeClick = () => {
    // If the candidate has already verified email, allow resume without re-opening the OTP modal
    if (previewData?.requiresEmailVerification && !emailVerified && !previewData?.emailAssigned) {
      setShowEmailVerification(true);
      return;
    }
    
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => console.warn(err));
    }
    setLobbyState('countdown');
  };

  const handleSendOTP = async () => {
    if (!verifyEmail) {
      toast.error('Please enter your email');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await axios.post('/api/v1/email-verification/send-otp', {
        email: verifyEmail,
        testToken: shareToken
      });

      if (response.data.success) {
        setVerificationId(response.data.data.verificationId);
        setOtpExpiry(response.data.data.expiresIn);
        setAttemptsRemaining(5);
        setEmailVerifyStep('otp');
        toast.success('OTP sent to your email!');
      } else {
        toast.error(response.data.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      // Handle specific error cases - show most specific error first
      if (error.response?.status === 403) {
        toast.error('❌ This email is not assigned to this test. Please contact the admin.');
      } else if (error.response?.status === 404) {
        toast.error('Test not found. Please check the link and try again.');
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || 'Invalid email format');
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to send OTP';
        toast.error(errorMsg);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpInput || otpInput.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await axios.post('/api/v1/email-verification/verify-otp', {
        verificationId,
        otp: otpInput
      });

      if (response.data.success) {
        setVerificationToken(response.data.data.verificationToken);
        toast.success('✅ Email verified successfully!', { duration: 3000 });
        setShowEmailVerification(false);
        setEmailVerified(true);
        setVerifiedEmail(verifyEmail); // Store the verified email
        setPreviewData(prev => prev ? {
          ...prev,
          requiresEmailVerification: false,
          emailAssigned: true
        } : prev);
        // Reset form
        setEmailVerifyStep('email');
        setOtpInput('');
      } else {
        toast.error(response.data.message || 'OTP verification failed');
        if (response.data.data?.attemptsRemaining !== undefined) {
          setAttemptsRemaining(response.data.data.attemptsRemaining);
        }
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'OTP verification failed';
      toast.error(errorMsg);
      
      if (error.response?.status === 429) {
        toast.error('Too many attempts. Please request a new OTP.');
        setEmailVerifyStep('email');
      } else if (error.response?.status === 401) {
        if (error.response.data?.expired) {
          setEmailVerifyStep('email');
          toast.error('OTP has expired. Please request a new one.');
        }
        const remaining = error.response.data?.data?.attemptsRemaining;
        if (remaining !== undefined) {
          setAttemptsRemaining(remaining);
        }
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setIsVerifying(true);
    try {
      const response = await axios.post('/api/v1/email-verification/resend-otp', {
        verificationId
      });

      if (response.data.success) {
        setOtpExpiry(response.data.data.expiresIn);
        setAttemptsRemaining(5);
        setOtpInput('');
        toast.success('New OTP sent to your email!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  // OTP expiry timer
  useEffect(() => {
    if (otpExpiry > 0 && emailVerifyStep === 'otp') {
      const timer = setInterval(() => {
        setOtpExpiry(prev => {
          if (prev <= 1) {
            setEmailVerifyStep('email');
            toast.error('OTP has expired. Please request a new one.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpExpiry, emailVerifyStep]);

  useEffect(() => {
    if (test && attempt) {
      startTimer();
      startAntiCheat();
      // Mark first question visited
      if (test.questions.length > 0) {
        markVisited(test.questions[0].id);
      }
    }
    return () => {
      stopTimer();
      stopAntiCheat();
    };
  }, [test, attempt, startTimer, startAntiCheat, markVisited]);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false));
      }
    }
  };

  const handleSelectOption = (optionId: string) => {
    if (!test) return;
    const q = test.questions[currentIndex];
    const currentAns = answers[q.id];
    let newOptions = [optionId];

    if (q.allowMultiple) {
      if (currentAns?.selectedOptions.includes(optionId)) {
        newOptions = currentAns.selectedOptions.filter(id => id !== optionId);
      } else {
        newOptions = [...(currentAns?.selectedOptions || []), optionId];
      }
    }
    
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    startTimeRef.current = Date.now();
    saveAnswer(q.id, newOptions, timeSpent);
  };

  const handleNavigate = (index: number) => {
    if (!test) return;
    setCurrentIndex(index);
    markVisited(test.questions[index].id);
    startTimeRef.current = Date.now();
  };

  const handleSaveAndNext = () => {
    if (!test) return;
    if (currentIndex < test.questions.length - 1) {
      handleNavigate(currentIndex + 1);
    } else {
      setModalState({ isOpen: true, type: 'submit' });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) handleNavigate(currentIndex - 1);
  };

  const handleToggleReview = () => {
    if (!test) return;
    toggleReviewFlag(test.questions[currentIndex].id);
  };

  const handleSubmitConfirm = async () => {
    setModalState({ ...modalState, isOpen: false });
    const success = await submitTest();
    if (success && attempt) {
      navigate(`/attempt/result/${attempt._id}`);
    }
  };

  if (lobbyState === 'loading') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLightMode ? 'bg-slate-50' : 'bg-[#0d1117]'}`}>
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (lobbyState === 'preview' || lobbyState === 'countdown') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${isLightMode ? 'bg-slate-50' : 'bg-[#0d1117]'}`}>
        <div className={`max-w-lg w-full p-8 rounded-3xl shadow-lg border ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#161b22] border-white/10'}`}>
          
          {emailVerified && !showEmailVerification && lobbyState === 'preview' ? (
            // ---- EMAIL VERIFIED SUCCESS VIEW ----
            <div className="space-y-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-emerald-500/20">
                  <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className={`text-2xl font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                Email Verified Successfully! ✅
              </h2>
              <p className={`text-sm ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                Your email has been verified. You're ready to start the test.
              </p>
              
              <div className="pt-6">
                <button 
                  onClick={() => {
                    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                      document.documentElement.requestFullscreen().catch(err => console.warn(err));
                    }
                    setCountdown(10);
                    setLobbyState('countdown');
                  }}
                  className="w-full py-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all"
                >
                  Start Test
                </button>
              </div>
            </div>
          ) : showEmailVerification && !blockedMessage ? (
            // ---- EMAIL VERIFICATION MODAL (OTP Based) ----
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-full ${isLightMode ? 'bg-indigo-50' : 'bg-indigo-500/20'}`}>
                    <Mail className="text-indigo-600" size={32} />
                  </div>
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                  Email Verification Required
                </h2>
                <p className={`text-sm ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  This is a private test. Please verify your email before starting.
                </p>
              </div>

              {emailVerifyStep === 'email' ? (
                // ---- STEP 1: Enter Email ----
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={verifyEmail}
                      onChange={e => setVerifyEmail(e.target.value)}
                      placeholder="your@email.com"
                      className={`w-full px-4 py-3 rounded-xl border outline-none transition-colors ${
                        isLightMode
                          ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                          : 'bg-slate-950 border-white/10 text-white placeholder:text-slate-500'
                      }`}
                      disabled={isVerifying}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendOTP()}
                    />
                  </div>

                  <button
                    onClick={handleSendOTP}
                    disabled={isVerifying || !verifyEmail}
                    className="w-full py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Lock size={18} />
                        Send OTP
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowEmailVerification(false)}
                    disabled={isVerifying}
                    className={`w-full py-3 rounded-xl font-bold border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isLightMode
                        ? 'text-slate-700 border-slate-200 hover:bg-slate-50'
                        : 'text-slate-300 border-white/10 hover:bg-white/5'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                // ---- STEP 2: Enter OTP ----
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${isLightMode ? 'bg-blue-50 border border-blue-200' : 'bg-blue-500/10 border border-blue-500/30'}`}>
                    <p className={`text-sm ${isLightMode ? 'text-blue-800' : 'text-blue-200'}`}>
                      ✓ OTP sent to <span className="font-bold">{verifyEmail}</span>
                    </p>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                      Enter OTP Code (6 digits)
                    </label>
                    <input
                      type="text"
                      value={otpInput}
                      onChange={e => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className={`w-full px-4 py-3 rounded-xl border outline-none transition-colors text-center text-2xl font-mono tracking-widest ${
                        isLightMode
                          ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                          : 'bg-slate-950 border-white/10 text-white placeholder:text-slate-500'
                      }`}
                      disabled={isVerifying}
                      onKeyPress={(e) => e.key === 'Enter' && otpInput.length === 6 && handleVerifyOTP()}
                    />
                    <p className={`text-xs mt-2 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      Attempts remaining: {attemptsRemaining} | Expires in {otpExpiry}s
                    </p>
                  </div>

                  <button
                    onClick={handleVerifyOTP}
                    disabled={isVerifying || otpInput.length !== 6}
                    className="w-full py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Lock size={18} />
                        Verify OTP
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleResendOTP}
                    disabled={isVerifying}
                    className={`w-full py-3 rounded-xl font-bold border transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                      isLightMode
                        ? 'text-indigo-600 border-indigo-200 hover:bg-indigo-50'
                        : 'text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10'
                    }`}
                  >
                    <RefreshCw size={16} />
                    Resend OTP
                  </button>

                  <button
                    onClick={() => {
                      setEmailVerifyStep('email');
                      setOtpInput('');
                    }}
                    disabled={isVerifying}
                    className={`w-full py-3 rounded-xl font-bold border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isLightMode
                        ? 'text-slate-700 border-slate-200 hover:bg-slate-50'
                        : 'text-slate-300 border-white/10 hover:bg-white/5'
                    }`}
                  >
                    Back
                  </button>
                </div>
              )}
            </div>
          ) : (
            // ---- NORMAL PREVIEW ----
            <>
              <h1 className={`text-2xl font-bold mb-2 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{previewData?.title}</h1>
              <p className={`mb-6 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>{previewData?.description || 'Please read the instructions carefully before starting.'}</p>
              
              <div className="space-y-4 mb-8">
                <div className={`flex justify-between pb-4 border-b border-dashed ${isLightMode ? 'border-slate-200' : 'border-white/10'}`}>
                  <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>Category</span>
                  <span className={`font-semibold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{previewData?.category}</span>
                </div>
                <div className={`flex justify-between pb-4 border-b border-dashed ${isLightMode ? 'border-slate-200' : 'border-white/10'}`}>
                  <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>Duration</span>
                  <span className={`font-semibold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{previewData?.durationMinutes} minutes</span>
                </div>
                <div className={`flex justify-between pb-4 border-b border-dashed ${isLightMode ? 'border-slate-200' : 'border-white/10'}`}>
                  <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>Total Marks</span>
                  <span className={`font-semibold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{previewData?.totalMarks}</span>
                </div>
              </div>

              {lobbyState === 'countdown' ? (
                <div className="text-center py-6">
                  <h3 className={`text-xl font-bold mb-2 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Your test starts in</h3>
                  <div className="text-6xl font-black text-indigo-500">{countdown}</div>
                </div>
              ) : blockedMessage ? (
                // ---- BLOCKED STATE ----
                <div className="space-y-4">
                  <div className={`flex items-start gap-3 p-4 rounded-xl border ${
                    isLightMode ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}>
                    <svg className="w-5 h-5 mt-0.5 shrink-0 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-bold text-sm mb-1">Access Restricted</p>
                      <p className="text-sm leading-relaxed">{blockedMessage}</p>
                    </div>
                  </div>
                  <div className="relative group">
                    <button
                      disabled
                      className="w-full py-4 rounded-xl font-bold text-white bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60 transition-all"
                    >
                      🚫 Test Deactivated
                    </button>
                    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 text-center text-xs font-medium px-3 py-2 rounded-lg shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 ${
                      isLightMode ? 'bg-slate-800 text-white' : 'bg-slate-900 text-slate-200 border border-white/10'
                    }`}>
                      This test has been deactivated by the admin. Please try contacting the admin for unblocking.
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleStartResumeClick}
                  className="w-full py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all"
                >
                  {previewData?.hasExistingAttempt ? 'Resume Test' : 'Start Test'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  if (!test || !attempt) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLightMode ? 'bg-slate-50' : 'bg-[#0d1117]'}`}>
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentIndex];
  const questionStatuses = getQuestionStatusArray(test.questions, Object.values(answers), reviewFlags, visitedQuestions);
  const answeredCount = questionStatuses.filter(q => q.status === 'answered').length;

  if (test && attempt && !isFullscreen) {
    return (
      <div className={`fixed inset-0 z-[9999] flex items-center justify-center ${isLightMode ? 'bg-slate-50' : 'bg-[#0d1117]'}`}>
        <div className={`p-8 max-w-lg w-full rounded-3xl shadow-2xl text-center border ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#161b22] border-white/10'}`}>
          <Maximize size={64} className="mx-auto text-indigo-500 mb-6" />
          <h2 className={`text-2xl font-bold mb-4 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Fullscreen Required</h2>
          <p className={`mb-8 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
            The test will be taken in full screen mode. Please click the button below to enter full screen mode.
            <br/><br/>
            <strong>Note: Your timer is still running!</strong>
          </p>
          <button 
            onClick={() => document.documentElement.requestFullscreen().catch(err => console.error(err))}
            className="w-full px-8 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 transition-all text-lg"
          >
            Enter Full Screen Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AttemptLayout
        testTitle={test.title}
        totalQuestions={test.questions.length}
        timeLeft={timeLeft}
        isWarning={isWarning}
        currentQuestion={currentQuestion}
        currentIndex={currentIndex}
        currentAnswer={answers[currentQuestion.id]}
        isReviewMarked={reviewFlags[currentQuestion.id] || false}
        questionStatuses={questionStatuses}
        isLightMode={isLightMode}
        isFullscreen={isFullscreen}
        onSelectOption={handleSelectOption}
        onNavigate={handleNavigate}
        onToggleReview={handleToggleReview}
        onSaveAndNext={handleSaveAndNext}
        onPrevious={handlePrevious}
        onToggleFullscreen={handleToggleFullscreen}
        onSubmit={() => setModalState({ isOpen: true, type: 'submit' })}
      />
      
      <AttemptModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        isLightMode={isLightMode}
        metadata={{
          answeredCount,
          totalQuestions: test.questions.length,
          violationMessage: modalState.message
        }}
        onConfirm={modalState.type === 'submit' ? handleSubmitConfirm : () => setModalState({ ...modalState, isOpen: false })}
        onCancel={() => setModalState({ ...modalState, isOpen: false })}
      />
    </>
  );
};
