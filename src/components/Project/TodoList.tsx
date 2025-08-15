import React, { useState } from 'react';
import { Plus, CheckCircle, Circle, Trash2, AlertCircle, Clock, Flag, X, Sparkles } from 'lucide-react';
import { useTodos } from '../../hooks/useTodos';
import { useAuth } from '../../contexts/AuthContext';

interface TodoListProps {
  projectId: string;
  onUpdate?: () => void;
}

const categoryIcons = {
  feature: Sparkles,
  bug: AlertCircle,
  design: Circle,
  content: Clock,
};

const categoryColors = {
  feature: 'bg-blue-50 text-blue-700 border-blue-200',
  bug: 'bg-red-50 text-red-700 border-red-200',
  design: 'bg-purple-50 text-purple-700 border-purple-200',
  content: 'bg-green-50 text-green-700 border-green-200',
};

const priorityColors = {
  high: 'text-red-500',
  medium: 'text-yellow-500',
  low: 'text-green-500',
};

export const TodoList: React.FC<TodoListProps> = ({ projectId, onUpdate }) => {
  const { user } = useAuth();
  const { todos, loading, error, createTodo, toggleTodo, deleteTodo } = useTodos(projectId);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    category: 'feature' as const,
    priority: 'medium' as const,
  });

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createTodo(newTodo);
      setNewTodo({
        title: '',
        description: '',
        category: 'feature',
        priority: 'medium',
      });
      setShowAddForm(false);
      onUpdate?.();
    } catch (err: any) {
      console.error('Failed to create todo:', err);
      alert('Failed to create task: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTodo = async (todoId: string) => {
    try {
      await toggleTodo(todoId);
      onUpdate?.();
    } catch (err: any) {
      console.error('Failed to toggle todo:', err);
      alert('Failed to update task: ' + err.message);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await deleteTodo(todoId);
      onUpdate?.();
    } catch (err: any) {
      console.error('Failed to delete todo:', err);
      alert('Failed to delete task: ' + err.message);
    }
  };

  const completedTodos = todos.filter(t => t.completed);
  const pendingTodos = todos.filter(t => !t.completed);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error loading tasks</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Tasks</h3>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">{pendingTodos.length} pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">{completedTodos.length} completed</span>
            </div>
          </div>
        </div>
        {user?.role === 'freelancer' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </button>
        )}
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Create New Task</h4>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <form onSubmit={handleAddTodo} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                id="title"
                value={newTodo.title}
                onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter task title..."
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={newTodo.description}
                onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Describe the task (optional)..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={newTodo.category}
                  onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="feature">Feature</option>
                  <option value="bug">Bug Fix</option>
                  <option value="design">Design</option>
                  <option value="content">Content</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  value={newTodo.priority}
                  onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !newTodo.title.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Task
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {/* Pending Tasks */}
        {pendingTodos.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Pending Tasks ({pendingTodos.length})
            </h4>
            <div className="space-y-3">
              {pendingTodos.map((todo) => {
                const CategoryIcon = categoryIcons[todo.category as keyof typeof categoryIcons] || Circle;
                return (
                  <div
                    key={todo.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-start space-x-4">
                      <button
                        onClick={() => handleToggleTodo(todo.id)}
                        className="flex-shrink-0 mt-1 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                      >
                        <Circle className="w-5 h-5" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h5 className="text-sm font-medium text-gray-900">{todo.title}</h5>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${categoryColors[todo.category as keyof typeof categoryColors] || categoryColors.feature}`}>
                            <CategoryIcon className="w-3 h-3 mr-1" />
                            {todo.category}
                          </div>
                          <Flag className={`w-3 h-3 ${priorityColors[todo.priority]}`} />
                        </div>
                        {todo.description && (
                          <p className="text-sm text-gray-600 mb-2">{todo.description}</p>
                        )}
                        <div className="text-xs text-gray-500">
                          Created {todo.createdAt.toLocaleDateString()}
                        </div>
                      </div>

                      {user?.role === 'freelancer' && (
                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTodos.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Completed Tasks ({completedTodos.length})
            </h4>
            <div className="space-y-3">
              {completedTodos.map((todo) => {
                const CategoryIcon = categoryIcons[todo.category as keyof typeof categoryIcons] || Circle;
                return (
                  <div
                    key={todo.id}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 opacity-75"
                  >
                    <div className="flex items-start space-x-4">
                      <button
                        onClick={() => handleToggleTodo(todo.id)}
                        className="flex-shrink-0 mt-1 text-green-500 hover:text-gray-400 transition-colors duration-200"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h5 className="text-sm font-medium text-gray-600 line-through">{todo.title}</h5>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${categoryColors[todo.category as keyof typeof categoryColors] || categoryColors.feature}`}>
                            <CategoryIcon className="w-3 h-3 mr-1" />
                            {todo.category}
                          </div>
                        </div>
                        {todo.description && (
                          <p className="text-sm text-gray-500 line-through mb-2">{todo.description}</p>
                        )}
                        <div className="text-xs text-gray-500">
                          Completed {todo.completedAt?.toLocaleDateString() || 'recently'}
                        </div>
                      </div>

                      {user?.role === 'freelancer' && (
                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {todos.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-600 mb-6">
              {user?.role === 'freelancer' 
                ? 'Create your first task to start tracking progress'
                : 'Tasks will appear here when created by your freelancer'
              }
            </p>
            {user?.role === 'freelancer' && (
              <button 
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Task
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};