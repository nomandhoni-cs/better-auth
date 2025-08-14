'use client';

import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Key, Smartphone, Shield, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface Passkey {
  id: string;
  name?: string;
  deviceType: string;
  backedUp: boolean;
  createdAt: Date;
}

export function PasskeyManager() {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [passkeyName, setPasskeyName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const loadPasskeys = async () => {
    try {
      const result = await authClient.passkey.listUserPasskeys();
      if (result.data) {
        setPasskeys(result.data);
      }
    } catch (error) {
      console.error('Failed to load passkeys:', error);
      toast.error('Failed to load passkeys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPasskeys();
  }, []);

  const handleRegisterPasskey = async (authenticatorType?: 'platform' | 'cross-platform') => {
    if (!passkeyName.trim()) {
      toast.error('Please enter a name for your passkey');
      return;
    }

    setRegistering(true);
    try {
      await authClient.passkey.addPasskey({
        name: passkeyName.trim(),
        authenticatorAttachment: authenticatorType
      });
      
      toast.success('Passkey registered successfully!');
      setPasskeyName('');
      await loadPasskeys();
    } catch (error: unknown) {
      console.error('Failed to register passkey:', error);
      
      // Handle specific WebAuthn errors
      const err = error as { name?: string; message?: string };
      if (err.name === 'NotAllowedError') {
        toast.error('Passkey registration was cancelled or timed out');
      } else if (err.name === 'InvalidStateError') {
        toast.error('This authenticator is already registered');
      } else if (err.name === 'NotSupportedError') {
        toast.error('Passkeys are not supported on this device');
      } else {
        toast.error('Failed to register passkey. Please try again.');
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleDeletePasskey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this passkey?')) {
      return;
    }

    try {
      await authClient.passkey.deletePasskey({ id });
      toast.success('Passkey deleted successfully');
      await loadPasskeys();
    } catch (error) {
      console.error('Failed to delete passkey:', error);
      toast.error('Failed to delete passkey');
    }
  };

  const handleUpdatePasskey = async (id: string, newName: string) => {
    if (!newName.trim()) {
      toast.error('Passkey name cannot be empty');
      return;
    }

    try {
      await authClient.passkey.updatePasskey({ id, name: newName.trim() });
      toast.success('Passkey name updated successfully');
      setEditingId(null);
      await loadPasskeys();
    } catch (error) {
      console.error('Failed to update passkey:', error);
      toast.error('Failed to update passkey name');
    }
  };

  const startEditing = (passkey: Passkey) => {
    setEditingId(passkey.id);
    setEditingName(passkey.name ?? '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Passkeys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Passkeys
        </CardTitle>
        <CardDescription>
          Manage your passkeys for secure, passwordless authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Register new passkey */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter passkey name (e.g., iPhone, MacBook)"
              value={passkeyName}
              onChange={(e) => setPasskeyName(e.target.value)}
              disabled={registering}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleRegisterPasskey('platform')}
              disabled={registering || !passkeyName.trim()}
              className="flex items-center gap-2"
            >
              <Smartphone className="h-4 w-4" />
              {registering ? 'Registering...' : 'Add Device Passkey'}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleRegisterPasskey('cross-platform')}
              disabled={registering || !passkeyName.trim()}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              {registering ? 'Registering...' : 'Add Security Key'}
            </Button>
          </div>
        </div>

        {/* Existing passkeys */}
        {passkeys.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No passkeys registered yet</p>
            <p className="text-sm">Add your first passkey to enable passwordless login</p>
          </div>
        ) : (
          <div className="space-y-3">
            {passkeys.map((passkey) => (
              <div
                key={passkey.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    {passkey.deviceType === 'platform' ? (
                      <Smartphone className="h-4 w-4 text-primary" />
                    ) : (
                      <Shield className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div>
                    {editingId === passkey.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="h-8 w-48"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdatePasskey(passkey.id, editingName);
                            } else if (e.key === 'Escape') {
                              cancelEditing();
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdatePasskey(passkey.id, editingName)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEditing}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {passkey.name ?? 'Unnamed Passkey'}
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(passkey)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {passkey.deviceType === 'platform' ? 'Device' : 'Security Key'}
                          </span>
                          {passkey.backedUp && (
                            <Badge variant="secondary" className="text-xs">
                              Synced
                            </Badge>
                          )}
                          <span>•</span>
                          <span>
                            Added {new Date(passkey.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePasskey(passkey.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}