import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ClientSignupFormProps {
  projectName: string;
  freelancerName: string;
  inviteToken: string;
}

const ClientSignupForm: React.FC<ClientSignupFormProps> = ({
  projectName,
  freelancerName,
  inviteToken
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signUp, joinProject } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Create client account
      const signupResult = await signUp(email, password, name, 'client');
      if (!signupResult.success) {
        throw new Error(signupResult.error || 'Failed to create account');
      }

      // Handle email confirmation required case
      if (signupResult.message) {
        setSuccess(signupResult.message);
        setIsSubmitting(false);
        return;
      }

      // Immediately try to join the project after successful signup
      const joinResult = await joinProject(inviteToken);
      if (joinResult.success) {
        navigate(`/project/${joinResult.projectId}`);
      } else {
        // This can happen if auth state propagation is slow. Guide the user.
        throw new Error(joinResult.error || 'Account created, but failed to join project. Please sign in and use the invite link again.');
      }
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm"
            placeholder="Your full name"
          />
        </div>
      </div>

      <div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm"
            placeholder="Your email address"
          />
        </div>
      </div>

      <div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm"
            placeholder="Create a password"
          />
        </div>
      </div>

      {error && (
        <div className={`${
          error.includes('Please check your email')
            ? 'bg-blue-50 border border-blue-200'
            : 'bg-red-50 border border-red-200'
        } rounded-lg p-3`}>
          <p className={`text-sm ${
            error.includes('Please check your email')
              ? 'text-blue-600'
              : 'text-red-600'
          }`}>
            {error}
          </p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isSubmitting ? (
          <>
            <Loader className="w-4 h-4 animate-spin mr-2" />
            Creating Account...
          </>
        ) : (
          `Join ${projectName}`
        )}
      </button>
    </form>
  );
};

export const InvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, joinProject } = useAuth();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    loadProjectInfo();
  }, [token]);

  const loadProjectInfo = async () => {
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .rpc('get_project_by_invite_token', { p_invite_token: token })
        .single();

      if (fetchError) throw new Error('Invalid invitation link or an issue with the database function.');

      setProject(data);
    } catch (err: any) {
      console.error('Error loading project info:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinProject = async () => {
    if (!user || !token) return;

    setJoining(true);
    try {
      const result = await joinProject(token);
      if (result.success) {
        navigate(`/project/${result.projectId}`);
      } else {
        setError(result.error || 'Failed to join project');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <img src="/logo.svg" alt="User Icon" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">You're Invited!</h1>
          <p className="text-gray-600 mb-6">
            You've been invited to collaborate on <strong>{project?.name}</strong> by {project?.freelancer_name}.
          </p>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-800 mb-2">New to ClientBridge?</p>
              <p className="text-xs text-blue-600 mb-3">
                Create your client account to join this project and collaborate with your freelancer.
              </p>
                          <ClientSignupForm
              projectName={project?.name || ''}
              freelancerName={project?.freelancer_name || ''}
              inviteToken={token || ''}
            />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Already have an account?</p>
              <button
                onClick={() => navigate('/')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in to join this project
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Project</h1>
        <p className="text-gray-600 mb-2">
          You've been invited to collaborate on
        </p>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{project?.name}</h2>
        <p className="text-sm text-gray-500 mb-6">
          by {project?.freelancer_name}
        </p>
        <p className="text-sm text-gray-600 mb-6">
          {project?.description}
        </p>
        <button
          onClick={handleJoinProject}
          disabled={joining}
          className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {joining ? (
            <>
              <Loader className="w-4 h-4 animate-spin mr-2" />
              Joining...
            </>
          ) : (
            'Join Project'
          )}
        </button>
      </div>
    </div>
  );
};
