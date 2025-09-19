import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import ApiService from './services/api';
import { ToastProvider } from './components/ToastProvider';
import { ThemeProvider } from './components/ThemeProvider';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import './App.css';
import LoadingDots from './components/LoadingDots';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [showLandingPage, setShowLandingPage] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const userData = localStorage.getItem('pokerTracker_user') || sessionStorage.getItem('pokerTracker_user');
      if (userData) {
        try {
          // Test if token is still valid by making a request
          await ApiService.getSessions();
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
          setShowLandingPage(false); // Skip landing page if already authenticated
        } catch (error) {
          // Token is invalid, clear it
          console.log('Token expired, clearing auth data');
          localStorage.removeItem('pokerTracker_token');
          localStorage.removeItem('pokerTracker_user');
          sessionStorage.removeItem('pokerTracker_token');
          sessionStorage.removeItem('pokerTracker_user');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (email, password, rememberMe) => {
    try {
      setIsLoading(true);
      setError('');
      
      const data = await ApiService.login(email, password, rememberMe);
      setUser(data.user);
      setIsAuthenticated(true);
      // Persist user alongside token based on rememberMe
      const userJson = JSON.stringify(data.user);
      if (rememberMe) {
        localStorage.setItem('pokerTracker_user', userJson);
        sessionStorage.removeItem('pokerTracker_user');
      } else {
        sessionStorage.setItem('pokerTracker_user', userJson);
        localStorage.removeItem('pokerTracker_user');
      }
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
      // Default to persistent on register
      localStorage.setItem('pokerTracker_user', JSON.stringify(data.user));
      sessionStorage.removeItem('pokerTracker_user');
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
    setShowLandingPage(true); // Show landing page after sign out
    localStorage.removeItem('pokerTracker_user');
    sessionStorage.removeItem('pokerTracker_user');
  };

  const handleGetStarted = () => {
    setShowLandingPage(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <LoadingDots />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showLandingPage) {
      return (
        <ThemeProvider>
          <LandingPage onGetStarted={handleGetStarted} />
        </ThemeProvider>
      );
    }
    
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
        <div className="min-h-screen bg-white dark:bg-black">
          <Dashboard user={user} onSignOut={handleSignOut} />
        </div>
        <Analytics />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
