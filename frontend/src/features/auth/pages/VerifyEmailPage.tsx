import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { BrainCircuit, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { authApi } from '../api/authApi';
import { Button, Card } from '@components/ui';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Verification token is missing.');
      return;
    }

    if (hasVerified.current) return;
    hasVerified.current = true;

    const verify = async () => {
      try {
        await authApi.verifyEmail(token);
        setStatus('success');
      } catch (error: any) {
        setStatus('error');
        setErrorMessage(error.response?.data?.message || 'Email verification failed.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <Card className="w-full max-w-md p-8 text-center border-surface-border">
        <div className="flex justify-center mb-6">
          <BrainCircuit className="text-primary-500" size={40} />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-6">Email Verification</h1>

        {status === 'loading' && (
          <div className="space-y-4 py-4">
            <Loader2 className="mx-auto h-8 w-8 text-primary-500 animate-spin" />
            <p className="text-slate-400 text-sm">Verifying your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-success-500/10 rounded-full flex items-center justify-center text-success-500 mb-4">
              <CheckCircle2 size={32} />
            </div>
            <p className="text-slate-300">Your email has been verified successfully. You can now log in to your account.</p>
            <Link to="/login" className="block pt-4">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-danger-500/10 rounded-full flex items-center justify-center text-danger-500 mb-4">
              <XCircle size={32} />
            </div>
            <p className="text-slate-300">{errorMessage}</p>
            <p className="text-sm text-slate-400">Please try registering again or contact support if the problem persists.</p>
            <Link to="/register" className="block pt-4">
              <Button variant="outline" className="w-full">Back to Registration</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
