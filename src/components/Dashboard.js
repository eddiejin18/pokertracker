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
  const [allSessions, setAllSessions] = useState([]);
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
  const [summaryPeriod, setSummaryPeriod] = useState('weekly');
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
      
      console.log('Raw sessions from API:', sessions);
      console.log('Number of raw sessions:', sessions.length);

      // Populate blinds options from all sessions
      const uniqueBlinds = Array.from(new Set(sessions.map(s => s.blinds).filter(Boolean)));
      setBlindsOptions(uniqueBlinds);

      // Apply filters
      const originalSessions = [...sessions]; // Keep original for debugging
      sessions = sessions.filter(s => {
        const matchesLocation = filters.location === 'ALL' || s.location === filters.location;
        const matchesGame = filters.gameType === 'ALL' || (s.game_type || s.gameType) === filters.gameType;
        const matchesBlinds = filters.blinds === 'ALL' || (s.blinds || '') === filters.blinds;
        const matchesLocType = filters.locationType === 'ALL' || (s.location_type || s.locationType) === filters.locationType;
        const ts = s.timestamp.includes('T') ? s.timestamp : s.timestamp + 'T12:00:00';
        const d = new Date(ts);
        const afterStart = !filters.startDate || d >= new Date(filters.startDate + 'T00:00:00');
        const beforeEnd = !filters.endDate || d <= new Date(filters.endDate + 'T23:59:59');
        
        console.log('Filtering session:', s);
        console.log('Matches location:', matchesLocation, 'Location:', s.location, 'Filter:', filters.location);
        console.log('Matches game:', matchesGame, 'Game:', s.game_type || s.gameType, 'Filter:', filters.gameType);
        console.log('Matches blinds:', matchesBlinds, 'Blinds:', s.blinds, 'Filter:', filters.blinds);
        console.log('Matches location type:', matchesLocType, 'Location type:', s.location_type || s.locationType, 'Filter:', filters.locationType);
        console.log('After start:', afterStart, 'Date:', d, 'Start:', filters.startDate);
        console.log('Before end:', beforeEnd, 'Date:', d, 'End:', filters.endDate);
        console.log('Final match:', matchesLocation && matchesGame && matchesBlinds && matchesLocType && afterStart && beforeEnd);
        console.log('---');
        
        return matchesLocation && matchesGame && matchesBlinds && matchesLocType && afterStart && beforeEnd;
      });
      
      console.log('Original sessions count:', originalSessions.length);
      console.log('Filtered sessions count:', sessions.length);
      const recentSessions = sessions.slice(-5).reverse();
      
      // Calculate stats from sessions
      const statsData = calculateStats(sessions);
      const chartData = calculateChartData(sessions, selectedPeriod);
      const gameTypeStats = calculateGameTypeStats(sessions);
      const locationStats = calculateLocationStats(sessions);
      
      console.log('Filtered sessions after applying filters:', sessions);
      console.log('Number of filtered sessions:', sessions.length);
      console.log('Recent sessions:', recentSessions);
      
      setStats(statsData);
      setChartData(chartData);
      setRecentSessions(recentSessions);
      setAllSessions(sessions);
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
    return entries.map(([periodKey, data]) => {
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
        winnings: data.winnings,
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

  // Calculate percentage change from previous period
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  // Get filtered data based on summary period
  const getFilteredData = (period) => {
    const now = new Date();
    // Use all sessions data
    const sessions = allSessions || [];
    
    console.log('All sessions:', sessions);
    console.log('Summary period:', period);
    console.log('Current time:', now);
    
    let startDate;
    switch (period) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'yearly':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return sessions;
    }
    
    console.log('Start date for', period, ':', startDate);
    
    const filtered = sessions.filter(session => {
      if (!session.timestamp) {
        console.log('Session missing timestamp:', session);
        return false;
      }
      
      // Handle different timestamp formats
      let sessionDate;
      if (typeof session.timestamp === 'string') {
        // If it's a string, try to parse it
        sessionDate = new Date(session.timestamp);
      } else if (session.timestamp instanceof Date) {
        sessionDate = session.timestamp;
      } else {
        console.log('Invalid timestamp format:', session.timestamp);
        return false;
      }
      
      // Check if the date is valid
      if (isNaN(sessionDate.getTime())) {
        console.log('Invalid date:', session.timestamp, 'Parsed as:', sessionDate);
        return false;
      }
      
      const isInRange = sessionDate >= startDate;
      
      console.log('Session:', session);
      console.log('Session timestamp:', session.timestamp);
      console.log('Session date:', sessionDate);
      console.log('Start date:', startDate);
      console.log('In range:', isInRange);
      console.log('---');
      
      return isInRange;
    });
    
    console.log('Filtered sessions for', period, ':', filtered);
    
    // If no sessions match the date filter, return all sessions as fallback
    if (filtered.length === 0 && sessions.length > 0) {
      console.log('No sessions found in date range, returning all sessions as fallback');
      return sessions;
    }
    
    return filtered;
  };

  // Get previous period data for comparison
  const getPreviousPeriodData = (period) => {
    const now = new Date();
    const sessions = allSessions || [];
    
    let startDate, endDate;
    switch (period) {
      case 'weekly':
        endDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        endDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
      case 'yearly':
        endDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        startDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
        break;
      default:
        return [];
    }
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.timestamp);
      return sessionDate >= startDate && sessionDate < endDate;
    });
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

  // Calculate real percentage changes
  const currentPeriodData = getFilteredData('monthly');
  const previousPeriodData = getPreviousPeriodData('monthly');
  
  const currentWinnings = currentPeriodData.reduce((sum, session) => sum + (session.winnings || 0), 0);
  const previousWinnings = previousPeriodData.reduce((sum, session) => sum + (session.winnings || 0), 0);
  const winningsPercentageChange = calculatePercentageChange(currentWinnings, previousWinnings);
  
  const currentHours = currentPeriodData.reduce((sum, session) => sum + (session.duration || 0), 0);
  const previousHours = previousPeriodData.reduce((sum, session) => sum + (session.duration || 0), 0);
  const currentHourlyRate = currentHours > 0 ? currentWinnings / currentHours : 0;
  const previousHourlyRate = previousHours > 0 ? previousWinnings / previousHours : 0;
  const hourlyRatePercentageChange = calculatePercentageChange(currentHourlyRate, previousHourlyRate);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-xl overflow-hidden flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
                <img src="/favicon.png" alt="Poker Tracker" className="h-8 w-8 object-contain dark:hidden" />
                <img src="/invertedicon.png" alt="Poker Tracker" className="h-8 w-8 object-contain hidden dark:block" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Poker Tracker</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Navigation Tabs */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`flex items-center justify-start px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 w-32 ${
                    activeView === 'dashboard'
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Home className="h-5 w-5 mr-2" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveView('calendar')}
                  className={`flex items-center justify-start px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 w-32 ${
                    activeView === 'calendar'
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Sessions
                </button>
              </div>
              <ThemeToggle />
              <button
                onClick={() => setIsSupportOpen(true)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Contact Support
              </button>
              <button
                onClick={onSignOut}
                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors inline-flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 text-gray-900 dark:text-white">
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
          <div className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm ${isRefreshing ? 'opacity-70' : ''}`}>
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Total Winnings</p>
              <p className={`text-3xl font-bold ${safeStats.totalWinnings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(safeStats.totalWinnings)}
              </p>
              <p className={`text-xs mt-1 ${winningsPercentageChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {winningsPercentageChange >= 0 ? '+' : ''}{winningsPercentageChange.toFixed(1)}% vs last month
              </p>
            </div>
          </div>

          <div className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm ${isRefreshing ? 'opacity-70' : ''}`}>
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Sessions Played</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{safeStats.totalSessions}</p>
            </div>
          </div>

          <div className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm ${isRefreshing ? 'opacity-70' : ''}`}>
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Total Hours</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatDuration(safeStats.totalHours)}</p>
            </div>
          </div>

          <div className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm ${isRefreshing ? 'opacity-70' : ''}`}>
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Hourly Rate</p>
              <p className={`text-3xl font-bold ${safeStats.hourlyProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(safeStats.hourlyProfit)}/hr
              </p>
              <p className={`text-xs mt-1 ${hourlyRatePercentageChange >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                {hourlyRatePercentageChange >= 0 ? '+' : ''}{hourlyRatePercentageChange.toFixed(1)}% vs last month
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
          {/* Winnings Chart */}
          <div className="lg:col-span-2 flex">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex flex-col w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Bankroll Growth</h3>
                <div className="flex items-center space-x-2">
                  {isRefreshing && (
                    <span className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin text-black dark:text-white" />
                  )}
                  <button
                    onClick={() => setSelectedPeriod('1W')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedPeriod === '1W'
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    1W
                  </button>
                  <button
                    onClick={() => setSelectedPeriod('1M')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedPeriod === '1M'
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    1M
                  </button>
                  <button
                    onClick={() => setSelectedPeriod('3M')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedPeriod === '3M'
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    3M
                  </button>
                  <button
                    onClick={() => setSelectedPeriod('1Y')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedPeriod === '1Y'
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    1Y
                  </button>
                  <button
                    onClick={() => setSelectedPeriod('ALL')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedPeriod === 'ALL'
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    ALL
                  </button>
                </div>
              </div>
              
              <div className={`h-96 ${isRefreshing ? 'opacity-60 transition-opacity' : ''}`}>
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
                      formatter={(value) => [formatCurrency(value), 'Winnings']}
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
          <div className="lg:col-span-1 flex">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex flex-col w-full">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Sessions</h3>
              <div className="h-96 overflow-y-auto">
                <SessionList 
                  sessions={recentSessions} 
                  onSessionUpdated={loadData}
                  onEditSession={handleEditSession}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary with Toggle */}
        <div className="mt-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {summaryPeriod === 'weekly' ? 'Weekly' : summaryPeriod === 'monthly' ? 'Monthly' : 'Yearly'} Summary
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSummaryPeriod('weekly')}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                    summaryPeriod === 'weekly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-700'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setSummaryPeriod('monthly')}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                    summaryPeriod === 'monthly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-700'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSummaryPeriod('yearly')}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                    summaryPeriod === 'yearly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-700'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {(() => {
                const filteredData = getFilteredData(summaryPeriod);
                const filteredSessions = filteredData.length;
                const filteredHours = filteredData.reduce((sum, session) => {
                  const duration = session.duration || 0;
                  console.log('Session duration:', session.duration, 'Parsed:', duration);
                  return sum + (isNaN(duration) ? 0 : duration);
                }, 0);
                const filteredWinnings = filteredData.reduce((sum, session) => {
                  const winnings = session.winnings || 0;
                  console.log('Session winnings:', session.winnings, 'Parsed:', winnings);
                  return sum + (isNaN(winnings) ? 0 : winnings);
                }, 0);
                
                // Debug logging
                console.log('Summary Period:', summaryPeriod);
                console.log('Filtered Data:', filteredData);
                console.log('Filtered Hours:', filteredHours);
                console.log('Filtered Winnings:', filteredWinnings);
                
                return (
                  <>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{filteredSessions}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sessions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {isNaN(filteredHours) ? '0h 0m' : formatDuration(filteredHours)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Time</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-3xl font-bold ${filteredWinnings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {isNaN(filteredWinnings) ? '$0.00' : formatCurrency(filteredWinnings)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Profit</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
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
