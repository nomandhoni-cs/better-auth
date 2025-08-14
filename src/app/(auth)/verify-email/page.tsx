'use client';

import { useState, useEffect, Suspense } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DevMagicLinkDisplay } from '@/components/dev-magic-link-display';
import { Mail, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

function VerifyEmailContent() {
  const [sending, setSending] = useState(false);
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<{ email: string; emailVerified: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data) {
          setUser(session.data.user);
          setEmail(session.data.user.email);
          
          // If already verified, redirect to dashboard
          if (session.data.user.emailVerified) {
            router.push('/dashboard');
            return;
          }
        } else {
          // If not authenticated, get email from URL params
          const emailParam = searchParams.get('email');
          if (emailParam) {
            setEmail(emailParam);
          } else {
            router.push('/sign-in');
            return;
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        const emailParam = searchParams.get('email');
        if (emailParam) {
          setEmail(emailParam);
        } else {
          router.push('/sign-in');
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, searchParams]);

  const handleSendVerification = async () => {
    if (!email) {
      toast.error('Email address is required');
      return;
    }
    
    setSending(true);
    try {
      await authClient.signIn.magicLink({
        email: email,
        callbackURL: '/dashboard?verified=true'
      });
      
      toast.success('Verification email sent! Check your inbox and click the link to verify.');
    } catch (error: unknown) {
      console.error('Failed to send verification email:', error);
      toast.error('Failed to send verification email. Please try again.');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-black/40 backdrop-blur-sm border border-white/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-fit">
              <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-white">Check Your Email</CardTitle>
            <CardDescription className="text-gray-400">
              We have sent a verification link to your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-300">
                Verification email sent to:
              </p>
              <p className="font-medium text-[#44cc00] break-all">{email}</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Next Steps:
                  </p>
                  <ol className="text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                    <li>Check your email inbox</li>
                    <li>Click the verification link</li>
                    <li>You&apos;ll be automatically signed in</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleSendVerification}
                disabled={sending}
                className="w-full bg-[#44cc00] hover:bg-[#44cc00]/80 text-black"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${sending ? 'animate-spin' : ''}`} />
                {sending ? 'Sending...' : 'Resend Verification Email'}
              </Button>

              {user ? (
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full border-white/20 text-gray-300 hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Link href="/sign-in">
                  <Button
                    variant="outline"
                    className="w-full border-white/20 text-gray-300 hover:bg-white/10"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign In
                  </Button>
                </Link>
              )}
            </div>

            {process.env.NODE_ENV === 'development' && (
              <DevMagicLinkDisplay />
            )}

            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>Didn&apos;t receive the email? Check your spam folder.</p>
              <p>The verification link will expire in 24 hours.</p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-blue-400">Development: Check browser console for magic links</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#44cc00]"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}