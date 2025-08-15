import React from 'react';
import { Calendar, User, BarChart, Clock, CheckCircle2 } from 'lucide-react';
import { Project } from '../../types';

interface ProjectInfoProps {
  project: Project;
}

export const ProjectInfo: React.FC<ProjectInfoProps> = ({ project }) => {
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
    <div className="space-y-6">
      {/* Project Details Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center text-sm">
              <User className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <span className="text-gray-600">Client</span>
                <p className="font-medium text-gray-900">{project.clientName}</p>
              </div>
            </div>
            
            <div className="flex items-center text-sm">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <span className="text-gray-600">Timeline</span>
                <p className="font-medium text-gray-900">{project.timeline}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center text-sm">
              <BarChart className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <span className="text-gray-600">Started</span>
                <p className="font-medium text-gray-900">{formatDate(project.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center text-sm">
              <Clock className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <span className="text-gray-600">Last Activity</span>
                <p className="font-medium text-gray-900">{formatDate(project.lastActivity)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-2xl font-bold text-gray-900">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <div className="mt-3 text-sm text-gray-600">
            {project.progress < 25 && 'Just getting started'}
            {project.progress >= 25 && project.progress < 50 && 'Making good progress'}
            {project.progress >= 50 && project.progress < 75 && 'More than halfway there'}
            {project.progress >= 75 && project.progress < 100 && 'Almost complete'}
            {project.progress === 100 && 'Project completed!'}
          </div>
        </div>
      </div>

      {/* Description Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Description</h3>
        <p className="text-gray-700 leading-relaxed">{project.description}</p>
      </div>
    </div>
  );
};