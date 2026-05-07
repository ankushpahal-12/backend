import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../Dashboard/DashboardLayout';
import Card from '../../../../components/ui/Card';
import TestHeader from './TestHeader';
import QuestionCard from './QuestionCard';
import OptionsList from './OptionsList';
import QuestionPalette from './QuestionPalette';
import TestNavigation from './TestNavigation';

// Mock Data for the test
const MOCK_QUESTIONS = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    questionText: i === 0 
        ? "What is the primary function of mitochondria in a cell?" 
        : `Sample Question ${i + 1}: This is a placeholder for the actual test question text.`,
    options: [
        { label: 'A', text: i === 0 ? "To produce energy in the form of ATP" : "Option A text" },
        { label: 'B', text: i === 0 ? "To store genetic information" : "Option B text" },
        { label: 'C', text: i === 0 ? "To synthesize proteins" : "Option C text" },
        { label: 'D', text: i === 0 ? "To detoxify harmful substances" : "Option D text" }
    ],
    explanation: i === 0 
        ? "Mitochondria are known as the powerhouse of the cell because they produce energy (ATP) through cellular respiration."
        : undefined
}));

const TestPage: React.FC = () => {
    const navigate = useNavigate();
    
    // State
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [bookmarks, setBookmarks] = useState<number[]>([]);

    const totalQuestions = MOCK_QUESTIONS.length;
    const currentQ = MOCK_QUESTIONS[currentQuestionIdx];

    const answeredQuestions = Object.keys(answers).map(Number);
    const completedPercentage = Math.round((answeredQuestions.length / totalQuestions) * 100);

    // Handlers
    const handleSelectOption = (label: string) => {
        setAnswers(prev => ({ ...prev, [currentQ.id]: label }));
    };

    const handleNext = () => {
        if (currentQuestionIdx < totalQuestions - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIdx > 0) {
            setCurrentQuestionIdx(prev => prev - 1);
        }
    };

    const handleBookmark = () => {
        setBookmarks(prev => {
            if (prev.includes(currentQ.id)) {
                return prev.filter(id => id !== currentQ.id);
            }
            return [...prev, currentQ.id];
        });
    };

    const handleSubmit = () => {
        // For demo, just alert and maybe redirect to the results page we built earlier
        alert("Test Submitted! Redirecting to results...");
        // navigate('/practice/test/result'); // If route exists
    };

    const isBookmarked = bookmarks.includes(currentQ.id);

    return (
        <DashboardLayout title="Practice Test" subtitle="Active session">
            <div className="mx-auto max-w-6xl pb-24">
                {/* Top Bar Area */}
                <TestHeader 
                    title="Biology Practice Test"
                    subtitle="50 Questions • Medium"
                    currentQuestion={currentQ.id}
                    totalQuestions={totalQuestions}
                    timeLeft="14:32"
                    score={0}
                    completedPercentage={completedPercentage}
                />

                <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start">
                    {/* Left Column: Main Test Area */}
                    <div className="flex-1 space-y-6">
                        <Card sx={{ p: { xs: 4, md: 5 } }}>
                            <QuestionCard 
                                questionText={currentQ.questionText}
                                type="Single Choice"
                                onAskHint={() => alert('AI Hint: Think about energy production.')}
                            />
                            
                            <OptionsList 
                                options={currentQ.options}
                                selectedOption={answers[currentQ.id] || null}
                                onSelectOption={handleSelectOption}
                                // We can choose to show the explanation only if answered, or always for practice mode
                                explanation={answers[currentQ.id] ? currentQ.explanation : undefined}
                            />
                        </Card>

                        <Card sx={{ p: { xs: 4, md: 5 } }}>
                            <TestNavigation 
                                onNext={handleNext}
                                onPrevious={handlePrevious}
                                onBookmark={handleBookmark}
                                onSubmit={handleSubmit}
                                isBookmarked={isBookmarked}
                                isFirstQuestion={currentQuestionIdx === 0}
                                isLastQuestion={currentQuestionIdx === totalQuestions - 1}
                            />
                        </Card>
                    </div>

                    {/* Right Column: Question Palette Sidebar */}
                    <div className="w-full lg:sticky lg:top-24 lg:w-[320px] xl:w-[380px] shrink-0">
                        <Card sx={{ p: 4, height: '100%' }}>
                            <QuestionPalette 
                                totalQuestions={totalQuestions}
                                currentQuestion={currentQ.id}
                                answeredQuestions={answeredQuestions}
                                markedForReview={bookmarks}
                                onQuestionSelect={(q) => setCurrentQuestionIdx(q - 1)}
                            />
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TestPage;
