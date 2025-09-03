import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface SocketContextType {
  isConnected: boolean;
  socket: RealtimeChannel | null;
  emit: (event: string, data: unknown) => void;
  on: (event: string, callback: (data: unknown) => void) => void;
  off: (event: string, callback: (data: unknown) => void) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<RealtimeChannel | null>(null);
  const [eventCallbacks, setEventCallbacks] = useState<Map<string, ((data: unknown) => void)[]>>(new Map());

  useEffect(() => {
    // Set up Supabase Realtime connection
    const channel = supabase.channel('system');
    
    channel
      .on('presence', { event: 'sync' }, () => {
        console.log('Realtime connected');
        setIsConnected(true);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe();

    setCurrentChannel(channel);

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const joinRoom = (roomId: string) => {
    if (currentChannel) {
      currentChannel.unsubscribe();
    }

    const roomChannel = supabase.channel(`whiteboard-${roomId}`);
    
    roomChannel
      .on('broadcast', { event: 'whiteboard_update' }, (payload) => {
        const callbacks = eventCallbacks.get('whiteboard_update') || [];
        callbacks.forEach(callback => callback(payload.payload));
      })
      .on('broadcast', { event: 'chat_message' }, (payload) => {
        const callbacks = eventCallbacks.get('chat_message') || [];
        callbacks.forEach(callback => callback(payload.payload));
      })
      .subscribe();

    setCurrentChannel(roomChannel);
    setIsConnected(true);
  };

  const leaveRoom = (roomId: string) => {
    if (currentChannel) {
      currentChannel.unsubscribe();
      setCurrentChannel(null);
      setIsConnected(false);
    }
  };

  const emit = (event: string, data: unknown) => {
    if (currentChannel && isConnected) {
      currentChannel.send({
        type: 'broadcast',
        event,
        payload: data
      });
    } else {
      console.log(`Emit (not connected): ${event}`, data);
    }
  };

  const on = (event: string, callback: (data: unknown) => void) => {
    const callbacks = eventCallbacks.get(event) || [];
    callbacks.push(callback);
    setEventCallbacks(new Map(eventCallbacks.set(event, callbacks)));
  };

  const off = (event: string, callback: (data: unknown) => void) => {
    const callbacks = eventCallbacks.get(event) || [];
    const filteredCallbacks = callbacks.filter(cb => cb !== callback);
    setEventCallbacks(new Map(eventCallbacks.set(event, filteredCallbacks)));
  };

  return (
    <SocketContext.Provider value={{ 
      isConnected, 
      socket: currentChannel, 
      emit, 
      on, 
      off, 
      joinRoom, 
      leaveRoom 
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}