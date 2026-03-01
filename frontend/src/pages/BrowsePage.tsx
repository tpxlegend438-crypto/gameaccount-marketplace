import { useState } from 'react';
import { useGetAllActiveListings } from '../hooks/useQueries';
import ListingCard from '../components/ListingCard';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function BrowsePage() {
  const [search, setSearch] = useState('');
  const { data: listings, isLoading, error } = useGetAllActiveListings();

  const filtered = (listings || []).filter((l) =>
    l.gameName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <div className="relative w-full overflow-hidden" style={{ height: '140px' }}>
        <img
          src="/assets/generated/hero-banner.dim_800x300.png"
          alt="GAME BAZAR"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 flex flex-col justify-end px-4 pb-3">
          <h1 className="font-heading text-2xl font-bold text-foreground leading-tight">
            GAME <span className="text-neon-green">BAZAR</span>
          </h1>
          <p className="text-muted-foreground text-xs">Buy & sell premium game accounts</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 sticky top-[57px] z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by game name..."
            className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-neon-green h-10"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-3">
              <Loader2 size={32} className="animate-spin text-neon-green mx-auto" />
              <p className="text-muted-foreground text-sm">Loading listings...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16 space-y-2">
            <p className="text-destructive text-sm">Failed to load listings</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <img
              src="/assets/generated/empty-state.dim_400x300.png"
              alt="No listings found"
              className="w-48 h-auto opacity-80"
            />
            <div className="text-center space-y-1">
              <p className="font-heading text-lg font-bold text-foreground">
                {search ? 'No results found' : 'No listings yet'}
              </p>
              <p className="text-muted-foreground text-sm">
                {search
                  ? `No accounts found for "${search}"`
                  : 'Be the first to list a game account!'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-xs">
                {filtered.length} listing{filtered.length !== 1 ? 's' : ''} found
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((listing, index) => {
                // We need to track the original index as the ID
                const originalIndex = listings!.indexOf(listing);
                return (
                  <ListingCard
                    key={index}
                    listing={listing}
                    listingId={BigInt(originalIndex)}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-6 text-center border-t border-border mt-4">
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
