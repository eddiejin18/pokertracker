import React, { useState } from 'react';
import { X, Mail } from 'lucide-react';
import ApiService from '../services/api';
import LoadingDots from './LoadingDots';
import { useToast } from './ToastProvider';

const SupportModal = ({ isOpen, onClose }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const toast = useToast();
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen) return null;

  const submit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await ApiService.sendSupport(subject.trim(), message.trim());
      toast.show('Thanks! Your message has been sent.', { type: 'success' });
      setSubject('');
      setMessage('');
      handleClose();
    } catch (err) {
      const msg = err.message || 'Failed to send message.';
      setFeedback({ ok: false, text: msg });
      toast.show(msg, { type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`} onMouseDown={handleClose}>
      <div className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-luxury w-full max-w-lg border border-stone-300/50 transition-all duration-200 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-stone-200/80">
          <h3 className="text-lg font-semibold text-charcoal tracking-tight flex items-center"><Mail className="h-4 w-4 mr-2"/>Contact Support</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5"/></button>
        </div>
          <form onSubmit={submit} className="p-4 space-y-4">
            {feedback && (
              <div className={`p-3 rounded-md border ${feedback.ok ? 'bg-green-50 border-green-600 text-green-700' : 'bg-red-50 border-red-600 text-red-700'}`}>
                {feedback.text}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-black mb-1">Subject</label>
              <input value={subject} onChange={(e)=>setSubject(e.target.value)} required className="input" placeholder="Brief summary"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Message</label>
              <textarea value={message} onChange={(e)=>setMessage(e.target.value)} required rows={5} className="input" placeholder="Please describe your issue or feedback"/>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={handleClose} className="btn">Close</button>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary disabled:opacity-50 flex items-center gap-2">
                {isSubmitting && (
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                )}
                <span>{isSubmitting ? 'Sending...' : 'Send'}</span>
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};

export default SupportModal;


