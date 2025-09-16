import React from 'react';
import { LogIn } from 'lucide-react';

const LoginPage = ({ onSignIn, isLoading }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Poker Tracker</h1>
            <p className="text-gray-600 text-sm">Sign in to continue</p>
          </div>

          <button
            onClick={onSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="loading-spinner mr-2"></div>
            ) : (
              <LogIn className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Your data is stored locally on your device
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
