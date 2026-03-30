import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, DollarSign, Trash2, Edit3 } from 'lucide-react';
import ApiService from '../services/api';
import { formatSessionLocationLine } from '../utils/sessionLocation';

const SessionList = ({
  sessions,
  onSessionUpdated,
  onEditSession,
  variant = 'default',
  /** When true and list is empty, user has no sessions at all (not just filtered out). */
  noSessionsOnAccount = false,
  /** Table only: checkboxes + bulk delete */
  enableBulkDelete = false,
}) => {
  const clean = variant === 'clean';
  const table = variant === 'table';
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [bulkDeletePending, setBulkDeletePending] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [expandedNotes, setExpandedNotes] = useState({});

  useEffect(() => {
    setSelectedIds((prev) => {
      const valid = new Set(sessions.map((s) => s.id));
      const next = new Set();
      prev.forEach((id) => {
        if (valid.has(id)) next.add(id);
      });
      return next;
    });
  }, [sessions]);
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

  const toggleRowSelect = (sessionId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) next.delete(sessionId);
      else next.add(sessionId);
      return next;
    });
  };

  const toggleSelectAllRows = () => {
    if (!sessions.length) return;
    const allOn = sessions.every((s) => selectedIds.has(s.id));
    setSelectedIds(allOn ? new Set() : new Set(sessions.map((s) => s.id)));
  };

  const handleBulkDelete = async () => {
    try {
      await ApiService.deleteSessionsBulk(Array.from(selectedIds));
      setSelectedIds(new Set());
      setBulkDeletePending(false);
      onSessionUpdated();
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert(error?.message || 'Failed to delete sessions');
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
    if (noSessionsOnAccount) {
      return (
        <div className="text-center py-8 px-2">
          <Calendar className="h-10 w-10 text-gray-200 mx-auto mb-3" strokeWidth={1.25} />
          <p className="text-[14px] text-gray-500">No sessions yet</p>
          <p className="text-[13px] text-gray-400 mt-1 max-w-sm mx-auto">
            Sessions you add will appear here.
          </p>
        </div>
      );
    }
    return (
      <div className="text-center py-12">
        <Calendar className="h-10 w-10 text-gray-200 mx-auto mb-3" strokeWidth={1.25} />
        <p className="text-[14px] text-gray-500">No sessions match your filters</p>
        <p className="text-[13px] text-gray-400 mt-1 max-w-xs mx-auto">
          Clear filters or widen the date range to see sessions.
        </p>
      </div>
    );
  }

  if (table) {
    return (
      <>
        {enableBulkDelete && selectedIds.size > 0 && (
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={() => setBulkDeletePending(true)}
              className="text-[12px] font-medium text-red-600 hover:text-red-700 px-2 py-1 rounded-md hover:bg-red-50"
            >
              Delete {selectedIds.size} selected
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className={`w-full border-collapse text-left ${enableBulkDelete ? 'min-w-[780px]' : 'min-w-[720px]'}`}>
            <thead>
              <tr className="border-b border-gray-100">
                {enableBulkDelete && (
                  <th className="pb-3 pr-2 w-10 text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={sessions.length > 0 && sessions.every((s) => selectedIds.has(s.id))}
                      onChange={toggleSelectAllRows}
                      title="Select all"
                      aria-label="Select all sessions"
                    />
                  </th>
                )}
                <th className="pb-3 pr-4 text-[11px] font-medium uppercase tracking-wider text-gray-500">Date</th>
                <th className="pb-3 pr-4 text-[11px] font-medium uppercase tracking-wider text-gray-500">Game</th>
                <th className="pb-3 pr-4 text-[11px] font-medium uppercase tracking-wider text-gray-500">Stakes</th>
                <th className="pb-3 pr-4 text-[11px] font-medium uppercase tracking-wider text-gray-500">Location</th>
                <th className="pb-3 pr-4 text-[11px] font-medium uppercase tracking-wider text-gray-500">Duration</th>
                <th className="pb-3 pr-6 text-right text-[11px] font-medium uppercase tracking-wider text-gray-500">Result</th>
                <th className="pb-3 w-24 text-right text-[11px] font-medium uppercase tracking-wider text-gray-500">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="border-b border-gray-100 last:border-0">
                  {enableBulkDelete && (
                    <td className="py-4 pr-2 align-middle">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedIds.has(session.id)}
                        onChange={() => toggleRowSelect(session.id)}
                        aria-label={`Select session ${session.id}`}
                      />
                    </td>
                  )}
                  <td className="py-4 pr-4 align-middle text-[14px] text-neutral-900 whitespace-nowrap">
                    {formatDate(session.timestamp)}
                  </td>
                  <td className="py-4 pr-4 align-middle text-[14px] font-medium text-neutral-900">
                    {session.game_type || '—'}
                  </td>
                  <td className="py-4 pr-4 align-middle text-[14px] text-gray-600">{session.blinds || '—'}</td>
                  <td className="py-4 pr-4 align-middle text-[14px] text-gray-600 max-w-[180px] truncate">
                    {formatSessionLocationLine(session) ?? '—'}
                  </td>
                  <td className="py-4 pr-4 align-middle text-[14px] text-gray-600 whitespace-nowrap">
                    {formatDuration(session.duration || 0)}
                  </td>
                  <td className="py-4 pr-6 align-middle text-right">
                    {(() => {
                      const w =
                        (typeof session.winnings === 'number'
                          ? session.winnings
                          : parseFloat(session.winnings)) || 0;
                      const positive = w >= 0;
                      return (
                    <span
                      className={`text-[14px] font-semibold tabular-nums ${
                        positive ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {positive ? '+' : ''}
                      {formatCurrency(w)}
                    </span>
                      );
                    })()}
                  </td>
                  <td className="py-4 align-middle text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleEditSession(session)}
                      className="inline-flex p-1.5 text-gray-400 hover:text-neutral-900 rounded-md hover:bg-gray-50 transition-colors mr-1"
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(session.id)}
                      className="inline-flex p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50/50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showDeleteConfirm && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
            onMouseDown={() => setShowDeleteConfirm(null)}
            role="presentation"
          >
            <div
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-luxury max-w-md w-full"
              onMouseDown={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
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
                  type="button"
                  onClick={() => handleDeleteSession(showDeleteConfirm)}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-[14px] font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {bulkDeletePending && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
            onMouseDown={() => setBulkDeletePending(false)}
            role="presentation"
          >
            <div
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-luxury max-w-md w-full"
              onMouseDown={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <h3 className="text-lg font-semibold text-charcoal mb-2">Delete {selectedIds.size} sessions</h3>
              <p className="text-gray-500 text-[14px] mb-6">This cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setBulkDeletePending(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-charcoal rounded-lg hover:bg-gray-50 transition-colors text-[14px] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-[14px] font-medium"
                >
                  Delete all
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (clean) {
    return (
      <div className="divide-y divide-gray-100">
        {sessions.map((session) => {
          const locationLine = formatSessionLocationLine(session);
          return (
          <div key={session.id} className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 first:pt-0">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span
                  className={`text-[15px] font-semibold tabular-nums ${
                    session.winnings >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(session.winnings)}
                </span>
                <span className="text-[13px] text-gray-500">{session.game_type}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[12px] text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3 opacity-70" />
                  {formatDate(session.timestamp)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3 opacity-70" />
                  {formatDuration(session.duration || 0)}
                </span>
                {locationLine && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 opacity-70" />
                    {locationLine}
                  </span>
                )}
                {session.stakes && (
                  <span className="inline-flex items-center gap-1">
                    <DollarSign className="h-3 w-3 opacity-70" />
                    {session.stakes}
                  </span>
                )}
              </div>
              {renderNotes(session)}
            </div>
            <div className="flex items-center gap-1 shrink-0 sm:pl-4">
              <button
                type="button"
                onClick={() => handleEditSession(session)}
                className="p-2 rounded-lg text-gray-400 hover:text-charcoal hover:bg-gray-50 transition-colors"
                title="Edit"
              >
                <Edit3 className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(session.id)}
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50/50 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
          );
        })}
        {showDeleteConfirm && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
            onMouseDown={() => setShowDeleteConfirm(null)}
            role="presentation"
          >
            <div
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-luxury max-w-md w-full"
              onMouseDown={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <h3 className="text-lg font-semibold text-charcoal mb-2">Delete session</h3>
              <p className="text-[14px] text-gray-500 mb-6">This cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-medium text-charcoal hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSession(showDeleteConfirm)}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-[14px] font-medium hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const locationLine = formatSessionLocationLine(session);
        return (
        <div
          key={session.id}
          className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`text-lg font-semibold ${
                    session.winnings >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(session.winnings)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {session.game_type}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEditSession(session)}
                    className="text-gray-400 hover:text-charcoal transition-colors"
                    title="Edit session"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
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
                
                {locationLine && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{locationLine}</span>
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
      );
      })}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onMouseDown={() => setShowDeleteConfirm(null)}
          role="presentation"
        >
          <div
            className="bg-white p-6 rounded-lg border border-black max-w-md w-full mx-4"
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
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
