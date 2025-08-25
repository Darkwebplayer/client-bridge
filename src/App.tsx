import React, { useState } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LoginForm } from './components/Auth/LoginForm';
import { InvitePage } from './components/InvitePage';
import { Header } from './components/Layout/Header';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ProjectDetail } from './components/Project/ProjectDetail';
import { ThreadDetailPage } from './components/Project/ThreadDetailPage';
import { useProjects } from './hooks/useProjects';

const ProjectDetailWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects } = useProjects();
  const navigate = useNavigate();
  const project = id ? projects.find(p => p.id === id) : null;

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
          <p className="text-gray-600">The project you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <ProjectDetail project={project} onBack={() => navigate('/')} />;
};

const ThreadDetailWrapper: React.FC = () => {
  const { projectId, threadId } = useParams<{ projectId: string; threadId: string }>();

  if (!projectId || !threadId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thread Not Found</h1>
          <p className="text-gray-600">The thread you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return <ThreadDetailPage projectId={projectId} threadId={threadId} />;
};
const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Show loading screen while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <img src="/logo.svg" alt="ClientBridge Logo" className="w-16 h-16" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading ClientBridge</h2>
          <p className="text-gray-600">Initializing your workspace...</p>
        </div>
      </div>
    );
  }

  // Show login screen if no user after loading completes
  if (!user) {
    return (
      <Routes>
        <Route path="/invite" element={<InvitePage />} />
        <Route path="/" element={<LoginForm />} />
        <Route path="*" element={<LoginForm />} />
      </Routes>
    );
  }

  // Show main app if user is authenticated
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard onProjectSelect={(id) => navigate(`/project/${id}`)} />} />
        <Route path="/project/:id" element={<ProjectDetailWrapper />} />
        <Route path="/project/:projectId/thread/:threadId" element={<ThreadDetailWrapper />} />
        <Route path="/invite" element={<InvitePage />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
