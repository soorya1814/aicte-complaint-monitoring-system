import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Building2,
  School,
  Users,
  Bell,
  BarChart3,
  Shield,
  UserCheck,
  History,
  User,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const role = user?.role || 'institution';

  // Navigation config based on role
  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'officer', 'institution'],
    },
    {
      to: '/complaints',
      label: 'Complaint Cases',
      icon: FileText,
      roles: ['admin', 'officer', 'institution'],
    },
    {
      to: '/complaints/new',
      label: 'Submit Grievance',
      icon: PlusCircle,
      roles: ['institution', 'admin'],
    },
    {
      to: '/reports',
      label: 'Analytics & Reports',
      icon: BarChart3,
      roles: ['admin', 'officer'],
    },
    {
      to: '/departments',
      label: 'AICTE Bureaus',
      icon: Building2,
      roles: ['admin', 'officer'],
    },
    {
      to: '/institutions',
      label: 'Institutions Directory',
      icon: School,
      roles: ['admin', 'officer'],
    },
    {
      to: '/users',
      label: 'User Management',
      icon: Users,
      roles: ['admin'],
    },
    {
      to: '/audit-logs',
      label: 'System Audit Logs',
      icon: History,
      roles: ['admin'],
    },
    {
      to: '/notifications',
      label: 'Notifications',
      icon: Bell,
      roles: ['admin', 'officer', 'institution'],
    },
    {
      to: '/profile',
      label: 'Profile & Settings',
      icon: User,
      roles: ['admin', 'officer', 'institution'],
    },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container: Deep Navy */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center space-x-3 px-5 py-5 border-b border-slate-800 bg-slate-950/50">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-900/30 shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-sm font-black text-white tracking-wide truncate">AICTE GRIEVANCE</h1>
            <p className="text-[10px] text-blue-400 font-mono tracking-wider">SIH26264 DASHBOARD</p>
          </div>
        </div>

        {/* User Card */}
        <div className="px-4 py-3 mx-3 my-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Authorized User'}</p>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-blue-400 uppercase font-semibold tracking-wider">
                  {role}
                </span>
                {user?.institution?.name && (
                  <span className="text-[10px] text-slate-400 truncate">
                    • {user.institution.name.split(' ')[0]}
                  </span>
                )}
                {user?.department?.code && (
                  <span className="text-[10px] text-slate-400 truncate">
                    • {user.department.code}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950/40">
          <a
            href="http://localhost:5000/api/docs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Swagger API Docs</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>

          <button
            onClick={logout}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
