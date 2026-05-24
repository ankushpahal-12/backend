/* Standard Components */
import Landing from './pages/public/Landing';
import NotFound from './pages/public/NotFound';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import TermsOfService from './pages/public/TermsOfService';
import CookieConsent from './components/common/CookieConsent';

/* Auth Pages */
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ResetPassword from './pages/auth/ResetPassword';
import TwoFactorSetup from './pages/auth/TwoFactorSetup';
import ForgotPassword from './pages/auth/ForgotPassword';
import EmailVerificationPage from './pages/public/EmailVerificationPage';


/* Third-party Components */
import { CssBaseline } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import NavigationProgress from './components/ui/NavigationProgress';
import PageSecurityEnforcer from './components/common/PageSecurityEnforcer';

/* User Routes */
import PricingPage from './pages/user/Pricing';
import { NotesPage } from './pages/user/Notes';

import UserDashboard from './pages/user/Dashboard/index';
import ProfilePage from './pages/user/Profile/ProfilePage';
import UserSettings from './pages/user/UserSettings/index';
import NotesEditorPage from './pages/user/Notes/NotesEditorPage';


/* Admin Pages */
import AdminLogin from './pages/admin/AdminLogin';
import AdminSettings from './pages/admin/AdminSettings';
import AdminDashboard from './pages/admin/pages/DashboardPage';
import SecurityPage from './pages/admin/pages/SecurityPage';
import SubscriptionPage from './pages/admin/pages/Subscription';
import { AvailableTestsPage } from './pages/user/Test/pages/AvailableTestsPage';
import { AttemptPage } from './pages/user/Test/pages/AttemptPage';
import { AttemptResultPage } from './pages/user/Test/pages/AttemptResultPage';
import AdminUsersPublicView from './pages/admin/pages/UsersPage';
import { SupportTicketPage, TicketDetailsPage } from './pages/admin';
import { AdminTestsPage } from './pages/admin/tests/pages/AdminTestsPage';
import { CreateEditTestPage } from './pages/admin/tests/pages/CreateEditTestPage_PROD';
import AdminUsersSecurityWrapper from './pages/admin/security/AdminUsersSecurityWrapper';

/* Contexts */
import { AuthProvider } from './context/AuthContext';
import { AIInsightsPage} from './pages/user/AIinsights';
import { SocketProvider } from './context/SocketContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LoadingProvider } from './context/LoadingContext';
import LoadingOverlay from './components/common/LoadingOverlay';
import NetworkStatus from './system/network/components/NetworkStatus';
import { NotificationProvider } from './context/NotificationContext';


/* Helpers */
import { ENV } from './config/env';
import { CustomThemeProvider } from './context/ThemeContext';
import GuestProvision from './components/auth/GuestProvision';
import SystemProvision from './components/auth/SystemProvision';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SupportWidgetProvider, HelpBubble, HelpPanel } from './features/support_chatBot';
import EmailVerificationSecurityWrapper from './components/auth/EmailVerificationSecurityWrapper';






function App() {
  return (
    <CustomThemeProvider>
      <CssBaseline />
      <GoogleOAuthProvider clientId={ENV.googleClientId}>
        <AuthProvider>
          <SocketProvider>
            <LoadingProvider>
              <SupportWidgetProvider>
                <LoadingOverlay />
                <NetworkStatus />
                <CookieConsent />
                {/* Support widget — self-auth-gated: only visible to authenticated non-admin users */}
                <HelpBubble />
                <HelpPanel />
                <Router>
                  <NavigationProgress />
                <PageSecurityEnforcer />
                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={true}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="dark"
                  style={{
                    background: 'rgba(15,15,15,0.96)',
                  }}
                />
                <NotificationProvider>
                  <Routes>
                      {/* Admin and user routes for the login and the signup */}
                      <Route path="/user/login" element={<GuestProvision><Login /></GuestProvision>} />
                      <Route path="/user/register" element={<GuestProvision><Register /></GuestProvision>} />
                      <Route path="/user/verify-email" element={<GuestProvision><VerifyEmail /></GuestProvision>} />
                      <Route path="/user/forgot-password" element={<GuestProvision><ForgotPassword /></GuestProvision>} />
                      <Route path="/user/reset-password" element={<GuestProvision><ResetPassword /></GuestProvision>} />
                      <Route path="/auth/2fa/setup" element={<TwoFactorSetup />} />
                      <Route path="/admin/login" element={<GuestProvision><AdminLogin /></GuestProvision>} />

                      {/* Protected Admin Routes - High Security */}
                      <Route path="/admin/users"     element={<SystemProvision accessTiers={['admin']}><AdminUsersSecurityWrapper><AdminUsersPublicView /></AdminUsersSecurityWrapper></SystemProvision>}/>
                      <Route path="/admin/settings"  element={<SystemProvision accessTiers={['admin']}><AdminSettings /></SystemProvision>}/>
                      <Route path="/admin/security"  element={<SystemProvision accessTiers={['admin']}><SecurityPage /></SystemProvision>}/>
                      <Route path="/admin/dashboard" element={<SystemProvision accessTiers={['admin']}><AdminDashboard /></SystemProvision>}/>
                      <Route path="/admin/support/tickets" element={<SystemProvision accessTiers={['admin']}><SupportTicketPage /></SystemProvision>}/>
                      <Route path="/admin/support/tickets/:id"element={<SystemProvision accessTiers={['admin']}><TicketDetailsPage /></SystemProvision>}/>
                      <Route path="/admin/subscriptions"element={<SystemProvision accessTiers={['admin']}><SubscriptionPage /></SystemProvision>}/>
                      
                      {/* Protected Admin Test Routes - Manage Tests */}
                      <Route path="/admin/tests"element={<SystemProvision accessTiers={['admin']}><AdminTestsPage /></SystemProvision>}/>                      <Route path="/admin/tests/create"element={<SystemProvision accessTiers={['admin']}><CreateEditTestPage /></SystemProvision>}/>
                      <Route path="/admin/tests/edit/:testId"element={<SystemProvision accessTiers={['admin']}><CreateEditTestPage /></SystemProvision>}/>
          
                      {/* Public Email Verification Route - No authentication required */}
                      <Route path="/verify-email"element={<GuestProvision><EmailVerificationSecurityWrapper><EmailVerificationPage /></EmailVerificationSecurityWrapper></GuestProvision>}/>

                      {/* Protected User Routes */}
                      <Route path="/user/settings" element={<SystemProvision accessTiers={['user']}><UserSettings /></SystemProvision>}/>
                      <Route path="/user/dashboard"element={<SystemProvision accessTiers={['user']}><UserDashboard /></SystemProvision>}/>
                      <Route path="/user/notes"element={<SystemProvision accessTiers={['user']}><NotesPage /></SystemProvision>}/>
                      <Route path="/user/notes/editor/:noteId?" element={<SystemProvision accessTiers={['user']}><NotesEditorPage /></SystemProvision>}/>
                      <Route path="/user/pricing"  element={<SystemProvision accessTiers={['user']}><PricingPage /></SystemProvision>}/>
                      <Route path="/user/ai-insights"element={<SystemProvision accessTiers={['user']}><AIInsightsPage /></SystemProvision>}/>
                      <Route path="/user/profile"element={<SystemProvision accessTiers={['user']}><ProfilePage /></SystemProvision>}/>
                      

                      {/* Public Test Attempt Route - Accessible via email share links without authentication */}
                      <Route  path="/attempt/:shareToken" element={<AttemptPage />}/>
                      
                      {/* Protected User Test Routes - Take Tests */}
                      <Route path="/tests"element={<SystemProvision accessTiers={['user']}><AvailableTestsPage /></SystemProvision>}/>
                      <Route path="/attempt/result/:attemptId"element={<SystemProvision accessTiers={['user']}><AttemptResultPage /></SystemProvision>}/>
                      
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/terms-of-service" element={<TermsOfService />} />
                      <Route path="/" element={<Landing />} />
                      <Route path="*" element={<NotFound />} />


                  </Routes>
                </NotificationProvider>
              </Router>
              </SupportWidgetProvider>
            </LoadingProvider>
          </SocketProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </CustomThemeProvider>
  );
}

export default App;
