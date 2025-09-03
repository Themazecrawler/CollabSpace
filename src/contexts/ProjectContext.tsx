import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  members: string[];
  tasks: Task[];
}

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>) => void;
  updateTask: (projectId: string, task: Task) => void;
  addTask: (projectId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => void;
  addComment: (projectId: string, taskId: string, content: string) => void;
  isLoading: boolean;
  setUser: (userId: string | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Load projects when user is authenticated
  useEffect(() => {
    if (currentUserId) {
      loadProjects();
    }
  }, [currentUserId]);

  // Function to set the current user ID (called from outside)
  const setUser = (userId: string | null) => {
    setCurrentUserId(userId);
    if (!userId) {
      setProjects([]);
      setIsLoading(false);
    }
  };

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      if (!currentUserId) {
        setProjects([]);
        setIsLoading(false);
        return;
      }

      // Load projects from Supabase
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          project_members!inner(user_id)
        `)
        .eq('project_members.user_id', currentUserId);

      if (projectsError) {
        console.error('Error loading projects:', projectsError);
        setProjects([]);
        setIsLoading(false);
        return;
      }

      // Load tasks for each project
      const projectsWithTasks = await Promise.all(
        projectsData.map(async (project) => {
          const { data: tasksData, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .eq('project_id', project.id);

          if (tasksError) {
            console.error('Error loading tasks:', tasksError);
            return {
              ...project,
              tasks: []
            };
          }

          // Convert tasks to the expected format
          const tasks = tasksData.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            assigneeId: task.assignee_id,
            dueDate: task.due_date,
            createdAt: task.created_at,
            updatedAt: task.updated_at,
            comments: [] // TODO: Load comments
          }));

          return {
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            createdAt: project.created_at,
            updatedAt: project.updated_at,
            members: [currentUserId], // TODO: Load actual members
            tasks
          };
        })
      );

      setProjects(projectsWithTasks);
    } catch (error) {
      console.error('Failed to load projects:', error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasks'>) => {
    try {
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      // Create project in Supabase
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: projectData.name,
          description: projectData.description,
          status: projectData.status,
          created_by: currentUserId
        })
        .select()
        .single();

      if (projectError) {
        console.error('Error creating project:', projectError);
        throw projectError;
      }

      // Add user as project member
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: newProject.id,
          user_id: currentUserId,
          role: 'member'
        });

      if (memberError) {
        console.error('Error adding project member:', memberError);
      }

      // Convert to Project format
      const project: Project = {
        id: newProject.id,
        name: newProject.name,
        description: newProject.description,
        status: newProject.status,
        createdAt: newProject.created_at,
        updatedAt: newProject.updated_at,
        members: [currentUserId],
      tasks: []
    };

      setProjects(prev => [...prev, project]);
      return project;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  };

  const updateTask = async (projectId: string, updatedTask: Task) => {
    try {
      // Update task in Supabase
      const { error: taskError } = await supabase
        .from('tasks')
        .update({
          title: updatedTask.title,
          description: updatedTask.description,
          status: updatedTask.status,
          priority: updatedTask.priority,
          assignee_id: updatedTask.assigneeId,
          due_date: updatedTask.dueDate
        })
        .eq('id', updatedTask.id);

      if (taskError) {
        console.error('Error updating task:', taskError);
        throw taskError;
      }

    setProjects(prev =>
      prev.map(project =>
        project.id === projectId
          ? {
              ...project,
              tasks: project.tasks.map(task =>
                task.id === updatedTask.id ? updatedTask : task
              ),
              updatedAt: new Date().toISOString()
            }
          : project
      )
    );
      return updatedTask;
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const addTask = async (projectId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => {
    try {
      // Create task in Supabase
      const { data: newTask, error: taskError } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          assignee_id: taskData.assigneeId,
          due_date: taskData.dueDate
        })
        .select()
        .single();

      if (taskError) {
        console.error('Error creating task:', taskError);
        throw taskError;
      }

      // Convert to Task format
      const task: Task = {
        id: newTask.id,
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        priority: newTask.priority,
        assigneeId: newTask.assignee_id,
        dueDate: newTask.due_date,
        createdAt: newTask.created_at,
        updatedAt: newTask.updated_at,
      comments: []
    };

    setProjects(prev =>
      prev.map(project =>
        project.id === projectId
          ? {
              ...project,
                tasks: [...project.tasks, task],
              updatedAt: new Date().toISOString()
            }
          : project
      )
    );
      return task;
    } catch (error) {
      console.error('Failed to add task:', error);
      throw error;
    }
  };

  const addComment = (projectId: string, taskId: string, content: string) => {
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: '1', // Current user
      userName: 'Alex Johnson',
      content,
      createdAt: new Date().toISOString()
    };

    setProjects(prev =>
      prev.map(project =>
        project.id === projectId
          ? {
              ...project,
              tasks: project.tasks.map(task =>
                task.id === taskId
                  ? {
                      ...task,
                      comments: [...task.comments, newComment],
                      updatedAt: new Date().toISOString()
                    }
                  : task
              ),
              updatedAt: new Date().toISOString()
            }
          : project
      )
    );
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      currentProject,
      setCurrentProject,
      addProject,
      updateTask,
      addTask,
      addComment,
      isLoading,
      setUser
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}