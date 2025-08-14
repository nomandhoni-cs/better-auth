'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface EmailVerificationBannerProps {
  user: {
    email: string;
    emailVerified: boolean;
  };
  onDismiss?: () => void;
}

export function EmailVerificationBanner({ user, onDismiss }: EmailVerificationBannerProps) {
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (user.emailVerified || dismissed) {
    return null;
  }

  const handleSendVerification = async () => {
    setSending(true);
    try {
      // Send verification email using magic link
      await authClient.signIn.magicLink({
        email: user.email,
        callbackURL: '/dashboard?verified=true'
      });
      
      if (process.env.NODE_ENV === 'development') {
        toast.success('Development mode: Check browser console for magic link!', {
          duration: 5000,
        });
      } else {
        toast.success('Verification email sent! Check your inbox.');
      }
    } catch (error: any) {
      console.error('Failed to send verification email:', error);
      if (process.env.NODE_ENV === 'development') {
        toast.info('Development mode: Check browser console for magic link!', {
          duration: 5000,
        });
      } else {
        toast.error('Failed to send verification email. Please try again.');
      }
    } finally {
      setSending(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Email Verification Required
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Please verify your email address ({user.email}) to secure your account and access all features.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Button
                onClick={handleSendVerification}
                disabled={sending}
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Mail className="h-4 w-4 mr-2" />
                {sending ? 'Sending...' : 'Send Verification Email'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EmailVerifiedBanner() {
  return (
    <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <div>
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
              Email Verified
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your email address has been successfully verified.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}