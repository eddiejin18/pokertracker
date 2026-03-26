import React, { useState, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import ApiService from './services/api';
import { ToastProvider } from './components/ToastProvider';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import SEOContent from './components/SEOContent';
import './App.css';
import LoadingPercentScreen from './components/LoadingPercentScreen';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadPercent, setLoadPercent] = useState(0);
  const loadProgressTimerRef = useRef(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [initialGroupId, setInitialGroupId] = useState(null);
  const pendingInviteCodeRef = useRef(null);
  const [hasPendingInvite, setHasPendingInvite] = useState(false);

  useEffect(() => {
    // Invite deep-link: ?invite=CODE
    const params = new URLSearchParams(window.location.search || '');
    const invite = (params.get('invite') || '').trim().toUpperCase();
    if (invite) {
      pendingInviteCodeRef.current = invite;
      setHasPendingInvite(true);
      setShowLandingPage(false); // Send invited users straight to auth
    }

    setLoadPercent(0);
    const started = performance.now();
    const rampMs = 720;
    const capBeforeDone = 88;

    loadProgressTimerRef.current = setInterval(() => {
      const elapsed = performance.now() - started;
      const t = Math.min(1, elapsed / rampMs);
      const eased = 1 - (1 - t) * (1 - t);
      setLoadPercent(Math.min(capBeforeDone, Math.round(eased * capBeforeDone)));
    }, 24);

    const finishLoad = () => {
      if (loadProgressTimerRef.current) {
        clearInterval(loadProgressTimerRef.current);
        loadProgressTimerRef.current = null;
      }
      setLoadPercent(100);
      setTimeout(() => setIsLoading(false), 220);
    };

    const checkAuth = async () => {
      const userData = localStorage.getItem('pokerTracker_user') || sessionStorage.getItem('pokerTracker_user');
      if (userData) {
        try {
          await ApiService.getSessions();
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
          setShowLandingPage(false);

          // If someone opened an invite link while already logged in, join immediately.
          const inviteCode = pendingInviteCodeRef.current;
          if (inviteCode) {
            try {
              const joined = await ApiService.joinGroup(inviteCode);
              setInitialGroupId(joined.id);
            } catch (e) {
              // Don't break login/session if invite join fails (already joined, bad code, etc.)
              console.log('Invite join failed:', e?.message || e);
            } finally {
              pendingInviteCodeRef.current = null;
              setHasPendingInvite(false);
              // Remove invite from URL to avoid re-joining on refresh
              const url = new URL(window.location.href);
              url.searchParams.delete('invite');
              window.history.replaceState({}, '', url.toString());
            }
          }
        } catch (error) {
          console.log('Token expired, clearing auth data');
          localStorage.removeItem('pokerTracker_token');
          localStorage.removeItem('pokerTracker_user');
          sessionStorage.removeItem('pokerTracker_token');
          sessionStorage.removeItem('pokerTracker_user');
        }
      }
      finishLoad();
    };

    checkAuth();

    return () => {
      if (loadProgressTimerRef.current) {
        clearInterval(loadProgressTimerRef.current);
      }
    };
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

      // If user came from an invite link, join automatically after auth.
      const inviteCode = pendingInviteCodeRef.current;
      if (inviteCode) {
        try {
          const joined = await ApiService.joinGroup(inviteCode);
          setInitialGroupId(joined.id);
        } catch (e) {
          console.log('Invite join failed:', e?.message || e);
        } finally {
          pendingInviteCodeRef.current = null;
          setHasPendingInvite(false);
          const url = new URL(window.location.href);
          url.searchParams.delete('invite');
          window.history.replaceState({}, '', url.toString());
        }
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

      // If user came from an invite link, join automatically after auth.
      const inviteCode = pendingInviteCodeRef.current;
      if (inviteCode) {
        try {
          const joined = await ApiService.joinGroup(inviteCode);
          setInitialGroupId(joined.id);
        } catch (e) {
          console.log('Invite join failed:', e?.message || e);
        } finally {
          pendingInviteCodeRef.current = null;
          setHasPendingInvite(false);
          const url = new URL(window.location.href);
          url.searchParams.delete('invite');
          window.history.replaceState({}, '', url.toString());
        }
      }
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

  const handleBackToHome = () => {
    setShowLandingPage(true);
  };

  if (isLoading) {
    return <LoadingPercentScreen percent={loadPercent} />;
  }

  if (!isAuthenticated) {
    if (showLandingPage) {
      return (
        <ToastProvider>
          <SEOContent />
          <LandingPage onGetStarted={handleGetStarted} />
        </ToastProvider>
      );
    }
    
    return (
      <ToastProvider>
        <SEOContent />
        <AuthForm
          onLogin={handleLogin}
          onRegister={handleRegister}
          isLoading={isLoading}
          error={error}
          onBackToHome={handleBackToHome}
        />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <SEOContent />
      <div className="min-h-screen bg-canvas">
        <Dashboard user={user} onSignOut={handleSignOut} initialGroupId={initialGroupId} />
      </div>
      <Analytics />
    </ToastProvider>
  );
}

export default App;
