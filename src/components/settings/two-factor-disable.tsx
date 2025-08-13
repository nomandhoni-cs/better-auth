'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Shield, AlertTriangle, Trash2 } from 'lucide-react';

interface TwoFactorDisableProps {
  onDisabled: () => void;
}

export function TwoFactorDisable({ onDisabled }: TwoFactorDisableProps) {
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDisable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const response = await authClient.twoFactor.disable({
        code: verificationCode,
        password: password,
      });

      if (response.data) {
        toast.success('Two-factor authentication disabled successfully');
        onDisabled();
        setShowDisableDialog(false);
        setVerificationCode('');
        setPassword('');
      }
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      toast.error('Invalid verification code or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm">
        <Shield className="w-4 h-4 text-green-500" />
        <span className="text-green-600 font-medium">Two-factor authentication is enabled</span>
      </div>
      
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-medium text-green-800">Your account is protected</p>
            <p className="text-sm text-green-700 mt-1">
              Two-factor authentication adds an extra layer of security to your account. 
              You&apos;ll need to enter a code from your authenticator app when signing in.
            </p>
          </div>
        </div>
      </div>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-base text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Disabling 2FA will make your account less secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Disable Two-Factor Authentication
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
                <DialogDescription>
                  Are you sure you want to disable two-factor authentication? This will make your account less secure.
                  Enter a verification code from your authenticator app to confirm.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="disable-password">Current Password</Label>
                  <Input
                    id="disable-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your current password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="disable-verification-code">Verification Code</Label>
                  <Input
                    id="disable-verification-code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="text-center text-lg font-mono tracking-widest"
                    maxLength={6}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDisableDialog(false);
                    setVerificationCode('');
                    setPassword('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDisable2FA}
                  disabled={loading || verificationCode.length !== 6 || !password}
                >
                  {loading ? 'Disabling...' : 'Disable 2FA'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}