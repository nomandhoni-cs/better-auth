'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code } from 'lucide-react';
import { toast } from 'sonner';

export function DevMagicLinkDisplay() {
  // In development, we'll simulate getting magic links from console logs
  // This is a development helper component
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
          <Code className="h-5 w-5" />
          Development Mode
        </CardTitle>
        <CardDescription className="text-blue-700 dark:text-blue-300">
          Magic links are logged to the browser console in development mode
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
            How to find your magic link:
          </h4>
          <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
            <li>Open browser Developer Tools (F12)</li>
            <li>Go to the Console tab</li>
            <li>Look for the magic link URL</li>
            <li>Click the link or copy it to verify your email</li>
          </ol>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Note:</strong> In production, emails will be sent normally. 
            This console logging only happens in development mode.
          </p>
        </div>

        <Button
          onClick={() => {
            console.log('🔍 Looking for magic links in console...');
            toast.info('Check the browser console for magic links');
          }}
          variant="outline"
          className="w-full"
        >
          <Code className="h-4 w-4 mr-2" />
          Open Developer Console
        </Button>
      </CardContent>
    </Card>
  );
}