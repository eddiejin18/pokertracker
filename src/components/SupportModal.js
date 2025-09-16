import React, { useState } from 'react';
import { X, Mail } from 'lucide-react';
import ApiService from '../services/api';
import LoadingDots from './LoadingDots';

const SupportModal = ({ isOpen, onClose }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen) return null;

  const submit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await ApiService.sendSupport(subject.trim(), message.trim());
      setFeedback({ ok: true, text: 'Thanks! Your message has been sent.' });
      setSubject('');
      setMessage('');
    } catch (err) {
      setFeedback({ ok: false, text: err.message || 'Failed to send message.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onMouseDown={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-black flex items-center"><Mail className="h-4 w-4 mr-2"/>Contact Support</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5"/></button>
        </div>
        <form onSubmit={submit} className="p-4 space-y-4">
          {feedback && (
            <div className={`p-3 rounded-md border ${feedback.ok ? 'bg-green-50 border-green-600 text-green-700' : 'bg-red-50 border-red-600 text-red-700'}`}>
              {feedback.text}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-black mb-1">Subject</label>
            <input value={subject} onChange={(e)=>setSubject(e.target.value)} required className="w-full px-3 py-2 border border-black rounded-lg focus:ring-2 focus:ring-black focus:border-black" placeholder="Brief summary"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Message</label>
            <textarea value={message} onChange={(e)=>setMessage(e.target.value)} required rows={5} className="w-full px-3 py-2 border border-black rounded-lg focus:ring-2 focus:ring-black focus:border-black" placeholder="Please describe your issue or feedback"/>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-black rounded-lg">Close</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50">
              {isSubmitting ? <LoadingDots /> : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupportModal;


