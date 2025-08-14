'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DevEmailBypass } from '@/components/dev-email-bypass';
import { Mail, AlertTriangle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface EmailVerificationGuardProps {
  children: React.ReactNode;
  requireVerification?: boolean;
}

export function EmailVerificationGuard({ 
  children, 
  requireVerification = false 
}: EmailVerificationGuardProps) {
  const [user, setUser] = useState<{ 
    email: string; 
    emailVerified: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data) {
          setUser(session.data.user);
        } else {
          router.push('/sign-in');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/sign-in');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSendVerification = async () => {
    if (!user?.email) return;
    
    setSending(true);
    try {
      await authClient.signIn.magicLink({
        email: user.email,
        callbackURL: '/dashboard?verified=true'
      });
      
      if (process.env.NODE_ENV === 'development') {
        toast.success('Development mode: Check browser console for magic link!', {
          duration: 6000,
        });
      } else {
        toast.success('Verification email sent! Check your inbox and click the link to verify.');
      }
    } catch (error: unknown) {
      console.error('Failed to send verification email:', error);
      if (process.env.NODE_ENV === 'development') {
        toast.info('Development mode: Check browser console for magic link!', {
          duration: 6000,
        });
      } else {
        toast.error('Failed to send verification email. Please try again.');
      }
    } finally {
      setSending(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push('/sign-in');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#44cc00]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // If email verification is required and user is not verified, show verification screen
  if (requireVerification && !user.emailVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-amber-200 bg-black/40 backdrop-blur-sm border border-white/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-amber-100 dark:bg-amber-900/20 rounded-full w-fit">
                <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-white">Email Verification Required</CardTitle>
              <CardDescription className="text-gray-400">
                You must verify your email address to access this feature and protect against unauthorized access.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-300">
                  We sent a verification link to:
                </p>
                <p className="font-medium text-[#44cc00]">{user.email}</p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleSendVerification}
                  disabled={sending}
                  className="w-full bg-[#44cc00] hover:bg-[#44cc00]/80 text-black"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {sending ? 'Sending...' : 'Resend Verification Email'}
                </Button>

                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full border-white/20 text-gray-300 hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <DevEmailBypass />
              )}

              <div className="text-xs text-gray-500 text-center">
                <p>Check your spam folder if you don&apos;t see the email.</p>
                <p className="mt-1">The verification link will expire in 24 hours.</p>
                {process.env.NODE_ENV === 'development' && (
                  <p className="mt-1 text-blue-400">Development: Magic links are logged to browser console</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}