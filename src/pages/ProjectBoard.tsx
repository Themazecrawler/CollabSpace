import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Filter, Users, Calendar, Circle } from 'lucide-react';
import { useProjects } from '../contexts/ProjectContext';
import TaskCard from '../components/Tasks/TaskCard';
import TaskModal from '../components/Tasks/TaskModal';
import InviteModal from '../components/Modals/InviteModal';
import { Task } from '../contexts/ProjectContext';

const columns = [
  { id: 'todo', title: 'To Do', color: 'border-gray-300' },
  { id: 'in-progress', title: 'In Progress', color: 'border-blue-300' },
  { id: 'review', title: 'Review', color: 'border-orange-300' },
  { id: 'done', title: 'Done', color: 'border-green-300' }
];

export default function ProjectBoard() {
  const { id } = useParams<{ id: string }>();
  const { projects, currentProject, setCurrentProject, updateTask, addTask, isLoading } = useProjects();
  
  // Mock data for project board
  const mockProject = {
    id: '1',
    name: 'Website Redesign',
    description: 'Modern redesign of company website with improved UX',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    members: ['user1', 'user2', 'user3'],
    tasks: [
      {
        id: 'task1',
        title: 'Design Homepage Layout',
        description: 'Create wireframes and mockups for homepage',
        status: 'todo',
        priority: 'high',
        assigneeId: 'user1',
        dueDate: '2024-02-01T00:00:00Z',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        comments: []
      },
      {
        id: 'task2',
        title: 'Implement Navigation Menu',
        description: 'Build responsive navigation with dropdown menus',
        status: 'in-progress',
        priority: 'medium',
        assigneeId: 'user2',
        dueDate: '2024-01-25T00:00:00Z',
        createdAt: '2024-01-16T11:00:00Z',
        updatedAt: '2024-01-18T14:00:00Z',
        comments: []
      },
      {
        id: 'task3',
        title: 'Mobile Responsive Design',
        description: 'Ensure website works perfectly on mobile devices',
        status: 'review',
        priority: 'high',
        assigneeId: 'user3',
        dueDate: '2024-01-30T00:00:00Z',
        createdAt: '2024-01-17T09:00:00Z',
        updatedAt: '2024-01-19T16:00:00Z',
        comments: []
      },
      {
        id: 'task4',
        title: 'Content Management System',
        description: 'Integrate CMS for easy content updates',
        status: 'done',
        priority: 'medium',
        assigneeId: 'user1',
        dueDate: '2024-01-20T00:00:00Z',
        createdAt: '2024-01-10T08:00:00Z',
        updatedAt: '2024-01-20T12:00:00Z',
        comments: []
      }
    ]
  };
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  React.useEffect(() => {
    const project = projects.find(p => p.id === id);
    setCurrentProject(project || mockProject);
  }, [id, projects, setCurrentProject]);

  // Ensure we always have a project to display
  const displayProject = currentProject || mockProject;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }



  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    updateTask(displayProject.id, updatedTask);
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  const handleNewTask = (columnId: string) => {
    setSelectedTask({
      id: '',
      title: '',
      description: '',
      status: columnId as Task['status'],
      priority: 'medium',
      createdAt: '',
      updatedAt: '',
      comments: []
    });
    setIsTaskModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{displayProject.name}</h1>
          <p className="text-gray-600">{displayProject.description}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => {
              const filter = prompt('Filter by:\n1. Priority\n2. Assignee\n3. Due Date\nEnter choice (1-3):');
              if (filter) {
                alert(`Filter ${filter} applied`);
              }
            }}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 border border-gray-300 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 border border-gray-300 rounded-lg transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Invite</span>
          </button>
          
          <button 
            onClick={() => {
              const timelineWindow = window.open('', '_blank');
              if (timelineWindow) {
                timelineWindow.document.write(`
                  <html>
                    <head><title>Project Timeline - ${displayProject.name}</title></head>
                    <body>
                      <h1>Project Timeline: ${displayProject.name}</h1>
                      <div style="margin: 20px 0;">
                        <h2>Project Progress</h2>
                        <div style="background: #f0f0f0; height: 20px; border-radius: 10px; overflow: hidden;">
                          <div style="background: #4CAF50; height: 100%; width: ${(displayProject.tasks.filter(t => t.status === 'done').length / displayProject.tasks.length) * 100}%;"></div>
                        </div>
                        <p>${displayProject.tasks.filter(t => t.status === 'done').length} of ${displayProject.tasks.length} tasks completed</p>
                      </div>
                      <div>
                        <h2>Task Timeline</h2>
                        ${displayProject.tasks.map(task => `
                          <div style="border: 1px solid #ddd; margin: 10px 0; padding: 10px; border-radius: 5px;">
                            <h3>${task.title}</h3>
                            <p>Status: ${task.status}</p>
                            <p>Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</p>
                          </div>
                        `).join('')}
                      </div>
                    </body>
                  </html>
                `);
                timelineWindow.document.close();
              }
            }}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 border border-gray-300 rounded-lg transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Timeline</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map(column => {
          const columnTasks = displayProject.tasks.filter(task => task.status === column.id);
          
          return (
            <div key={column.id} className={`bg-gray-50 rounded-xl p-4 border-t-4 ${column.color}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                    {columnTasks.length}
                  </span>
                </div>
                <button 
                  onClick={() => handleNewTask(column.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                {columnTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => handleTaskClick(task)}
                  />
                ))}
                
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tasks yet</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isTaskModalOpen && (
        <TaskModal
          task={selectedTask}
          onSave={handleTaskUpdate}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
          onAddTask={(taskData) => {
            addTask(displayProject.id, taskData);
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
        />
      )}

      {isInviteModalOpen && displayProject && (
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          projectId={displayProject.id}
          projectName={displayProject.name}
        />
      )}
    </div>
  );
}