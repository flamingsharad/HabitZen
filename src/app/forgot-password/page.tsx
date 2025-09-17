
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { sendPasswordReset } = useAuth();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await sendPasswordReset(email);
      setSubmitted(true);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No user found with this email address.');
      } else {
        setError('Failed to send password reset email. Please try again.');
      }
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Forgot Password</h1>
            <p className="text-balance text-muted-foreground">
              {submitted 
                ? "Check your email for a password reset link." 
                : "Enter your email to receive a password reset link."
              }
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleResetPassword} className="grid gap-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">
                Send Reset Link
              </Button>
            </form>
          ) : (
             <div className="text-center mt-4 text-sm text-muted-foreground">
                <p>If you don't see the email in your inbox, please check your spam folder.</p>
            </div>
          )}

          <div className="mt-4 text-center text-sm">
            Remember your password?{' '}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://picsum.photos/seed/3/1200/1800"
          alt="Image"
          width="1200"
          height="1800"
          data-ai-hint="calm water"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
