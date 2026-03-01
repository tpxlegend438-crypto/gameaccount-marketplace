import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { LogIn, Shield } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  message?: string;
}

export default function AuthGuard({ children, message }: AuthGuardProps) {
  const { identity, login, loginStatus, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-neon-green border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
          <Shield size={32} className="text-neon-green" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-bold text-foreground">Login Required</h2>
          <p className="text-muted-foreground text-sm">
            {message || 'You need to be logged in to access this feature.'}
          </p>
        </div>
        <Button
          onClick={login}
          disabled={loginStatus === 'logging-in'}
          className="bg-neon-green text-game-dark font-heading font-bold px-8 shadow-neon-green hover:bg-neon-green/90"
        >
          <LogIn size={16} className="mr-2" />
          {loginStatus === 'logging-in' ? 'Logging in...' : 'Login to Continue'}
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
