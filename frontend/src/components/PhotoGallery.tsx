import { useState } from 'react';
import { type ExternalBlob } from '../backend';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoGalleryProps {
  photos: ExternalBlob[];
  gameName?: string;
}

export default function PhotoGallery({ photos, gameName }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="w-full aspect-video bg-secondary flex items-center justify-center rounded-2xl">
        <span className="text-6xl">🎮</span>
      </div>
    );
  }

  const prev = () => setCurrentIndex((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setCurrentIndex((i) => (i + 1) % photos.length);

  return (
    <div className="relative w-full">
      {/* Main image */}
      <div className="relative w-full aspect-video bg-secondary rounded-2xl overflow-hidden">
        <img
          src={photos[currentIndex].getDirectURL()}
          alt={`${gameName || 'Listing'} photo ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Navigation arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Counter */}
        {photos.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
            {currentIndex + 1}/{photos.length}
          </div>
        )}
      </div>

      {/* Dots */}
      {photos.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === currentIndex ? 'bg-neon-green w-4' : 'bg-border'
              }`}
            />
          ))}
        </div>
      )}

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === currentIndex ? 'border-neon-green' : 'border-border'
              }`}
            >
              <img
                src={photo.getDirectURL()}
                alt={`Thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
