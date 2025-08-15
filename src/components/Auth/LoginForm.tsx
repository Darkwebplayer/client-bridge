import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signUp, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      if (isSignUp) {
        const result = await signUp(email, password, name, 'freelancer');
        if (!result.success) {
          setError(result.error || 'Failed to create account');
        }
      } else {
        const result = await signIn(email, password);
        if (!result.success) {
          // Handle different types of auth errors gracefully
          const errorMessage = result.error || 'Failed to sign in';
          if (errorMessage.toLowerCase().includes('invalid') ||
              errorMessage.toLowerCase().includes('credentials') ||
              errorMessage.toLowerCase().includes('password')) {
            setError('Invalid email or password. Please check your credentials and try again.');
          } else if (errorMessage.toLowerCase().includes('network') ||
                     errorMessage.toLowerCase().includes('fetch')) {
            setError('Network error. Please check your connection and try again.');
          } else {
            setError('Sign in failed. Please try again.');
          }
        } else {
          // Successful login - redirect to dashboard
          window.location.reload();
          navigate('/');
        }
        // If successful, the auth state change will handle the redirect
      }
    } catch (err: any) {
      console.error('Unexpected error in handleSubmit:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">

            <img src="/logo.svg" alt="ClientBridge Logo" className="w-16 h-16 mx-auto my-3" />

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSignUp ? 'Join ClientBridge' : 'Welcome to ClientBridge'}
          </h1>
          <p className="text-gray-600">
            {isSignUp
              ? 'Create your freelancer account to start managing projects'
              : 'Sign in to manage your projects and collaborate seamlessly'
            }
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <UserPlus className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Freelancer Account</p>
                      <p className="text-xs text-blue-600">Create projects and invite clients to collaborate</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
                {error.includes('Email or password is incorrect') && !isSignUp && (
                  <div className="mt-2 text-xs text-gray-600">
                    <p>• Double-check your email address for typos</p>
                    <p>• Make sure your password is correct</p>
                    <p>• If you don't have an account yet, click "Sign up" below</p>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {(isLoading || isSubmitting) ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>


          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {isSignUp
                ? 'Already have a freelancer account? Sign in'
                : "Don't have a freelancer account? Sign up"
              }
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500 mb-3">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Are you a client?</p>
            <p className="text-xs text-gray-600">
              Clients receive invitation links from freelancers to join projects.
              Check your email for an invitation link to get started.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
