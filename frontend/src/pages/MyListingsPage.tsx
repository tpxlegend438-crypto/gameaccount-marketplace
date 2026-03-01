import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllActiveListings, useMarkAsSold, useDeleteListing } from '../hooks/useQueries';
import { useIsAdmin } from '../hooks/useIsAdmin';
import AuthGuard from '../components/AuthGuard';
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
import { PlusCircle, Loader2, Tag, DollarSign, CheckCircle, ShoppingCart, Trash2 } from 'lucide-react';

function CartContent() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const currentPrincipal = identity?.getPrincipal().toString();
  const { data: allListings, isLoading } = useGetAllActiveListings();
  const markAsSold = useMarkAsSold();
  const deleteListing = useDeleteListing();
  const { isAdmin } = useIsAdmin();

  const myListings = (allListings || [])
    .map((listing, index) => ({ listing, id: BigInt(index) }))
    .filter(({ listing }) => listing.seller.toString() === currentPrincipal);

  return (
    <div className="px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            My <span className="text-neon-green">Cart</span>
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            {myListings.length} item{myListings.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => navigate({ to: '/create' })}
            size="sm"
            className="bg-neon-green text-game-dark font-heading font-bold shadow-neon-green hover:bg-neon-green/90"
          >
            <PlusCircle size={14} className="mr-1" />
            New
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-neon-green" />
        </div>
      ) : myListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <ShoppingCart size={28} className="text-neon-green" />
          </div>
          <div className="space-y-1">
            <p className="font-heading text-lg font-bold text-foreground">Cart is empty</p>
            <p className="text-muted-foreground text-sm">
              {isAdmin ? 'Start selling your game accounts!' : 'No items in your cart yet.'}
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => navigate({ to: '/create' })}
              className="bg-neon-green text-game-dark font-heading font-bold shadow-neon-green hover:bg-neon-green/90"
            >
              <PlusCircle size={16} className="mr-2" />
              Create First Listing
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {myListings.map(({ listing, id }) => {
            const thumbnailUrl = listing.photos.length > 0
              ? listing.photos[0].getDirectURL()
              : null;
            const formattedPrice = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            }).format(Number(listing.price));

            return (
              <div
                key={id.toString()}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-card"
              >
                <div className="flex gap-3 p-3">
                  {/* Thumbnail */}
                  <div
                    className="w-20 h-20 rounded-xl overflow-hidden bg-secondary flex-shrink-0 cursor-pointer"
                    onClick={() => navigate({ to: '/listing/$id', params: { id: id.toString() } })}
                  >
                    {thumbnailUrl ? (
                      <img src={thumbnailUrl} alt={listing.gameName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl">🎮</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Tag size={11} className="text-neon-green" />
                      <span className="text-neon-green text-xs font-heading font-semibold uppercase tracking-wider truncate">
                        {listing.gameName}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs line-clamp-2">
                      {listing.description}
                    </p>
                    <div className="flex items-center gap-1">
                      <DollarSign size={12} className="text-neon-orange" />
                      <span className="text-neon-orange text-sm font-heading font-bold">
                        {formattedPrice}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Badge
                      variant="outline"
                      className={listing.status === 'active'
                        ? 'border-neon-green/40 text-neon-green text-[10px] px-1.5'
                        : 'border-muted text-muted-foreground text-[10px] px-1.5'
                      }
                    >
                      {listing.status === 'active' ? 'Active' : 'Sold'}
                    </Badge>
                    {isAdmin && listing.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsSold.mutate(id)}
                        disabled={markAsSold.isPending}
                        className="h-7 text-[10px] border-border hover:border-neon-orange hover:text-neon-orange px-2"
                      >
                        {markAsSold.isPending ? (
                          <Loader2 size={10} className="animate-spin" />
                        ) : (
                          <>
                            <CheckCircle size={10} className="mr-1" />
                            Mark Sold
                          </>
                        )}
                      </Button>
                    )}
                    {isAdmin && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={deleteListing.isPending}
                            className="h-7 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
                          >
                            {deleteListing.isPending ? (
                              <Loader2 size={10} className="animate-spin" />
                            ) : (
                              <>
                                <Trash2 size={10} className="mr-1" />
                                Delete
                              </>
                            )}
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
                              onClick={() => deleteListing.mutate(id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Listing
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MyListingsPage() {
  return (
    <AuthGuard message="Login to view your cart.">
      <CartContent />
    </AuthGuard>
  );
}
