'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface DevEmailBypassProps {
  onSuccess?: () => void;
}

export function DevEmailBypass({ onSuccess }: DevEmailBypassProps) {
  const [bypassing, setBypassing] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleBypassVerification = async () => {
    setBypassing(true);
    try {
      // This is a development-only feature
      // In a real app, you'd need to implement a dev-only API endpoint
      // For now, we'll just show instructions
      toast.info('Development bypass: Use the magic link from console', {
        duration: 5000,
      });
      
      // You could implement a dev-only API endpoint here
      // await fetch('/api/dev/bypass-email-verification', { method: 'POST' });
      
    } catch (error) {
      console.error('Bypass failed:', error);
      toast.error('Bypass failed');
    } finally {
      setBypassing(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
          <Code className="h-5 w-5" />
          Development Tools
        </CardTitle>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          Development-only features for testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-lg">
          <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
            <strong>Quick Testing:</strong> Magic links are logged to the browser console in development mode.
          </p>
          <Button
            onClick={() => {
              console.log('🔍 Check the browser console for magic links after sending verification email');
              toast.info('Check browser console (F12) for magic links');
            }}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Zap className="h-4 w-4 mr-2" />
            Show Console Instructions
          </Button>
        </div>
        
        <div className="text-xs text-orange-600 dark:text-orange-400">
          This panel only appears in development mode
        </div>
      </CardContent>
    </Card>
  );
}