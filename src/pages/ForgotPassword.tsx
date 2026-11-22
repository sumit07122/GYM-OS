import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth/context';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dumbbell, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const res = await resetPassword(email);
    setLoading(false);
    if (res.success) {
      setStatus({
        success: true,
        message: 'Password reset link dispatched. Please check your inbox.',
      });
    } else {
      setStatus({
        success: false,
        message: res.error || 'Failed to send password reset email.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-glow text-white mb-2">
            <Dumbbell className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your registered email to receive a secure recovery link
          </p>
        </div>

        <Card className="border border-slate-200 dark:border-white/10 shadow-2xl">
          <CardContent className="p-6 space-y-4">
            {status && (
              <div
                className={`p-3 rounded-lg flex items-center gap-2 text-xs ${
                  status.success
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400'
                }`}
              >
                {status.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                )}
                <span>{status.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <Input
                label="Registered Business / Member Email"
                type="email"
                placeholder="name@fitness.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={loading}
                className="w-full font-bold text-xs py-2.5"
              >
                {loading ? 'Sending link...' : 'Send Password Reset Link'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-xs">
          <Link
            to="/login"
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};
