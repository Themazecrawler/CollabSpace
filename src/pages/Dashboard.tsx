import React from 'react';
import { Plus, TrendingUp, Users, Calendar, Activity } from 'lucide-react';
import { useProjects } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import ProjectCard from '../components/Projects/ProjectCard';
import StatsCard from '../components/Dashboard/StatsCard';
import RecentActivity from '../components/Dashboard/RecentActivity';
import AIInsights from '../components/AI/AIInsights';

export default function Dashboard() {
  const { projects, isLoading, addProject } = useProjects();
  const { user } = useAuth();

  // Mock data for dashboard
  const mockProjects = [
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Modern redesign of company website',
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      members: ['user1', 'user2'],
      tasks: [
        { id: 'task1', title: 'Design Homepage', status: 'in-progress' },
        { id: 'task2', title: 'Implement Navigation', status: 'done' },
        { id: 'task3', title: 'Mobile Responsive', status: 'todo' }
      ]
    },
    {
      id: '2', 
      name: 'Mobile App Development',
      description: 'Cross-platform mobile application',
      status: 'active',
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-18T16:45:00Z',
      members: ['user1', 'user3'],
      tasks: [
        { id: 'task4', title: 'User Authentication', status: 'done' },
        { id: 'task5', title: 'Push Notifications', status: 'in-progress' }
      ]
    }
  ];

  const displayProjects = projects.length > 0 ? projects : mockProjects;

  const stats = [
    {
      title: 'Active Projects',
      value: projects.filter(p => p.status === 'active').length,
      icon: Activity,
      color: 'blue',
      change: '+2 this week'
    },
    {
      title: 'Team Members',
      value: 12,
      icon: Users,
      color: 'green',
      change: '+3 this month'
    },
    {
      title: 'Completed Tasks',
      value: 24,
      icon: TrendingUp,
      color: 'purple',
      change: '+8 today'
    },
    {
      title: 'Upcoming Deadlines',
      value: 5,
      icon: Calendar,
      color: 'orange',
      change: 'Next 7 days'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-600">Here's what's happening with your projects today.</p>
        </div>
        <button 
          onClick={async () => {
            try {
              await addProject({
                name: 'Test Project',
                description: 'This is a test project to verify functionality',
                status: 'active',
                members: []
              });
              alert('Project created successfully!');
            } catch (error) {
              console.error('Failed to create project:', error);
              alert('Failed to create project');
            }
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Active Projects</h2>
            <button 
              onClick={() => window.location.href = '/projects'}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayProjects.filter(p => p.status === 'active').map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <AIInsights />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}