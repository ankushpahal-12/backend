import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert
} from '@mui/material';
import { CheckCircle, XCircle, Award, TrendingUp } from 'lucide-react';
import Loader from '../components/ui/Loader';
import { useTestHistory } from '../tests/hooks/useTests';

interface TestResultsPageProps {
  attemptId?: string;
}

export const TestResultsPage: React.FC<TestResultsPageProps> = ({ attemptId }) => {
  const [results, setResults] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { fetchHistory } = useTestHistory();

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      try {
        await fetchHistory('submitted', 1, 1);
        // In a real app, fetch specific attempt results
        setLoading(false);
      } catch (error) {
        console.error('Failed to load results:', error);
        setLoading(false);
      }
    };

    loadResults();
  }, [attemptId, fetchHistory]);

  if (loading) {
    return <Loader message="Loading your results..." isVisible={true} />;
  }

  if (!results) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Unable to load test results. Please try again.</Alert>
      </Box>
    );
  }

  const percentage = parseFloat(results.percentage);
  const isPassed = results.isPassed;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f3f4f6', pb: 4 }}>
      {/* Header */}
      <Box sx={{ backgroundColor: '#ffffff', p: 4, borderBottom: '1px solid #e5e7eb', mb: 4 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {isPassed ? (
                <CheckCircle size={48} color="#10b981" />
              ) : (
                <XCircle size={48} color="#ef4444" />
              )}
              <div>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937' }}>
                  {isPassed ? 'Congratulations!' : 'Test Submitted'}
                </Typography>
                <Typography variant="body1" sx={{ color: '#6b7280' }}>
                  {isPassed ? 'You have passed the test!' : 'Your test has been submitted for evaluation.'}
                </Typography>
              </div>
            </Box>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              href="/admin/tests"
              sx={{ backgroundColor: '#3b82f6' }}
            >
              Back to Tests
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {/* Score Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 2 }}>
                    Your Score
                  </Typography>
                  <Box sx={{ position: 'relative', width: 200, height: 200, mx: 'auto', mb: 3 }}>
                    <svg width="200" height="200" sx={{ transform: 'rotate(-90deg)' }}>
                      <circle
                        cx="100"
                        cy="100"
                        r="90"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="90"
                        fill="none"
                        stroke={isPassed ? '#10b981' : '#ef4444'}
                        strokeWidth="8"
                        strokeDasharray={`${(percentage / 100) * 565} 565`}
                      />
                    </svg>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="h3" sx={{ fontWeight: 700, color: '#1f2937' }}>
                        {percentage.toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        Score
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={isPassed ? 'PASSED' : 'NOT PASSED'}
                    sx={{
                      backgroundColor: isPassed ? '#d1fae5' : '#fee2e2',
                      color: isPassed ? '#065f46' : '#991b1b',
                      fontWeight: 600,
                      fontSize: '12px'
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Performance Metrics */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Card>
                <CardContent>
                  <Stack spacing={3}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1f2937' }}>
                          Marks Obtained
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {results.totalMarksObtained} / {results.totalMarksPossible}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(results.totalMarksObtained / results.totalMarksPossible) * 100}
                        sx={{
                          height: 8,
                          borderRadius: 1,
                          backgroundColor: '#e5e7eb',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: isPassed ? '#10b981' : '#ef4444',
                            borderRadius: 1
                          }
                        }}
                      />
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1f2937' }}>
                          Correct Answers
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#10b981' }}>
                          {results.correctAnswers}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1f2937' }}>
                          Wrong Answers
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#ef4444' }}>
                          {results.totalQuestions - results.correctAnswers}
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1f2937', mb: 1 }}>
                        Time Taken
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        {results.timeTaken} minutes
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Test Info */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Test Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        Test Name
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                        {results.testName}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        Category
                      </Typography>
                      <Chip label={results.category} size="small" sx={{ mt: 0.5 }} />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        Total Questions
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                        {results.totalQuestions}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        Status
                      </Typography>
                      <Chip
                        label={results.status}
                        size="small"
                        sx={{
                          mt: 0.5,
                          backgroundColor: '#dbeafe',
                          color: '#0369a1'
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                href="/admin/tests"
              >
                Take Another Test
              </Button>
              <Button
                variant="outlined"
                href="/admin/tests/history"
              >
                View History
              </Button>
              <Button
                variant="contained"
                onClick={() => window.print()}
                sx={{ backgroundColor: '#3b82f6' }}
              >
                Download Results
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default TestResultsPage;
