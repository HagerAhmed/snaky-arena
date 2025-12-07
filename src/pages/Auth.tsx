import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const navigate = useNavigate();
  const { user, login, signup, error, loading, clearError } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
    return success;
  };

  const handleSignup = async (username: string, email: string, password: string) => {
    const success = await signup(username, email, password);
    if (success) {
      navigate('/');
    }
    return success;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 px-4">
      <AuthForm
        onLogin={handleLogin}
        onSignup={handleSignup}
        error={error}
        loading={loading}
        onClearError={clearError}
      />
    </div>
  );
};

export default Auth;
