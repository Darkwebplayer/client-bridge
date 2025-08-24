import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Document } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { sendNotification } from './useNotifications';

export const useDocuments = (projectId: string) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadDocuments = useCallback(async () => {
    if (!projectId) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Loading documents for project:', projectId);
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const formattedDocuments: Document[] = (data || []).map(doc => ({
        id: doc.id,
        projectId: doc.project_id,
        title: doc.title,
        type: doc.type,
        link: doc.link,
        amount: doc.amount,
        status: doc.status,
        createdAt: new Date(doc.created_at),
        dueDate: doc.due_date ? new Date(doc.due_date) : undefined,
      }));

      console.log('Loaded documents:', formattedDocuments.length);
      setDocuments(formattedDocuments);
    } catch (err: any) {
      console.error('Error loading documents:', err);
      setError(err.message);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const createDocument = useCallback(async (documentData: {
    title: string;
    type: 'invoice' | 'contract' | 'proposal';
    link: string;
    amount?: number;
    status?: 'pending' | 'paid' | 'overdue' | 'draft';
    dueDate?: Date;
  }) => {
    if (!user || user.role !== 'freelancer') {
      throw new Error('Only freelancers can create documents');
    }

    console.log('Creating document:', documentData);

    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          project_id: projectId,
          title: documentData.title,
          type: documentData.type,
          link: documentData.link,
          amount: documentData.amount || null,
          status: documentData.status || 'draft',
          due_date: documentData.dueDate ? documentData.dueDate.toISOString().split('T')[0] : null,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Document created successfully:', data);
      
      // Send notification to project members
      sendNotification(
        user.id,
        projectId,
        'document',
        'New Document',
        `New document added: ${documentData.title}`,
        data.id
      );
      
      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);
      
      return data;
    } catch (err: any) {
      console.error('Error creating document:', err);
      throw new Error(err.message);
    }
  }, [user, projectId]);

  const updateDocument = useCallback(async (documentId: string, updates: {
    title?: string;
    type?: 'invoice' | 'contract' | 'proposal';
    link?: string;
    amount?: number;
    status?: 'pending' | 'paid' | 'overdue' | 'draft';
    dueDate?: Date;
  }) => {
    if (!user || user.role !== 'freelancer') {
      throw new Error('Only freelancers can update documents');
    }

    try {
      console.log('Updating document:', documentId, updates);

      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.link !== undefined) updateData.link = updates.link;
      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.dueDate !== undefined) {
        updateData.due_date = updates.dueDate ? updates.dueDate.toISOString().split('T')[0] : null;
      }

      const { error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', documentId);

      if (error) throw error;

      console.log('Document updated successfully');
      
      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      console.error('Error updating document:', err);
      throw new Error(err.message);
    }
  }, [user]);

  const deleteDocument = useCallback(async (documentId: string) => {
    if (!user || user.role !== 'freelancer') {
      throw new Error('Only freelancers can delete documents');
    }

    try {
      console.log('Deleting document:', documentId);

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      console.log('Document deleted successfully');
      
      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      console.error('Error deleting document:', err);
      throw new Error(err.message);
    }
  }, [user]);

  // Load documents when projectId changes or refresh is triggered
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments, refreshTrigger]);

  return {
    documents,
    loading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
    refetch: loadDocuments,
  };
};