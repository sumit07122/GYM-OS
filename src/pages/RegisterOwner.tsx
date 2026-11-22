import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth/context';
import { generateGymSlug, validatePasswordStrength } from '@/lib/auth/helpers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dumbbell, ShieldCheck, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';

export const RegisterOwner: React.FC = () => {
  const navigate = useNavigate();
  const { signUpOwner, isLoading } = useAuth();

  // Owner Details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Gym Details
  const [gymName, setGymName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [address, setAddress] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [slugPreview, setSlugPreview] = useState('');

  const handleGymNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGymName(val);
    setSlugPreview(generateGymSlug(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const pwdCheck = validatePasswordStrength(password);
    if (!pwdCheck.valid) {
      setErrorMessage(pwdCheck.error || 'Invalid password.');
      return;
    }

    const res = await signUpOwner({
      fullName,
      email,
      phone,
      password,
      gymName,
      city,
      state,
      address,
    });

    if (res.success && res.gymSlug) {
      navigate(`/gym/${res.gymSlug}/dashboard`);
    } else {
      setErrorMessage(res.error || 'Gym registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] flex items-center justify-center p-4 transition-colors py-12">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-glow text-white mb-2">
            <Dumbbell className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Register Your Gym on GymOS
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Launch your facility ERP in under 2 minutes • 14-day full platform trial included
          </p>
        </div>

        <Card className="border border-slate-200 dark:border-white/10 shadow-2xl">
          <CardHeader className="border-b border-slate-200 dark:border-white/5 pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Gym Owner & Facility Onboarding
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-xs text-rose-500 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Step 1: Gym Owner Account Details
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Owner Full Name *"
                    placeholder="e.g. Vikram Singhania"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                  <Input
                    label="Official Mobile Number *"
                    placeholder="+91 98200 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Business Email Address *"
                    type="email"
                    placeholder="owner@mygym.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    label="Create Password (Min 8 characters) *"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Step 2: Gym Facility Information
                </p>
                <Input
                  label="Gym Display Name *"
                  placeholder="e.g. Iron Forge Elite Fitness"
                  value={gymName}
                  onChange={handleGymNameChange}
                  required
                />

                {slugPreview && (
                  <div className="p-2 bg-slate-100 dark:bg-[#070b12] rounded-lg border border-slate-200 dark:border-white/5 text-[11px]">
                    <span className="text-slate-500">Tenant URL Slug Preview: </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      https://gymos.in/gym/{slugPreview}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="City *"
                    placeholder="e.g. Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                  <Input
                    label="State *"
                    placeholder="Maharashtra"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Premises Address"
                  placeholder="e.g. Plot 15, Link Road, Andheri West"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={isLoading}
                className="w-full font-bold text-xs py-3 mt-4 shadow-glow"
              >
                {isLoading ? 'Creating Tenant...' : 'Complete Registration & Launch GymOS'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Sign in to existing account
          </Link>
        </div>
      </div>
    </div>
  );
};
