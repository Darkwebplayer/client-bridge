import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Thread } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useThreads = (projectId: string) => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadThreads = useCallback(async () => {
    if (!projectId) {
      setThreads([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Loading threads for project:', projectId);
      setLoading(true);
      setError(null);

      // First, get the threads
      const { data: threadsData, error: fetchError } = await supabase
        .from('threads')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Get unique creator IDs
      const creatorIds = [...new Set(threadsData?.map(thread => thread.creator_id) || [])];
      
      // Fetch user profiles for all creators
      let userProfiles: { [key: string]: string } = {};
      if (creatorIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', creatorIds);

        if (!profilesError && profilesData) {
          userProfiles = profilesData.reduce((acc, profile) => {
            acc[profile.id] = profile.name;
            return acc;
          }, {} as { [key: string]: string });
        }
      }

      // Get reply counts for each thread
      const threadIds = (threadsData || []).map(thread => thread.id);
      let replyCounts: { [key: string]: number } = {};
      
      if (threadIds.length > 0) {
        const { data: replyData } = await supabase
          .from('thread_replies')
          .select('thread_id')
          .in('thread_id', threadIds);
        
        if (replyData) {
          replyCounts = replyData.reduce((acc, reply) => {
            acc[reply.thread_id] = (acc[reply.thread_id] || 0) + 1;
            return acc;
          }, {} as { [key: string]: number });
        }
      }

      const formattedThreads: Thread[] = (threadsData || []).map(thread => {
        // If we can't get the user's name due to RLS restrictions, show a generic name
        let creatorName = userProfiles[thread.creator_id];
        if (!creatorName) {
          // If it's the current user, we should be able to get their name
          if (user && thread.creator_id === user.id) {
            creatorName = user.name;
          } else {
            // For other users, show a generic name
            creatorName = 'Project Member';
          }
        }
        
        return {
          id: thread.id,
          projectId: thread.project_id,
          title: thread.title,
          content: thread.content,
          category: thread.category,
          creatorId: thread.creator_id,
          creatorName: creatorName,
          isResolved: thread.is_resolved || false,
          createdAt: new Date(thread.created_at),
          lastActivity: new Date(thread.updated_at || thread.created_at),
          replyCount: replyCounts[thread.id] || 0,
          url: thread.url || undefined,
          imageUrl: thread.image_url || undefined,
        };
      });

      setThreads(formattedThreads);
      console.log('Loaded threads:', formattedThreads.length);
    } catch (err: any) {
      console.error('Error loading threads:', err);
      
      // Handle network/fetch errors with more user-friendly messages
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        console.error('Network error details:', {
          name: err.name,
          message: err.message,
          stack: err.stack,
          projectId,
          timestamp: new Date().toISOString()
        });
        setError('Unable to connect to the database. Please check your internet connection and ensure the Supabase service is accessible.');
      } else {
        setError(err.message || 'An unexpected error occurred while loading threads');
      }
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const createThread = useCallback(async (threadData: {
    title: string;
    category: string;
    url?: string;
    imageUrl?: string;
  }) => {
    if (!user) {
      throw new Error('You must be logged in to create a thread');
    }

    console.log('Creating thread:', threadData);

    try {
      const { data, error } = await supabase
        .from('threads')
        .insert({
          project_id: projectId,
          title: threadData.title,
          category: threadData.category,
          creator_id: user.id,
          url: threadData.url,
          image_url: threadData.imageUrl || null,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Thread created successfully:', data);
      
      // Force immediate refresh of threads
      setRefreshTrigger(prev => prev + 1);
      
      // Return formatted thread data for navigation
      const formattedThread = {
        id: data.id,
        projectId: data.project_id,
        title: data.title,
        category: data.category,
        creatorId: data.creator_id,
        creatorName: user.name,
        isResolved: data.is_resolved || false,
        createdAt: new Date(data.created_at),
        lastActivity: new Date(data.updated_at || data.created_at),
        replyCount: 0,
        url: data.url || undefined,
        imageUrl: data.image_url || undefined,
      };
      
      return formattedThread;
    } catch (err: any) {
      console.error('Error creating thread:', err);
      throw new Error(err.message);
    }
  }, [user, projectId, setRefreshTrigger]);

  const toggleThread = useCallback(async (threadId: string) => {
    if (!user || user.role !== 'freelancer') {
      throw new Error('Only freelancers can update threads');
    }

    try {
      const thread = threads.find(t => t.id === threadId);
      if (!thread) return;

      console.log('Toggling thread:', threadId, 'to', !thread.isResolved);

      const { error } = await supabase
        .from('threads')
        .update({
          is_resolved: !thread.isResolved,
        })
        .eq('id', threadId);

      if (error) {
        console.error('Error toggling thread:', error);
        // Check if it's a permission error
        if (error.message.includes('permission') || error.message.includes('denied')) {
          throw new Error('You do not have permission to update this thread. Please contact the project owner.');
        }
        throw error;
      }

      console.log('Thread toggled successfully');
      
      // Force refresh
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      console.error('Error toggling thread:', err);
      throw new Error(err.message || 'Failed to update thread status');
    }
  }, [user, threads]);

  const deleteThread = useCallback(async (threadId: string) => {
    if (!user || user.role !== 'freelancer') {
      throw new Error('Only freelancers can delete threads');
    }

    try {
      console.log('Deleting thread:', threadId);

      const { error } = await supabase
        .from('threads')
        .delete()
        .eq('id', threadId);

      if (error) throw error;

      console.log('Thread deleted successfully');
      
      // Force refresh
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      console.error('Error deleting thread:', err);
      throw new Error(err.message);
    }
  }, [user]);

  // Load threads when projectId changes or refresh is triggered
  useEffect(() => {
    loadThreads();
  }, [loadThreads, refreshTrigger]);

  return {
    threads,
    loading,
    error,
    createThread,
    toggleThread,
    deleteThread,
    refetch: loadThreads,
  };
};