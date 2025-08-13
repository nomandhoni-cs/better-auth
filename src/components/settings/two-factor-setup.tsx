'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Smartphone, Key, Download, AlertTriangle, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';

interface TwoFactorSetupProps {
  onEnabled: () => void;
}

export function TwoFactorSetup({ onEnabled }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'start' | 'setup' | 'verify'>('start');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const handleStartSetup = async () => {
    if (!password) {
      toast.error('Please enter your password to continue');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting to enable 2FA...');
      
      const response = await authClient.twoFactor.enable({
        password: password,
      });

      console.log('2FA enable response:', response);

      if (response?.data) {
        const { backupCodes, totpURI } = response.data;
        
        // Extract secret from TOTP URI
        const secretMatch = totpURI.match(/secret=([A-Z2-7]+)/);
        const extractedSecret = secretMatch ? secretMatch[1] : '';
        
        // Generate QR code from TOTP URI
        const qrCodeDataUrl = await QRCode.toDataURL(totpURI);
        
        setSecret(extractedSecret);
        setBackupCodes(backupCodes);
        setQrCode(qrCodeDataUrl);
        setStep('setup');
      }
    } catch (error: unknown) {
      console.error('Failed to start 2FA setup:', error);
      console.error('Error details:', {
        message: error?.message,
        status: error?.status,
        response: error?.response,
      });
      
      toast.error('Failed to start 2FA setup. Please check your password and try again.');
    } finally {
      setLoading(false);
    }
  };



  const handleVerifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      // Use Better Auth's verifyTotp method
      const response = await authClient.twoFactor.verifyTotp({
        code: verificationCode,
      });

      if (response.data) {
        toast.success('Two-factor authentication enabled successfully!');
        onEnabled();
        setStep('start');
        // Reset form
        setPassword('');
        setVerificationCode('');
        setSecret('');
        setBackupCodes([]);
        setQrCode('');
      } else if (response.error) {
        throw new Error(response.error.message);
      }
    } catch (error: unknown) {
      console.error('Failed to verify 2FA code:', error);
      console.error('Error details:', {
        message: error?.message,
        status: error?.status,
        response: error?.response,
      });
      toast.error('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'secret' | 'codes') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'secret') {
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
      } else {
        setCopiedCodes(true);
        setTimeout(() => setCopiedCodes(false), 2000);
      }
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  if (step === 'start') {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          <span>Two-factor authentication is currently disabled</span>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-medium">Authenticator App</p>
              <p className="text-sm text-muted-foreground">
                Use an app like Google Authenticator or Authy
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Key className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-medium">Backup Codes</p>
              <p className="text-sm text-muted-foreground">
                Save backup codes in case you lose access to your device
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Password Required</p>
                <p>
                  If you signed up with Google or GitHub and don&apos;t have a password, 
                  you can set one by using the &quot;Forgot Password&quot; feature on the login page 
                  with your email address.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Current Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your current password"
            />
          </div>
          
          <Button 
            onClick={handleStartSetup} 
            disabled={loading || !password}
            className="w-full"
          >
            {loading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'setup') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Set up your authenticator app</h3>
          <p className="text-sm text-muted-foreground">
            Scan the QR code with your authenticator app or enter the secret key manually
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">QR Code</CardTitle>
              <CardDescription>Scan with your authenticator app</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              {qrCode && (
                <img 
                  src={qrCode} 
                  alt="2FA QR Code" 
                  className="w-48 h-48 border rounded-lg"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Manual Entry</CardTitle>
              <CardDescription>Enter this key in your app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Secret Key</Label>
                <div className="flex space-x-2">
                  <Input 
                    value={secret} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(secret, 'secret')}
                  >
                    {copiedSecret ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="w-4 h-4" />
              Backup Codes
            </CardTitle>
            <CardDescription>
              Save these codes in a secure location. You can use them to access your account if you lose your device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div key={index} className="p-2 bg-white rounded border">
                  {code}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(backupCodes.join('\n'), 'codes')}
              className="w-full"
            >
              {copiedCodes ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All Codes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Button 
          onClick={() => setStep('verify')}
          className="w-full"
        >
          Continue to Verification
        </Button>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Verify your setup</h3>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code from your authenticator app to complete the setup
          </p>
        </div>

        <div className="max-w-sm mx-auto space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verification-code">Verification Code</Label>
            <Input
              id="verification-code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="text-center text-lg font-mono tracking-widest"
              maxLength={6}
            />
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setStep('setup')}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleVerifyAndEnable}
              disabled={loading || verificationCode.length !== 6}
              className="flex-1"
            >
              {loading ? 'Verifying...' : 'Enable 2FA'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}