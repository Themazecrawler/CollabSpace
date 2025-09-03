import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, CheckCircle, Circle } from 'lucide-react';
import { Project } from '../../contexts/ProjectContext';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();

  const completedTasks = project.tasks.filter(task => task.status === 'done').length;
  const totalTasks = project.tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const priorityColors = {
    low: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-orange-600 bg-orange-50',
    urgent: 'text-red-600 bg-red-50'
  };

  const upcomingTasks = project.tasks
    .filter(task => task.status !== 'done' && task.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 2);

  return (
    <div
      onClick={() => navigate(`/project/${project.id}`)}
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {project.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{project.description}</p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          project.status === 'active' ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'
        }`}>
          {project.status}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4" />
            <span>{completedTasks}/{totalTasks} tasks</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{project.members.length} members</span>
          </div>
        </div>

        {upcomingTasks.length > 0 && (
          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center space-x-1 text-xs font-medium text-gray-500 mb-2">
              <Calendar className="w-3 h-3" />
              <span>UPCOMING TASKS</span>
            </div>
            <div className="space-y-2">
              {upcomingTasks.map(task => (
                <div key={task.id} className="flex items-center space-x-2">
                  <Circle className="w-3 h-3 text-gray-400" />
                  <span className="text-sm text-gray-700 flex-1 truncate">{task.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}