import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Todo } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from './useProjects';

export const useTodos = (projectId: string) => {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadTodos = useCallback(async () => {
    if (!projectId) {
      setTodos([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Loading todos for project:', projectId);
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('todos')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const formattedTodos: Todo[] = (data || []).map(todo => ({
        id: todo.id,
        projectId: todo.project_id,
        title: todo.title,
        description: todo.description,
        completed: todo.completed,
        category: todo.category,
        priority: todo.priority,
        createdAt: new Date(todo.created_at),
        completedAt: todo.completed_at ? new Date(todo.completed_at) : undefined,
      }));

      console.log('Loaded todos:', formattedTodos.length);
      setTodos(formattedTodos);
    } catch (err: any) {
      console.error('Error loading todos:', err);
      setError(err.message);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const createTodo = useCallback(async (todoData: {
    title: string;
    description?: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
  }) => {
    if (!user || user.role !== 'freelancer') {
      throw new Error('Only freelancers can create todos');
    }

    console.log('Creating todo:', todoData);

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert({
          project_id: projectId,
          title: todoData.title,
          description: todoData.description,
          category: todoData.category,
          priority: todoData.priority,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Todo created successfully:', data);
      
      // Trigger a refresh to reload all todos from database
      console.log('Triggering refresh after todo creation');
      setRefreshTrigger(prev => prev + 1);
      
      return data;
    } catch (err: any) {
      console.error('Error creating todo:', err);
      throw new Error(err.message);
    }
  }, [user, projectId]);

  const toggleTodo = useCallback(async (todoId: string) => {
    if (!user || user.role !== 'freelancer') {
      throw new Error('Only freelancers can update todos');
    }

    try {
      const todo = todos.find(t => t.id === todoId);
      if (!todo) return;

      console.log('Toggling todo:', todoId, 'to', !todo.completed);

      const { error } = await supabase
        .from('todos')
        .update({
          completed: !todo.completed,
          completed_at: !todo.completed ? new Date().toISOString() : null,
        })
        .eq('id', todoId);

      if (error) throw error;

      console.log('Todo toggled successfully');
      
      // Trigger refresh after toggle
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      console.error('Error toggling todo:', err);
      throw new Error(err.message);
    }
  }, [user, todos]);

  const deleteTodo = useCallback(async (todoId: string) => {
    if (!user || user.role !== 'freelancer') {
      throw new Error('Only freelancers can delete todos');
    }

    try {
      console.log('Deleting todo:', todoId);

      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId);

      if (error) throw error;

      console.log('Todo deleted successfully');
      
      // Trigger refresh after delete
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      console.error('Error deleting todo:', err);
      throw new Error(err.message);
    }
  }, [user]);

  // Function to update project progress after todo changes
  const updateProjectProgress = useCallback(async () => {
    try {
      // Calculate progress based on current todos
      const totalTasks = todos.length;
      const completedTasks = todos.filter(todo => todo.completed).length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Update project progress
      const { error } = await supabase
        .from('projects')
        .update({ progress })
        .eq('id', projectId);

      if (error) throw error;
    } catch (err: any) {
      console.error('Error updating project progress:', err);
    }
  }, [todos, projectId]);

  // Update project progress whenever todos change
  useEffect(() => {
    if (todos.length > 0 || refreshTrigger > 0) {
      updateProjectProgress();
    }
  }, [todos, updateProjectProgress, refreshTrigger]);
  // Load todos when projectId changes
  useEffect(() => {
    loadTodos();
  }, [loadTodos, refreshTrigger]);

  return {
    todos,
    loading,
    error,
    createTodo,
    toggleTodo,
    deleteTodo,
    refetch: loadTodos,
  };
};