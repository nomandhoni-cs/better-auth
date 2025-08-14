'use client';

import { PasskeySignIn } from '@/components/passkey-signin';
import { PasskeyManager } from '@/components/passkey-manager';
import { EmailVerificationGuard } from '@/components/email-verification-guard';
import { authClient } from '@/lib/auth-client';
import { useState, useEffect } from 'react';

export default function PasskeyDemo() {
  const [user, setUser] = useState<{ 
    name?: string; 
    email: string; 
    emailVerified: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data) {
          setUser(session.data.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      setUser(null);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Passkey Demo</h1>
          <p className="text-gray-400">
            Test the secure, passwordless authentication with passkeys
          </p>
        </div>

        {!user ? (
          <div className="max-w-md mx-auto">
            <PasskeySignIn onSuccess={() => window.location.reload()} />
          </div>
        ) : (
          <EmailVerificationGuard requireVerification={true}>
            <div className="space-y-8">
              <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Welcome back!</h2>
                    <p className="text-gray-400">{user.name || user.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
                <PasskeyManager />
              </div>
            </div>
          </EmailVerificationGuard>
        )}

        <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">How to Test Passkeys</h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start gap-3">
              <span className="bg-[#44cc00] text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
              <p>If not signed in, use the passkey sign-in above or go to the regular sign-in page</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-[#44cc00] text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
              <p>Once signed in, register a new passkey using the form above</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-[#44cc00] text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
              <p>Sign out and try signing back in with your passkey</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-[#44cc00] text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
              <p>For testing, use Chrome DevTools → Security → WebAuthn to create virtual authenticators</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}