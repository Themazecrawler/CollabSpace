import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatPanel from '../Chat/ChatPanel';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header onToggleChat={() => setIsChatOpen(!isChatOpen)} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
      {isChatOpen && (
        <ChatPanel onClose={() => setIsChatOpen(false)} />
      )}
    </div>
  );
}