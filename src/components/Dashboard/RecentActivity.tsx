import React from 'react';
import { Clock, MessageCircle, CheckCircle, Users } from 'lucide-react';

const activities = [
  {
    id: '1',
    type: 'task_completed',
    user: 'Sarah Chen',
    action: 'completed',
    target: 'Design mockups',
    timestamp: '2 minutes ago',
    icon: CheckCircle,
    color: 'text-green-600'
  },
  {
    id: '2',
    type: 'comment',
    user: 'Mike Rodriguez',
    action: 'commented on',
    target: 'Frontend development',
    timestamp: '15 minutes ago',
    icon: MessageCircle,
    color: 'text-blue-600'
  },
  {
    id: '3',
    type: 'member_joined',
    user: 'Emma Wilson',
    action: 'joined project',
    target: 'Website Redesign',
    timestamp: '1 hour ago',
    icon: Users,
    color: 'text-purple-600'
  }
];

export default function RecentActivity() {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>
      
      <div className="space-y-4">
        {activities.map(activity => (
          <div key={activity.id} className="flex space-x-3">
            <div className={`p-1 rounded-full ${activity.color}`}>
              <activity.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.user}</span>{' '}
                {activity.action}{' '}
                <span className="font-medium">{activity.target}</span>
              </p>
              <p className="text-xs text-gray-500">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        onClick={() => window.location.href = '/analytics'}
        className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        View all activity
      </button>
    </div>
  );
}