import React from 'react';
import { Calendar, User, Activity, Clock, CheckCircle2 } from 'lucide-react';
import { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 3600 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 20) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

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
        return <CheckCircle2 className="w-3 h-3" />;
      case 'active':
        return <Activity className="w-3 h-3" />;
      case 'on-hold':
        return <Clock className="w-3 h-3" />;
      default:
        return <Activity className="w-3 h-3" />;
    }
  };

  return (
    <div 
      onClick={() => onClick(project)}
      className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
            {project.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {project.description}
          </p>
        </div>
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-4 ${getStatusColor(project.status)}`}>
          {getStatusIcon(project.status)}
          <span className="ml-1 capitalize">{project.status.replace('-', ' ')}</span>
        </div>
      </div>

      {/* Project Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <User className="w-4 h-4 mr-2 text-gray-400" />
          <span>
            {project.clients && project.clients.length > 0 
              ? `${project.clients.length} client${project.clients.length > 1 ? 's' : ''}`
              : 'No clients yet'
            }
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>{project.timeline}</span>
          </div>
          <div className="flex items-center">
            <Activity className="w-4 h-4 mr-1 text-gray-400" />
            <span>{formatDate(project.lastActivity)}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-semibold text-gray-900">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Hover Effect */}
      <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="text-xs text-blue-600 font-medium">
          Click to view details →
        </div>
      </div>
    </div>
  );
};