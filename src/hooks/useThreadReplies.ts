import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ThreadReply } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useThreadReplies = (threadId: string) => {
  const { user } = useAuth();
  const [replies, setReplies] = useState<ThreadReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReplies = async () => {
    if (!threadId) return;

    try {
      setLoading(true);
      setError(null);

      // First, get the replies
      const { data: repliesData, error: fetchError } = await supabase
        .from('thread_replies')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      // Get unique author IDs
      const authorIds = [...new Set(repliesData?.map(reply => reply.author_id) || [])];
      
      // Fetch user profiles for all authors
      let userProfiles: { [key: string]: string } = {};
      if (authorIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', authorIds);

        if (!profilesError && profilesData) {
          userProfiles = profilesData.reduce((acc, profile) => {
            acc[profile.id] = profile.name;
            return acc;
          }, {} as { [key: string]: string });
        }
      }

      const formattedReplies: ThreadReply[] = (repliesData || []).map(reply => {
        // If we can't get the user's name due to RLS restrictions, show a generic name
        let authorName = userProfiles[reply.author_id];
        if (!authorName) {
          // If it's the current user, we should be able to get their name
          if (user && reply.author_id === user.id) {
            authorName = user.name;
          } else {
            // For other users, show a generic name
            authorName = 'Project Member';
          }
        }
        
        return {
          id: reply.id,
          threadId: reply.thread_id,
          authorId: reply.author_id,
          authorName: authorName,
          content: reply.content,
          createdAt: new Date(reply.created_at),
          isEdited: reply.is_edited,
          imageUrl: reply.image_url || undefined,
        };
      });

      setReplies(formattedReplies);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading replies:', err);
    } finally {
      setLoading(false);
    }
  };

  const createReply = async (content: string) => {
    return createReplyWithImage(content);
  };

  const createReplyWithImage = async (content: string, imageUrl?: string) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    try {
      const { error } = await supabase
        .from('thread_replies')
        .insert({
          thread_id: threadId,
          author_id: user.id,
          content: content.trim(),
          image_url: imageUrl || null,
        });

      if (error) throw error;

      // Immediately refresh the replies list
      await loadReplies();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  useEffect(() => {
    loadReplies();
  }, [threadId]);
  return {
    replies,
    loading,
    error,
    createReply,
    createReplyWithImage,
    refetch: loadReplies,
  };
};