'use client';

import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Fingerprint, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface PasskeySignInProps {
  onSuccess?: () => void;
  callbackURL?: string;
}

export function PasskeySignIn({ onSuccess, callbackURL }: PasskeySignInProps) {
  const [email, setEmail] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [supportsConditionalUI, setSupportsConditionalUI] = useState(false);

  useEffect(() => {
    // Check if browser supports conditional UI (autofill)
    const checkConditionalUI = async () => {
      if (
        typeof window !== 'undefined' &&
        window.PublicKeyCredential &&
        typeof window.PublicKeyCredential.isConditionalMediationAvailable === 'function'
      ) {
        try {
          const available = await window.PublicKeyCredential.isConditionalMediationAvailable();
          setSupportsConditionalUI(available);
          
          // If supported, start conditional UI
          if (available) {
            authClient.signIn.passkey({ 
              autoFill: true 
            }).catch((error) => {
              // Silently handle conditional UI errors as they're expected
              console.debug('Conditional UI error (expected):', error);
            });
          }
        } catch (error) {
          console.debug('Conditional UI check failed:', error);
        }
      }
    };

    checkConditionalUI();
  }, []);

  const handlePasskeySignIn = async (withEmail = false) => {
    if (withEmail && !email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setSigningIn(true);
    try {
      const result = await authClient.signIn.passkey({
        email: withEmail ? email.trim() : undefined,
        callbackURL: callbackURL || '/dashboard'
      });

      if (result.data) {
        toast.success('Successfully signed in with passkey!');
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Passkey sign-in failed:', error);
      
      // Handle specific WebAuthn errors
      if (error.name === 'NotAllowedError') {
        toast.error('Sign-in was cancelled or timed out');
      } else if (error.name === 'InvalidStateError') {
        toast.error('No passkey found for this account');
      } else if (error.name === 'NotSupportedError') {
        toast.error('Passkeys are not supported on this device');
      } else if (error.message?.includes('User not found')) {
        toast.error('No account found with this email address');
      } else {
        toast.error('Failed to sign in with passkey. Please try again.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5" />
          Sign in with Passkey
        </CardTitle>
        <CardDescription>
          Use your fingerprint, face, or security key to sign in securely
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick passkey sign-in */}
        <Button
          onClick={() => handlePasskeySignIn(false)}
          disabled={signingIn}
          className="w-full flex items-center gap-2"
          size="lg"
        >
          <Fingerprint className="h-4 w-4" />
          {signingIn ? 'Signing in...' : 'Sign in with Passkey'}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or with email
            </span>
          </div>
        </div>

        {/* Email-based passkey sign-in */}
        <div className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={signingIn}
              className="pl-10"
              autoComplete="username webauthn"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePasskeySignIn(true);
                }
              }}
            />
          </div>
          <Button
            onClick={() => handlePasskeySignIn(true)}
            disabled={signingIn || !email.trim()}
            variant="outline"
            className="w-full"
          >
            {signingIn ? 'Signing in...' : 'Sign in with Email + Passkey'}
          </Button>
        </div>

        {supportsConditionalUI && (
          <div className="text-xs text-muted-foreground text-center">
            💡 Tip: Your browser supports autofill. Click on the email field above to see available passkeys.
          </div>
        )}
      </CardContent>
    </Card>
  );
}