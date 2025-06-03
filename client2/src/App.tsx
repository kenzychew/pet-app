// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';

// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import PetPage from './pages/PetPage';
import AppointmentPage from './pages/AppointmentPage';
import AppointmentDetailPage from './pages/AppointmentDetailPage';
import GroomerSchedulePage from './pages/GroomerSchedulePage';
import GroomerCalendarPage from './pages/GroomerCalendarPage';
import PetDetailPage from './pages/PetDetailPage';
import ServiceRatesPage from './pages/ServiceRatesPage';
import GroomingPolicyPage from './pages/GroomingPolicyPage';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            {/* Public routes - accessible to everyone */}
            <Route path="/" element={<HomePage />} />
            <Route path="/service-rates" element={<ServiceRatesPage />} />
            <Route path="/grooming-policy" element={<GroomingPolicyPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            
            {/* Protected routes for all authenticated users */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
            
            {/* Protected routes for pet owners only */}
            <Route element={<ProtectedRoute allowedRoles={["owner"]} />}>
              <Route path="/pets" element={<PetPage />} />
              <Route path="/pets/:petId" element={<PetDetailPage />} />
              <Route path="/appointments" element={<AppointmentPage />} />
              <Route path="/appointments/:id" element={<AppointmentDetailPage />} />
            </Route>
            
            {/* Protected routes for groomers only */}
            <Route element={<ProtectedRoute allowedRoles={["groomer"]} />}>
              <Route path="/schedule" element={<GroomerSchedulePage />} />
              <Route path="/calendar" element={<GroomerCalendarPage />} />
            </Route>
            
            {/* Fallback route - redirect to home for unauthenticated, dashboard for authenticated */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
