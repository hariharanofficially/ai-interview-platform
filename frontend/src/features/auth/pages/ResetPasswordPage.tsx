import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BrainCircuit, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api/authApi';
import { Button, Input, Card } from '@components/ui';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetFormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: ResetFormData) => {
    if (!token) return toast.error('Reset token is missing');
    try {
      setIsLoading(true);
      await authApi.resetPassword(token, data.password, data.confirmPassword);
      setIsSuccess(true);
      toast.success('Password reset successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <Card className="w-full max-w-md p-8 text-center border-surface-border">
          <h2 className="text-xl font-bold text-white mb-2">Invalid Reset Link</h2>
          <p className="text-slate-400 text-sm mb-6">This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password">
            <Button>Request New Link</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center mb-8">
            <BrainCircuit className="text-primary-500" size={40} />
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Reset password</h1>
            <p className="text-slate-400 text-sm">Enter your new password below.</p>
          </div>

          {isSuccess ? (
            <Card className="p-6 border-success-500/20 bg-success-500/5 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-success-500/10 rounded-full flex items-center justify-center text-success-500">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-medium text-white">Password Updated</h3>
              <p className="text-sm text-slate-400">Your password has been successfully reset. You can now log in with your new password.</p>
              <Link to="/login" className="block pt-2">
                <Button className="w-full">Go to Login</Button>
              </Link>
            </Card>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button type="submit" className="w-full" size="lg" loading={isLoading}>
                Reset Password <ArrowRight className="ml-2" size={16} />
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-slate-400 mt-8">
            Remembered your password?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
