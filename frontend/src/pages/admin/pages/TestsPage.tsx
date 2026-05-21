import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Typography,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import { Search, Play, Clock, BookOpen, AlertCircle, Zap } from 'lucide-react';
import Loader from '../components/ui/Loader';
import TestTaking from '../components/TestTaking';
import { useTests } from '../tests/hooks/useTests';
import toast from 'react-hot-toast';

export const TestsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTest, setSelectedTest] = useState<any | null>(null);
  const [isTakingTest, setIsTakingTest] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewTest, setPreviewTest] = useState<any | null>(null);

  const { tests, loading, error, fetchTests } = useTests();

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handleStartTest = useCallback(async (test: any) => {
    setSelectedTest(test);
    setIsTakingTest(true);
  }, []);

  const handlePreviewTest = useCallback((test: any) => {
    setPreviewTest(test);
    setPreviewDialogOpen(true);
  }, []);

  const handleTestComplete = useCallback((results: any) => {
    setIsTakingTest(false);
    toast.success('Test completed successfully!');
    
    // Navigate to results page or show results dialog
    setTimeout(() => {
      window.location.href = `/admin/tests/results/${results.attemptId}`;
    }, 1500);
  }, []);

  const handleExitTest = useCallback(() => {
    setIsTakingTest(false);
    setSelectedTest(null);
  }, []);

  const filteredTests = tests.filter(test => {
    const query = searchQuery.toLowerCase();
    return (
      test.title?.toLowerCase().includes(query) ||
      test.category?.toLowerCase().includes(query) ||
      test.description?.toLowerCase().includes(query)
    );
  });

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Biology': '#10b981',
      'Physics': '#3b82f6',
      'Chemistry': '#f59e0b',
      'Mathematics': '#8b5cf6',
      'History': '#ec4899',
      'English': '#06b6d4'
    };
    return colors[category] || '#6b7280';
  };

  // Show test taking interface
  if (isTakingTest && selectedTest) {
    return (
      <TestTaking
        testId={selectedTest._id}
        testTitle={selectedTest.title}
        durationMinutes={selectedTest.durationMinutes}
        questions={selectedTest.questions}
        totalMarks={selectedTest.totalMarks}
        onSubmit={handleTestComplete}
        onClose={handleExitTest}
      />
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f3f4f6', pb: 4 }}>
      {/* Header */}
      <Box sx={{ backgroundColor: '#ffffff', p: 3, borderBottom: '1px solid #e5e7eb' }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <BookOpen size={32} color="#3b82f6" />
              <div>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1f2937' }}>
                  Available Tests
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Take online tests and assess your knowledge
                </Typography>
              </div>
            </Box>
          </Grid>
          <Grid item>
            <Chip
              icon={<Zap size={16} />}
              label={`${filteredTests.length} Tests Available`}
              sx={{
                backgroundColor: '#dbeafe',
                color: '#0369a1',
                fontWeight: 600
              }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Loading State */}
      {loading && (
        <Loader
          message="Loading available tests..."
          isVisible={true}
          status="loading"
        />
      )}

      {/* Error State */}
      {error && !loading && (
        <Box sx={{ p: 3 }}>
          <Alert
            severity="error"
            icon={<AlertCircle size={20} />}
            action={
              <Button size="small" onClick={fetchTests}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </Box>
      )}

      {/* Content */}
      {!loading && (
        <Box sx={{ p: 3 }}>
          {/* Search Bar */}
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search tests by name, category, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} color="#6b7280" />
                  </InputAdornment>
                )
              }}
              sx={{
                backgroundColor: '#ffffff',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Box>

          {/* Tests Grid */}
          {filteredTests.length > 0 ? (
            <Grid container spacing={3}>
              {filteredTests.map((test) => (
                <Grid item xs={12} sm={6} md={4} key={test._id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  >
                    <CardContent sx={{ flex: 1 }}>
                      {/* Category Badge */}
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={test.category}
                          size="small"
                          sx={{
                            backgroundColor: getCategoryColor(test.category),
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: '11px'
                          }}
                        />
                      </Box>

                      {/* Test Title */}
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: '#1f2937',
                          mb: 1,
                          lineHeight: 1.3
                        }}
                      >
                        {test.title}
                      </Typography>

                      {/* Test Description */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#6b7280',
                          mb: 3,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {test.description || 'No description provided'}
                      </Typography>

                      {/* Test Stats */}
                      <Stack spacing={1.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Clock size={16} color="#6b7280" />
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            Duration: <strong>{test.durationMinutes} minutes</strong>
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BookOpen size={16} color="#6b7280" />
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            Questions: <strong>{test.questions?.length || 0}</strong>
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AlertCircle size={16} color="#6b7280" />
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            Total Marks: <strong>{test.totalMarks}</strong>
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Test Instructions Preview */}
                      {test.instructions && (
                        <Box
                          sx={{
                            mt: 3,
                            p: 2,
                            backgroundColor: '#f3f4f6',
                            borderRadius: 1,
                            borderLeft: '4px solid #3b82f6'
                          }}
                        >
                          <Typography variant="caption" sx={{ color: '#4b5563', fontWeight: 600 }}>
                            Instructions
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#6b7280',
                              display: 'block',
                              mt: 0.5,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {test.instructions}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>

                    {/* Card Actions */}
                    <CardActions sx={{ pt: 0, gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handlePreviewTest(test)}
                      >
                        Preview
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Play size={16} />}
                        onClick={() => handleStartTest(test)}
                        sx={{
                          backgroundColor: '#3b82f6',
                          flex: 1,
                          '&:hover': {
                            backgroundColor: '#2563eb'
                          }
                        }}
                      >
                        Start Test
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                backgroundColor: '#ffffff',
                borderRadius: 2,
                border: '2px dashed #e5e7eb'
              }}
            >
              <BookOpen size={48} color="#d1d5db" sx={{ mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#6b7280', fontWeight: 600, mb: 1 }}>
                {searchQuery ? 'No tests found' : 'No tests available'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                {searchQuery
                  ? 'Try adjusting your search criteria'
                  : 'Check back later for new tests'}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Test Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{previewTest?.title}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1f2937' }}>
                Category
              </Typography>
              <Chip label={previewTest?.category} size="small" sx={{ mt: 0.5 }} />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1f2937' }}>
                Description
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
                {previewTest?.description || 'No description'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1f2937' }}>
                Test Details
              </Typography>
              <Stack spacing={0.5} sx={{ mt: 1 }}>
                <Typography variant="body2">
                  <strong>Duration:</strong> {previewTest?.durationMinutes} minutes
                </Typography>
                <Typography variant="body2">
                  <strong>Questions:</strong> {previewTest?.questions?.length || 0}
                </Typography>
                <Typography variant="body2">
                  <strong>Total Marks:</strong> {previewTest?.totalMarks}
                </Typography>
              </Stack>
            </Box>

            {previewTest?.instructions && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1f2937' }}>
                  Instructions
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
                  {previewTest.instructions}
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<Play size={16} />}
            onClick={() => {
              setPreviewDialogOpen(false);
              handleStartTest(previewTest);
            }}
          >
            Start Test
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TestsPage;
