
import React, { useState, useEffect, useRef } from 'react';
import type { User } from 'firebase/auth';
import type { VimoUser, ChatMessage } from '../types';
import { VideoIcon, SendIcon } from './icons';

interface ChatWindowProps {
  selectedUser: VimoUser | null;
  messages: ChatMessage[];
  currentUser: User;
  onSendMessage: (text: string) => void;
  onStartCall: (user: VimoUser) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedUser, messages, currentUser, onSendMessage, onStartCall }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  if (!selectedUser) {
    return (
      <div className="w-full md:w-3/4 flex items-center justify-center h-full bg-gray-900">
        <div className="text-center text-gray-500">
          <p className="text-2xl">Select a contact to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-3/4 flex flex-col h-full bg-gray-900">
      <header className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center">
            <img
                src={selectedUser.photoURL || `https://i.pravatar.cc/150?u=${selectedUser.uid}`}
                alt={selectedUser.displayName || 'User'}
                className="w-10 h-10 rounded-full mr-3"
            />
            <h2 className="text-xl font-bold">{selectedUser.displayName}</h2>
        </div>
        <button 
            onClick={() => onStartCall(selectedUser)} 
            className="p-2 rounded-full text-gray-300 hover:bg-gray-700 hover:text-white"
            title={`Call ${selectedUser.displayName}`}
        >
          <VideoIcon />
        </button>
      </header>

      <main className="flex-grow p-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex my-2 ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-lg ${msg.senderId === currentUser.uid ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'}`}>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 bg-gray-800 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow px-4 py-2 bg-gray-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="ml-4 p-3 bg-blue-600 rounded-full text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <SendIcon />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatWindow;
