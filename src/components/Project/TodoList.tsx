import React, { useState } from 'react';
import { Plus, CheckCircle, Circle, Trash2, AlertCircle, Clock, Flag, X, Sparkles, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { useTodos } from '../../hooks/useTodos';
import { useAuth } from '../../contexts/AuthContext';
import { useCategories } from '../../hooks/useCategories';

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

const priorityColors = {
  high: 'text-red-500',
  medium: 'text-yellow-500',
  low: 'text-green-500',
};

export const TodoList: React.FC<TodoListProps> = ({ projectId, onUpdate }) => {
  const { user } = useAuth();
  const { todos, loading, error, createTodo, toggleTodo, deleteTodo } = useTodos(projectId);
  const { categories, loading: categoriesLoading, createCategory } = useCategories(projectId);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#6B7280' });
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as const,
    delivery_date: '',
  });

  // Set default category when categories load
  React.useEffect(() => {
    if (categories.length > 0 && !newTodo.category) {
      setNewTodo(prev => ({ ...prev, category: categories[0].id }));
    }
  }, [categories]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createTodo({
        ...newTodo,
        delivery_date: newTodo.delivery_date || null,
      });
      setNewTodo({
        title: '',
        description: '',
        category: categories[0]?.id || '',
        priority: 'medium',
        delivery_date: '',
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

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    try {
      const newCat = await createCategory(newCategory.name, newCategory.color);
      // Automatically select the new category if we're in the todo form
      if (showAddForm && newCat) {
        setNewTodo(prev => ({ ...prev, category: newCat.id }));
      }
      setNewCategory({ name: '', color: '#6B7280' });
      setShowAddCategoryForm(false);
    } catch (err: any) {
      console.error('Failed to create category:', err);
      alert('Failed to create category: ' + err.message);
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

  const toggleCategoryFilter = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const filteredTodos = todos.filter(todo => {
    if (selectedCategories.length === 0) return true;
    return selectedCategories.includes(todo.category);
  });

  const completedTodos = filteredTodos.filter(t => t.completed);
  const pendingTodos = filteredTodos.filter(t => !t.completed);

  const getCategoryById = (id: string) => {
    return categories.find(cat => cat.id === id) || null;
  };

  if (loading || categoriesLoading) {
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

      {/* Category Filter Accordion */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <button
          onClick={() => setShowCategoryFilter(!showCategoryFilter)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <span className="font-medium text-gray-900">Filter by Category</span>
          {showCategoryFilter ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {showCategoryFilter && (
          <div className="px-4 pb-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2 pt-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategoryFilter(category.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategories.includes(category.id)
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: category.color,
                  }}
                >
                  {category.name}
                </button>
              ))}
              
              {user?.role === 'freelancer' && (
                <button
                  onClick={() => setShowAddCategoryForm(!showAddCategoryForm)}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Category
                </button>
              )}
            </div>
            
            {showAddCategoryForm && (
              <form onSubmit={handleAddCategory} className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name
                    </label>
                    <input
                      type="text"
                      id="categoryName"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. Research"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="categoryColor" className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <input
                      type="color"
                      id="categoryColor"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                      className="w-full h-10 px-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryForm(false)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Category
                  </button>
                </div>
              </form>
            )}
          </div>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  {user?.role === 'freelancer' && (
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryForm(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </button>
                  )}
                </div>
                <select
                  id="category"
                  value={newTodo.category}
                  onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                
                {/* Inline category form when adding from todo form */}
                {showAddCategoryForm && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Add New Category</h5>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Category name"
                        required
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={newCategory.color}
                          onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={handleAddCategory}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddCategoryForm(false)}
                          className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
              
              <div>
                <label htmlFor="delivery_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Date
                </label>
                <input
                  type="date"
                  id="delivery_date"
                  value={newTodo.delivery_date}
                  onChange={(e) => setNewTodo({ ...newTodo, delivery_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
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
                disabled={isSubmitting || !newTodo.title.trim() || !newTodo.category}
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
                const category = getCategoryById(todo.category);
                const CategoryIcon = categoryIcons[category?.name.toLowerCase() as keyof typeof categoryIcons] || Circle;
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
                          {category && (
                            <div 
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border"
                              style={{
                                backgroundColor: `${category.color}20`,
                                color: category.color,
                                borderColor: `${category.color}40`,
                                borderLeftWidth: '4px',
                                borderLeftColor: category.color,
                              }}
                            >
                              <CategoryIcon className="w-3 h-3 mr-1" />
                              {category.name}
                            </div>
                          )}
                          <Flag className={`w-3 h-3 ${priorityColors[todo.priority]}`} />
                        </div>
                        {todo.description && (
                          <p className="text-sm text-gray-600 mb-2">{todo.description}</p>
                        )}
                        {todo.deliveryDate && (
                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            <Calendar className="w-3 h-3 mr-1" />
                            Due: {todo.deliveryDate.toLocaleDateString()}
                          </div>
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
                const category = getCategoryById(todo.category);
                const CategoryIcon = categoryIcons[category?.name.toLowerCase() as keyof typeof categoryIcons] || Circle;
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
                          {category && (
                            <div 
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border"
                              style={{
                                backgroundColor: `${category.color}20`,
                                color: category.color,
                                borderColor: `${category.color}40`,
                                borderLeftWidth: '4px',
                                borderLeftColor: category.color,
                              }}
                            >
                              <CategoryIcon className="w-3 h-3 mr-1" />
                              {category.name}
                            </div>
                          )}
                        </div>
                        {todo.description && (
                          <p className="text-sm text-gray-500 line-through mb-2">{todo.description}</p>
                        )}
                        {todo.deliveryDate && (
                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            <Calendar className="w-3 h-3 mr-1" />
                            Due: {todo.deliveryDate.toLocaleDateString()}
                          </div>
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
        {filteredTodos.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-6">
              {selectedCategories.length > 0
                ? 'No tasks match your selected filters'
                : user?.role === 'freelancer'
                ? 'Create your first task to start tracking progress'
                : 'Tasks will appear here when created by your freelancer'
              }
            </p>
            {user?.role === 'freelancer' && selectedCategories.length === 0 && (
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