const PRIMARY_BASE = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000/api' : '/api');
const FALLBACKS = process.env.NODE_ENV === 'development'
  ? Array.from(new Set([PRIMARY_BASE, 'http://localhost:5001/api', 'http://127.0.0.1:5000/api']))
  : [PRIMARY_BASE];

class ApiService {
  constructor() {
    this.token = localStorage.getItem('pokerTracker_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('pokerTracker_token', token);
    } else {
      localStorage.removeItem('pokerTracker_token');
    }
  }

  async request(endpoint, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    let lastError;
    for (const base of FALLBACKS) {
      const url = `${base}${endpoint}`;
      try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
          // Only auto-logout+reload if we were authenticated and hit a protected endpoint
          if ((response.status === 401 || response.status === 403) && this.token && !endpoint.includes('/login') && !endpoint.includes('/register')) {
            this.setToken(null);
            localStorage.removeItem('pokerTracker_user');
            window.location.reload();
          }
          throw new Error(data.error || 'Request failed');
        }
        return data;
      } catch (error) {
        lastError = error;
        // try next base URL on network errors
        continue;
      }
    }
    console.error('API request failed on all base URLs:', lastError);
    throw lastError || new Error('Network error');
  }

  // Auth methods
  async register(email, password, name) {
    const data = await this.request('/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  async login(email, password) {
    const data = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  logout() {
    this.setToken(null);
  }

  // Session methods
  async getSessions() {
    return this.request('/sessions');
  }

  async createSession(sessionData) {
    return this.request('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async updateSession(id, sessionData) {
    return this.request(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sessionData),
    });
  }

  async deleteSession(id) {
    return this.request(`/sessions/${id}`, {
      method: 'DELETE',
    });
  }

  async sendSupport(subject, message) {
    return this.request('/support', {
      method: 'POST',
      body: JSON.stringify({ subject, message })
    });
  }
}

export default new ApiService();
