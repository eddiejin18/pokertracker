import React, { useState } from 'react';
import { X, DollarSign, Clock, MapPin, Calendar } from 'lucide-react';

const SessionModal = ({ isOpen, onClose, onSessionAdded }) => {
  const [formData, setFormData] = useState({
    winnings: '',
    duration: '',
    location: '',
    gameType: 'Cash Game',
    stakes: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gameTypes = [
    'Cash Game',
    'Tournament',
    'Sit & Go',
    'Multi-Table Tournament',
    'Spin & Go'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const sessionData = {
        ...formData,
        winnings: parseFloat(formData.winnings) || 0,
        duration: parseFloat(formData.duration) || 0,
        timestamp: new Date().toISOString()
      };

      // Legacy local storage path removed; this component is currently not used.
      onSessionAdded();
      
      // Reset form
      setFormData({
        winnings: '',
        duration: '',
        location: '',
        gameType: 'Cash Game',
        stakes: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Failed to save session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add New Session</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Winnings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Winnings/Losses ($)
            </label>
            <input
              type="number"
              step="0.01"
              name="winnings"
              value={formData.winnings}
              onChange={handleInputChange}
              placeholder="Enter amount (negative for losses)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="h-4 w-4 inline mr-1" />
              Duration (hours)
            </label>
            <input
              type="number"
              step="0.25"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              placeholder="e.g., 2.5 for 2 hours 30 minutes"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* Game Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Game Type
            </label>
            <select
              name="gameType"
              value={formData.gameType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {gameTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Stakes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stakes
            </label>
            <input
              type="text"
              name="stakes"
              value={formData.stakes}
              onChange={handleInputChange}
              placeholder="e.g., $1/$2, $10 MTT, $5 SNG"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Online, Casino Name, Home Game"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any additional notes about the session..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors btn-animate"
            >
              {isSubmitting ? 'Saving...' : 'Save Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionModal;
