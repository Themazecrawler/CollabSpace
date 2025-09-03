import { supabase } from '../lib/supabase';

export interface ChatMessage {
  id: string;
  channel_id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
  avatar_url?: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'general' | 'project' | 'direct';
  project_id?: string;
  created_at: string;
}

class ChatService {
  private subscriptions: Map<string, any> = new Map();

  async getChannels(projectId?: string): Promise<ChatChannel[]> {
    try {
      let query = supabase
        .from('chat_channels')
        .select('*')
        .order('created_at', { ascending: true });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Failed to load channels:', error);
      // Return mock channels if table doesn't exist
      return [
        { id: 'general', name: 'General', type: 'general', created_at: new Date().toISOString() },
        { id: 'design', name: 'Design Team', type: 'project', project_id: projectId, created_at: new Date().toISOString() },
        { id: 'dev', name: 'Development', type: 'project', project_id: projectId, created_at: new Date().toISOString() }
      ];
    }
  }

  async getMessages(channelId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Failed to load messages:', error);
      // Return mock messages if table doesn't exist
      return [
        {
          id: '1',
          channel_id: channelId,
          user_id: '2',
          user_name: 'Sarah Chen',
          content: 'Hey team! Just finished the wireframes for the new dashboard. Can someone take a look?',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
        },
        {
          id: '2',
          channel_id: channelId,
          user_id: '1',
          user_name: 'Alex Johnson',
          content: 'Looks great! I love the new layout approach. Can we schedule a quick review meeting?',
          created_at: new Date(Date.now() - 3000000).toISOString(),
          avatar_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
        }
      ];
    }
  }

  async sendMessage(channelId: string, content: string, userId: string, userName: string, avatarUrl?: string): Promise<ChatMessage> {
    try {
      const newMessage = {
        channel_id: channelId,
        user_id: userId,
        user_name: userName,
        content,
        avatar_url: avatarUrl
      };

      const { data, error } = await supabase
        .from('chat_messages')
        .insert(newMessage)
        .select()
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Failed to send message:', error);
      // Return mock message if table doesn't exist
      return {
        id: Math.random().toString(36).substr(2, 9),
        channel_id: channelId,
        user_id: userId,
        user_name: userName,
        content,
        created_at: new Date().toISOString(),
        avatar_url: avatarUrl
      };
    }
  }

  subscribeToMessages(channelId: string, callback: (message: ChatMessage) => void) {
    try {
      const subscription = supabase
        .channel(`chat:${channelId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${channelId}`
        }, (payload) => {
          callback(payload.new as ChatMessage);
        })
        .subscribe();

      this.subscriptions.set(channelId, subscription);
      
      return () => {
        this.unsubscribeFromMessages(channelId);
      };
    } catch (error) {
      console.error('Failed to subscribe to messages:', error);
      // Return no-op function if subscription fails
      return () => {};
    }
  }

  unsubscribeFromMessages(channelId: string) {
    const subscription = this.subscriptions.get(channelId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(channelId);
    }
  }

  async createChannel(name: string, type: 'general' | 'project' | 'direct', projectId?: string): Promise<ChatChannel> {
    try {
      const newChannel = {
        name,
        type,
        project_id: projectId
      };

      const { data, error } = await supabase
        .from('chat_channels')
        .insert(newChannel)
        .select()
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Failed to create channel:', error);
      // Return mock channel if table doesn't exist
      return {
        id: Math.random().toString(36).substr(2, 9),
        name,
        type,
        project_id: projectId,
        created_at: new Date().toISOString()
      };
    }
  }
}

export const chatService = new ChatService();
