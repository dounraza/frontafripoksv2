import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { MessageSquare, X } from 'lucide-react';

interface ChatProps {
  tableId: string | number;
  playerName: string;
  socket: Socket | null;
}

export const Chat: React.FC<ChatProps> = ({ tableId, playerName, socket }) => {
  const [messages, setMessages] = useState<{ playerName: string; message: string; timestamp: number }[]>([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (socket) {
      socket.on('newChatMessage', (data: any) => {
        setMessages((prev) => [...prev, data]);
        if (!isOpen) setUnreadCount((prev) => prev + 1);
      });
      return () => { socket.off('newChatMessage'); };
    }
  }, [socket, isOpen]);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setUnreadCount(0);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && socket) {
      socket.emit('chatMessage', { tableId, playerName, message: input });
      setInput('');
    }
  };

  return (
    <>
      <button 
        onClick={toggleChat}
        className="p-3 bg-yellow-500 rounded-full shadow-lg hover:scale-110 transition-transform active:scale-95 relative"
      >
        {isOpen ? <X className="w-5 h-5 text-black" /> : <MessageSquare className="w-5 h-5 text-black" />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-black">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed top-32 left-2 sm:top-auto sm:bottom-20 sm:left-6 z-[60] w-[260px] sm:w-[320px] h-[300px] sm:h-[400px] bg-[#1a1a1a] border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-top-10 sm:slide-in-from-bottom-10 duration-200">
          <div className="p-3 border-b border-white/10 bg-black/60 flex justify-between items-center cursor-pointer" onClick={toggleChat}>
            <h3 className="text-xs font-black italic text-white uppercase tracking-tighter flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Chat Table
            </h3>
            <X className="w-4 h-4 text-gray-400 hover:text-white" />
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-black/20">
            {messages.map((m, i) => {
              const isMine = m.playerName === playerName;
              return (
                <div key={i} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <span className="text-[8px] font-bold text-gray-500 mb-0.5 px-1">{m.playerName}</span>
                  <div className={`px-3 py-2 rounded-2xl text-xs max-w-[85%] ${isMine ? 'bg-yellow-500 text-black font-bold' : 'bg-white/10 text-white'}`}>
                    {m.message}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={sendMessage} className="p-2 border-t border-white/10 bg-black/60 flex gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Aa..."
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            />
            <button type="submit" className="text-[10px] font-black text-yellow-500 uppercase px-2">Send</button>
          </form>
        </div>
      )}
    </>
  );
};
