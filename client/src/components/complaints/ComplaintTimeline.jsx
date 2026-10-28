import React from 'react';
import {
  FileText,
  UserCheck,
  CheckCircle2,
  RotateCcw,
  Clock,
  ArrowRightCircle,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

export const ComplaintTimeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return <p className="text-xs text-slate-500 py-4 text-center">No timeline activity recorded yet.</p>;
  }

  const getEventIcon = (action) => {
    switch (action) {
      case 'SUBMITTED':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'OFFICER_ASSIGNED':
      case 'DEPARTMENT_ROUTED':
        return <UserCheck className="w-4 h-4 text-purple-600" />;
      case 'STATUS_CHANGE':
        return <ArrowRightCircle className="w-4 h-4 text-indigo-600" />;
      case 'CLARIFICATION_REQUESTED':
        return <HelpCircle className="w-4 h-4 text-amber-600" />;
      case 'RESOLVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'REOPENED':
        return <RotateCcw className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {history.map((event, idx) => {
        const formattedDate = event.timestamp
          ? format(new Date(event.timestamp), 'dd MMM yyyy, hh:mm a')
          : 'Recent';

        return (
          <div key={event._id || idx} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center shadow-xs group-hover:border-blue-500 transition-colors">
              {getEventIcon(event.action)}
            </div>

            {/* Event Details */}
            <div className="bg-slate-50 hover:bg-slate-100/80 rounded-lg p-3.5 border border-slate-200/80 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-slate-800 tracking-tight">
                  {event.action.replace(/_/g, ' ')}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{formattedDate}</span>
              </div>

              {event.newStatus && (
                <div className="text-xs font-medium text-slate-600 mb-1">
                  Status changed to:{' '}
                  <span className="font-semibold text-slate-900">{event.newStatus}</span>
                </div>
              )}

              {event.reason && (
                <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-white p-2 rounded border border-slate-100">
                  {event.reason}
                </p>
              )}

              <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span>
                  By: <strong className="text-slate-700">{event.changedByName || 'System'}</strong> (
                  <span className="capitalize">{event.changedByRole || 'Admin'}</span>)
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
