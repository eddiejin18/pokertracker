import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Edit3, Trash2 } from 'lucide-react';
import ApiService from '../services/api';
import { formatSessionLocationLine } from '../utils/sessionLocation';
import SessionPanel from './SessionPanel';

const Calendar = ({ onSessionAdded }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null); // Will be set to today on first mount only
  const [isSessionPanelOpen, setIsSessionPanelOpen] = useState(false);
  const [sessionsByDate, setSessionsByDate] = useState({});
  const [monthSessions, setMonthSessions] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingSession, setEditingSession] = useState(null);

  useEffect(() => {
    loadMonthSessions();
  }, [currentDate]);

  // On first mount, select today once. Afterwards, we never auto-change the user's selection.
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(new Date());
    }
  }, []);

  const loadMonthSessions = async () => {
    try {
      const sessions = await ApiService.getSessions();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Filter sessions for current month
      const monthSessions = sessions.filter(session => {
        // Handle date-only strings by adding time component to avoid timezone issues
        const timestamp = session.timestamp.includes('T') ? session.timestamp : session.timestamp + 'T12:00:00';
        const sessionDate = new Date(timestamp);
        return sessionDate >= startOfMonth && sessionDate <= endOfMonth;
      });
      
      // Group sessions by date
      const grouped = monthSessions.reduce((acc, session) => {
        // Handle date-only strings by adding time component to avoid timezone issues
        const timestamp = session.timestamp.includes('T') ? session.timestamp : session.timestamp + 'T12:00:00';
        const sessionDate = new Date(timestamp);
        const dateKey = sessionDate.toDateString();
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(session);
        return acc;
      }, {});
      
      setSessionsByDate(grouped);
      setMonthSessions(monthSessions);
    } catch (error) {
      console.error('Error loading month sessions:', error);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getDateKey = (date) => {
    return date ? date.toDateString() : '';
  };

  const getSessionsForDate = (date) => {
    if (!date) return [];
    return sessionsByDate[getDateKey(date)] || [];
  };

  const getTotalWinningsForDate = (date) => {
    const sessions = getSessionsForDate(date);
    const toNumber = (value) => (typeof value === 'number' ? value : parseFloat(value)) || 0;
    return sessions.reduce((total, session) => total + toNumber(session.winnings), 0);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsSessionPanelOpen(false); // Don't open panel immediately
  };

  const handleSessionAdded = () => {
    loadMonthSessions();
    onSessionAdded();
    setIsSessionPanelOpen(false);
    setEditingSession(null);
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
    setIsSessionPanelOpen(true);
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await ApiService.deleteSession(sessionId);
      loadMonthSessions();
      onSessionAdded();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session');
    }
  };

  const formatCurrency = (amount) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
    
    return amount >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isFutureDate = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cmp = new Date(date);
    cmp.setHours(0, 0, 0, 0);
    return cmp > today;
  };

  return (
    <div className="bg-white border border-neutral-900/15 rounded-lg p-5 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-neutral-900" strokeWidth={1.75} />
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 text-[13px] font-medium bg-neutral-900 text-white hover:bg-neutral-800 rounded-md transition-colors"
          >
            Jump to today
          </button>
          <button
            type="button"
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-md border border-neutral-900/20 bg-white text-neutral-900 hover:bg-neutral-50 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-md border border-neutral-900/20 bg-white text-neutral-900 hover:bg-neutral-50 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Main content area with calendar and sessions side by side */}
      <div className="flex gap-6">
        {/* Calendar Section */}
        <div className="w-[32rem] flex-shrink-0">
          <div className="grid grid-cols-7 gap-px mb-px bg-neutral-200 rounded-md overflow-hidden">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center text-[11px] font-medium text-neutral-500 bg-white">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-neutral-200 rounded-md overflow-hidden">
            {getDaysInMonth().map((date, index) => {
              const sessions = getSessionsForDate(date);
              const totalWinnings = getTotalWinningsForDate(date);
              const isToday = date && date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && date && date.toDateString() === selectedDate.toDateString();
              const future = date && isFutureDate(date);
              const loss = totalWinnings < 0;

              return (
                <div
                  key={index}
                  className={`
                    aspect-square p-0.5 min-h-[4.5rem] bg-white text-xs transition-colors
                    ${future ? 'cursor-default text-neutral-400' : 'cursor-pointer'}
                    ${!future && !isSelected ? 'hover:bg-neutral-50' : ''}
                    ${isSelected ? 'bg-neutral-900 text-white' : ''}
                    ${!date ? 'bg-neutral-50 cursor-default' : ''}
                  `}
                  onClick={() => date && !future && handleDateClick(date)}
                >
                  {date && (
                    <div className="flex flex-col h-full">
                      <div className="flex flex-col items-center pt-1">
                        <span
                          className={`text-[11px] font-semibold ${
                            isSelected ? 'text-white' : future ? 'text-neutral-400' : 'text-neutral-900'
                          }`}
                        >
                          {date.getDate()}
                        </span>
                        {isToday && !isSelected && (
                          <span className={`text-[10px] font-medium ${future ? 'text-neutral-400' : 'text-neutral-600'}`}>
                            Today
                          </span>
                        )}
                        {isToday && isSelected && (
                          <span className="text-[10px] font-medium text-white">Today</span>
                        )}
                      </div>
                      {sessions.length > 0 && (
                        <div className="flex flex-col items-center justify-center flex-1 -mt-0.5 px-0.5">
                          <div
                            className={`text-[10px] font-semibold tabular-nums ${
                              future
                                ? 'text-neutral-400'
                                : isSelected
                                  ? loss
                                    ? 'text-red-300'
                                    : 'text-white'
                                  : loss
                                    ? 'text-red-600'
                                    : 'text-neutral-900'
                            }`}
                          >
                            {formatCurrency(totalWinnings)}
                          </div>
                          <div
                            className={`text-[9px] mt-0.5 ${
                              isSelected ? 'text-neutral-300' : future ? 'text-neutral-400' : 'text-neutral-500'
                            }`}
                          >
                            {sessions.length} Session{sessions.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sessions List Section — white panel, thin border only */}
        <div className="flex-1 min-w-0 bg-white border border-neutral-900/10 rounded-lg p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5">
            <h3 className="text-[15px] font-bold text-neutral-900 leading-snug pr-2">
              {selectedDate ? `Sessions for ${selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}` : 'Select a date'}
            </h3>
            {selectedDate && (
              <button
                type="button"
                onClick={() => setIsSessionPanelOpen(true)}
                className="inline-flex shrink-0 items-center px-3 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors text-[13px] font-medium"
              >
                <Plus className="h-4 w-4 mr-1.5" strokeWidth={2} />
                Add Session
              </button>
            )}
          </div>
          
          <div className="space-y-0 max-h-96 overflow-y-auto divide-y divide-neutral-100">
            {selectedDate ? (
              getSessionsForDate(selectedDate).length > 0 ? (
                getSessionsForDate(selectedDate).map((session, index) => (
                  <div key={index} className="py-4 first:pt-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="font-semibold text-neutral-900 text-[14px]">{session.game_type || 'No Limit Hold\'em'}</span>
                          <span className="text-[13px] text-neutral-500">{session.blinds || 'No blinds'}</span>
                          <span className="text-[13px] text-neutral-500">{formatSessionLocationLine(session) || 'No location'}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-[13px] text-neutral-500">
                          <span>Buy-in: ${session.buy_in || 0}</span>
                          <span>End: ${session.end_amount || 0}</span>
                          <span>Duration: {session.duration || 0}h</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`text-[15px] font-semibold tabular-nums ${
                            (session.winnings || 0) >= 0 ? 'text-neutral-900' : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(session.winnings || 0)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleEditSession(session)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors rounded-md hover:bg-neutral-50"
                          title="Edit session"
                        >
                          <Edit3 className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(session.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50/50"
                          title="Delete session"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-14 text-neutral-500">
                  <Plus className="h-10 w-10 mx-auto mb-3 text-neutral-200" strokeWidth={1.25} />
                  <p className="text-[14px] text-neutral-600">No sessions for this date</p>
                  <p className="text-[13px] text-neutral-400 mt-1">Click &quot;Add Session&quot; to get started</p>
                </div>
              )
            ) : (
              <div className="text-center py-14 text-neutral-500">
                <CalendarIcon className="h-10 w-10 mx-auto mb-3 text-neutral-200" strokeWidth={1.25} />
                <p className="text-[14px] text-neutral-600">Click on a date to view sessions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session Panel */}
      <SessionPanel
        isOpen={isSessionPanelOpen}
        onClose={() => {
          setIsSessionPanelOpen(false);
          setEditingSession(null);
        }}
        onSessionAdded={handleSessionAdded}
        selectedDate={selectedDate}
        editingSession={editingSession}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-luxury max-w-md w-full">
            <h3 className="text-lg font-semibold text-charcoal mb-2">Delete session</h3>
            <p className="text-gray-500 text-[14px] mb-6">Are you sure? This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-charcoal rounded-lg hover:bg-gray-50 transition-colors text-[14px] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSession(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
