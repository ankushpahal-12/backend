import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import Login from './pages/auth/Login';
import TwoFactorSetup from './pages/auth/TwoFactorSetup';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import EmailVerificationPage from './pages/public/EmailVerificationPage';
import ResetPassword from './pages/auth/ResetPassword';
import { PracticePage } from './pages/user/Practise';
import ProfilePage from './pages/user/Profile/ProfilePage';
import PricingPage from './pages/user/Pricing';
import { TestPage } from './pages/user/Practise/Test';
import SubscriptionPage from './pages/admin/pages/Subscription';


import { CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import NavigationProgress from './components/ui/NavigationProgress';
import PageSecurityEnforcer from './components/common/PageSecurityEnforcer';

import { LoadingProvider } from './context/LoadingContext';
import LoadingOverlay from './components/common/LoadingOverlay';
import CookieConsent from './components/common/CookieConsent';
import { NotificationProvider } from './context/NotificationContext';
import ForgotPassword from './pages/auth/ForgotPassword';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDashboardPublicView from './pages/admin/pages/DashboardPage';
import AdminUsersPublicView from './pages/admin/pages/UsersPage';
import SecurityPage from './pages/admin/pages/SecurityPage';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import UserSettings from './pages/user/UserSettings/index';
import UserDashboard from './pages/user/Dashboard/index';
import { NotesPage } from './pages/user/Notes';
import {
  AIInsightsPage,
  AISummary,
  AIReasoning,
  AIRecommendations,
  PerformanceChart,
  Strengths,
  WeakAreas,
} from './pages/user/AIinsights';
import MainLayout from './components/layouts/MainLayout';
import AdminSettings from './pages/admin/AdminSettings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import SystemProvision from './components/auth/SystemProvision';
import GuestProvision from './components/auth/GuestProvision';
import AdminUsersSecurityWrapper from './components/admin/AdminUsersSecurityWrapper';
import EmailVerificationSecurityWrapper from './components/auth/EmailVerificationSecurityWrapper';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CustomThemeProvider } from './context/ThemeContext';
import { ENV } from './config/env';
import NotesEditorPage from './pages/user/Notes/NotesEditorPage';

const SidebarPreviewPage = ({ title }: { title: string }) => (
  <MainLayout>
    <div className="max-w-5xl mx-auto py-10">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-400 font-bold">Sidebar Preview</p>
        <h2 className="mt-3 text-3xl font-black text-white">{title}</h2>
        <p className="mt-3 text-zinc-400 text-sm">
          This is a public preview route for your user sidebar. You can open this page without login.
        </p>
      </div>
    </div>
  </MainLayout>
);

const AIComponentPreview = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <MainLayout>
    <div className="max-w-6xl mx-auto py-8 space-y-4">
      <h2 className="text-2xl font-black text-slate-900">{title}</h2>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">{children}</div>
    </div>
  </MainLayout>
);

function App() {
  return (
    <CustomThemeProvider>
      <CssBaseline />
      <GoogleOAuthProvider clientId={ENV.googleClientId}>
        <AuthProvider>
          <SocketProvider>
            <LoadingProvider>
              <LoadingOverlay />
              <CookieConsent />
              <Router>
                <NavigationProgress />
                <PageSecurityEnforcer />
                <Toaster
                  position="top-center"
                  toastOptions={{
                    duration: 5000,
                    style: {
                      background: 'rgba(15,15,15,0.96)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '16px',
                      backdropFilter: 'blur(16px)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      padding: '14px 20px',
                      maxWidth: '420px',
                    },
                    success: {
                      iconTheme: { primary: '#10b981', secondary: '#000' },
                      style: { borderColor: 'rgba(16,185,129,0.25)' },
                    },
                    error: {
                      iconTheme: { primary: '#ef4444', secondary: '#000' },
                      style: { borderColor: 'rgba(239,68,68,0.25)' },
                    },
                  }}
                />
                <NotificationProvider>
                  <Routes>
                    <Route path="/user/login" element={<GuestProvision><Login /></GuestProvision>} />
                    <Route path="/user/register" element={<GuestProvision><Register /></GuestProvision>} />
                    <Route path="/user/verify-email" element={<GuestProvision><VerifyEmail /></GuestProvision>} />
                      <Route path="/user/forgot-password" element={<GuestProvision><ForgotPassword /></GuestProvision>} />
                      <Route path="/user/reset-password" element={<GuestProvision><ResetPassword /></GuestProvision>} />
                      <Route path="/auth/2fa/setup" element={<TwoFactorSetup />} />
                      <Route path="/admin/login" element={<GuestProvision><AdminLogin /></GuestProvision>} />

                      {/* Protected Admin Routes - High Security */}
                      <Route
                        path="/admin/dashboard"
                        element={<SystemProvision accessTiers={['admin']}><AdminDashboard /></SystemProvision>}
                      />
                      <Route
                        path="/admin/settings"
                        element={<SystemProvision accessTiers={['admin']}><AdminSettings /></SystemProvision>}
                      />
                      <Route
                        path="/admin/security"
                        element={<SystemProvision accessTiers={['admin']}><SecurityPage /></SystemProvision>}
                      />
                      <Route
                        path="/admin/users"
                        element={<SystemProvision accessTiers={['admin']}><AdminUsersSecurityWrapper><AdminUsersPublicView /></AdminUsersSecurityWrapper></SystemProvision>}
                      />

                      {/* Public Email Verification Route - No authentication required */}
                      <Route
                        path="/verify-email"
                        element={<GuestProvision><EmailVerificationSecurityWrapper><EmailVerificationPage /></EmailVerificationSecurityWrapper></GuestProvision>}
                      />

                      {/* Protected User Routes */}
                      <Route
                        path="/user/settings"
                        element={<SystemProvision><UserSettings /></SystemProvision>}
                      />

                    {/* Public sidebar preview routes (no login required) */}
                    <Route path="/dashboard" element={<UserDashboard />} />
                    <Route path="/admin/dashboard-public" element={<AdminDashboardPublicView />} />
                    <Route path="/admin/subscriptions-public" element={<SubscriptionPage />} />
                    <Route path="/admin/security-public" element={<SecurityPage />} />
                    <Route path="/practice" element={<PracticePage />} />
                    <Route path="/practice/test/:subject" element={<TestPage />} />
                    <Route path="/notes" element={<NotesPage />} />
                    <Route path="/notes/editor/:noteId?" element={<NotesEditorPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/analytics" element={<SidebarPreviewPage title="Analytics" />} />
                    <Route path="/ai-insights" element={<AIInsightsPage />} />
                    <Route
                      path="/ai-insights/summary"
                      element={
                        <AIComponentPreview title="AI Summary Preview">
                          <AISummary summary="You scored 16 out of 20 with 80% accuracy. Your performance was strong in Physics and Maths, while Biology needs more practice." />
                        </AIComponentPreview>
                      }
                    />
                    <Route
                      path="/ai-insights/strengths"
                      element={
                        <AIComponentPreview title="Strengths Preview">
                          <Strengths
                            items={[
                              {
                                title: 'Strong in Physics',
                                description: 'Accuracy: 90%',
                                metric: 'Stable performance in recent tests',
                                showTrend: true,
                              },
                              {
                                title: 'Good Time Management',
                                description: 'Avg. time per question: 38s',
                                metric: 'Within target range',
                                showTrend: true,
                              },
                              {
                                title: 'Consistent Performance',
                                description: 'Balanced score trend',
                                metric: 'Low score variation',
                                showTrend: true,
                              },
                            ]}
                          />
                        </AIComponentPreview>
                      }
                    />
                    <Route
                      path="/ai-insights/weak-areas"
                      element={
                        <AIComponentPreview title="Weak Areas Preview">
                          <WeakAreas
                            items={[
                              { topic: 'Biology Concepts', accuracy: 60 },
                              { topic: 'Theoretical Questions', accuracy: 55 },
                              { topic: 'Diagram Based Questions', accuracy: 50 },
                            ]}
                          />
                        </AIComponentPreview>
                      }
                    />
                    <Route
                      path="/ai-insights/reasoning"
                      element={
                        <AIComponentPreview title="AI Reasoning Preview">
                          <AIReasoning
                            points={[
                              { text: 'Strong Physics performance boosted your final score.', positive: true },
                              { text: 'Biology accuracy pulled your total score down.', positive: false },
                              { text: 'You maintained a healthy pace across all questions.', positive: true },
                            ]}
                          />
                        </AIComponentPreview>
                      }
                    />
                    <Route
                      path="/ai-insights/recommendations"
                      element={
                        <AIComponentPreview title="AI Recommendations Preview">
                          <AIRecommendations
                            items={[
                              {
                                title: 'Focus on Biology',
                                description: 'Practice more cell biology, genetics and ecology topics.',
                              },
                              {
                                title: 'Practice Weak Questions',
                                description: 'Retry missed or incorrect questions to improve accuracy.',
                              },
                              {
                                title: 'Take More Mock Tests',
                                description: 'Build consistency and speed with timed sessions.',
                              },
                            ]}
                          />
                        </AIComponentPreview>
                      }
                    />
                    <Route
                      path="/ai-insights/performance-chart"
                      element={
                        <AIComponentPreview title="Performance Chart Preview">
                          <PerformanceChart
                            subjectData={[
                              { name: 'Physics', value: 90, color: '#16a34a' },
                              { name: 'Chemistry', value: 75, color: '#2563eb' },
                              { name: 'Biology', value: 60, color: '#f59e0b' },
                              { name: 'Maths', value: 85, color: '#7c3aed' },
                            ]}
                            trendData={[
                              { test: 'Test 1', accuracy: 40 },
                              { test: 'Test 2', accuracy: 70 },
                              { test: 'Test 3', accuracy: 64 },
                              { test: 'Test 4', accuracy: 78 },
                              { test: 'Latest', accuracy: 88 },
                            ]}
                          />
                        </AIComponentPreview>
                      }
                    />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SidebarPreviewPage title="Settings" />} />
                    <Route path="/preview/sidebar" element={<SidebarPreviewPage title="Sidebar Preview" />} />

                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/" element={<Landing />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </NotificationProvider>
              </Router>
            </LoadingProvider>
          </SocketProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </CustomThemeProvider>
  );
}

export default App;
