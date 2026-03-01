import { type ChatMessage } from '../backend';

interface ChatBubbleProps {
  message: ChatMessage;
  isSentByCurrentUser: boolean;
}

function formatTime(timestamp: bigint): string {
  const ms = Number(timestamp / BigInt(1_000_000));
  const date = new Date(ms);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatBubble({ message, isSentByCurrentUser }: ChatBubbleProps) {
  const photoUrl = message.photo ? message.photo.getDirectURL() : null;

  return (
    <div className={`flex ${isSentByCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[75%] space-y-1 ${isSentByCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Photo */}
        {photoUrl && (
          <div className={`rounded-2xl overflow-hidden border ${
            isSentByCurrentUser ? 'border-neon-green/30' : 'border-border'
          }`}>
            <img
              src={photoUrl}
              alt="Shared photo"
              className="max-w-[200px] max-h-[200px] object-cover"
            />
          </div>
        )}

        {/* Text bubble */}
        {message.content && (
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              isSentByCurrentUser
                ? 'bg-neon-green text-game-dark rounded-br-sm font-medium'
                : 'bg-secondary text-foreground rounded-bl-sm'
            }`}
          >
            {message.content}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
