import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../../components/ui/loading-spinner';
import PageTransition from '../../components/layout/PageTransition';
import { ResetPasswordForm } from '../../components/auth/ResetPasswordForm';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const { isAuthenticated, loading } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="bg-muted flex min-h-svh items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <PageTransition>
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <motion.div 
          className="flex w-full max-w-sm flex-col gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ResetPasswordForm token={token} />
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default ResetPasswordPage;
