import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Category {
  id: string;
  name: string;
  color: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export const useCategories = (projectId: string) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('project_id', projectId)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name: string, color: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([
          {
            name,
            color,
            project_id: projectId
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setCategories(prev => [...prev, data]);
        return data;
      }
    } catch (err: any) {
      console.error('Error creating category:', err);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err: any) {
      console.error('Error deleting category:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchCategories();
    }
  }, [projectId]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    deleteCategory
  };
};