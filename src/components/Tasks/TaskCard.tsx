import React from 'react';
import { Calendar, MessageCircle, User } from 'lucide-react';
import { Task } from '../../contexts/ProjectContext';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const priorityColors = {
    low: 'border-green-300 bg-green-50 text-green-700',
    medium: 'border-yellow-300 bg-yellow-50 text-yellow-700',
    high: 'border-orange-300 bg-orange-50 text-orange-700',
    urgent: 'border-red-300 bg-red-50 text-red-700'
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
          {task.title}
        </h4>
        <div className={`px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
          {task.priority}
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          {task.dueDate && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
          
          {task.assigneeId && (
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>Assigned</span>
            </div>
          )}
        </div>

        {task.comments.length > 0 && (
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-3 h-3" />
            <span>{task.comments.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}