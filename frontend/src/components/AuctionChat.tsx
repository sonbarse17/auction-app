import { useState, useEffect, useRef } from 'react';
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

export default function AuctionChat({ auctionId, onSendMessage, wsMessages }: AuctionChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [channel] = useState('public');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMessages();
  }, [auctionId]);

  useEffect(() => {
    if (wsMessages.length > 0) {
      setMessages(prev => [...prev, ...wsMessages]);
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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} className="text-blue-600" />
          <h3 className="font-semibold dark:text-white">Auction Chat</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={`${msg.id}-${idx}`} className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-sm dark:text-white">{msg.username}</span>
                {msg.team_name && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">({msg.team_name})</span>
                )}
                <span className="text-xs text-gray-400 ml-auto">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-gray-700 dark:text-gray-300">{msg.message}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            maxLength={500}
            className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
