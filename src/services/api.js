const PRIMARY_BASE = resolveApiBase();

function resolveApiBase() {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.protocol === 'file:') {
    return 'http://127.0.0.1:5001/api';
  }
  // Local development: your React app is on :3000 and the API is on :5001.
  // If we ever return `/api` here, requests can accidentally hit the frontend dev server.
  if (typeof window !== 'undefined') {
    const host = window.location?.hostname;
    const port = window.location?.port;
    if (
      (host === 'localhost' || host === '127.0.0.1') &&
      (port === '3000' || port === '80' || port === '' || port == null)
    ) {
      return 'http://127.0.0.1:5001/api';
    }
  }
  return '/api';
}

const DEV_FALLBACKS =
  process.env.NODE_ENV === 'development'
    ? Array.from(
        new Set([
          PRIMARY_BASE,
          'http://127.0.0.1:5001/api',
          'http://localhost:5001/api',
          'http://127.0.0.1:5000/api',
          'http://localhost:5000/api',
        ])
      )
    : [PRIMARY_BASE];

function buildFallbackList() {
  return process.env.NODE_ENV === 'development' ? DEV_FALLBACKS : [PRIMARY_BASE];
}

function isNetworkFailure(err) {
  if (!err) return false;
  if (err instanceof TypeError) return true;
  if (err.name === 'TypeError') return true;
  const m = String(err.message || err).toLowerCase();
  return m.includes('failed to fetch') || m.includes('networkerror') || m.includes('load failed');
}

class ApiService {
  constructor() {
    this.token = localStorage.getItem('pokerTracker_token') || sessionStorage.getItem('pokerTracker_token');
  }

  setToken(token, persist = 'local') {
    this.token = token;
    if (token) {
      if (persist === 'session') {
        sessionStorage.setItem('pokerTracker_token', token);
        localStorage.removeItem('pokerTracker_token');
      } else {
        localStorage.setItem('pokerTracker_token', token);
        sessionStorage.removeItem('pokerTracker_token');
      }
    } else {
      localStorage.removeItem('pokerTracker_token');
      sessionStorage.removeItem('pokerTracker_token');
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

    const bases = buildFallbackList();
    let lastNetworkError = null;

    for (let i = 0; i < bases.length; i++) {
      const base = bases[i];
      const url = `${base}${endpoint}`;
      try {
        const response = await fetch(url, config);
        const text = await response.text();
        let data = {};
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            data = { error: text.slice(0, 200) || response.statusText || 'Invalid response' };
          }
        }

        if (!response.ok) {
          if ((response.status === 401 || response.status === 403) && this.token && !endpoint.includes('/login') && !endpoint.includes('/register')) {
            this.setToken(null);
            localStorage.removeItem('pokerTracker_user');
            window.location.reload();
          }
          throw new Error(data.error || `Request failed (${response.status})`);
        }
        return data;
      } catch (error) {
        if (!isNetworkFailure(error)) {
          throw error;
        }
        lastNetworkError = error;
        continue;
      }
    }

    console.error('API request failed on all base URLs:', lastNetworkError);
    throw new Error(
      'Cannot reach the server. Run `npm run server` (API on port 5001) or `npm run dev` to start the app and API together.'
    );
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

  async login(email, password, rememberMe = true) {
    const data = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      this.setToken(data.token, rememberMe ? 'local' : 'session');
    }

    return data;
  }

  logout() {
    this.setToken(null);
  }

  // Session methods
  async getSessions() {
    const sessions = await this.request('/sessions');
    if (!Array.isArray(sessions)) {
      throw new Error(`Expected sessions array but got ${typeof sessions}`);
    }
    return sessions;
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

  async deleteSessionsBulk(ids) {
    return this.request('/sessions/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  async sendSupport(subject, message) {
    return this.request('/support', {
      method: 'POST',
      body: JSON.stringify({ subject, message }),
    });
  }

  async getGroups() {
    const groups = await this.request('/groups');
    if (!Array.isArray(groups)) {
      throw new Error(`Expected groups array but got ${typeof groups}`);
    }
    return groups;
  }

  async createGroup(name) {
    return this.request('/groups', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async joinGroup(inviteCode) {
    return this.request('/groups/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    });
  }

  async getGroup(id) {
    return this.request(`/groups/${id}`);
  }

  async leaveGroup(id) {
    return this.request(`/groups/${id}/leave`, { method: 'DELETE' });
  }

  async deleteGroup(id) {
    return this.request(`/groups/${id}`, { method: 'DELETE' });
  }

  // Group member management
  async getGroupMembers(id) {
    return this.request(`/groups/${id}/members`);
  }

  async addModerator(id, userId) {
    return this.request(`/groups/${id}/moderators`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async removeGroupMember(id, userId) {
    return this.request(`/groups/${id}/members/${userId}`, { method: 'DELETE' });
  }

  // Group settings (leaderboard filters)
  async getGroupSettings(id) {
    return this.request(`/groups/${id}/settings`);
  }

  async updateGroupSettings(id, filters) {
    return this.request(`/groups/${id}/settings`, {
      method: 'PUT',
      body: JSON.stringify({ filters }),
    });
  }
}

export default new ApiService();
