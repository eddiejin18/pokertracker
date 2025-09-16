import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Edit3, Trash2 } from 'lucide-react';
import ApiService from '../services/api';
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
    <div className="bg-white border border-black p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-black flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-black" />
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-black"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm bg-black text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-black"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {dayNames.map(day => (
          <div key={day} className="p-1 text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {getDaysInMonth().map((date, index) => {
          const sessions = getSessionsForDate(date);
          const totalWinnings = getTotalWinningsForDate(date);
          const isToday = date && date.toDateString() === new Date().toDateString();
          const isSelected = selectedDate && date && date.toDateString() === selectedDate.toDateString();
          const future = date && isFutureDate(date);

          return (
            <div
              key={index}
              className={`
                aspect-square p-0.5 border border-black rounded ${future ? 'cursor-default bg-gray-100 text-gray-400' : 'cursor-pointer'} transition-all text-xs
                ${!future ? (isSelected ? 'hover:bg-black hover:text-white' : 'hover:bg-gray-100') : ''}
                ${isSelected ? 'bg-black text-white' : ''}
                ${!date ? 'bg-gray-100 border-gray-300 cursor-default' : ''}
              `}
              onClick={() => date && !future && handleDateClick(date)}
            >
              {date && (
                <div className="flex flex-col h-full">
                  {/* Date at the top */}
                  <div className="flex flex-col items-center pt-1">
                    <span className={`text-xs font-medium ${isSelected ? 'text-white' : (future ? 'text-gray-400' : 'text-black')}`}>
                      {date.getDate()}
                    </span>
                    {isToday && (
                      <span className={`text-xs font-medium ${isSelected ? 'text-white' : (future ? 'text-gray-400' : 'text-black')}`}>
                        Today
                      </span>
                    )}
                  </div>
                  
                  {/* Profit and session count in the center */}
                  {sessions.length > 0 && (
                    <div className="flex flex-col items-center justify-center flex-1">
                      <div className={`text-sm font-bold ${
                        future ? 'text-gray-400' : (
                          isSelected 
                            ? (totalWinnings >= 0 ? 'text-green-300' : 'text-red-300')
                            : (totalWinnings >= 0 ? 'text-green-600' : 'text-red-600')
                        )
                      }`}>
                        {formatCurrency(totalWinnings)}
                      </div>
                      <div className={`text-xs mt-0.5 ${isSelected ? 'text-white' : (future ? 'text-gray-400' : 'text-gray-500')}`}>
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

      {/* Sessions Management Section */}
      {selectedDate && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black">
              Sessions for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <button
              onClick={() => setIsSessionPanelOpen(true)}
              className="flex items-center px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Session
            </button>
          </div>
          
          {/* Sessions List */}
          <div className="space-y-3">
            {getSessionsForDate(selectedDate).length > 0 ? (
              getSessionsForDate(selectedDate).map((session, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <span className="font-medium text-black">{session.game_type || 'No Limit Hold\'em'}</span>
                        <span className="text-sm text-gray-600">{session.blinds || 'No blinds'}</span>
                        <span className="text-sm text-gray-600">{session.location || 'No location'}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">
                          Buy-in: ${session.buy_in || 0}
                        </span>
                        <span className="text-sm text-gray-600">
                          End: ${session.end_amount || 0}
                        </span>
                        <span className="text-sm text-gray-600">
                          Duration: {session.duration || 0}h
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`font-bold ${
                        session.winnings >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(session.winnings || 0)}
                      </span>
                      <button
                        onClick={() => handleEditSession(session)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit session"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(session.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Plus className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No sessions for this date</p>
                <p className="text-sm">Click "Add Session" to get started</p>
              </div>
            )}
          </div>
        </div>
      )}

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg border border-black max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-black mb-4">Delete Session</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this session? This action cannot be undone.</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-black text-black rounded-lg hover:bg-gray-100 transition-colors"
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
