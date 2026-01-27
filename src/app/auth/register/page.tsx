'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle, Check, X } from 'lucide-react';
import { registerUser } from '@/lib/auth/actions';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isPasswordStrong = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    // Client-side validation
    if (!isPasswordStrong) {
      setError('Please meet all password requirements');
      setLoading(false);
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await registerUser(formData);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } else {
      setError(result.error || 'Registration failed');
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative border-0 shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-1 gradient-brand rounded-t-lg" />

        <CardHeader className="space-y-4 text-center pb-2">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center justify-center gap-2 mx-auto">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl gradient-brand shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </Link>

          <div>
            <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
            <CardDescription className="mt-1">
              Start your learning journey today
            </CardDescription>
          </div>
        </CardHeader>

        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="animate-slide-up">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="animate-slide-up border-emerald bg-emerald/10">
                <CheckCircle className="h-4 w-4 text-emerald" />
                <AlertDescription className="text-emerald">
                  Account created! Redirecting to login...
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10"
                  required
                  disabled={success}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  required
                  disabled={success}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  className="pl-10"
                  required
                  disabled={success}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {/* Password strength indicator */}
              {password.length > 0 && (
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    {hasMinLength ? <Check className="h-3 w-3 text-emerald" /> : <X className="h-3 w-3 text-muted-foreground" />}
                    <span className={hasMinLength ? 'text-emerald' : 'text-muted-foreground'}>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasUppercase ? <Check className="h-3 w-3 text-emerald" /> : <X className="h-3 w-3 text-muted-foreground" />}
                    <span className={hasUppercase ? 'text-emerald' : 'text-muted-foreground'}>One uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasLowercase ? <Check className="h-3 w-3 text-emerald" /> : <X className="h-3 w-3 text-muted-foreground" />}
                    <span className={hasLowercase ? 'text-emerald' : 'text-muted-foreground'}>One lowercase letter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasNumber ? <Check className="h-3 w-3 text-emerald" /> : <X className="h-3 w-3 text-muted-foreground" />}
                    <span className={hasNumber ? 'text-emerald' : 'text-muted-foreground'}>One number</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="pl-10"
                  required
                  disabled={success}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {confirmPassword.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  {passwordsMatch ? (
                    <>
                      <Check className="h-3 w-3 text-emerald" />
                      <span className="text-emerald">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3 text-destructive" />
                      <span className="text-destructive">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full gradient-brand text-white btn-shine"
              disabled={loading || success}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>

            <p className="text-xs text-center text-muted-foreground">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:underline">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
