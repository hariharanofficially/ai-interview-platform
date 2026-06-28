import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BrainCircuit, ArrowRight, MailCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api/authApi';
import { Button, Input, Card } from '@components/ui';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      await authApi.forgotPassword(data.email);
      setIsSuccess(true);
      toast.success('Password reset link sent');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center mb-8">
            <BrainCircuit className="text-primary-500" size={40} />
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Forgot password?</h1>
            <p className="text-slate-400 text-sm">No worries, we'll send you reset instructions.</p>
          </div>

          {isSuccess ? (
            <Card className="p-6 border-primary-500/20 bg-primary-500/5 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center text-primary-400">
                <MailCheck size={24} />
              </div>
              <h3 className="text-lg font-medium text-white">Check your email</h3>
              <p className="text-sm text-slate-400">We sent a password reset link to your email address.</p>
              <Button variant="outline" className="w-full mt-4" onClick={() => setIsSuccess(false)}>
                Try another email
              </Button>
            </Card>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Email address"
                type="email"
                placeholder="name@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Button type="submit" className="w-full" size="lg" loading={isLoading}>
                Reset Password <ArrowRight className="ml-2" size={16} />
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-slate-400 mt-8">
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              &larr; Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
