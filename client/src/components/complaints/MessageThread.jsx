import React, { useState } from 'react';
import { Send, Lock, Globe, MessageSquare, ShieldAlert } from 'lucide-react';
import { Button } from '../common/Button';
import { format } from 'date-fns';

export const MessageThread = ({
  messages = [],
  onSendMessage,
  isSending = false,
  currentUserRole = 'institution',
}) => {
  const [text, setText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // all, public, internal

  const canPostInternal = currentUserRole === 'admin' || currentUserRole === 'officer';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage({ message: text.trim(), isInternal: canPostInternal ? isInternal : false });
    setText('');
  };

  const filteredMessages = messages.filter((m) => {
    if (activeFilter === 'public') return !m.isInternal;
    if (activeFilter === 'internal') return m.isInternal;
    return true;
  });

  return (
    <div className="flex flex-col h-[520px] bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header Tabs */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
          <MessageSquare className="w-4 h-4 text-blue-600" />
          <span>Case Communications & Notes ({messages.length})</span>
        </div>

        {canPostInternal && (
          <div className="flex rounded-lg bg-slate-200/70 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                activeFilter === 'all' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('public')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                activeFilter === 'public' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600'
              }`}
            >
              Public Only
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('internal')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                activeFilter === 'internal' ? 'bg-amber-100 text-amber-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Internal Notes Only
            </button>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-1">
            <Globe className="w-8 h-8 stroke-1 text-slate-300" />
            <p className="text-xs">No communications in this thread yet.</p>
          </div>
        ) : (
          filteredMessages.map((msg, index) => {
            const isNote = msg.isInternal;
            const isInstSender = msg.senderRole === 'institution';

            return (
              <div
                key={msg._id || index}
                className={`p-3.5 rounded-xl border text-xs transition-all ${
                  isNote
                    ? 'bg-amber-50/90 border-amber-200 text-amber-950 shadow-xs'
                    : isInstSender
                    ? 'bg-white border-slate-200 text-slate-800'
                    : 'bg-blue-50/70 border-blue-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-black/5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{msg.senderName}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wider ${
                        isInstSender
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {msg.senderRole}
                    </span>

                    {isNote && (
                      <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                        <Lock className="w-3 h-3" />
                        <span>CONFIDENTIAL INTERNAL NOTE</span>
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {msg.createdAt ? format(new Date(msg.createdAt), 'dd MMM, hh:mm a') : 'Just now'}
                  </span>
                </div>

                <p className="whitespace-pre-wrap leading-relaxed text-[13px]">{msg.message}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Input Composer */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200">
        {canPostInternal && (
          <div className="flex items-center space-x-4 mb-2 px-1">
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="radio"
                name="msgType"
                checked={!isInternal}
                onChange={() => setIsInternal(false)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>Public Response (Visible to Institution)</span>
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-amber-900">
              <input
                type="radio"
                name="msgType"
                checked={isInternal}
                onChange={() => setIsInternal(true)}
                className="text-amber-600 focus:ring-amber-500"
              />
              <span className="flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Private Internal Note (Hidden from Institution)</span>
              </span>
            </label>
          </div>
        )}

        <div className="flex items-end space-x-2">
          <textarea
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              isInternal
                ? 'Record confidential officer notes, investigation remarks, or inter-bureau instructions...'
                : 'Write official response or request clarification from the institution...'
            }
            className={`flex-1 rounded-lg border text-xs p-2.5 focus:outline-none focus:ring-2 resize-none transition-colors ${
              isInternal
                ? 'border-amber-300 bg-amber-50/40 focus:ring-amber-400'
                : 'border-slate-300 focus:ring-blue-500'
            }`}
          />
          <Button
            type="submit"
            variant={isInternal ? 'secondary' : 'primary'}
            disabled={!text.trim() || isSending}
            loading={isSending}
            className={isInternal ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600' : ''}
            icon={Send}
          >
            {isInternal ? 'Save Note' : 'Send'}
          </Button>
        </div>
      </form>
    </div>
  );
};
