import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import AuthGuard from '../components/AuthGuard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LogOut, User, Shield, Gamepad2 } from 'lucide-react';

function ProfileContent() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useGetCallerUserProfile();

  const principal = identity?.getPrincipal().toString() || '';

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">
        My <span className="text-neon-green">Profile</span>
      </h1>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-card">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-neon-green/20 border-2 border-neon-green/40 flex items-center justify-center">
            <Gamepad2 size={28} className="text-neon-green" />
          </div>
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <>
                <Skeleton className="h-5 w-32 mb-1 bg-secondary" />
                <Skeleton className="h-3 w-48 bg-secondary" />
              </>
            ) : (
              <>
                <p className="font-heading text-xl font-bold text-foreground">
                  {profile?.name || 'Anonymous'}
                </p>
                <p className="text-muted-foreground text-xs truncate">{principal.slice(0, 20)}...</p>
              </>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary rounded-xl p-3 text-center">
            <User size={16} className="text-neon-green mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Account</p>
            <p className="text-sm font-heading font-bold text-foreground">Verified</p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center">
            <Shield size={16} className="text-neon-orange mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-sm font-heading font-bold text-neon-green">Active</p>
          </div>
        </div>
      </div>

      {/* Principal ID */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-2 shadow-card">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Principal ID</p>
        <p className="text-xs text-foreground font-mono break-all leading-relaxed">{principal}</p>
      </div>

      {/* Logout */}
      <Button
        onClick={handleLogout}
        variant="outline"
        className="w-full h-12 border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive font-heading font-bold rounded-xl"
      >
        <LogOut size={16} className="mr-2" />
        Logout
      </Button>

      {/* Footer */}
      <div className="text-center pt-4 border-t border-border">
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()} Built with{' '}
          <span className="text-neon-green">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon-green hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard message="Login to view your profile.">
      <ProfileContent />
    </AuthGuard>
  );
}
