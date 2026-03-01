import { useNavigate } from '@tanstack/react-router';
import { useGetUserChats } from '../hooks/useQueries';
import AuthGuard from '../components/AuthGuard';
import { Loader2, MessageCircle, ChevronRight } from 'lucide-react';
import type { ChatPreview } from '../backend';

function formatTimestamp(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  const date = new Date(ms);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function ChatPreviewCard({ preview, onClick }: { preview: ChatPreview; onClick: () => void }) {
  const lastMsg = preview.lastMessage;

  return (
    <button
      onClick={onClick}
      className="w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-neon-green/40 transition-colors text-left active:scale-[0.98]"
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
        <span className="text-xl">🎮</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-heading font-bold text-foreground text-sm truncate">
            {preview.listingTitle}
          </span>
          {lastMsg && (
            <span className="text-muted-foreground text-[10px] flex-shrink-0">
              {formatTimestamp(lastMsg.timestamp)}
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-xs mt-0.5 truncate">
          {lastMsg
            ? lastMsg.photo
              ? '📷 Photo'
              : lastMsg.content
            : 'No messages yet'}
        </p>
      </div>

      <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
    </button>
  );
}

function ChatsContent() {
  const navigate = useNavigate();
  const { data: chats, isLoading } = useGetUserChats();

  return (
    <div className="px-4 py-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          My <span className="text-neon-green">Chats</span>
        </h1>
        <p className="text-muted-foreground text-xs mt-0.5">
          {chats && chats.length > 0
            ? `${chats.length} conversation${chats.length !== 1 ? 's' : ''}`
            : 'Messages with sellers'}
        </p>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-neon-green" />
        </div>
      ) : !chats || chats.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <MessageCircle size={28} className="text-neon-green" />
          </div>
          <div className="space-y-1">
            <p className="font-heading text-lg font-bold text-foreground">No chats yet</p>
            <p className="text-muted-foreground text-sm">
              Start a conversation by tapping "Buy / Chat" on any listing.
            </p>
          </div>
        </div>
      ) : (
        /* Chat list */
        <div className="space-y-3">
          {chats.map((preview) => (
            <ChatPreviewCard
              key={preview.listingId.toString()}
              preview={preview}
              onClick={() =>
                navigate({
                  to: '/chat/$listingId',
                  params: { listingId: preview.listingId.toString() },
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChatsPage() {
  return (
    <AuthGuard message="Login to view your chats with sellers.">
      <ChatsContent />
    </AuthGuard>
  );
}
