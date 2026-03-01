import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetListing, useDeleteListing } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/useIsAdmin';
import PhotoGallery from '../components/PhotoGallery';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, MessageCircle, ArrowLeft, Tag, DollarSign, User, Trash2 } from 'lucide-react';

export default function ListingDetailPage() {
  const { id } = useParams({ from: '/listing/$id' });
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { isAdmin } = useIsAdmin();

  const listingId = BigInt(id);
  const { data: listing, isLoading, error } = useGetListing(listingId);
  const deleteListing = useDeleteListing();

  const formattedPrice = listing
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(Number(listing.price))
    : '';

  const handleBuyChat = () => {
    if (!isAuthenticated) {
      login();
      return;
    }
    navigate({ to: '/chat/$listingId', params: { listingId: id } });
  };

  const handleDelete = async () => {
    await deleteListing.mutateAsync(listingId);
    navigate({ to: '/' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 size={32} className="animate-spin text-neon-green mx-auto" />
          <p className="text-muted-foreground text-sm">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center space-y-4">
        <p className="font-heading text-xl font-bold text-foreground">Listing Not Found</p>
        <p className="text-muted-foreground text-sm">This listing may have been removed.</p>
        <Button
          onClick={() => navigate({ to: '/' })}
          variant="outline"
          className="border-border"
        >
          Back to Browse
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Back button */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Admin Delete button */}
        {isAdmin && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                disabled={deleteListing.isPending}
              >
                {deleteListing.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-heading text-foreground">
                  Delete Listing?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  This will permanently remove <span className="text-foreground font-medium">{listing.gameName}</span> from the marketplace. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Listing
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Photo Gallery */}
      <div className="px-4">
        <PhotoGallery photos={listing.photos} gameName={listing.gameName} />
      </div>

      {/* Details */}
      <div className="px-4 py-4 space-y-4">
        {/* Game name & status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Tag size={14} className="text-neon-green" />
              <span className="text-neon-green text-sm font-heading font-semibold uppercase tracking-wider">
                {listing.gameName}
              </span>
            </div>
            <Badge
              variant={listing.status === 'active' ? 'default' : 'secondary'}
              className={listing.status === 'active'
                ? 'bg-neon-green/20 text-neon-green border-neon-green/30 text-xs'
                : 'text-xs'
              }
            >
              {listing.status === 'active' ? '● Active' : '● Sold'}
            </Badge>
          </div>
          {/* Price */}
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <DollarSign size={16} className="text-neon-orange" />
              <span className="font-heading text-2xl font-bold text-neon-orange">
                {formattedPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Seller info */}
        <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center">
            <User size={16} className="text-neon-green" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Seller</p>
            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
              {listing.seller.toString().slice(0, 12)}...
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="font-heading text-base font-bold text-foreground">Description</h3>
          <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
            {listing.description}
          </p>
        </div>

        {/* Posted date */}
        <p className="text-xs text-muted-foreground">
          Posted {new Date(Number(listing.created / BigInt(1_000_000))).toLocaleDateString()}
        </p>
      </div>

      {/* Buy / Chat CTA */}
      <div className="sticky bottom-20 px-4 pb-4 pt-2 bg-gradient-to-t from-background via-background/95 to-transparent">
        {listing.status === 'active' ? (
          <Button
            onClick={handleBuyChat}
            className="w-full h-14 bg-neon-green text-game-dark font-heading font-bold text-lg shadow-neon-green hover:bg-neon-green/90 rounded-2xl"
          >
            <MessageCircle size={20} className="mr-2" />
            {isAuthenticated ? 'Buy / Chat with Seller' : 'Login to Buy'}
          </Button>
        ) : (
          <Button
            disabled
            className="w-full h-14 rounded-2xl font-heading font-bold text-lg"
            variant="secondary"
          >
            This Account is Sold
          </Button>
        )}
      </div>
    </div>
  );
}
