'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Zap } from 'lucide-react';
import { toast } from 'sonner';

export function DevEmailBypass() {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

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