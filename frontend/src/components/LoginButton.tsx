import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={isLoggingIn}
      size="sm"
      variant={isAuthenticated ? 'outline' : 'default'}
      className={`h-8 px-3 text-xs font-heading font-semibold tracking-wide ${
        isAuthenticated
          ? 'border-border text-muted-foreground hover:text-foreground'
          : 'bg-neon-green text-game-dark hover:bg-neon-green/90 shadow-neon-green'
      }`}
    >
      {isLoggingIn ? (
        <Loader2 size={14} className="animate-spin" />
      ) : isAuthenticated ? (
        <>
          <LogOut size={14} className="mr-1" />
          Logout
        </>
      ) : (
        <>
          <LogIn size={14} className="mr-1" />
          Login
        </>
      )}
    </Button>
  );
}
