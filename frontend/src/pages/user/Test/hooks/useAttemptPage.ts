import axios from 'axios';
import toast from 'react-hot-toast';
import { useTimer } from './useTimer';
import { useAttempt } from './useAttempt';
import { useAntiCheat } from './useAntiCheat';
import { previewTest } from '../services/attemptApi';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import type { ModalType } from '../components/AttemptModal';
import type { CandidateTest, Attempt, Answer, QuestionStatus } from '../types/attempt.types';
import { getQuestionStatusArray, calculateProgress, formatTime } from '../utils/attemptHelpers';

// ============ TYPES ============
export type PreviewData = {
  id?: string;
  testId?: string;
  title?: string;
  description?: string;
  durationMinutes?: number;
  totalMarks?: number;
  category?: string;
  instructions?: string;
  isBlocked?: boolean;
  blockedMessage?: string;
  requiresEmailVerification?: boolean;
  emailAssigned?: boolean;
  visibility?: string;
  hasExistingAttempt?: boolean;
};

export type ModalState = {
  isOpen: boolean;
  type: ModalType;
  message?: string;
};

export type LobbyState = 'loading' | 'preview' | 'countdown' | 'started';

export type EmailVerifyStep = 'email' | 'otp';

// ============ HOOK RETURN TYPE ============
export type UseAttemptPageReturn = {
  // Attempt data (from useAttempt hook)
  test: CandidateTest | null;
  attempt: Attempt | null;
  answers: Record<string, Answer>;
  reviewFlags: Record<string, boolean>;
  visitedQuestions: Record<string, boolean>;
  
  // UI State
  currentIndex: number;
  isFullscreen: boolean;
  modalState: ModalState;
  lobbyState: LobbyState;
  previewData: PreviewData | null;
  countdown: number;
  blockedMessage: string | null;
  
  // Email Verification State
  showEmailVerification: boolean;
  emailVerifyStep: EmailVerifyStep;
  verifyEmail: string;
  otpInput: string;
  isVerifying: boolean;
  attemptsRemaining: number;
  otpExpiry: number;
  emailVerified: boolean;
  verifiedEmail: string | null;
  
  // Timer & Anti-cheat (from respective hooks)
  timeLeft: number;
  isWarning: boolean;
  timeFormatted: string;
  violations: string[];
  
  // Question status & progress
  questionStatuses: QuestionStatus[];
  progress: number;
  
  // Action handlers
  handleSelectOption: (optionId: string) => void;
  handleNavigate: (index: number) => void;
  handleSaveAndNext: () => void;
  handlePrevious: () => void;
  handleToggleReview: () => void;
  handleToggleFullscreen: () => void;
  handleSubmitConfirm: () => Promise<void>;
  handleStartResumeClick: () => void;
  handleSendOTP: () => Promise<void>;
  handleVerifyOTP: () => Promise<void>;
  handleResendOTP: () => Promise<void>;
  
  // UI state setters (for component control)
  setCurrentIndex: (index: number) => void;
  setIsFullscreen: (value: boolean) => void;
  setModalState: (state: ModalState) => void;
  setLobbyState: (state: LobbyState) => void;
  setCountdown: (value: number | ((prev: number) => number)) => void;
  setEmailVerifyStep: (step: EmailVerifyStep) => void;
  setVerifyEmail: (email: string) => void;
  setOtpInput: (otp: string) => void;
  setShowEmailVerification: (value: boolean) => void;
  setPreviewData: (data: PreviewData | null | ((prev: PreviewData | null) => PreviewData | null)) => void;
};

// ============ CUSTOM HOOK ============
export const useAttemptPage = (): UseAttemptPageReturn => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();

  const { 
    test, attempt, answers, reviewFlags, visitedQuestions, 
    startAttempt, saveAnswer, submitTest, toggleReviewFlag, markVisited 
  } = useAttempt();

  // ============ STATE MANAGEMENT ============
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({ 
    isOpen: false, type: 'submit' 
  });
  
  const [lobbyState, setLobbyState] = useState<LobbyState>('loading');
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  
  // Email verification state
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [emailVerifyStep, setEmailVerifyStep] = useState<EmailVerifyStep>('email');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verificationId, setVerificationId] = useState<string>('');
  const [otpInput, setOtpInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [otpExpiry, setOtpExpiry] = useState<number>(0);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  const startTimeRef = useRef(Date.now());

  // ============ TIMER & ANTI-CHEAT SETUP ============
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

  const { violations, startAntiCheat, stopAntiCheat } = useAntiCheat(handleViolation);

  // ============ FULLSCREEN DETECTION ============
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // ============ LOAD TEST PREVIEW ============
  useEffect(() => {
    if (shareToken && lobbyState === 'loading' && !previewData) {
      previewTest(shareToken).then((res: unknown) => {
        const data = res as { success?: boolean; status?: number; error?: string; data?: unknown; blockedMessage?: string };
        if (data?.success && data?.data) {
          const previewInfo = data.data as PreviewData;
          const dataToSet: PreviewData = {
            id: previewInfo.id || '',
            testId: previewInfo.testId || '',
            title: previewInfo.title || '',
            description: previewInfo.description,
            durationMinutes: previewInfo.durationMinutes,
            totalMarks: previewInfo.totalMarks,
            category: previewInfo.category || '',
            instructions: previewInfo.instructions,
            isBlocked: previewInfo.isBlocked || false,
            blockedMessage: previewInfo.blockedMessage,
            requiresEmailVerification: previewInfo.requiresEmailVerification || false,
            emailAssigned: previewInfo.emailAssigned,
            visibility: previewInfo.visibility,
            hasExistingAttempt: previewInfo.hasExistingAttempt
          };
          setPreviewData(dataToSet);
          
          if (dataToSet.isBlocked) {
            setBlockedMessage(dataToSet.blockedMessage || 'You have been blocked from this test. Please contact the admin to unblock you.');
            setLobbyState('preview');
          } 
          else if (dataToSet.requiresEmailVerification) {
            setShowEmailVerification(true);
            setEmailVerified(false);
            setLobbyState('preview');
          }
          else {
            setLobbyState('preview');
          }
        } else {
          if (data.status === 403 || (data.error && data.error.includes('email'))) {
            setPreviewData({
              requiresEmailVerification: true,
              visibility: 'private'
            });
            setShowEmailVerification(true);
            setLobbyState('preview');
          } else {
            toast.error(data.error || 'Failed to load test');
            navigate('/user/dashboard');
          }
        }
      });
    }
  }, [shareToken, lobbyState, previewData, navigate]);

  // ============ COUNTDOWN TIMER ============
  useEffect(() => {
    if (lobbyState === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown((c: number) => c - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setLobbyState('loading');
        if (shareToken) {
          const candidateEmail = verifiedEmail || (verifyEmail && verificationToken ? verifyEmail : undefined);
          startAttempt(shareToken, candidateEmail).then(success => {
            if (success) {
              setLobbyState('started');
            } else {
              navigate('/user/dashboard');
            }
          });
        }
      }
    }
  }, [lobbyState, countdown, shareToken, startAttempt, navigate, verifyEmail, verificationToken, emailVerified, verifiedEmail]);

  // ============ OTP EXPIRY TIMER ============
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

  // ============ START TEST TIMER & ANTI-CHEAT ============
  useEffect(() => {
    if (test && attempt) {
      startTimer();
      startAntiCheat();
      if (test.questions.length > 0) {
        markVisited(test.questions[0].id);
      }
    }
    return () => {
      stopTimer();
      stopAntiCheat();
    };
  }, [test, attempt, startTimer, startAntiCheat, markVisited, stopTimer, stopAntiCheat]);

  // ============ EMAIL VERIFICATION HANDLERS ============
  const handleSendOTP = useCallback(async () => {
    if (!verifyEmail.trim()) {
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
    } catch (err) {
      const error = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      if (error.response?.status === 403) {
        toast.error('This email is not assigned to this test. Please contact the admin.');
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
  }, [verifyEmail, shareToken]);

  const handleVerifyOTP = useCallback(async () => {
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
        toast.success('Email verified successfully!', { duration: 3000 });
        setShowEmailVerification(false);
        setEmailVerified(true);
        setVerifiedEmail(verifyEmail);
        setPreviewData((prev) => prev ? {
          ...prev,
          requiresEmailVerification: false,
          emailAssigned: true
        } : prev);
        setEmailVerifyStep('email');
        setOtpInput('');
      } else {
        toast.error(response.data.message || 'OTP verification failed');
        if (response.data.data?.attemptsRemaining !== undefined) {
          setAttemptsRemaining(response.data.data.attemptsRemaining);
        }
      }
    } catch (err) {
      const error = err as { response?: { status?: number; data?: { message?: string; expired?: boolean; data?: { attemptsRemaining?: number } } }; message?: string };
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
  }, [verificationId, otpInput, verifyEmail]);

  const handleResendOTP = useCallback(async () => {
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
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsVerifying(false);
    }
  }, [verificationId]);

  // ============ TEST INTERACTION HANDLERS ============
  const handleSelectOption = useCallback((optionId: string) => {
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
  }, [test, currentIndex, answers, saveAnswer]);

  const handleNavigate = useCallback((index: number) => {
    if (!test) return;
    setCurrentIndex(index);
    markVisited(test.questions[index].id);
    startTimeRef.current = Date.now();
  }, [test, markVisited]);

  const handleSaveAndNext = useCallback(() => {
    if (!test) return;
    if (currentIndex < test.questions.length - 1) {
      handleNavigate(currentIndex + 1);
    } else {
      setModalState({ isOpen: true, type: 'submit' });
    }
  }, [test, currentIndex, handleNavigate]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) handleNavigate(currentIndex - 1);
  }, [currentIndex, handleNavigate]);

  const handleToggleReview = useCallback(() => {
    if (!test) return;
    toggleReviewFlag(test.questions[currentIndex].id);
  }, [test, currentIndex, toggleReviewFlag]);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false));
      }
    }
  }, []);

  const handleSubmitConfirm = useCallback(async () => {
    setModalState({ ...modalState, isOpen: false });
    const success = await submitTest();
    if (success && attempt) {
      navigate(`/attempt/result/${attempt._id}`);
    }
  }, [modalState, submitTest, attempt, navigate]);

  const handleStartResumeClick = useCallback(() => {
    if (previewData?.requiresEmailVerification && !emailVerified && !previewData?.emailAssigned) {
      setShowEmailVerification(true);
      return;
    }
    
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => console.warn(err));
    }
    setLobbyState('countdown');
  }, [previewData, emailVerified]);

  // ============ COMPUTED VALUES ============
  const timeFormatted = useMemo(() => formatTime(timeLeft), [timeLeft]);
  
  const questionStatuses = useMemo(() => {
    if (!test) return [];
    return getQuestionStatusArray(
      test.questions,
      Object.values(answers),
      reviewFlags,
      visitedQuestions
    );
  }, [test, answers, reviewFlags, visitedQuestions]);

  const progress = useMemo(() => {
    if (!test) return 0;
    return calculateProgress(Object.values(answers), test.questions.length);
  }, [test, answers]);

  // ============ RETURN ALL STATE AND HANDLERS ============
  return {
    // Attempt data from useAttempt hook
    test,
    attempt,
    answers,
    reviewFlags,
    visitedQuestions,
    
    // UI state
    currentIndex,
    isFullscreen,
    modalState,
    lobbyState,
    previewData,
    countdown,
    blockedMessage,
    
    // Email verification state
    showEmailVerification,
    emailVerifyStep,
    verifyEmail,
    otpInput,
    isVerifying,
    attemptsRemaining,
    otpExpiry,
    emailVerified,
    verifiedEmail,
    
    // From useTimer and useAntiCheat hooks
    timeLeft,
    isWarning,
    timeFormatted,
    violations,
    
    // Computed values from helpers
    questionStatuses,
    progress,
    
    // Action handlers
    handleSelectOption,
    handleNavigate,
    handleSaveAndNext,
    handlePrevious,
    handleToggleReview,
    handleToggleFullscreen,
    handleSubmitConfirm,
    handleStartResumeClick,
    handleSendOTP,
    handleVerifyOTP,
    handleResendOTP,
    
    // UI state setters
    setCurrentIndex,
    setIsFullscreen,
    setModalState,
    setLobbyState,
    setCountdown,
    setEmailVerifyStep,
    setVerifyEmail,
    setOtpInput,
    setShowEmailVerification,
    setPreviewData,
  };
};

