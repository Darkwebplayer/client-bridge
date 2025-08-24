import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, FileText, Bug, CheckSquare, Clock, CheckCircle2, User, Calendar, BarChart, UserPlus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Project } from '../../types';
import { ProjectTasks } from './ProjectTasks';
import { ThreadList } from './ThreadList';
import { DocumentList } from './DocumentList';
import { InviteClientModal } from './InviteClientModal';
import { useAuth } from '../../contexts/AuthContext';
import { useTodos } from '../../hooks/useTodos';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack }) => {
  const { user } = useAuth();
  const { todos } = useTodos(project.id);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get the active tab from URL or default to 'tasks'
  const activeTab = (searchParams.get('tab') as 'tasks' | 'threads' | 'bugs' | 'documents') || 'tasks';
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [taskProgress, setTaskProgress] = useState<number | null>(null);

  // Handle progress updates from ProjectTasks
  const handleProgressUpdate = (progress: number) => {
    setTaskProgress(progress);
  };

  // Update URL when tab changes
  const setActiveTab = (tab: 'tasks' | 'threads' | 'bugs' | 'documents') => {
    setSearchParams({ tab });
  };

  // Use real-time progress from tasks or fallback to project progress
  const displayProgress = taskProgress !== null ? taskProgress : project.progress;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'active':
        return <Clock className="w-4 h-4" />;
      case 'on-hold':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 20) return 'bg-yellow-500';
    return 'bg-gray-400';
  };


  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center mb-6 sm:mb-8">
        <div className="flex items-center mb-4 sm:mb-0">
          <button
            onClick={onBack}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{project.name}</h1>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(project.status)}`}>
                {getStatusIcon(project.status)}
                <span className="ml-1 capitalize">{project.status.replace('-', ' ')}</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm sm:text-base">{project.description}</p>
          </div>
        </div>
        <div className="sm:ml-auto sm:pl-4 mt-2 sm:mt-0">
          {user?.role === 'freelancer' && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Client
            </button>
          )}
        </div>
      </div>

      {/* Project Info Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Client</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">{project.clientName}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Timeline</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">{project.timeline}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Started</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">{formatDate(project.createdAt)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Last Activity</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">{formatDate(project.lastActivity)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
          <span className="text-2xl sm:text-3xl font-bold text-gray-900">{displayProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 mb-3">
          <div
            className={`h-3 sm:h-4 rounded-full transition-all duration-300 ${getProgressColor(displayProgress)}`}
            style={{ width: `${displayProgress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600">
          {displayProgress < 25 && 'Just getting started'}
          {displayProgress >= 25 && displayProgress < 50 && 'Making good progress'}
          {displayProgress >= 50 && displayProgress < 75 && 'More than halfway there'}
          {displayProgress >= 75 && displayProgress < 100 && 'Almost complete'}
          {displayProgress === 100 && 'Project completed!'}
        </p>
      </div>

      {/* Tabs Layout */}
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto py-2" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'tasks'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <CheckSquare className="w-4 h-4 mr-2" />
                Tasks
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('threads')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'threads'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Messages
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('bugs')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'bugs'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Bug className="w-4 h-4 mr-2" />
                Bug Reports
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'documents'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Documents
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'tasks' && <ProjectTasks projectId={project.id} onProgressUpdate={handleProgressUpdate} />}
          {activeTab === 'documents' && <DocumentList projectId={project.id} />}
          {(activeTab === 'threads' || activeTab === 'bugs') && (
            <ThreadList 
              projectId={project.id}
              selectedTab={activeTab}
            />
          )}
        </div>
      </div>

      {/* Invite Client Modal */}
      <InviteClientModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        projectName={project.name}
        inviteToken={project.inviteToken || ''}
      />
    </div>
  );
};