import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PrivateRoute from './PrivateRoute.tsx';
import AdminRoute from './AdminRoute.tsx';
import { lazy, Suspense } from 'react';
import { Spinner } from '@components/ui';

// ── Lazy-loaded pages ─────────────────────────────────────────────────────
const LandingPage = lazy(() => import('@features/auth/pages/LandingPage'));
const LoginPage = lazy(() => import('@features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@features/auth/pages/RegisterPage'));
const VerifyEmailPage = lazy(() => import('@features/auth/pages/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('@features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@features/auth/pages/ResetPasswordPage'));

const DashboardPage = lazy(() => import('@features/dashboard/pages/DashboardPage'));
const ResumeEnhancerPage = lazy(() => import('@features/resume/pages/ResumeEnhancerPage'));
const InterviewSetupPage = lazy(() => import('@features/interview/pages/InterviewSetupPage'));
const InterviewPage = lazy(() => import('@features/interview/pages/InterviewPage'));
const InterviewReportPage = lazy(() => import('@features/interview/pages/InterviewReportPage'));
const CodingChallengePage = lazy(() => import('@features/coding/pages/CodingChallengePage'));
const AnalyticsPage = lazy(() => import('@features/analytics/pages/AnalyticsPage'));
const ProfilePage = lazy(() => import('@features/profile/pages/ProfilePage'));
const SettingsPage = lazy(() => import('@features/profile/pages/SettingsPage'));

const AdminDashboardPage = lazy(() => import('@features/admin/pages/AdminDashboardPage'));
const UserManagementPage = lazy(() => import('@features/admin/pages/UserManagementPage'));

const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const ErrorPage = lazy(() => import('@/pages/ErrorPage'));

// ── AppLayout (authenticated shell) ──────────────────────────────────────
const AppLayout = lazy(() => import('@components/layout/AppLayout'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-dark-900">
    <Spinner size="lg" />
  </div>
);

const router = createBrowserRouter([
  // ── Public routes ────────────────────────────────────────────────────
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<PageLoader />}>
        <RegisterPage />
      </Suspense>
    ),
  },
  {
    path: '/verify-email',
    element: (
      <Suspense fallback={<PageLoader />}>
        <VerifyEmailPage />
      </Suspense>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ForgotPasswordPage />
      </Suspense>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ResetPasswordPage />
      </Suspense>
    ),
  },

  // ── Authenticated candidate routes ───────────────────────────────────
  {
    element: <PrivateRoute />,
    children: [
      {
        element: (
          <Suspense fallback={<PageLoader />}>
            <AppLayout />
          </Suspense>
        ),
        children: [
          { path: '/dashboard', element: <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense> },
          { path: '/resume', element: <Suspense fallback={<PageLoader />}><ResumeEnhancerPage /></Suspense> },
          { path: '/interview/setup', element: <Suspense fallback={<PageLoader />}><InterviewSetupPage /></Suspense> },
          { path: '/interview/:id', element: <Suspense fallback={<PageLoader />}><InterviewPage /></Suspense> },
          { path: '/interview/:id/report', element: <Suspense fallback={<PageLoader />}><InterviewReportPage /></Suspense> },
          { path: '/coding', element: <Suspense fallback={<PageLoader />}><CodingChallengePage /></Suspense> },
          { path: '/analytics', element: <Suspense fallback={<PageLoader />}><AnalyticsPage /></Suspense> },
          { path: '/profile', element: <Suspense fallback={<PageLoader />}><ProfilePage /></Suspense> },
          { path: '/settings', element: <Suspense fallback={<PageLoader />}><SettingsPage /></Suspense> },
        ],
      },
    ],
  },

  // ── Admin routes ─────────────────────────────────────────────────────
  {
    element: <AdminRoute />,
    children: [
      {
        element: (
          <Suspense fallback={<PageLoader />}>
            <AppLayout />
          </Suspense>
        ),
        children: [
          { path: '/admin', element: <Suspense fallback={<PageLoader />}><AdminDashboardPage /></Suspense> },
          { path: '/admin/users', element: <Suspense fallback={<PageLoader />}><UserManagementPage /></Suspense> },
        ],
      },
    ],
  },

  // ── Error routes ─────────────────────────────────────────────────────
  {
    path: '/error',
    element: <Suspense fallback={<PageLoader />}><ErrorPage /></Suspense>,
  },
  {
    path: '*',
    element: <Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
