import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Gamepad2 } from 'lucide-react';

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [name, setName] = useState('');

  const showModal = isAuthenticated && !isLoading && isFetched && userProfile === null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await saveProfile.mutateAsync({ name: name.trim() });
  };

  return (
    <Dialog open={showModal}>
      <DialogContent className="bg-card border-border max-w-sm mx-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Gamepad2 className="text-neon-green" size={24} />
            <DialogTitle className="font-heading text-2xl text-foreground">
              Welcome, Player!
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Set up your gamer profile to start buying and selling accounts.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-medium">
              Your Gamer Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ProGamer99"
              className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-neon-green focus:ring-neon-green"
              maxLength={30}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={!name.trim() || saveProfile.isPending}
            className="w-full bg-neon-green text-game-dark font-heading font-bold text-base hover:bg-neon-green/90 shadow-neon-green"
          >
            {saveProfile.isPending ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : null}
            Enter the Arena
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
