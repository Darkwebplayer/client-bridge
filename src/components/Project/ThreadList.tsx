import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Plus, Bug, AlertCircle, FileText, MessageCircle, Clock, CheckCircle, Image, MoreVertical, Trash2 } from 'lucide-react';
import { Thread } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useThreads } from '../../hooks/useThreads';
import { NewThreadModal } from './NewThreadModal';

interface ThreadListProps {
  projectId: string;
  selectedTab: 'threads' | 'bugs' | 'documents';
  onUpdate?: () => void;
}

const categoryIcons = {
  general: MessageCircle,
  bug: Bug,
  feature: AlertCircle,
  feedback: MessageSquare
};

const categoryColors = {
  general: 'text-gray-600 bg-gray-100',
  bug: 'text-red-600 bg-red-100',
  feature: 'text-blue-600 bg-blue-100',
  feedback: 'text-green-600 bg-green-100'
};

const categoryLabels = {
  general: 'General',
  bug: 'Bug Report',
  feature: 'Feature Request',
  feedback: 'Feedback'
};

export const ThreadList: React.FC<ThreadListProps> = ({ 
  projectId, 
  selectedTab,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { threads, loading, error, deleteThread, toggleThread } = useThreads(projectId);
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  console.log('ThreadList: Rendering with threads:', threads?.length || 0);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error loading threads: {error}</p>
      </div>
    );
  }

  // Ensure threads is an array
  const safeThreads = Array.isArray(threads) ? threads : [];
  
  const filteredThreads = selectedTab === 'bugs' 
    ? safeThreads.filter(t => t.category === 'bug')
    : safeThreads;

  const handleAddSuccess = (newThread?: any) => {
    console.log('ThreadList: Add thread success callback triggered');
    if (newThread) {
      // Navigate to the newly created thread
      navigate(`/project/${projectId}/thread/${newThread.id}`);
    }
    // The useThreads hook will automatically refresh due to refreshTrigger
  };

  const handleThreadClick = (thread: Thread) => {
    navigate(`/project/${projectId}/thread/${thread.id}`, {
      state: { from: location.pathname + location.search }
    });
  };
  const handleDeleteThread = async (thread: Thread) => {
    if (!confirm(`Are you sure you want to delete "${thread.title}"?`)) return;
    
    try {
      await deleteThread(thread.id);
      setShowDropdown(null);
    } catch (err: any) {
      console.error('Failed to delete thread:', err);
      alert('Failed to delete thread: ' + err.message);
    }
  };

  const handleToggleResolve = async (thread: Thread) => {
    try {
      await toggleThread(thread.id);
      setShowDropdown(null);
    } catch (err: any) {
      console.error('Failed to toggle thread status:', err);
      // Check if it's a permission error
      if (err.message.includes('permission') || err.message.includes('not have')) {
        alert('You do not have permission to update this thread. Only the project freelancer can mark threads as resolved.');
      } else {
        alert('Failed to update thread status: ' + err.message);
      }
    }
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Unknown';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return 'Unknown';
      
      const now = new Date();
      const diff = now.getTime() - dateObj.getTime();
      const hours = Math.floor(diff / (1000 * 3600));
      const days = Math.floor(diff / (1000 * 3600 * 24));
      
      if (hours < 1) return 'Just now';
      if (hours < 24) return `${hours}h ago`;
      if (days === 1) return 'Yesterday';
      if (days < 7) return `${days}d ago`;
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (selectedTab === 'documents') {
    return null; // Documents tab is handled separately
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedTab === 'bugs' ? 'Bug Reports' : 'Messages'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {filteredThreads.length} {selectedTab === 'bugs' ? 'bug reports' : 'conversations'}
          </p>
        </div>
        <button 
          onClick={() => setShowNewThreadModal(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          New {selectedTab === 'bugs' ? 'Bug Report' : 'Message'}
        </button>
      </div>

      <div className="space-y-3">
        {filteredThreads.map((thread) => {
          const IconComponent = categoryIcons[thread.category] || MessageCircle;
          return (
            <div
              key={thread.id}
              onClick={() => handleThreadClick(thread)}
              className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm hover:border-gray-300 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium text-sm">
                    {getInitials(thread.creatorName)}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryColors[thread.category] || categoryColors.general}`}>
                        <IconComponent className="w-3 h-3 mr-1" />
                        {categoryLabels[thread.category] || 'General'}
                      </span>
                      {thread.isResolved && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Resolved
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(thread.lastActivity)}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                    {thread.title}
                  </h4>
                  
                  {/* URL Link */}
                  {thread.url && (
                    <div className="mb-2">
                      <a
                        href={thread.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline break-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {thread.url}
                      </a>
                    </div>
                  )}
                  
                  {/* Image Attachment */}
                  {thread.imageUrl && (
                    <div className="mb-2">
                      <div className="mt-2">
                        <img
                          src={thread.imageUrl}
                          alt="Thread attachment"
                          className="max-w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(thread.imageUrl, '_blank');
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created by {thread.creatorName} • {formatDate(thread.createdAt)}</span>
                    <div className="flex items-center space-x-4">
                      {(thread.replyCount || 0) > 0 && (
                        <span className="flex items-center">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
                        </span>
                      )}
                      {user?.role === 'freelancer' && (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDropdown(showDropdown === thread.id ? null : thread.id);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100"
                            title="More options"
                          >
                            <MoreVertical className="w-3 h-3" />
                          </button>
                          
                          {showDropdown === thread.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleResolve(thread);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                              >
                                {thread.isResolved ? (
                                  <>
                                    <AlertCircle className="w-3 h-3 mr-2" />
                                    Mark as Unresolved
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-3 h-3 mr-2" />
                                    Mark as Resolved
                                  </>
                                )}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteThread(thread);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                              >
                                <Trash2 className="w-3 h-3 mr-2" />
                                Delete Thread
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredThreads.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {selectedTab === 'bugs' ? (
              <Bug className="w-8 h-8 text-gray-400" />
            ) : (
              <MessageSquare className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {selectedTab === 'bugs' ? 'bug reports' : 'messages'} yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start the conversation by creating a new {selectedTab === 'bugs' ? 'bug report' : 'message'}
          </p>
          <button 
            onClick={() => setShowNewThreadModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create {selectedTab === 'bugs' ? 'Bug Report' : 'Message'}
          </button>
        </div>
      )}

      {/* New Thread Modal */}
      <NewThreadModal
        isOpen={showNewThreadModal}
        onClose={() => setShowNewThreadModal(false)}
        projectId={projectId}
        defaultCategory={selectedTab === 'bugs' ? 'bug' : 'general'}
        onSuccess={handleAddSuccess}
      />

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowDropdown(null)}
        />
      )}
    </div>
  );
};