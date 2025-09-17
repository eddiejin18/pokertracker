import React, { useState } from 'react';
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import LoadingDots from './LoadingDots';
import { useEffect } from 'react';

const AuthForm = ({ onLogin, onRegister, isLoading, error }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    rememberMe: false
  });
  const [showErrorToast, setShowErrorToast] = useState(false);

  useEffect(() => {
    if (error) {
      setShowErrorToast(true);
      const t = setTimeout(() => setShowErrorToast(false), 4000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLogin) {
      onLogin(formData.email, formData.password, formData.rememberMe);
    } else {
      onRegister(formData.email, formData.password, formData.name);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: '', password: '', name: '' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      {showErrorToast && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg z-50">
          {error}
        </div>
      )}
      <div className="max-w-sm w-full">
        <div className="bg-white dark:bg-black rounded-lg border border-black/10 dark:border-white/30 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Poker Tracker</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-600 dark:border-red-700 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full px-3 py-2 border border-black/10 dark:border-white/30 bg-white dark:bg-black text-black dark:text-white rounded-lg focus:outline-none"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-black/10 dark:border-white/30 bg-white dark:bg-black text-black dark:text-white rounded-lg focus:outline-none"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 pr-10 border border-black/10 dark:border-white/30 bg-white dark:bg-black text-black dark:text-white rounded-lg focus:outline-none"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-black dark:text-white" />
                  ) : (
                    <Eye className="h-4 w-4 text-black dark:text-white" />
                  )}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-black dark:text-white border-black/10 dark:border-white/30 rounded"
                />
                <label className="ml-2 text-sm text-black dark:text-white">
                  Remember me for 30 days
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-black/10 dark:border-white/30 text-sm font-medium rounded-lg text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="mr-2"><LoadingDots /></span>
              ) : isLogin ? (
                <LogIn className="h-4 w-4 mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-300 text-center mt-4">
            Your data is stored securely in the cloud
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
