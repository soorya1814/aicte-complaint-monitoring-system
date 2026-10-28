import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, UserCheck, School, Sparkles } from 'lucide-react';

export const DemoBanner = () => {
  const { user, quickDemoLogin } = useAuth();

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-xs px-4 py-2 border-b border-indigo-900/50 shadow-inner flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center space-x-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-bold tracking-wider uppercase text-indigo-300">SIH26264 Live Prototype</span>
        <span className="hidden sm:inline text-slate-400">|</span>
        <span className="hidden sm:inline text-slate-300">Active Session:</span>
        <span className="bg-indigo-900/80 text-indigo-200 px-2 py-0.5 rounded font-mono font-semibold">
          {user ? `${user.role.toUpperCase()} (${user.name})` : 'Guest / Logged Out'}
        </span>
      </div>

      <div className="flex items-center flex-wrap gap-1.5">
        <span className="text-slate-400 mr-1 hidden md:inline">1-Click Demo Login:</span>
        <button
          onClick={() => quickDemoLogin('admin')}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-indigo-700 text-slate-200 hover:text-white transition-all font-medium border border-slate-700"
        >
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span>Admin</span>
        </button>

        <button
          onClick={() => quickDemoLogin('officer')}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-indigo-700 text-slate-200 hover:text-white transition-all font-medium border border-slate-700"
        >
          <UserCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>Bureau Officer</span>
        </button>

        <button
          onClick={() => quickDemoLogin('institution')}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-indigo-700 text-slate-200 hover:text-white transition-all font-medium border border-slate-700"
        >
          <School className="w-3.5 h-3.5 text-amber-400" />
          <span>Institution</span>
        </button>
      </div>
    </div>
  );
};
