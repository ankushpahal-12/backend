import { useCallback, useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

import { ENV } from '../../../../config/env';

const SOCKET_URL = ENV.socketUrl;

// Socket Event Data Types
interface AnswerSavedData {
  questionId: string;
  selectedOptions: string[];
  timeTaken: number;
}

interface TimerUpdateData {
  remainingSeconds: number;
  totalSeconds: number;
}

interface TimeWarningData {
  remainingSeconds: number;
  message: string;
}

interface TestSubmittedData {
  attemptId: string;
  score: number;
  totalMarks: number;
}

interface UserBlockedData {
  userId: string;
  reason: string;
  message: string;
}

interface IssueReportedData {
  issue: string;
  timestamp: number;
}

interface TestSocketEvents {
  onAnswerSaved?: (data: AnswerSavedData) => void;
  onTimerUpdate?: (data: TimerUpdateData) => void;
  onTimeWarning?: (data: TimeWarningData) => void;
  onTestSubmitted?: (data: TestSubmittedData) => void;
  onUserBlocked?: (data: UserBlockedData) => void;
  onIssueReported?: (data: IssueReportedData) => void;
}

/**
 * Hook for real-time test socket communication
 */
export const useTestSocket = (testId: string, attemptId: string, events?: TestSocketEvents) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // EFFECT 1: Socket lifecycle (connect/disconnect) — only depends on testId & attemptId
  useEffect(() => {
    let mounted = true;

    const setupSocket = () => {
      try {
        const token = localStorage.getItem('authToken');
        
        socketRef.current = io(SOCKET_URL, {
          auth: { token },
          withCredentials: true,
          transports: ['polling', 'websocket'], // Allow polling fallback
          upgrade: true,  // Allow upgrading from polling to websocket
          forceNew: true,
          reconnection: true,
          reconnectionDelay: 1500,
          reconnectionDelayMax: 10000,
          reconnectionAttempts: 8,
          closeOnBeforeunload: false,
          autoConnect: true
        });

        socketRef.current.on('connect', () => {
          if (mounted) {
            setIsConnected(true);
            setError(null);
          }
          
          // Join test room
          socketRef.current?.emit('test:join', { testId, attemptId });
        });

        socketRef.current.on('disconnect', () => {
          if (mounted) {
            setIsConnected(false);
          }
        });

        socketRef.current.on('connect_error', (error: Error) => {
          if (mounted) {
            setError(error.message);
          }
          console.error('Socket connection error:', error);
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown socket setup error';
        console.error('Socket setup error:', err);
        if (mounted) {
          setError(errorMessage);
        }
      }
    };

    setupSocket();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.emit('test:leave', { testId, attemptId });
        if (socketRef.current.connected) {
          socketRef.current.disconnect();
        }
        socketRef.current = null;
      }
    };
  }, [testId, attemptId]);

  // EFFECT 2: Event listener binding — depends on events object
  // This runs AFTER socket exists and refreshes listeners when events change
  // without causing socket reconnection
  useEffect(() => {
    if (!socketRef.current) return;

    // Unbind all previous listeners
    socketRef.current.removeAllListeners('test:answer_saved');
    socketRef.current.removeAllListeners('test:timer_sync');
    socketRef.current.removeAllListeners('test:time_warning');
    socketRef.current.removeAllListeners('test:submitted');
    socketRef.current.removeAllListeners('test:user_blocked');
    socketRef.current.removeAllListeners('test:issue_reported');

    // Bind new listeners from current events object
    if (events?.onAnswerSaved) {
      socketRef.current.on('test:answer_saved', events.onAnswerSaved);
    }
    if (events?.onTimerUpdate) {
      socketRef.current.on('test:timer_sync', events.onTimerUpdate);
    }
    if (events?.onTimeWarning) {
      socketRef.current.on('test:time_warning', events.onTimeWarning);
    }
    if (events?.onTestSubmitted) {
      socketRef.current.on('test:submitted', events.onTestSubmitted);
    }
    if (events?.onUserBlocked) {
      socketRef.current.on('test:user_blocked', events.onUserBlocked);
    }
    if (events?.onIssueReported) {
      socketRef.current.on('test:issue_reported', events.onIssueReported);
    }

    return () => {
      // Cleanup: remove all listeners when component unmounts
      if (socketRef.current) {
        socketRef.current.removeAllListeners('test:answer_saved');
        socketRef.current.removeAllListeners('test:timer_sync');
        socketRef.current.removeAllListeners('test:time_warning');
        socketRef.current.removeAllListeners('test:submitted');
        socketRef.current.removeAllListeners('test:user_blocked');
        socketRef.current.removeAllListeners('test:issue_reported');
      }
    };
  }, [events]);

  const emitAnswerSave = useCallback((questionId: string, selectedOptions: string[], timeTaken: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('test:answer_save', {
        testId,
        attemptId,
        questionId,
        selectedOptions,
        timeTaken
      });
    }
  }, [testId, attemptId]);

  const emitTimerUpdate = useCallback((remainingSeconds: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('test:timer_update', {
        testId,
        attemptId,
        remainingSeconds
      });
    }
  }, [testId, attemptId]);

  const emitQuestionNavigation = useCallback((questionIndex: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('test:navigate_question', {
        testId,
        attemptId,
        questionIndex
      });
    }
  }, [testId, attemptId]);

  const emitFlagForReview = useCallback((questionId: string, flagged: boolean) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('test:flag_review', {
        testId,
        attemptId,
        questionId,
        flagged
      });
    }
  }, [testId, attemptId]);

  const emitTestSubmit = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('test:submit', {
        testId,
        attemptId
      });
    }
  }, [testId, attemptId]);

  const emitReportIssue = useCallback((issue: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('test:report_issue', {
        testId,
        attemptId,
        issue
      });
    }
  }, [testId, attemptId]);

  return {
    isConnected,
    error,
    emitAnswerSave,
    emitTimerUpdate,
    emitQuestionNavigation,
    emitFlagForReview,
    emitTestSubmit,
    emitReportIssue
  };
};

/**
 * Hook for admin test monitoring
 */
interface MonitoringEvents {
  onAnswerSaved?: (data: AnswerSavedData) => void;
  onQuestionFlagged?: (data: { questionId: string; flagged: boolean }) => void;
  onTestSubmitted?: (data: TestSubmittedData) => void;
  onIssueReported?: (data: IssueReportedData) => void;
}

export const useTestMonitoring = (onEvents?: MonitoringEvents) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // EFFECT 1: Socket lifecycle — establishes connection once
  useEffect(() => {
    let mounted = true;

    const setupSocket = () => {
      try {
        const token = localStorage.getItem('authToken');

        const socket = io(SOCKET_URL, {
          auth: { token },
          withCredentials: true,
          transports: ['polling', 'websocket'],
          upgrade: true,
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });
        socketRef.current = socket;

        socket.on('connect', () => {
          if (mounted) setIsConnected(true);
          socket.emit('admin:monitor_tests');
        });

        socket.on('disconnect', () => {
          if (mounted) setIsConnected(false);
        });

        socket.on('connect_error', (err: Error) => {
          if (mounted) setError(err.message);
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown socket setup error';
        console.error('Socket setup error:', err);
        if (mounted) setError(msg);
      }
    };

    setupSocket();

    return () => {
      mounted = false;
      if (socketRef.current) {
        if (socketRef.current.connected) {
          socketRef.current.disconnect();
        }
        socketRef.current = null;
      }
    };
  }, []); // empty — socket is created once

  // EFFECT 2: Event listener binding — depends on onEvents
  // This refreshes listeners when onEvents changes without reconnecting
  useEffect(() => {
    if (!socketRef.current) return;

    // Unbind all previous listeners
    socketRef.current.removeAllListeners('test:answer_saved');
    socketRef.current.removeAllListeners('test:question_flagged');
    socketRef.current.removeAllListeners('test:submitted');
    socketRef.current.removeAllListeners('test:issue_reported');

    // Bind new listeners from current onEvents object
    if (onEvents?.onAnswerSaved) {
      socketRef.current.on('test:answer_saved', onEvents.onAnswerSaved);
    }
    if (onEvents?.onQuestionFlagged) {
      socketRef.current.on('test:question_flagged', onEvents.onQuestionFlagged);
    }
    if (onEvents?.onTestSubmitted) {
      socketRef.current.on('test:submitted', onEvents.onTestSubmitted);
    }
    if (onEvents?.onIssueReported) {
      socketRef.current.on('test:issue_reported', onEvents.onIssueReported);
    }

    return () => {
      // Cleanup: remove all listeners
      if (socketRef.current) {
        socketRef.current.removeAllListeners('test:answer_saved');
        socketRef.current.removeAllListeners('test:question_flagged');
        socketRef.current.removeAllListeners('test:submitted');
        socketRef.current.removeAllListeners('test:issue_reported');
      }
    };
  }, [onEvents]);

  const blockUserFromTest = useCallback((userId: string, testId: string, reason: string) => {
    socketRef.current?.emit('admin:block_user_test', { userId, testId, reason });
  }, []);

  const publishTestNotification = useCallback((testId: string, testTitle: string) => {
    socketRef.current?.emit('admin:notify_test_published', { testId, testTitle });
  }, []);

  return {
    isConnected,
    error,
    blockUserFromTest,
    publishTestNotification,
  };
};

