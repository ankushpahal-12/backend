import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Paper,
  Radio,
  Stack,
  Typography,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Clock, AlertTriangle, Flag } from 'lucide-react';
import Loader from './ui/Loader';
import { useTestSocket } from '../tests/hooks/useTestSocket';
import { useTestAttempt } from '../tests/hooks/useTests';
import toast from 'react-hot-toast';

interface Question {
  id: string;
  text: string;
  marks: number;
  allowMultiple: boolean;
  options: Array<{ id: string; text: string }>;
}

interface TestTakingProps {
  testId: string;
  testTitle: string;
  durationMinutes: number;
  questions: Question[];
  totalMarks: number;
  onSubmit?: (results: any) => void;
  onClose?: () => void;
}

export const TestTaking: React.FC<TestTakingProps> = ({
  testId,
  testTitle,
  durationMinutes,
  questions,
  totalMarks,
  onSubmit,
  onClose
}) => {
  // State Management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string[] }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const autoSaveRef = useRef<NodeJS.Timeout>();

  // Hooks
  const { attempt, startAttempt, saveAnswer, submitAttempt } = useTestAttempt();
  const { emitAnswerSave, emitTimerUpdate, emitTestSubmit } = useTestSocket(
    testId,
    attemptId || '',
    {
      onTimeWarning: () => {
        toast.error('Less than 2 minutes remaining!');
      }
    }
  );

  // Initialize test
  useEffect(() => {
    const initTest = async () => {
      try {
        const result = await startAttempt(testId);
        setAttemptId(result._id);
        // Initialize answers from current attempt
        result.answers?.forEach((answer: any) => {
          setAnswers(prev => ({
            ...prev,
            [answer.questionId]: answer.selectedOptions
          }));
        });
      } catch (error) {
        toast.error('Failed to start test');
      }
    };
    
    initTest();
  }, [testId, startAttempt]);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = Math.max(prev - 1, 0);

        // Emit timer update every 10 seconds
        if (newTime % 10 === 0 && attemptId) {
          emitTimerUpdate(newTime);
        }

        // Auto-submit when time is up
        if (newTime === 0) {
          handleSubmit();
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [attemptId, emitTimerUpdate]);

  // Auto-save answers every 30 seconds
  useEffect(() => {
    autoSaveRef.current = setInterval(async () => {
      if (attemptId && Object.keys(answers).length > 0) {
        const currentQuestion = questions[currentQuestionIndex];
        const timeTaken = (durationMinutes * 60) - timeRemaining;
        
        try {
          await saveAnswer(
            attemptId,
            currentQuestion.id,
            answers[currentQuestion.id] || [],
            timeTaken
          );
          emitAnswerSave(
            currentQuestion.id,
            answers[currentQuestion.id] || [],
            timeTaken
          );
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, 30000);

    return () => clearInterval(autoSaveRef.current);
  }, [attemptId, answers, currentQuestionIndex, questions, durationMinutes, timeRemaining, saveAnswer, emitAnswerSave]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswerChange = useCallback((optionId: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    
    setAnswers(prev => {
      const currentAnswers = prev[currentQuestion.id] || [];
      let newAnswers: string[];

      if (currentQuestion.allowMultiple) {
        // Multiple choice
        if (currentAnswers.includes(optionId)) {
          newAnswers = currentAnswers.filter(id => id !== optionId);
        } else {
          newAnswers = [...currentAnswers, optionId];
        }
      } else {
        // Single choice
        newAnswers = [optionId];
      }

      return {
        ...prev,
        [currentQuestion.id]: newAnswers
      };
    });
  }, [currentQuestionIndex, questions]);

  // Handle flag for review
  const handleFlagQuestion = useCallback(() => {
    const currentQuestion = questions[currentQuestionIndex];
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
  }, [currentQuestionIndex, questions]);

  // Navigate questions
  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex(prev => Math.min(prev + 1, questions.length - 1));
  };

  const handleSubmit = async () => {
    if (!attemptId) return;

    setIsSubmitting(true);
    try {
      const result = await submitAttempt(attemptId);
      emitTestSubmit();
      toast.success('Test submitted successfully!');
      
      if (onSubmit) {
        onSubmit(result);
      }
    } catch (error) {
      toast.error('Failed to submit test');
    } finally {
      setIsSubmitting(false);
      setSubmitDialogOpen(false);
    }
  };

  if (!attempt || !attemptId) {
    return <Loader message="Initializing test..." isVisible={true} />;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswers = answers[currentQuestion.id] || [];
  const isQuestionFlagged = flaggedQuestions.has(currentQuestion.id);
  const isTimeWarning = timeRemaining < 300; // 5 minutes warning

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f3f4f6', pb: 4 }}>
      {/* Header with Timer */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          p: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {testTitle}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </Typography>
          </Box>

          <Box>
            <Chip
              icon={<Clock size={16} />}
              label={formatTime(timeRemaining)}
              sx={{
                fontSize: '14px',
                fontWeight: 600,
                backgroundColor: isTimeWarning ? '#fee2e2' : '#dbeafe',
                color: isTimeWarning ? '#991b1b' : '#1e40af',
                borderRadius: 1,
                height: 36
              }}
            />
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              Total Marks: <strong>{totalMarks}</strong>
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Time Warning Alert */}
      {isTimeWarning && (
        <Alert severity="warning" icon={<AlertTriangle size={20} />} sx={{ m: 2, mb: 1 }}>
          Less than {Math.ceil(timeRemaining / 60)} minute(s) remaining. Please hurry!
        </Alert>
      )}

      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Left: Question Panel */}
          <Box sx={{ flex: { xs: '1 1 auto', md: '2 1 0%' } }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                {/* Question Text */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#1f2937',
                        flex: 1
                      }}
                    >
                      {currentQuestion.text}
                    </Typography>
                    <Chip
                      label={`${currentQuestion.marks} marks`}
                      size="small"
                      sx={{
                        backgroundColor: '#e0f2fe',
                        color: '#0369a1',
                        fontWeight: 600
                      }}
                    />
                  </Box>

                  {currentQuestion.allowMultiple && (
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      (Multiple answers allowed)
                    </Typography>
                  )}
                </Box>

                {/* Options */}
                <Stack spacing={2} sx={{ mb: 4 }}>
                  {currentQuestion.options.map((option) => (
                    <Box
                      key={option.id}
                      sx={{
                        p: 2,
                        border: '2px solid #e5e7eb',
                        borderRadius: 1,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backgroundColor: currentAnswers.includes(option.id)
                          ? '#f0fdf4'
                          : '#ffffff',
                        borderColor: currentAnswers.includes(option.id)
                          ? '#22c55e'
                          : '#e5e7eb',
                        '&:hover': {
                          borderColor: '#3b82f6'
                        }
                      }}
                      onClick={() => handleAnswerChange(option.id)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {currentQuestion.allowMultiple ? (
                          <Checkbox
                            checked={currentAnswers.includes(option.id)}
                            readOnly
                            sx={{ p: 0 }}
                          />
                        ) : (
                          <Radio
                            checked={currentAnswers.includes(option.id)}
                            readOnly
                            sx={{ p: 0 }}
                          />
                        )}
                        <Typography>{option.text}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>

                {/* Flag Button */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<Flag size={16} />}
                    onClick={handleFlagQuestion}
                    sx={{
                      color: isQuestionFlagged ? '#ef4444' : '#6b7280',
                      borderColor: isQuestionFlagged ? '#ef4444' : '#d1d5db',
                      '&:hover': {
                        borderColor: '#ef4444',
                        color: '#ef4444'
                      }
                    }}
                  >
                    {isQuestionFlagged ? 'Flagged' : 'Flag for Review'}
                  </Button>

                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    {flaggedQuestions.size} flagged question(s)
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Right: Navigation Panel */}
          <Box sx={{ flex: { xs: '1 1 auto', md: '1 1 0%' }, minWidth: { md: '300px' } }}>
            <Stack spacing={2}>
              {/* Question Grid */}
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Questions Navigation
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                    {questions.map((q, idx) => (
                      <Box key={q.id}>
                        <Button
                          variant={idx === currentQuestionIndex ? 'contained' : 'outlined'}
                          size="small"
                          fullWidth
                          onClick={() => setCurrentQuestionIndex(idx)}
                          sx={{
                            aspectRatio: '1/1',
                            p: 0,
                            fontSize: '12px',
                            backgroundColor: idx === currentQuestionIndex
                              ? '#3b82f6'
                              : answers[q.id]?.length
                              ? '#e0f2fe'
                              : '#f3f4f6',
                            border: flaggedQuestions.has(q.id)
                              ? '2px solid #ef4444'
                              : 'none'
                          }}
                        >
                          {idx + 1}
                        </Button>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                    <Box sx={{ width: 16, height: 16, backgroundColor: '#3b82f6', borderRadius: '2px' }} />
                    <Typography variant="caption">Current</Typography>
                  </Box>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Box sx={{ width: 16, height: 16, backgroundColor: '#e0f2fe', borderRadius: '2px' }} />
                    <Typography variant="caption">Attempted</Typography>
                  </Box>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Box sx={{ width: 16, height: 16, border: '2px solid #ef4444', borderRadius: '2px' }} />
                    <Typography variant="caption">Flagged</Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Test Summary */}
              <Card sx={{ backgroundColor: '#f9fafb' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Test Summary
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Attempted:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {Object.keys(answers).length} / {questions.length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Flagged:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {flaggedQuestions.size}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Time Left:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: isTimeWarning ? '#ef4444' : '#10b981' }}>
                        {formatTime(timeRemaining)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Box>

        {/* Bottom Navigation */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => onClose?.()}
            >
              Exit Test
            </Button>
            <Button
              variant="contained"
              onClick={() => setSubmitDialogOpen(true)}
              sx={{ backgroundColor: '#10b981', '&:hover': { backgroundColor: '#059669' } }}
            >
              Submit Test
            </Button>
          </Stack>

          <Button
            variant="outlined"
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex === questions.length - 1}
          >
            Next
          </Button>
        </Box>
      </Box>

      {/* Submit Confirmation Dialog */}
      <Dialog open={submitDialogOpen} onClose={() => setSubmitDialogOpen(false)}>
        <DialogTitle>Submit Test</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <Alert severity="info">
              Are you sure you want to submit the test? You cannot make any changes after submission.
            </Alert>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Total Questions:</Typography>
              <Typography sx={{ fontWeight: 600 }}>{questions.length}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Attempted:</Typography>
              <Typography sx={{ fontWeight: 600 }}>{Object.keys(answers).length}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Not Attempted:</Typography>
              <Typography sx={{ fontWeight: 600, color: '#ef4444' }}>
                {questions.length - Object.keys(answers).length}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialogOpen(false)}>Continue Test</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            sx={{ backgroundColor: '#10b981' }}
          >
            {isSubmitting ? 'Submitting...' : 'Confirm Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Submitting Loader */}
      <Loader
        isVisible={isSubmitting}
        message="Submitting your test..."
        status="submitting"
      />
    </Box>
  );
};

export default TestTaking;
