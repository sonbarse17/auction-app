import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import axios from 'axios';

interface ChatMessage {
  id: number;
  user_id: number;
  username: string;
  team_name?: string;
  message: string;
  created_at: string;
}

interface AuctionChatProps {
  auctionId: number;
  onSendMessage: (message: string) => void;
  wsMessages: ChatMessage[];
}

const ChatItem = React.memo(({ msg }: { msg: ChatMessage }) => {
  const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-bold text-sm text-blue-400">{msg.username}</span>
        {msg.team_name && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-white/60">
            {msg.team_name}
          </span>
        )}
        <span className="text-xs text-white/30 ml-auto">{time}</span>
      </div>
      <div className="bg-white/5 rounded-lg rounded-tl-none p-3 text-white/90 text-sm break-words border border-white/5 hover:bg-white/10 transition-colors">
        {msg.message}
      </div>
    </div>
  );
});

ChatItem.displayName = 'ChatItem';

export default function AuctionChat({ auctionId, onSendMessage, wsMessages }: AuctionChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [channel] = useState('public');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMessages();
  }, [auctionId]);

  useEffect(() => {
    if (wsMessages.length > 0) {
      setMessages(prev => {
        // Deduplicate messages based on ID
        const existingIds = new Set(prev.map(m => m.id));
        const uniqueNewMessages = wsMessages.filter(m => !existingIds.has(m.id));
        if (uniqueNewMessages.length === 0) return prev;
        return [...prev, ...uniqueNewMessages];
      });
    }
  }, [wsMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/v1/auctions/${auctionId}/chat?channel=${channel}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  // Memoize the message list to prevent unnecessary re-renders of individual items
  const messageList = useMemo(() => (
    messages.map((msg, idx) => (
      <ChatItem key={`${msg.id}-${idx}`} msg={msg} />
    ))
  ), [messages]);

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={listRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/30 space-y-2">
            <MessageCircle size={40} />
            <p>No messages yet</p>
          </div>
        ) : (
          messageList
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-black/20 border-t border-white/10 backdrop-blur-md">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            maxLength={500}
            className="flex-1 px-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/20 transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
