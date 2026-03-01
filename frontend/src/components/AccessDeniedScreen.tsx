import { useNavigate } from '@tanstack/react-router';
import { ShieldX, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccessDeniedScreenProps {
  title?: string;
  message?: string;
}

export default function AccessDeniedScreen({
  title = 'Access Denied',
  message = 'You do not have permission to access this page.',
}: AccessDeniedScreenProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center space-y-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center">
          <ShieldX size={36} className="text-destructive" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive animate-pulse" />
      </div>

      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-muted-foreground text-sm max-w-xs">{message}</p>
      </div>

      <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <Button
        onClick={() => navigate({ to: '/' })}
        className="bg-neon-green text-game-dark font-heading font-bold px-8 shadow-neon-green hover:bg-neon-green/90"
      >
        <Home size={16} className="mr-2" />
        Back to Browse
      </Button>
    </div>
  );
}
