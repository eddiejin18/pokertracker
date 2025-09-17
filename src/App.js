import React, { useState, useEffect } from 'react';
import ApiService from './services/api';
import { ToastProvider } from './components/ToastProvider';
import { ThemeProvider } from './components/ThemeProvider';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import './App.css';
import LoadingDots from './components/LoadingDots';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const token = localStorage.getItem('pokerTracker_token');
      const userData = localStorage.getItem('pokerTracker_user');
      
      if (token && userData) {
        try {
          // Test if token is still valid by making a request
          await ApiService.getSessions();
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        } catch (error) {
          // Token is invalid, clear it
          console.log('Token expired, clearing auth data');
          localStorage.removeItem('pokerTracker_token');
          localStorage.removeItem('pokerTracker_user');
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (email, password) => {
    try {
      setIsLoading(true);
      setError('');
      
      const data = await ApiService.login(email, password);
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      // Surface server-provided messages (email not found vs incorrect password)
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (email, password, name) => {
    try {
      setIsLoading(true);
      setError('');
      
      const data = await ApiService.register(email, password, name);
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    ApiService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingDots />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <ToastProvider>
          <AuthForm 
            onLogin={handleLogin}
            onRegister={handleRegister}
            isLoading={isLoading}
            error={error}
          />
        </ToastProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Dashboard user={user} onSignOut={handleSignOut} />
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
