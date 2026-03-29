import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LogOut, TrendingUp, TrendingDown, Home, Plus, Users, FileSpreadsheet } from 'lucide-react';
import ApiService from '../services/api';
import SessionList from './SessionList';
import SessionPanel from './SessionPanel';
import LoadingPercentScreen from './LoadingPercentScreen';
import SupportModal from './SupportModal';
import GroupsView from './GroupsView';
import SessionCsvImportModal from './SessionCsvImportModal';
import { isCsvLikeFile } from '../utils/csvSessionImport';

const Dashboard = ({ user, onSignOut, initialGroupId }) => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [recentSessions, setRecentSessions] = useState([]);
  /** Total sessions from API before filters — used for empty-state copy */
  const [totalSessionCountUnfiltered, setTotalSessionCountUnfiltered] = useState(0);
  const [firstSessionHintDismissed, setFirstSessionHintDismissed] = useState(false);
  const [gameTypeData, setGameTypeData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadPercent, setLoadPercent] = useState(0);
  const loadProgressTimerRef = useRef(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [blindsOptions, setBlindsOptions] = useState([]);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [csvPendingFile, setCsvPendingFile] = useState(null);
  const [recentSessionsDropActive, setRecentSessionsDropActive] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [newSessionSeedDate, setNewSessionSeedDate] = useState(null);
  const defaultFilters = {
    location: 'ALL',
    gameType: 'ALL',
    blinds: 'ALL',
    locationType: 'ALL',
    startDate: '',
    endDate: ''
  };
  const [filters, setFilters] = useState(defaultFilters);
  const [activeTab, setActiveTab] = useState(initialGroupId ? 'groups' : 'overview');

  useEffect(() => {
    if (initialGroupId) setActiveTab('groups');
  }, [initialGroupId]);

  /** Show first-session hint again on each login / account switch (no sessionStorage — that hid it after logout). */
  useEffect(() => {
    setFirstSessionHintDismissed(false);
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [selectedPeriod, filters]);

  useEffect(() => {
    if (!isInitialLoading) return;
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
    return () => {
      if (loadProgressTimerRef.current) {
        clearInterval(loadProgressTimerRef.current);
        loadProgressTimerRef.current = null;
      }
    };
  }, [isInitialLoading]);

  const loadData = async () => {
    const initialPass = isInitialLoading;
    try {
      if (isInitialLoading) {
        setIsInitialLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);
      
      let sessions = await ApiService.getSessions();
      setTotalSessionCountUnfiltered(sessions.length);

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
      if (initialPass) {
        if (loadProgressTimerRef.current) {
          clearInterval(loadProgressTimerRef.current);
          loadProgressTimerRef.current = null;
        }
        setLoadPercent(100);
        setTimeout(() => setIsInitialLoading(false), 220);
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

    let bestSession = null;
    let worstSession = null;
    sessions.forEach((session) => {
      const w = toNumber(session.winnings);
      if (bestSession === null || w > toNumber(bestSession.winnings)) bestSession = session;
      if (worstSession === null || w < toNumber(worstSession.winnings)) worstSession = session;
    });

    return {
      totalSessions,
      totalWinnings,
      totalBuyIns,
      totalHours,
      hourlyProfit,
      averageWinnings: totalSessions > 0 ? totalWinnings / totalSessions : 0,
      bestSession,
      worstSession,
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
    setNewSessionSeedDate(null);
  };

  const handleAddSession = () => {
    setEditingSession(null);
    setNewSessionSeedDate(new Date());
    setIsEditPanelOpen(true);
  };

  const dismissFirstSessionHint = () => {
    setFirstSessionHintDismissed(true);
  };

  const showFirstSessionHint =
    totalSessionCountUnfiltered === 0 && !firstSessionHintDismissed;

  const handleCsvInitialFileConsumed = useCallback(() => setCsvPendingFile(null), []);

  const handleRecentSessionsDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const types = e.dataTransfer?.types;
    if (types && !Array.from(types).includes('Files')) return;
    setRecentSessionsDropActive(true);
  };

  const handleRecentSessionsDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX: x, clientY: y } = e;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setRecentSessionsDropActive(false);
    }
  };

  const handleRecentSessionsDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleRecentSessionsDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setRecentSessionsDropActive(false);
    const f = Array.from(e.dataTransfer.files || []).find(isCsvLikeFile);
    if (f) {
      setCsvPendingFile(f);
      setIsCsvImportOpen(true);
    }
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
    setNewSessionSeedDate(null);
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
    return <LoadingPercentScreen percent={loadPercent} />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
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
    averageWinnings: 0,
    bestSession: null,
    worstSession: null,
  };

  return (
    <div className="min-h-screen bg-white text-charcoal">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center py-3 sm:py-4">
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'groups') setActiveTab('overview');
              }}
              className="flex items-center gap-3 bg-transparent border-0 p-0 m-0 cursor-pointer text-left rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            >
              <img src="/pokericon.png" alt="" className="h-9 w-9 object-contain" />
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-charcoal">Poker Tracker</h1>
                <p className="text-[13px] text-gray-500">{user?.name}</p>
              </div>
            </button>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50/80 p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-2 rounded-md text-[13px] font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === 'overview'
                      ? 'bg-white text-charcoal shadow-sm border border-gray-100'
                      : 'text-gray-500 hover:text-charcoal'
                  }`}
                >
                  <Home className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('groups')}
                  className={`px-3 py-2 rounded-md text-[13px] font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === 'groups'
                      ? 'bg-white text-charcoal shadow-sm border border-gray-100'
                      : 'text-gray-500 hover:text-charcoal'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Groups
                </button>
              </div>
              <button type="button" onClick={() => setIsSupportOpen(true)} className="btn text-[13px]">
                Support
              </button>
              <button type="button" onClick={onSignOut} className="btn text-[13px]">
                <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-7">
        {activeTab === 'groups' ? (
          <GroupsView initialSelectedGroupId={initialGroupId} />
        ) : (
        <>
            <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Overview</h1>
                <div className="mt-0.5 flex flex-row flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="text-[13px] text-gray-500 min-w-0">Performance and session history</p>
                  <p className="text-[12px] text-gray-400 text-right leading-snug shrink-0 max-w-[min(100%,22rem)]">
                    Feedback welcome — use{' '}
                    <button
                      type="button"
                      onClick={() => setIsSupportOpen(true)}
                      className="font-medium text-gray-500 hover:text-charcoal underline decoration-gray-300/70 underline-offset-2 transition-colors"
                    >
                      Support
                    </button>
                    {' '}
                    anytime.
                  </p>
                </div>
              </div>
            </div>

            {/* Filters — collapsible to save vertical space */}
            <div className="mb-4 rounded-xl border border-gray-100 bg-white p-3 sm:p-4 shadow-soft">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen((o) => !o)}
                className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 hover:text-charcoal"
              >
                Filters {filtersOpen ? '▴' : '▾'}
              </button>
              <button
                type="button"
                onClick={() => setFilters(defaultFilters)}
                className="text-[12px] text-gray-500 hover:text-charcoal transition-colors"
              >
                Clear all
              </button>
            </div>
            {filtersOpen && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-3 pt-3 border-t border-gray-100">
              <div>
                <div className="text-[11px] font-medium text-gray-500 mb-1.5">Location</div>
                <div className="relative">
                  <select className="appearance-none border border-gray-200 rounded-lg px-3 pr-9 py-2 text-[13px] w-full bg-white text-charcoal" value={filters.location} onChange={e=>setFilters(prev=>({...prev, location:e.target.value}))}>
                    <option value="ALL">All</option>
                    {[...new Set((locationData||[]).map(l=>l.location))].map(loc=>(<option key={loc} value={loc}>{loc}</option>))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-gray-500 mb-1.5">Variation</div>
                <div className="relative">
                  <select className="appearance-none border border-gray-200 rounded-lg px-3 pr-9 py-2 text-[13px] w-full bg-white text-charcoal" value={filters.gameType} onChange={e=>setFilters(prev=>({...prev, gameType:e.target.value}))}>
                    <option value="ALL">All</option>
                    {[...new Set((gameTypeData||[]).map(g=>g.gameType))].map(gt=>(<option key={gt} value={gt}>{gt}</option>))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-gray-500 mb-1.5">Blinds/Stakes</div>
                <div className="relative">
                  <select className="appearance-none border border-gray-200 rounded-lg px-3 pr-9 py-2 text-[13px] w-full bg-white text-charcoal" value={filters.blinds} onChange={e=>setFilters(prev=>({...prev, blinds:e.target.value}))}>
                    <option value="ALL">All</option>
                    {blindsOptions.map(b => (<option key={b} value={b}>{b}</option>))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-gray-500 mb-1.5">Location Type</div>
                <div className="relative">
                  <select className="appearance-none border border-gray-200 rounded-lg px-3 pr-9 py-2 text-[13px] w-full bg-white text-charcoal" value={filters.locationType} onChange={e=>setFilters(prev=>({...prev, locationType:e.target.value}))}>
                    <option value="ALL">All</option>
                    <option value="home">Home</option>
                    <option value="casino">Casino</option>
                    <option value="online">Online</option>
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-gray-500 mb-1.5">Start Date</div>
                <input type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] w-full bg-white text-charcoal" value={filters.startDate} onChange={e=>setFilters(prev=>({...prev, startDate:e.target.value}))} />
              </div>
              <div>
                <div className="text-[11px] font-medium text-gray-500 mb-1.5">End Date</div>
                <input type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] w-full bg-white text-charcoal" value={filters.endDate} onChange={e=>setFilters(prev=>({...prev, endDate:e.target.value}))} />
              </div>
            </div>
            )}
            </div>
        {/* Chart + summary: side-by-side on large screens to shorten the page */}
        <div className={`grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4 ${isRefreshing ? 'opacity-80' : ''}`}>
        <div className="lg:col-span-3 rounded-xl border border-gray-100 bg-white p-4 sm:p-5 shadow-soft">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-3">
            <div>
              <h2 className="text-[14px] font-semibold text-neutral-900 tracking-tight">Cumulative profit</h2>
              <p className="text-[12px] text-gray-500 mt-0.5">Based on filters and time range</p>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {isRefreshing && (
                <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin mr-1" />
              )}
              {['1W', '1M', '3M', '1Y', 'ALL'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPeriod(p)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    selectedPeriod === p
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="period" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} width={48} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), 'Cumulative']}
                  labelStyle={{ color: '#52525b', fontSize: 12 }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '10px',
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.12)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="winnings"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: '#2563eb', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-soft">
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Total profit</p>
            <p className={`text-xl font-semibold tabular-nums mt-1 ${safeStats.totalWinnings >= 0 ? 'text-neutral-900' : 'text-gray-500'}`}>
              {formatCurrency(safeStats.totalWinnings)}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">After filters</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-soft">
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Sessions</p>
            <p className="text-xl font-semibold tabular-nums text-neutral-900 mt-1">{safeStats.totalSessions}</p>
            <p className="text-[11px] text-gray-500 mt-1">{formatDuration(safeStats.totalHours)} played</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-soft">
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Hourly</p>
            <p className={`text-xl font-semibold tabular-nums mt-1 ${safeStats.hourlyProfit >= 0 ? 'text-neutral-900' : 'text-gray-500'}`}>
              {formatCurrency(safeStats.hourlyProfit)}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">Per hour</p>
          </div>
        </div>
        </div>

        {/* Best / worst — compact row */}
        {safeStats.bestSession && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-soft">
              <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-neutral-400" strokeWidth={1.5} />
                Best session
              </h3>
              <p className="text-lg font-semibold tabular-nums text-charcoal">
                {formatCurrency(safeStats.bestSession.winnings)}
              </p>
              <p className="text-[12px] text-gray-500 mt-0.5">
                {new Date(safeStats.bestSession.timestamp).toLocaleDateString()} ·{' '}
                {formatDuration(safeStats.bestSession.duration || 0)}
              </p>
            </div>

            {safeStats.worstSession && (
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-soft">
                <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5 text-gray-400" strokeWidth={1.5} />
                  Worst session
                </h3>
                <p className="text-lg font-semibold tabular-nums text-gray-600">
                  {formatCurrency(safeStats.worstSession.winnings)}
                </p>
                <p className="text-[12px] text-gray-500 mt-0.5">
                  {new Date(safeStats.worstSession.timestamp).toLocaleDateString()} ·{' '}
                  {formatDuration(safeStats.worstSession.duration || 0)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recent sessions — transaction rows (bottom of Overview); drop CSV to import */}
        <div
          className={`mt-4 rounded-xl border bg-white p-4 sm:p-5 shadow-soft transition-colors ${
            recentSessionsDropActive ? 'border-sky-400 ring-2 ring-sky-200/70' : 'border-gray-100'
          }`}
          onDragEnter={handleRecentSessionsDragEnter}
          onDragLeave={handleRecentSessionsDragLeave}
          onDragOver={handleRecentSessionsDragOver}
          onDrop={handleRecentSessionsDrop}
          role="region"
          aria-label="Recent sessions. Drop a CSV file here to import."
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-[14px] font-semibold text-neutral-900 tracking-tight">Recent sessions</h2>
              <p className="text-[12px] text-gray-500 mt-0.5">
                Newest first · {recentSessions.length} session{recentSessions.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setCsvPendingFile(null);
                  setIsCsvImportOpen(true);
                }}
                className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 bg-white text-charcoal shadow-sm hover:bg-gray-50 transition-colors"
                title="Import sessions from CSV"
                aria-label="Import sessions from CSV"
              >
                <FileSpreadsheet className="h-4 w-4" strokeWidth={2} />
              </button>
              <div className="relative">
              {showFirstSessionHint && (
                <div
                  id="empty-account-sessions-hint"
                  role="tooltip"
                  className="absolute bottom-full right-0 z-20 mb-2 w-[min(100vw-2rem,220px)] rounded-lg border border-gray-200/90 bg-white py-2 pl-2.5 pr-7 text-left shadow-md shadow-black/[0.06]"
                >
                  <p id="empty-account-hint-desc" className="text-[12px] leading-snug text-gray-600">
                    Tap <span className="font-semibold text-gray-800">+</span> to add your first session
                  </p>
                  <button
                    type="button"
                    onClick={dismissFirstSessionHint}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md text-[15px] leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Dismiss hint"
                  >
                    ×
                  </button>
                  <div
                    className="absolute -bottom-1 right-3 h-2 w-2 rotate-45 border-b border-r border-gray-200/90 bg-white"
                    aria-hidden
                  />
                </div>
              )}
              <button
                type="button"
                id="dashboard-add-session-btn"
                onClick={handleAddSession}
                aria-describedby={showFirstSessionHint ? 'empty-account-hint-desc' : undefined}
                className={`inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 bg-white text-charcoal shadow-sm hover:bg-gray-50 transition-colors ${
                  showFirstSessionHint ? 'ring-2 ring-sky-200/80 ring-offset-1' : ''
                }`}
                title="Add session"
                aria-label="Add session"
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
              </button>
              </div>
            </div>
          </div>
          <div
            className="overflow-x-auto -mx-1 px-1"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onScroll={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            style={{ touchAction: 'pan-y' }}
          >
            <SessionList
              sessions={recentSessions}
              onSessionUpdated={loadData}
              onEditSession={handleEditSession}
              variant="table"
              noSessionsOnAccount={totalSessionCountUnfiltered === 0}
              enableBulkDelete
            />
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
          setNewSessionSeedDate(null);
        }}
        onSessionAdded={handleSessionAdded}
        selectedDate={editingSession ? null : newSessionSeedDate}
        editingSession={editingSession}
      />

      {/* Support Modal */}
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />

      <SessionCsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => {
          setIsCsvImportOpen(false);
          setCsvPendingFile(null);
        }}
        onImported={loadData}
        initialFile={csvPendingFile}
        onInitialFileConsumed={handleCsvInitialFileConsumed}
      />
    </div>
  );
};

export default Dashboard;
