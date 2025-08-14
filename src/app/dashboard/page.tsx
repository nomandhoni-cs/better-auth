'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { PasskeyManager } from '@/components/passkey-manager';
import { EmailVerificationBanner, EmailVerifiedBanner } from '@/components/email-verification-banner';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null;
    isAnonymous?: boolean | null;
    twoFactorEnabled: boolean | null | undefined;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVerifiedMessage, setShowVerifiedMessage] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data) {
          setUser(session.data.user);
          
          // Check if user just verified their email
          if (searchParams.get('verified') === 'true' && session.data.user.emailVerified) {
            setShowVerifiedMessage(true);
            // Remove the query parametera
            router.replace('/dashboard');
          }
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
  }, [router, searchParams]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-2">Welcome back, {user.name || user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Email Verification Status */}
        <div className="mb-6">
          {showVerifiedMessage ? (
            <EmailVerifiedBanner />
          ) : !user.emailVerified ? (
            <EmailVerificationBanner 
              user={user} 
              onDismiss={() => setShowVerifiedMessage(false)} 
            />
          ) : null}
        </div>

        {/* User Info Card */}
        <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Name</label>
              <p className="text-white">{user.name || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Email</label>
              <p className="text-white">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Email Verified</label>
              <div className="flex items-center gap-2">
                <p className="text-white">{user.emailVerified ? 'Yes' : 'No'}</p>
                {user.emailVerified ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                    Unverified
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">2FA Enabled</label>
              <p className="text-white">{user.twoFactorEnabled === true ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        {/* Passkey Management */}
        <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
          {user.emailVerified ? (
            <PasskeyManager />
          ) : (
            <div className="p-6">
              <div className="text-center py-8">
                <div className="mx-auto mb-4 p-3 bg-amber-100 dark:bg-amber-900/20 rounded-full w-fit">
                  <svg className="h-8 w-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Email Verification Required</h3>
                <p className="text-gray-400 mb-4">
                  Please verify your email address to access passkey management and secure your account.
                </p>
                <p className="text-sm text-gray-500">
                  This helps prevent unauthorized access and ensures account security.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}