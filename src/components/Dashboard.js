import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from './ThemeProvider';
import { 
  LogOut, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  Target,
  Calendar as CalendarIcon,
  Home,
  BarChart3
} from 'lucide-react';
import ApiService from '../services/api';
import Calendar from './Calendar';
import SessionList from './SessionList';
import SessionPanel from './SessionPanel';
import LoadingDots from './LoadingDots';
import ThemeToggle from './ThemeToggle';
import SupportModal from './SupportModal';

const Dashboard = ({ user, onSignOut }) => {
  const [stats, setStats] = useState(null);
  const { theme } = useTheme();
  const [chartData, setChartData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [recentSessions, setRecentSessions] = useState([]);
  const [activeView, setActiveView] = useState('dashboard');
  const [gameTypeData, setGameTypeData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [blindsOptions, setBlindsOptions] = useState([]);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const defaultFilters = {
    location: 'ALL',
    gameType: 'ALL',
    blinds: 'ALL',
    locationType: 'ALL',
    startDate: '',
    endDate: ''
  };
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    loadData();
  }, [selectedPeriod, filters]);

  const loadData = async () => {
    try {
      if (isInitialLoading) {
        setIsInitialLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);
      
      let sessions = await ApiService.getSessions();

      // Populate blinds options from all sessions
      const uniqueBlinds = Array.from(new Set(sessions.map(s => s.blinds).filter(Boolean)));
      setBlindsOptions(uniqueBlinds);

      // Apply filters
      sessions = sessions.filter(s => {
        const matchesLocation = filters.location === 'ALL' || s.location === filters.location;
        const matchesGame = filters.gameType === 'ALL' || (s.game_type || s.gameType) === filters.gameType;
        const matchesBlinds = filters.blinds === 'ALL' || (s.blinds || '') === filters.blinds;
        const matchesLocType = filters.locationType === 'ALL' || (s.location_type || s.locationType) === filters.locationType;
        const ts = s.timestamp.includes('T') ? s.timestamp : s.timestamp + 'T12:00:00';
        const d = new Date(ts);
        const afterStart = !filters.startDate || d >= new Date(filters.startDate + 'T00:00:00');
        const beforeEnd = !filters.endDate || d <= new Date(filters.endDate + 'T23:59:59');
        return matchesLocation && matchesGame && matchesBlinds && matchesLocType && afterStart && beforeEnd;
      });
      // Get all recent sessions (not limited to 5) and sort by most recent first
      const recentSessions = sessions
        .sort((a, b) => {
          const dateA = new Date(a.timestamp.includes('T') ? a.timestamp : a.timestamp + 'T12:00:00');
          const dateB = new Date(b.timestamp.includes('T') ? b.timestamp : b.timestamp + 'T12:00:00');
          return dateB - dateA;
        });
      
      // Calculate stats from sessions
      const statsData = calculateStats(sessions);
      const chartData = calculateChartData(sessions, selectedPeriod);
      const gameTypeStats = calculateGameTypeStats(sessions);
      const locationStats = calculateLocationStats(sessions);
      
      setStats(statsData);
      setChartData(chartData);
      setRecentSessions(recentSessions);
      setGameTypeData(gameTypeStats);
      setLocationData(locationStats);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      if (isInitialLoading) {
        setIsInitialLoading(false);
      }
      setIsRefreshing(false);
    }
  };

  const calculateStats = (sessions) => {
    const toNumber = (value) => (typeof value === 'number' ? value : parseFloat(value)) || 0;
    const totalSessions = sessions.length;
    const totalWinnings = sessions.reduce((sum, session) => sum + toNumber(session.winnings), 0);
    const totalBuyIns = sessions.reduce((sum, session) => sum + toNumber(session.buy_in), 0);
    const totalHours = sessions.reduce((sum, session) => sum + toNumber(session.duration), 0);
    const hourlyProfit = totalHours > 0 ? totalWinnings / totalHours : 0;

    return {
      totalSessions,
      totalWinnings,
      totalBuyIns,
      totalHours,
      hourlyProfit,
      averageWinnings: totalSessions > 0 ? totalWinnings / totalSessions : 0
    };
  };

  const calculateChartData = (sessions, period) => {
    const now = new Date();
    let startDate, endDate;
    
    // Calculate date range based on period
    switch (period) {
      case '1W':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case '1M':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        endDate = now;
        break;
      case '3M':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        endDate = now;
        break;
      case '1Y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        endDate = now;
        break;
      case 'ALL':
      default:
        startDate = new Date(0);
        endDate = now;
        break;
    }
    
    // Filter sessions by date range (normalize to date-only)
    const filteredSessions = sessions.filter(session => {
      const timestamp = session.timestamp.includes('T') ? session.timestamp : session.timestamp + 'T12:00:00';
      const sessionDate = new Date(timestamp);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
    
    // Group sessions by appropriate time period
    const grouped = {};
    
    const toNumber = (value) => (typeof value === 'number' ? value : parseFloat(value)) || 0;
    filteredSessions.forEach(session => {
      // Handle date-only strings by adding time component to avoid timezone issues
      const timestamp = session.timestamp.includes('T') ? session.timestamp : session.timestamp + 'T12:00:00';
      const date = new Date(timestamp);
      // Use a stable ISO date key for grouping
      let key;
      
      if (period === '1W') {
        // Group by day for 1 week
        key = date.toISOString().split('T')[0];
      } else if (period === '1M') {
        // Group by day for 1 month
        key = date.toISOString().split('T')[0];
      } else if (period === '3M') {
        // Group by week for 3 months
        const weekStart = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());
        key = weekStart.toISOString().split('T')[0];
      } else if (period === '1Y') {
        // Group by month for 1 year
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        // Group by month for all time
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!grouped[key]) {
        grouped[key] = { winnings: 0, sessions: 0, hours: 0 };
      }
      
      grouped[key].winnings += toNumber(session.winnings);
      grouped[key].sessions += 1;
      grouped[key].hours += toNumber(session.duration);
    });
    
    // Sort by actual chronological key, then format label for display
    const entries = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
    
    // Calculate cumulative profit over time
    let cumulativeProfit = 0;
    return entries.map(([periodKey, data]) => {
      cumulativeProfit += data.winnings;
      
      let label;
      if (period === '1W' || period === '1M') {
        label = new Date(periodKey + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (period === '3M') {
        label = new Date(periodKey + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        label = new Date(periodKey + '-01T12:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }

      return {
        period: label,
        winnings: cumulativeProfit, // Show cumulative profit instead of daily winnings
        sessions: data.sessions,
        hours: data.hours
      };
    });
  };

  const calculateGameTypeStats = (sessions) => {
    const gameTypeData = {};
    const toNumber = (value) => (typeof value === 'number' ? value : parseFloat(value)) || 0;
    
    sessions.forEach(session => {
      const gameType = session.game_type || 'Unknown';
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
      gameTypeData[gameType].winnings += toNumber(session.winnings);
      gameTypeData[gameType].hours += toNumber(session.duration);
      gameTypeData[gameType].buyIns += toNumber(session.buy_in);
    });
    
    return Object.values(gameTypeData).map(data => ({
      ...data,
      roi: data.buyIns > 0 ? (data.winnings / data.buyIns) * 100 : 0,
      averageWinnings: data.sessions > 0 ? data.winnings / data.sessions : 0
    }));
  };

  const calculateLocationStats = (sessions) => {
    const locationData = {};
    const toNumber = (value) => (typeof value === 'number' ? value : parseFloat(value)) || 0;
    
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
      locationData[location].winnings += toNumber(session.winnings);
      locationData[location].hours += toNumber(session.duration);
      locationData[location].buyIns += toNumber(session.buy_in);
    });
    
    return Object.values(locationData).map(data => ({
      ...data,
      roi: data.buyIns > 0 ? (data.winnings / data.buyIns) * 100 : 0,
      averageWinnings: data.sessions > 0 ? data.winnings / data.sessions : 0
    }));
  };

  const handleSessionAdded = () => {
    loadData();
    setIsEditPanelOpen(false);
    setEditingSession(null);
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
    setIsEditPanelOpen(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <LoadingDots />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadData}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Ensure stats has default values
  const safeStats = stats || {
    totalSessions: 0,
    totalWinnings: 0,
    totalBuyIns: 0,
    totalHours: 0,
    hourlyProfit: 0,
    averageWinnings: 0
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-black/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-xl overflow-hidden flex items-center justify-center shadow-sm border border-black/10 dark:border-white/10 bg-white dark:bg-white">
                <img src="/favicon.png" alt="Poker Tracker" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black dark:text-white">Poker Tracker</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* New Tab Slider */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    activeView === 'dashboard'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => setActiveView('calendar')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    activeView === 'calendar'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <CalendarIcon className="h-4 w-4" />
                  <span>Sessions</span>
                </button>
              </div>
              <ThemeToggle />
              <button
                onClick={() => setIsSupportOpen(true)}
                className="btn"
              >
                Contact Support
              </button>
              <button
                onClick={onSignOut}
                className="btn"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-black dark:text-white">
        {activeView === 'dashboard' && (
          <>
            {/* Filters */}
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-black dark:text-white">Filters</h3>
              <button
                onClick={() => setFilters(defaultFilters)}
                className="text-xs px-3 py-1 border border-black/10 dark:border-white/10 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Clear all
              </button>
            </div>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Location</div>
                <div className="relative">
                  <select className="appearance-none border border-black/10 dark:border-white/20 rounded-md px-2 pr-9 py-1.5 text-sm w-full bg-white dark:bg-black text-black dark:text-white" value={filters.location} onChange={e=>setFilters(prev=>({...prev, location:e.target.value}))}>
                    <option value="ALL">All</option>
                    {[...new Set((locationData||[]).map(l=>l.location))].map(loc=>(<option key={loc} value={loc}>{loc}</option>))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Variation</div>
                <div className="relative">
                  <select className="appearance-none border border-black/10 dark:border-white/20 rounded-md px-2 pr-9 py-1.5 text-sm w-full bg-white dark:bg-black text-black dark:text-white" value={filters.gameType} onChange={e=>setFilters(prev=>({...prev, gameType:e.target.value}))}>
                    <option value="ALL">All</option>
                    {[...new Set((gameTypeData||[]).map(g=>g.gameType))].map(gt=>(<option key={gt} value={gt}>{gt}</option>))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Blinds/Stakes</div>
                <div className="relative">
                  <select className="appearance-none border border-black/10 dark:border-white/20 rounded-md px-2 pr-9 py-1.5 text-sm w-full bg-white dark:bg-black text-black dark:text-white" value={filters.blinds} onChange={e=>setFilters(prev=>({...prev, blinds:e.target.value}))}>
                    <option value="ALL">All</option>
                    {blindsOptions.map(b => (<option key={b} value={b}>{b}</option>))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Location Type</div>
                <div className="relative">
                  <select className="appearance-none border border-black/10 dark:border-white/20 rounded-md px-2 pr-9 py-1.5 text-sm w-full bg-white dark:bg-black text-black dark:text-white" value={filters.locationType} onChange={e=>setFilters(prev=>({...prev, locationType:e.target.value}))}>
                    <option value="ALL">All</option>
                    <option value="home">Home</option>
                    <option value="casino">Casino</option>
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Start Date</div>
                <input type="date" className="border border-black/10 dark:border-white/20 rounded-md px-2 py-1.5 text-sm w-full bg-white dark:bg-black text-black dark:text-white" value={filters.startDate} onChange={e=>setFilters(prev=>({...prev, startDate:e.target.value}))} />
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">End Date</div>
                <input type="date" className="border border-black/10 dark:border-white/20 rounded-md px-2 py-1.5 text-sm w-full bg-white dark:bg-black text-black dark:text-white" value={filters.endDate} onChange={e=>setFilters(prev=>({...prev, endDate:e.target.value}))} />
              </div>
            </div>
          </>
        )}
        {activeView === 'calendar' ? (
          <Calendar onSessionAdded={handleSessionAdded} />
        ) : (
          <>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`card p-6 ${isRefreshing ? 'opacity-70' : ''}`}>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Winnings</p>
              <p className={`text-2xl font-bold ${safeStats.totalWinnings >= 0 ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                {formatCurrency(safeStats.totalWinnings)}
              </p>
            </div>
          </div>

          <div className={`card p-6 ${isRefreshing ? 'opacity-70' : ''}`}>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Sessions Played</p>
              <p className="text-2xl font-bold text-black dark:text-white">{safeStats.totalSessions}</p>
            </div>
          </div>

          <div className={`card p-6 ${isRefreshing ? 'opacity-70' : ''}`}>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Hours</p>
              <p className="text-2xl font-bold text-black dark:text-white">{formatDuration(safeStats.totalHours)}</p>
            </div>
          </div>

          <div className={`card p-6 ${isRefreshing ? 'opacity-70' : ''}`}>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Hourly Profit</p>
              <p className={`text-2xl font-bold ${safeStats.hourlyProfit >= 0 ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                {formatCurrency(safeStats.hourlyProfit)}/hr
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Winnings Chart */}
          <div className="lg:col-span-2">
            <div className="card p-6 h-96">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-black dark:text-white">Profit Over Time</h3>
                <div className="flex items-center space-x-2">
                  {isRefreshing && (
                    <span className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin text-black dark:text-white" />
                  )}
                  <button
                    onClick={() => setSelectedPeriod('1W')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedPeriod === '1W'
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-white text-black border border-black/10 hover:bg-gray-100 dark:bg-black dark:text-white dark:border-white/20 dark:hover:bg-neutral-900'
                    }`}
                  >
                    1W
                  </button>
                  <button
                    onClick={() => setSelectedPeriod('1M')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedPeriod === '1M'
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-white text-black border border-black/10 hover:bg-gray-100 dark:bg-black dark:text-white dark:border-white/20 dark:hover:bg-neutral-900'
                    }`}
                  >
                    1M
                  </button>
                  <button
                    onClick={() => setSelectedPeriod('3M')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedPeriod === '3M'
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-white text-black border border-black/10 hover:bg-gray-100 dark:bg-black dark:text-white dark:border-white/20 dark:hover:bg-neutral-900'
                    }`}
                  >
                    3M
                  </button>
                  <button
                    onClick={() => setSelectedPeriod('1Y')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedPeriod === '1Y'
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-white text-black border border-black/10 hover:bg-gray-100 dark:bg-black dark:text-white dark:border-white/20 dark:hover:bg-neutral-900'
                    }`}
                  >
                    1Y
                  </button>
                  <button
                    onClick={() => setSelectedPeriod('ALL')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedPeriod === 'ALL'
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-white text-black border border-black/10 hover:bg-gray-100 dark:bg-black dark:text-white dark:border-white/20 dark:hover:bg-neutral-900'
                    }`}
                  >
                    ALL
                  </button>
                </div>
              </div>
              
              <div className={`h-80 ${isRefreshing ? 'opacity-60 transition-opacity' : ''}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1f2937' : '#f0f0f0'} />
                    <XAxis 
                      dataKey="period" 
                      stroke={theme === 'dark' ? '#9ca3af' : '#666'}
                      fontSize={12}
                    />
                    <YAxis 
                      stroke={theme === 'dark' ? '#9ca3af' : '#666'}
                      fontSize={12}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), 'Cumulative Profit']}
                      labelStyle={{ color: theme === 'dark' ? '#e5e7eb' : '#374151' }}
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#000000' : 'white',
                        border: theme === 'dark' ? '1px solid #1f2937' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="winnings" 
                      stroke={theme === 'dark' ? '#ffffff' : '#000000'} 
                      strokeWidth={3}
                      dot={{ fill: theme === 'dark' ? '#ffffff' : '#000000', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: theme === 'dark' ? '#ffffff' : '#000000', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="lg:col-span-1">
            <div className="card p-6 h-96">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Recent Sessions</h3>
              <div className="h-80 overflow-y-auto">
                <SessionList 
                  sessions={recentSessions} 
                  onSessionUpdated={loadData}
                  onEditSession={handleEditSession}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        {safeStats.bestSession && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 text-success-600 mr-2" />
                Best Session
              </h3>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-black">
                  {formatCurrency(safeStats.bestSession.winnings)}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(safeStats.bestSession.timestamp).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Duration: {formatDuration(safeStats.bestSession.duration || 0)}
                </p>
              </div>
            </div>

            {safeStats.worstSession && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingDown className="h-5 w-5 text-danger-600 mr-2" />
                  Worst Session
                </h3>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-gray-600">
                    {formatCurrency(safeStats.worstSession.winnings)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(safeStats.worstSession.timestamp).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Duration: {formatDuration(safeStats.worstSession.duration || 0)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
          </>
        )}
      </div>

      {/* Session Panel for editing */}
      <SessionPanel
        isOpen={isEditPanelOpen}
        onClose={() => {
          setIsEditPanelOpen(false);
          setEditingSession(null);
        }}
        onSessionAdded={handleSessionAdded}
        selectedDate={null}
        editingSession={editingSession}
      />

      {/* Support Modal */}
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </div>
  );
};

export default Dashboard;
