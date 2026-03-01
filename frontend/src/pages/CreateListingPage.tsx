import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateListing } from '../hooks/useQueries';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { ExternalBlob } from '../backend';
import AuthGuard from '../components/AuthGuard';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import PhotoUploadPreview from '../components/PhotoUploadPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PlusCircle } from 'lucide-react';

function CreateListingForm() {
  const navigate = useNavigate();
  const createListing = useCreateListing();
  const { isAdmin, isLoading: adminLoading, isFetched: adminFetched } = useIsAdmin();

  const [gameName, setGameName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Show loading while checking admin status
  if (adminLoading || !adminFetched) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-neon-green border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Block non-admins
  if (!isAdmin) {
    return (
      <AccessDeniedScreen
        title="Admin Only"
        message="Only the store admin can create new listings. Browse available game accounts below."
      />
    );
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!gameName.trim()) newErrors.gameName = 'Game name is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Enter a valid price';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const photoBlobs: ExternalBlob[] = await Promise.all(
      photos.map(async (file) => {
        const bytes = new Uint8Array(await file.arrayBuffer());
        return ExternalBlob.fromBytes(bytes);
      })
    );

    const listingId = await createListing.mutateAsync({
      gameName: gameName.trim(),
      description: description.trim(),
      price: BigInt(Math.round(Number(price))),
      photos: photoBlobs,
    });

    navigate({ to: '/listing/$id', params: { id: listingId.toString() } });
  };

  const handleAddPhotos = (newFiles: File[]) => {
    setPhotos((prev) => [...prev, ...newFiles].slice(0, 5));
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          List Your <span className="text-neon-green">Account</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Fill in the details to post your game account for sale
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Game Name */}
        <div className="space-y-1.5">
          <Label htmlFor="gameName" className="text-foreground font-medium text-sm">
            Game Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="gameName"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="e.g. Valorant, Fortnite, PUBG..."
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-neon-green"
          />
          {errors.gameName && (
            <p className="text-destructive text-xs">{errors.gameName}</p>
          )}
        </div>

        {/* Price */}
        <div className="space-y-1.5">
          <Label htmlFor="price" className="text-foreground font-medium text-sm">
            Asking Price (USD) <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <Input
              id="price"
              type="number"
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className="pl-7 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-neon-green"
            />
          </div>
          {errors.price && (
            <p className="text-destructive text-xs">{errors.price}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-foreground font-medium text-sm">
            Account Details <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the account: level, rank, skins, achievements, etc."
            rows={5}
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-neon-green resize-none"
          />
          {errors.description && (
            <p className="text-destructive text-xs">{errors.description}</p>
          )}
        </div>

        {/* Photos */}
        <div className="space-y-2">
          <Label className="text-foreground font-medium text-sm">
            Photos (up to 5)
          </Label>
          <PhotoUploadPreview
            files={photos}
            onAdd={handleAddPhotos}
            onRemove={handleRemovePhoto}
            maxPhotos={5}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={createListing.isPending}
          className="w-full h-12 bg-neon-green text-game-dark font-heading font-bold text-base shadow-neon-green hover:bg-neon-green/90 rounded-xl mt-2"
        >
          {createListing.isPending ? (
            <>
              <Loader2 size={18} className="animate-spin mr-2" />
              Creating Listing...
            </>
          ) : (
            <>
              <PlusCircle size={18} className="mr-2" />
              Post Listing
            </>
          )}
        </Button>

        {createListing.isError && (
          <p className="text-destructive text-sm text-center">
            Failed to create listing. Please try again.
          </p>
        )}
      </form>
    </div>
  );
}

export default function CreateListingPage() {
  return (
    <AuthGuard message="You need to be logged in to create a listing.">
      <CreateListingForm />
    </AuthGuard>
  );
}
