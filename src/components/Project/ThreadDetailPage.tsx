import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, MessageSquare, Bug, AlertCircle, MessageCircle, Clock, CheckCircle, Image, Upload, X } from 'lucide-react';
import { Thread, ThreadReply } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useThreadReplies } from '../../hooks/useThreadReplies';
import { useThreads } from '../../hooks/useThreads';
import { supabase } from '../../lib/supabase';

interface ThreadDetailPageProps {
  projectId: string;
  threadId: string;
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
  general: 'General Discussion',
  bug: 'Bug Report',
  feature: 'Feature Request',
  feedback: 'Feedback & Review'
};

export const ThreadDetailPage: React.FC<ThreadDetailPageProps> = ({ projectId, threadId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { threads, toggleThread } = useThreads(projectId);
  const { replies, createReplyWithImage, refetch } = useThreadReplies(threadId);
  const [thread, setThread] = useState<Thread | null>(null);
  const [newReply, setNewReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Find the thread from the threads list
  useEffect(() => {
    const foundThread = threads.find(t => t.id === threadId);
    setThread(foundThread || null);
  }, [threads, threadId]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 3600));
    const days = Math.floor(diff / (1000 * 3600 * 24));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be smaller than 5MB');
      return;
    }

    setSelectedFile(file);
    setUploadError('');

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const uploadImage = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    setIsUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `thread-images/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      // Get public URL
      const { data } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setUploadError('');
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || isSubmitting || !user) return;

    setIsSubmitting(true);
    
    try {
      let imageUrl: string | undefined;
      
      // Upload image if selected
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      await createReplyWithImage(newReply, imageUrl);
      setNewReply('');
      removeImage();
      // Refresh replies after successful creation
      await refetch();
    } catch (error: any) {
      console.error('Error creating reply:', error);
      alert('Failed to post reply: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleBack = () => {
    // Get the return URL from location state or default to project page
    const returnUrl = location.state?.from || `/project/${projectId}`;
    navigate(returnUrl);
  };

  const handleToggleResolve = async () => {
    if (!thread) return;
    
    try {
      await toggleThread(thread.id);
      // Refresh the threads list to get the updated status
      const foundThread = threads.find(t => t.id === threadId);
      if (foundThread) {
        setThread({ ...foundThread, isResolved: !foundThread.isResolved });
      }
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

  // Cleanup preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!thread) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading thread...</p>
        </div>
      </div>
    );
  }

  const IconComponent = categoryIcons[thread.category];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start mb-6 sm:mb-8">
        <div className="flex items-center mb-4 sm:mb-0">
          <button
            onClick={handleBack}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${categoryColors[thread.category]}`}>
                <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {categoryLabels[thread.category]}
              </div>
              {thread.isResolved && (
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Resolved
                </div>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{thread.title}</h1>
            {thread.url && (
              <div className="mb-3">
                <a
                  href={thread.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 underline break-all"
                >
                  🔗 {thread.url}
                </a>
              </div>
            )}
            <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-600 gap-2">
              <span>Started by {thread.creatorName}</span>
              <span>•</span>
              <div className="flex items-center">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                {formatDate(thread.createdAt)}
              </div>
              <span>•</span>
              <span>{replies.length + 1} {replies.length === 0 ? 'message' : 'messages'}</span>
            </div>
          </div>
        </div>
        <div className="sm:ml-auto sm:pl-4 mt-2 sm:mt-0">
          {user?.role === 'freelancer' && (
            <button
              onClick={handleToggleResolve}
              className={`w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 ${
                thread.isResolved
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {thread.isResolved ? (
                <>
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Mark as Unresolved</span>
                  <span className="xs:hidden">Unresolve</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Mark as Resolved</span>
                  <span className="xs:hidden">Resolve</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Thread Content */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        {/* Original Thread */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {getInitials(thread.creatorName)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">{thread.creatorName}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    Thread Creator
                  </span>
                </div>
                <span className="text-sm text-gray-500">{formatDate(thread.createdAt)}</span>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700">
                <div className="space-y-3">
                  <p className="text-gray-800 leading-relaxed">
                    {thread.title}
                  </p>
                  {thread.url && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-1">Reference Link:</p>
                      <a
                        href={thread.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                      >
                        {thread.url}
                      </a>
                    </div>
                  )}
                </div>
                {thread.category === 'bug' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">Bug Details:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Steps to reproduce the issue</li>
                      <li>• Expected vs actual behavior</li>
                      <li>• Browser/device information</li>
                      <li>• Screenshots or error messages</li>
                    </ul>
                  </div>
                )}
              </div>
              {thread.imageUrl && (
                <div className="mt-4">
                  <img
                    src={thread.imageUrl}
                    alt="Thread attachment"
                    className="max-w-full h-64 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity duration-200"
                    onClick={() => window.open(thread.imageUrl, '_blank')}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <div className="divide-y divide-gray-100">
            {replies.map((reply, index) => (
              <div key={reply.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium text-sm">
                      {getInitials(reply.authorName)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{reply.authorName}</span>
                        {reply.isEdited && (
                          <span className="text-xs text-gray-500">(edited)</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(reply.createdAt)}</span>
                    </div>
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <p>{reply.content}</p>
                    </div>
                    {reply.imageUrl && (
                      <div className="mt-3">
                        <img
                          src={reply.imageUrl}
                          alt="Reply attachment"
                          className="max-w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity duration-200"
                          onClick={() => window.open(reply.imageUrl, '_blank')}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <form onSubmit={handleSubmitReply}>
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium text-sm">
                {user ? getInitials(user.name) : 'U'}
              </span>
            </div>
            <div className="flex-1">
              <div className="mb-3">
                <label htmlFor="reply" className="block text-sm font-medium text-gray-700 mb-2">
                  Add a reply
                </label>
                <textarea
                  id="reply"
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Share your thoughts, ask questions, or provide updates..."
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none transition-all duration-200"
                  rows={4}
                />
              </div>
              
              {/* Image Upload Section */}
              <div className="mb-3">
                {!selectedFile && (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-gray-300 transition-colors duration-200">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="reply-image-upload"
                    />
                    <label
                      htmlFor="reply-image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-600">Click to attach an image</span>
                      <span className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</span>
                    </label>
                  </div>
                )}

                {selectedFile && (
                  <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Image className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {previewUrl && (
                      <div className="mt-3">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                )}

                {uploadError && (
                  <div className="mt-2 text-xs text-red-600">{uploadError}</div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-gray-500">
                  {newReply.length}/1000 characters
                </div>
                <button
                  type="submit"
                  disabled={!newReply.trim() || isSubmitting || isUploading}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSubmitting || isUploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {isUploading ? 'Uploading...' : isSubmitting ? 'Posting...' : 'Post Reply'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};