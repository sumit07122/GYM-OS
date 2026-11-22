import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth/context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Dumbbell, ShieldAlert, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import type { GymRole } from '@/types';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, session, isLoading } = useAuth();

  const [role, setRole] = useState<GymRole>('gym_owner');
  const [email, setEmail] = useState('owner@olympiafitness.in');
  const [password, setPassword] = useState('GymOwner@2026!');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = await signIn(email, password, role);
    if (res.success) {
      const targetSlug = res.gymSlug || session?.gymSlug || 'olympia-fitness';
      const targetRole = res.role || role;
      if (targetRole === 'member') {
        navigate(`/gym/${targetSlug}/member`);
      } else {
        navigate(`/gym/${targetSlug}/dashboard`);
      }
    } else {
      setErrorMessage(res.error || 'Invalid credentials.');
    }
  };

  const handleFillDemo = (targetRole: GymRole) => {
    setRole(targetRole);
    setErrorMessage('');
    if (targetRole === 'gym_owner') {
      setEmail('owner@olympiafitness.in');
      setPassword('GymOwner@2026!');
    } else {
      setEmail('aarav.mehta@gmail.com');
      setPassword('MemberPass@2026!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Product Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-glow text-white mb-2">
            <Dumbbell className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            GymOS Enterprise
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            White-Label Multi-Tenant Fitness ERP SaaS
          </p>
        </div>

        <Card className="border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
          {/* Role Persona Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-[#070b12] border-b border-slate-200 dark:border-white/5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleFillDemo('gym_owner')}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                role === 'gym_owner'
                  ? 'bg-white dark:bg-[#151D2E] text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Gym Owner ERP
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('member')}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                role === 'member'
                  ? 'bg-white dark:bg-[#151D2E] text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Member Portal
            </button>
          </div>

          <CardContent className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-xs text-rose-500 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <Input
                label="Registered Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@fitness.in"
                required
              />

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={isLoading}
                className="w-full font-bold text-xs py-2.5 mt-2"
              >
                {isLoading ? 'Signing in...' : `Sign In as ${role === 'gym_owner' ? 'Gym Owner' : 'Member'}`}
              </Button>
            </form>

            {/* Quick Demo Pre-Fill Helper */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Quick Evaluation Demo:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">1-Click Fill</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => handleFillDemo('gym_owner')}
                  className="w-1/2 text-[11px] py-1"
                >
                  Fill Owner
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => handleFillDemo('member')}
                  className="w-1/2 text-[11px] py-1"
                >
                  Fill Member
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Link to Owner Registration */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          Want to register your gym?{' '}
          <Link
            to="/register"
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            Register Gym & Start 14-Day Free Trial
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
