import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Project, User } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      if (user.role === 'freelancer') {
        // For freelancers, get their projects
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select('*')
          .eq('freelancer_id', user.id)
          .order('updated_at', { ascending: false });

        if (fetchError) throw fetchError;
        
        const formattedProjects: Project[] = (data || []).map(project => ({
          id: project.id,
          name: project.name,
          description: project.description,
          timeline: project.timeline,
          progress: project.progress,
          status: project.status,
          freelancerId: project.freelancer_id,
          inviteToken: project.invite_token,
          createdAt: new Date(project.created_at),
          lastActivity: new Date(project.updated_at),
          clients: []
        }));

        setProjects(formattedProjects);
      } else {
        // For clients, get projects they're part of
        const { data: clientProjects } = await supabase
          .from('project_clients')
          .select('project_id')
          .eq('client_id', user.id);

        if (clientProjects && clientProjects.length > 0) {
          const projectIds = clientProjects.map(cp => cp.project_id);
          const { data, error: fetchError } = await supabase
            .from('projects')
            .select('*')
            .in('id', projectIds)
            .order('updated_at', { ascending: false });

          if (fetchError) throw fetchError;

          const formattedProjects: Project[] = (data || []).map(project => ({
            id: project.id,
            name: project.name,
            description: project.description,
            timeline: project.timeline,
            progress: project.progress,
            status: project.status,
            freelancerId: project.freelancer_id,
            inviteToken: project.invite_token,
            createdAt: new Date(project.created_at),
            lastActivity: new Date(project.updated_at),
            clients: []
          }));

          setProjects(formattedProjects);
        } else {
          setProjects([]);
        }
      }
    } catch (err: any) {
      // Enhanced error handling for network issues
      let errorMessage = err.message;
      
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        errorMessage = 'Unable to connect to the database. Please check your internet connection and ensure the Supabase service is accessible.';
        console.error('Network error details:', {
          error: err,
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          timestamp: new Date().toISOString()
        });
      }
      
      setError(errorMessage);
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: {
    name: string;
    description: string;
    timeline: string;
  }) => {
    if (!user || user.role !== 'freelancer') {
      throw new Error('Only freelancers can create projects');
    }

    try {
      // Generate a simple, URL-friendly random token
      const invite_token = Math.random().toString(36).substring(2) + Date.now().toString(36);

      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: projectData.name,
          description: projectData.description,
          timeline: projectData.timeline,
          freelancer_id: user.id,
          invite_token: invite_token,
        })
        .select()
        .single();

      if (error) throw error;

      await loadProjects(); // Refresh the list
      return data;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: updates.name,
          description: updates.description,
          timeline: updates.timeline,
          progress: updates.progress,
          status: updates.status,
        })
        .eq('id', projectId);

      if (error) throw error;

      await loadProjects(); // Refresh the list
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const updateProjectProgress = async (projectId: string) => {
    try {
      // Get all todos for this project
      const { data: todos, error: todosError } = await supabase
        .from('todos')
        .select('completed')
        .eq('project_id', projectId);

      if (todosError) throw todosError;

      // Calculate progress based on completed tasks
      const totalTasks = todos?.length || 0;
      const completedTasks = todos?.filter(todo => todo.completed).length || 0;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Update project progress
      const { error: updateError } = await supabase
        .from('projects')
        .update({ progress })
        .eq('id', projectId);

      if (updateError) throw updateError;

      await loadProjects(); // Refresh the list
    } catch (err: any) {
      console.error('Error updating project progress:', err);
    }
  };
  useEffect(() => {
    loadProjects();
  }, [user]);

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    updateProjectProgress,
    refetch: loadProjects,
  };
};