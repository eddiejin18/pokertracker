// Google OAuth configuration
const GOOGLE_CLIENT_ID = 'your-google-client-id.apps.googleusercontent.com';
const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

// Development mode - set to true to bypass OAuth for testing
const DEV_MODE = true;

class AuthService {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
  }

  // Initialize Google OAuth
  async initializeGoogleAuth() {
    return new Promise((resolve, reject) => {
      // Check if Google API is already loaded
      if (window.gapi && window.gapi.auth2) {
        resolve();
        return;
      }

      // Load Google API script if not already loaded
      if (!window.gapi) {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          this.initializeGapi(resolve, reject);
        };
        script.onerror = () => {
          console.warn('Google API failed to load. Authentication will not work.');
          resolve(); // Resolve anyway to prevent blocking the app
        };
        document.head.appendChild(script);
      } else {
        this.initializeGapi(resolve, reject);
      }
    });
  }

  initializeGapi(resolve, reject) {
    try {
      window.gapi.load('auth2', () => {
        window.gapi.auth2.init({
          client_id: GOOGLE_CLIENT_ID,
          scope: GOOGLE_SCOPE
        }).then(() => {
          resolve();
        }).catch((error) => {
          console.warn('Google Auth2 initialization failed:', error);
          resolve(); // Resolve anyway to prevent blocking the app
        });
      });
    } catch (error) {
      console.warn('Google API initialization failed:', error);
      resolve(); // Resolve anyway to prevent blocking the app
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      // Development mode bypass
      if (DEV_MODE) {
        this.user = {
          id: 'dev-user-123',
          name: 'Dev User',
          email: 'dev@pokertracker.com',
          imageUrl: ''
        };
        this.isAuthenticated = true;
        localStorage.setItem('pokerTracker_user', JSON.stringify(this.user));
        localStorage.setItem('pokerTracker_authenticated', 'true');
        return this.user;
      }

      // Check if Google API is available
      if (!window.gapi || !window.gapi.auth2) {
        throw new Error('Google API not available. Please check your internet connection and try again.');
      }

      const authInstance = window.gapi.auth2.getAuthInstance();
      const googleUser = await authInstance.signIn();
      
      const profile = googleUser.getBasicProfile();
      this.user = {
        id: profile.getId(),
        name: profile.getName(),
        email: profile.getEmail(),
        imageUrl: profile.getImageUrl()
      };
      
      this.isAuthenticated = true;
      
      // Store user data in localStorage
      localStorage.setItem('pokerTracker_user', JSON.stringify(this.user));
      localStorage.setItem('pokerTracker_authenticated', 'true');
      
      return this.user;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  // Sign out
  async signOut() {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      
      this.user = null;
      this.isAuthenticated = false;
      
      // Clear stored data
      localStorage.removeItem('pokerTracker_user');
      localStorage.removeItem('pokerTracker_authenticated');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Check if user is already authenticated
  checkAuthStatus() {
    const storedUser = localStorage.getItem('pokerTracker_user');
    const isAuthenticated = localStorage.getItem('pokerTracker_authenticated') === 'true';
    
    if (storedUser && isAuthenticated) {
      this.user = JSON.parse(storedUser);
      this.isAuthenticated = true;
      return true;
    }
    
    return false;
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Check authentication status
  isUserAuthenticated() {
    return this.isAuthenticated;
  }
}

export default new AuthService();
