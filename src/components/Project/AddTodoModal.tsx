import React, { useState } from 'react';
import { X, Plus, AlertCircle, Bug, Palette, FileText } from 'lucide-react';
import { useTodos } from '../../hooks/useTodos';

interface AddTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess?: () => void;
}

const predefinedCategories = {
  feature: { icon: AlertCircle, label: 'Feature', color: 'bg-blue-100 text-blue-800' },
  bug: { icon: Bug, label: 'Bug Fix', color: 'bg-red-100 text-red-800' },
  design: { icon: Palette, label: 'Design', color: 'bg-purple-100 text-purple-800' },
  content: { icon: FileText, label: 'Content', color: 'bg-green-100 text-green-800' }
};

export const AddTodoModal: React.FC<AddTodoModalProps> = ({ isOpen, onClose, projectId, onSuccess }) => {
  const { createTodo } = useTodos(projectId);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'feature',
    customCategory: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [useCustomCategory, setUseCustomCategory] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    console.log('AddTodoModal: Starting form submission');
    setIsSubmitting(true);
    setError('');

    try {
      const category = useCustomCategory ? formData.customCategory.trim() : formData.category;
      if (!category) {
        setError('Please provide a category');
        return;
      }

      console.log('AddTodoModal: Calling createTodo with data:', {
        title: formData.title,
        description: formData.description || undefined,
        category,
        priority: formData.priority
      });

      await createTodo({
        title: formData.title,
        description: formData.description || undefined,
        category,
        priority: formData.priority
      });
      
      console.log('AddTodoModal: Todo created successfully, closing modal');
      setFormData({ title: '', description: '', category: 'feature', customCategory: '', priority: 'medium' });
      setUseCustomCategory(false);
      setError('');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('AddTodoModal: Error creating todo:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Add New Task</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Describe the task (optional)"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="predefined-category"
                    name="categoryType"
                    checked={!useCustomCategory}
                    onChange={() => setUseCustomCategory(false)}
                    className="text-blue-600 focus:ring-blue-600"
                  />
                  <label htmlFor="predefined-category" className="text-sm text-gray-700">
                    Use predefined category
                  </label>
                </div>
                
                {!useCustomCategory && (
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                  >
                    {Object.entries(predefinedCategories).map(([value, { label }]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="custom-category"
                    name="categoryType"
                    checked={useCustomCategory}
                    onChange={() => setUseCustomCategory(true)}
                    className="text-blue-600 focus:ring-blue-600"
                  />
                  <label htmlFor="custom-category" className="text-sm text-gray-700">
                    Create custom category
                  </label>
                </div>

                {useCustomCategory && (
                  <input
                    type="text"
                    name="customCategory"
                    value={formData.customCategory}
                    onChange={handleChange}
                    placeholder="Enter custom category name"
                    className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                  />
                )}
              </div>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <select
                id="priority"
                name="priority"
                required
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center px-4 py-2 sm:py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};