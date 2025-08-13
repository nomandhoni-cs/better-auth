'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Key, Plus, Edit } from 'lucide-react';

interface PasswordManagementProps {
  hasPassword: boolean;
  onPasswordSet: () => void;
}

export function PasswordManagement({ hasPassword, onPasswordSet }: PasswordManagementProps) {
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: newPassword,
        }),
      });

      if (response.ok) {
        toast.success('Password set successfully!');
        setShowSetPassword(false);
        setNewPassword('');
        setConfirmPassword('');
        onPasswordSet();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to set password');
      }
    } catch (error: unknown) {
      console.error('Failed to set password:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again';
      toast.error(`Failed to set password: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await authClient.changePassword({
        currentPassword: currentPassword,
        newPassword: newPassword,
      });

      if (response.data) {
        toast.success('Password changed successfully!');
        setShowChangePassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else if (response.error) {
        throw new Error(response.error.message);
      }
    } catch (error: unknown) {
      console.error('Failed to change password:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please check your current password';
      toast.error(`Failed to change password: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          Password Management
        </CardTitle>
        <CardDescription>
          {hasPassword 
            ? 'Change your account password or manage your login credentials.'
            : 'Set a password for your account to enable additional security features.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasPassword ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm">
              <Key className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-medium">Password is set</span>
            </div>
            
            <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and choose a new one.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter a new password"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                    <Input
                      id="confirm-new-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowChangePassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Key className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <p className="font-medium">No Password Set</p>
                  <p>
                    You signed up with a social provider. Setting a password will allow you to 
                    sign in with email/password and enable additional security features like 2FA.
                  </p>
                </div>
              </div>
            </div>

            <Dialog open={showSetPassword} onOpenChange={setShowSetPassword}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Set Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set Account Password</DialogTitle>
                  <DialogDescription>
                    Create a password for your account to enable additional login options and security features.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="set-new-password">New Password</Label>
                    <Input
                      id="set-new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter a strong password"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="set-confirm-password">Confirm Password</Label>
                    <Input
                      id="set-confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSetPassword(false);
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSetPassword}
                    disabled={loading || !newPassword || !confirmPassword}
                  >
                    {loading ? 'Setting...' : 'Set Password'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}