import React, { useState } from 'react';
import { LogIn, UserPlus, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import LoadingDots from './LoadingDots';
import { useEffect } from 'react';

const AuthForm = ({ onLogin, onRegister, isLoading, error, onBackToHome }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    rememberMe: true
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
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      {showErrorToast && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg z-50">
          {error}
        </div>
      )}
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-soft">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Back to home</span>
            </button>
          )}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-charcoal mb-2">Poker Tracker</h1>
            <p className="text-stone-600 text-sm">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              A free and intuitive UI to track your poker sessions and profit overtime.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full px-4 py-3 border border-gray-200 bg-white text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-400 transition-all"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 bg-white text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-400 transition-all"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-200 bg-white text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-400 transition-all"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
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
                  className="h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                />
                <label className="ml-3 text-sm text-gray-700">
                  Remember me for 30 days
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-6 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              {isLoading ? (
                <span className="mr-2"><LoadingDots /></span>
              ) : isLogin ? (
                <LogIn className="h-5 w-5 mr-2" />
              ) : (
                <UserPlus className="h-5 w-5 mr-2" />
              )}
              {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            Your data is stored securely in the cloud
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
