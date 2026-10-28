import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, CheckCheck, Check, Clock, ExternalLink } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Notification Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time case alerts, status transitions, clarification notifications, and SLA warnings
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} icon={CheckCheck}>
            Mark All Read
          </Button>
        )}
      </div>

      <Card className="divide-y divide-slate-100 p-0 border border-slate-200">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
            <p className="text-sm font-semibold text-slate-700">No notifications in your inbox.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                !n.isRead ? 'bg-blue-50/40' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    !n.isRead ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                    {n.referenceId && (
                      <span className="font-mono text-[11px] font-semibold text-blue-700">
                        [{n.referenceId}]
                      </span>
                    )}
                    {!n.isRead && (
                      <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-100 px-1.5 py-0.2 rounded">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    {n.createdAt ? format(new Date(n.createdAt), 'dd MMM yyyy, hh:mm a') : 'Recent'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {n.complaint && (
                  <Link to={`/complaints/${n.complaint._id || n.complaint}`}>
                    <Button size="sm" variant="outline" className="text-xs px-2 py-1" icon={ExternalLink}>
                      Open Case
                    </Button>
                  </Link>
                )}
                {!n.isRead && (
                  <button
                    onClick={() => markAsRead(n._id)}
                    className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
};
