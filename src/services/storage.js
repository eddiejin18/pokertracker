// Local data storage service for poker sessions
class StorageService {
  constructor() {
    this.STORAGE_KEY = 'pokerTracker_sessions';
    this.STATS_KEY = 'pokerTracker_stats';
  }

  // Save poker session
  saveSession(session) {
    const sessions = this.getAllSessions();
    const newSession = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...session
    };
    
    sessions.push(newSession);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
    
    // Update stats
    this.updateStats();
    
    return newSession;
  }

  // Get all sessions
  getAllSessions() {
    const sessions = localStorage.getItem(this.STORAGE_KEY);
    return sessions ? JSON.parse(sessions) : [];
  }

  // Get sessions by date range
  getSessionsByDateRange(startDate, endDate) {
    const sessions = this.getAllSessions();
    return sessions.filter(session => {
      const sessionDate = new Date(session.timestamp);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  }

  // Update session
  updateSession(sessionId, updates) {
    const sessions = this.getAllSessions();
    const index = sessions.findIndex(session => session.id === sessionId);
    
    if (index !== -1) {
      sessions[index] = { ...sessions[index], ...updates };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
      this.updateStats();
      return sessions[index];
    }
    
    return null;
  }

  // Delete session
  deleteSession(sessionId) {
    const sessions = this.getAllSessions();
    const filteredSessions = sessions.filter(session => session.id !== sessionId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredSessions));
    this.updateStats();
  }

  // Calculate and update statistics
  updateStats() {
    const sessions = this.getAllSessions();
    
    const stats = {
      totalSessions: sessions.length,
      totalWinnings: sessions.reduce((sum, session) => sum + (session.winnings || 0), 0),
      totalBuyIns: sessions.reduce((sum, session) => sum + (session.buyIn || 0), 0),
      totalHours: sessions.reduce((sum, session) => sum + (session.duration || 0), 0),
      averageWinnings: 0,
      winRate: 0,
      roi: 0,
      bestSession: null,
      worstSession: null,
      monthlyStats: this.calculateMonthlyStats(sessions),
      weeklyStats: this.calculateWeeklyStats(sessions),
      gameTypeStats: this.calculateGameTypeStats(sessions),
      locationStats: this.calculateLocationStats(sessions)
    };

    if (sessions.length > 0) {
      stats.averageWinnings = stats.totalWinnings / sessions.length;
      stats.winRate = (sessions.filter(s => (s.winnings || 0) > 0).length / sessions.length) * 100;
      stats.roi = stats.totalBuyIns > 0 ? (stats.totalWinnings / stats.totalBuyIns) * 100 : 0;
      
      const winningSessions = sessions.filter(s => (s.winnings || 0) > 0);
      const losingSessions = sessions.filter(s => (s.winnings || 0) < 0);
      
      if (winningSessions.length > 0) {
        stats.bestSession = winningSessions.reduce((best, current) => 
          (current.winnings || 0) > (best.winnings || 0) ? current : best
        );
      }
      
      if (losingSessions.length > 0) {
        stats.worstSession = losingSessions.reduce((worst, current) => 
          (current.winnings || 0) < (worst.winnings || 0) ? current : worst
        );
      }
    }

    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
    return stats;
  }

  // Get statistics
  getStats() {
    const stats = localStorage.getItem(this.STATS_KEY);
    return stats ? JSON.parse(stats) : this.updateStats();
  }

  // Calculate monthly statistics
  calculateMonthlyStats(sessions) {
    const monthlyData = {};
    
    sessions.forEach(session => {
      const date = new Date(session.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          sessions: 0,
          winnings: 0,
          hours: 0
        };
      }
      
      monthlyData[monthKey].sessions += 1;
      monthlyData[monthKey].winnings += session.winnings || 0;
      monthlyData[monthKey].hours += session.duration || 0;
    });
    
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }

  // Calculate weekly statistics
  calculateWeeklyStats(sessions) {
    const weeklyData = {};
    
    sessions.forEach(session => {
      const date = new Date(session.timestamp);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: weekKey,
          sessions: 0,
          winnings: 0,
          hours: 0
        };
      }
      
      weeklyData[weekKey].sessions += 1;
      weeklyData[weekKey].winnings += session.winnings || 0;
      weeklyData[weekKey].hours += session.duration || 0;
    });
    
    return Object.values(weeklyData).sort((a, b) => a.week.localeCompare(b.week));
  }

  // Get chart data for winnings over time
  getWinningsChartData(period = 'monthly') {
    const stats = this.getStats();
    const data = period === 'weekly' ? stats.weeklyStats : stats.monthlyStats;
    
    return data.map(item => ({
      period: period === 'weekly' ? 
        new Date(item.week).toLocaleDateString() : 
        new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      winnings: item.winnings,
      sessions: item.sessions,
      hours: item.hours
    }));
  }

  // Calculate game type statistics
  calculateGameTypeStats(sessions) {
    const gameTypeData = {};
    
    sessions.forEach(session => {
      const gameType = session.gameType || 'Unknown';
      if (!gameTypeData[gameType]) {
        gameTypeData[gameType] = {
          gameType,
          sessions: 0,
          winnings: 0,
          hours: 0,
          buyIns: 0
        };
      }
      
      gameTypeData[gameType].sessions += 1;
      gameTypeData[gameType].winnings += session.winnings || 0;
      gameTypeData[gameType].hours += session.duration || 0;
      gameTypeData[gameType].buyIns += session.buyIn || 0;
    });
    
    return Object.values(gameTypeData).map(data => ({
      ...data,
      roi: data.buyIns > 0 ? (data.winnings / data.buyIns) * 100 : 0,
      averageWinnings: data.sessions > 0 ? data.winnings / data.sessions : 0
    }));
  }

  // Calculate location statistics
  calculateLocationStats(sessions) {
    const locationData = {};
    
    sessions.forEach(session => {
      const location = session.location || 'Unknown';
      if (!locationData[location]) {
        locationData[location] = {
          location,
          sessions: 0,
          winnings: 0,
          hours: 0,
          buyIns: 0
        };
      }
      
      locationData[location].sessions += 1;
      locationData[location].winnings += session.winnings || 0;
      locationData[location].hours += session.duration || 0;
      locationData[location].buyIns += session.buyIn || 0;
    });
    
    return Object.values(locationData).map(data => ({
      ...data,
      roi: data.buyIns > 0 ? (data.winnings / data.buyIns) * 100 : 0,
      averageWinnings: data.sessions > 0 ? data.winnings / data.sessions : 0
    }));
  }

  // Get sessions for a specific date
  getSessionsForDate(date) {
    const sessions = this.getAllSessions();
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.timestamp);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === targetDate.getTime();
    });
  }

  // Clear all data
  clearAllData() {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.STATS_KEY);
  }
}

export default new StorageService();
