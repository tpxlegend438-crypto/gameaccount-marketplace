import { X, ImagePlus } from 'lucide-react';

interface PhotoUploadPreviewProps {
  files: File[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  maxPhotos?: number;
}

export default function PhotoUploadPreview({
  files,
  onAdd,
  onRemove,
  maxPhotos = 5,
}: PhotoUploadPreviewProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const remaining = maxPhotos - files.length;
    onAdd(selected.slice(0, remaining));
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {files.map((file, i) => (
          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group">
            <img
              src={URL.createObjectURL(file)}
              alt={`Preview ${i + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={10} className="text-white" />
            </button>
          </div>
        ))}

        {files.length < maxPhotos && (
          <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-neon-green/60 transition-colors bg-secondary/50">
            <ImagePlus size={20} className="text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground mt-1">Add</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {files.length}/{maxPhotos} photos added
        {files.length >= maxPhotos && (
          <span className="text-neon-orange ml-1">(limit reached)</span>
        )}
      </p>
    </div>
  );
}
