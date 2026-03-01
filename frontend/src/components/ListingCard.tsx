import { useNavigate } from '@tanstack/react-router';
import { type Listing } from '../backend';
import { Tag, ChevronRight } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  listingId: bigint;
}

export default function ListingCard({ listing, listingId }: ListingCardProps) {
  const navigate = useNavigate();

  const thumbnailUrl = listing.photos.length > 0
    ? listing.photos[0].getDirectURL()
    : null;

  const truncatedDesc = listing.description.length > 60
    ? listing.description.slice(0, 60) + '...'
    : listing.description;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(Number(listing.price));

  return (
    <div
      onClick={() => navigate({ to: '/listing/$id', params: { id: listingId.toString() } })}
      className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:border-neon-green/40 shadow-card group"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-[4/3] bg-secondary overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={listing.gameName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <span className="text-4xl">🎮</span>
          </div>
        )}
        {/* Price badge */}
        <div className="absolute top-2 right-2 bg-neon-orange text-game-dark text-xs font-heading font-bold px-2 py-1 rounded-lg shadow-neon-orange">
          {formattedPrice}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Tag size={11} className="text-neon-green flex-shrink-0" />
              <span className="text-neon-green text-xs font-heading font-semibold uppercase tracking-wider truncate">
                {listing.gameName}
              </span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
              {truncatedDesc}
            </p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground flex-shrink-0 mt-0.5 group-hover:text-neon-green transition-colors" />
        </div>
      </div>
    </div>
  );
}
