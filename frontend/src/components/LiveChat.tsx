import React, { useState, useEffect, useRef } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Send, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
}

interface LiveChatProps {
  auctionId: number;
  socket?: WebSocket | null;
}

export const LiveChat: React.FC<LiveChatProps> = ({ socket }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !socket) return;

    socket.send(JSON.stringify({
      type: 'CHAT_MESSAGE',
      data: { message: newMessage }
    }));
    
    setNewMessage('');
  };

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === 'CHAT_MESSAGE') {
        const msg: Message = {
          id: Date.now().toString(),
          user: data.data.user_name,
          message: data.data.message,
          timestamp: new Date(data.data.timestamp),
        };
        setMessages(prev => [...prev, msg]);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 z-40">
      <Card className="h-[500px] flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-3 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageCircle size={20} />
            Live Chat
          </h3>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="text-sm">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-blue-600">{msg.user}</span>
                <span className="text-xs text-gray-500">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-gray-700 mt-1">{msg.message}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
          <Button onClick={handleSend} disabled={!newMessage.trim()}>
            <Send size={16} />
          </Button>
        </div>
      </Card>
    </div>
  );
};
