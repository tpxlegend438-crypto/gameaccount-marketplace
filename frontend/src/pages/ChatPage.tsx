import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetListing, useGetChatHistory, useSendMessage } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import AuthGuard from '../components/AuthGuard';
import ChatBubble from '../components/ChatBubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, ImagePlus, Loader2, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

function ChatContent() {
  const { listingId } = useParams({ from: '/chat/$listingId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const currentPrincipal = identity?.getPrincipal().toString();

  const listingIdBig = BigInt(listingId);
  const { data: listing } = useGetListing(listingIdBig);
  const { data: messages, isLoading } = useGetChatHistory(listingIdBig);
  const sendMessage = useSendMessage(listingIdBig);

  const [text, setText] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() && !photoFile) return;

    let photo: ExternalBlob | null = null;
    if (photoFile) {
      const bytes = new Uint8Array(await photoFile.arrayBuffer());
      photo = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });
    }

    await sendMessage.mutateAsync({ content: text.trim(), photo });
    setText('');
    setPhotoFile(null);
    setUploadProgress(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formattedPrice = listing
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(Number(listing.price))
    : '';

  return (
    <div className="flex flex-col h-[calc(100vh-57px-64px)]">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
        <button
          onClick={() => navigate({ to: '/listing/$id', params: { id: listingId } })}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          {listing ? (
            <>
              <p className="font-heading font-bold text-foreground text-sm truncate">
                {listing.gameName}
              </p>
              <p className="text-neon-orange text-xs font-medium">{formattedPrice}</p>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">Loading...</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={24} className="animate-spin text-neon-green" />
          </div>
        ) : messages && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <p className="font-heading text-base font-bold text-foreground">Start the conversation</p>
            <p className="text-muted-foreground text-xs">
              Ask the seller about this account
            </p>
          </div>
        ) : (
          messages?.map((msg, i) => (
            <ChatBubble
              key={i}
              message={msg}
              isSentByCurrentUser={msg.sender.toString() === currentPrincipal}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Upload progress */}
      {sendMessage.isPending && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="px-4 py-2 bg-secondary">
          <p className="text-xs text-muted-foreground mb-1">Uploading photo... {uploadProgress}%</p>
          <Progress value={uploadProgress} className="h-1" />
        </div>
      )}

      {/* Photo preview */}
      {photoFile && (
        <div className="px-4 py-2 bg-secondary border-t border-border flex items-center gap-2">
          <img
            src={URL.createObjectURL(photoFile)}
            alt="Attachment preview"
            className="w-12 h-12 rounded-lg object-cover"
          />
          <span className="text-xs text-muted-foreground flex-1 truncate">{photoFile.name}</span>
          <button
            onClick={() => setPhotoFile(null)}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="px-4 py-3 bg-card border-t border-border flex items-center gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-neon-green transition-colors flex-shrink-0"
        >
          <ImagePlus size={18} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setPhotoFile(file);
            e.target.value = '';
          }}
        />
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-neon-green h-10 rounded-full px-4"
        />
        <Button
          onClick={handleSend}
          disabled={(!text.trim() && !photoFile) || sendMessage.isPending}
          size="icon"
          className="w-10 h-10 rounded-full bg-neon-green text-game-dark hover:bg-neon-green/90 shadow-neon-green flex-shrink-0"
        >
          {sendMessage.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </Button>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <AuthGuard message="You need to be logged in to chat with sellers.">
      <ChatContent />
    </AuthGuard>
  );
}
