import React, { useState, useEffect } from 'react';
import { X, Send, Users, Hash } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { chatService, ChatMessage, ChatChannel } from '../../services/chat';

interface ChatPanelProps {
  onClose: () => void;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  avatar?: string;
}

export default function ChatPanel({ onClose }: ChatPanelProps) {
  const [message, setMessage] = useState('');
  const [activeChannel, setActiveChannel] = useState('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  // Load channels and set up real-time subscription
  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    loadMessages();
    setupRealtimeSubscription();
  }, [activeChannel]);

  const loadChannels = async () => {
    try {
      const channelsData = await chatService.getChannels();
      setChannels(channelsData);
    } catch (error) {
      console.error('Failed to load channels:', error);
      // Mock channels if API fails
      setChannels([
        { id: 'general', name: 'General', description: 'General team discussion' },
        { id: 'project-updates', name: 'Project Updates', description: 'Project status and updates' },
        { id: 'random', name: 'Random', description: 'Casual conversation' }
      ]);
    }
  };

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const messagesData = await chatService.getMessages(activeChannel);
      setMessages(messagesData);
    } catch (error) {
      console.error('Failed to load messages:', error);
      // Mock messages if API fails
      setMessages([
        {
          id: '1',
          channelId: activeChannel,
          userId: 'user1',
          userName: 'Alex Johnson',
          content: 'Hey team! How is everyone doing today?',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
        },
        {
          id: '2',
          channelId: activeChannel,
          userId: 'user2',
          userName: 'Sarah Chen',
          content: 'Great! Just finished the homepage design. Ready for review!',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
        },
        {
          id: '3',
          channelId: activeChannel,
          userId: 'user3',
          userName: 'Mike Rodriguez',
          content: 'Awesome work Sarah! I\'ll take a look at it.',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    // Clean up previous subscription
    chatService.unsubscribeFromMessages(activeChannel);
    
    // Set up new subscription
    const unsubscribe = chatService.subscribeToMessages(activeChannel, (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });
    
    return unsubscribe;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;
    
    const messageContent = message;
    setMessage(''); // Clear input immediately
    
    try {
      // Send message via chat service
      await chatService.sendMessage(
        activeChannel,
        messageContent,
        user.id,
        user.name,
        user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`
      );
      
      // Message will be added to state via real-time subscription
    } catch (error) {
      console.error('Failed to send message:', error);
      // Could show error toast here
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Team Chat</h2>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 border-b border-gray-100">
        <div className="space-y-1">
          {channels.map(channel => (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel.id)}
              className={`
                w-full flex items-center space-x-2 px-2 py-1.5 rounded text-sm transition-colors
                ${activeChannel === channel.id 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <Hash className="w-4 h-4" />
              <span>{channel.name}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <Users className="w-4 h-4" />
            <span>Online Members</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Alex Johnson</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Sarah Chen</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Mike Rodriguez</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className="flex space-x-3">
            <img
              src={msg.avatar_url || `https://ui-avatars.com/api/?name=${msg.user_name}&background=random`}
              alt={msg.user_name}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900">{msg.user_name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <p className="text-sm text-gray-700 mt-1">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}