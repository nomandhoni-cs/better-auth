'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield, ArrowLeft } from 'lucide-react';

interface TwoFactorLoginProps {
  email?: string;
  password?: string;
  onBack: () => void;
  onSuccess: () => void;
}

export function TwoFactorLogin({ onBack, onSuccess }: TwoFactorLoginProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!verificationCode || (useBackupCode ? verificationCode.length < 8 : verificationCode.length !== 6)) {
      toast.error(useBackupCode ? 'Please enter a valid backup code' : 'Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting to verify 2FA during login:', verificationCode);
      
      // Use Better Auth's verifyTotp method for login verification
      const response = await authClient.twoFactor.verifyTotp({
        code: verificationCode,
      });

      console.log('2FA login verification response:', response);

      if (response.data) {
        toast.success('Successfully verified!');
        onSuccess();
      } else if (response.error) {
        console.error('2FA verification error:', response.error);
        throw new Error(response.error.message);
      }
    } catch (error: unknown) {
      console.error('Failed to verify 2FA code:', error);
      toast.error('Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          {useBackupCode 
            ? 'Enter one of your backup codes'
            : 'Enter the 6-digit code from your authenticator app'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="verification-code">
            {useBackupCode ? 'Backup Code' : 'Verification Code'}
          </Label>
          <Input
            id="verification-code"
            value={verificationCode}
            onChange={(e) => {
              if (useBackupCode) {
                setVerificationCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10));
              } else {
                setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
              }
            }}
            placeholder={useBackupCode ? 'abcd1234' : '000000'}
            className="text-center text-lg font-mono tracking-widest"
            maxLength={useBackupCode ? 10 : 6}
          />
        </div>

        <Button
          onClick={handleVerify}
          disabled={loading || (!useBackupCode && verificationCode.length !== 6) || (useBackupCode && verificationCode.length < 8)}
          className="w-full"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </Button>

        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setUseBackupCode(!useBackupCode);
              setVerificationCode('');
            }}
            className="w-full text-sm"
          >
            {useBackupCode ? 'Use authenticator app instead' : 'Use backup code instead'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="w-full text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}