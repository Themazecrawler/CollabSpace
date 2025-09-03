import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Kanban, 
  Palette, 
  BarChart3, 
  Users, 
  Lightbulb,
  Zap
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/project/1', icon: Kanban },
  { name: 'Whiteboard', href: '/whiteboard/1', icon: Palette },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Team', href: '/team', icon: Users },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">CollabFlow</h1>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href === '/project/1' && location.pathname.startsWith('/project/')) ||
            (item.href === '/whiteboard/1' && location.pathname.startsWith('/whiteboard/'));
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                ${isActive 
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={async () => {
            try {
              const suggestions = [
                'Consider breaking down large tasks into smaller ones',
                'Add more detailed descriptions to improve clarity',
                'Set up regular team check-ins for better communication',
                'Use the whiteboard for brainstorming sessions',
                'Review project timelines and adjust if needed'
              ];
              const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
              alert(`AI Suggestion: ${suggestion}`);
            } catch (error) {
              alert('AI Assistant is temporarily unavailable');
            }
          }}
          className="w-full flex items-center space-x-2 p-2 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-colors cursor-pointer"
        >
          <Lightbulb className="w-5 h-5 text-purple-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">AI Assistant</p>
            <p className="text-xs text-gray-500">Get smart suggestions</p>
          </div>
        </button>
      </div>
    </div>
  );
}