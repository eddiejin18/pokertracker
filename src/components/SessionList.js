import React, { useState } from 'react';
import { Calendar, Clock, MapPin, DollarSign, Trash2, Edit3 } from 'lucide-react';
import ApiService from '../services/api';

const SessionList = ({ sessions, onSessionUpdated, onEditSession }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [expandedNotes, setExpandedNotes] = useState({});
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

  const formatDate = (timestamp) => {
    // Handle date-only strings by adding a time component to avoid timezone issues
    const dateStr = timestamp.includes('T') ? timestamp : timestamp + 'T12:00:00';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await ApiService.deleteSession(sessionId);
      onSessionUpdated();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session');
    }
  };

  const handleEditSession = (session) => {
    if (onEditSession) {
      onEditSession(session);
    }
  };

  const toggleNotes = (id) => {
    setExpandedNotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNotes = (session) => {
    if (!session.notes) return null;
    const limit = 120;
    const text = session.notes;
    const isLong = text.length > limit;
    const isExpanded = !!expandedNotes[session.id];
    const display = isLong && !isExpanded ? text.slice(0, limit) + '…' : text;
    return (
      <div className="mt-2">
        <p className="text-sm text-gray-500 inline italic">"{display}"</p>
        {isLong && (
          <button
            type="button"
            onClick={() => toggleNotes(session.id)}
            className="ml-2 text-xs underline text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? 'View less' : 'View more'}
          </button>
        )}
      </div>
    );
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No sessions yet</p>
        <p className="text-sm text-gray-400">Add your first session to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`text-lg font-semibold ${
                    session.winnings >= 0 ? 'text-success-600' : 'text-danger-600'
                  }`}>
                    {formatCurrency(session.winnings)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {session.game_type}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditSession(session)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit session"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(session.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete session"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(session.timestamp)}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDuration(session.duration || 0)}</span>
                </div>
                
                {session.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{session.location}</span>
                  </div>
                )}
                
                {session.stakes && (
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-3 w-3" />
                    <span>{session.stakes}</span>
                  </div>
                )}
              </div>
              
              {renderNotes(session)}
            </div>
          </div>
        </div>
      ))}
      
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

export default SessionList;
