import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { DemoBanner } from '../components/common/DemoBanner';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res?.success) {
      navigate('/dashboard');
    }
  };

  const handleDemoClick = async (role) => {
    setLoading(true);
    const res = await quickDemoLogin(role);
    setLoading(false);
    if (res?.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans">
      <DemoBanner />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white mx-auto flex items-center justify-center shadow-md shadow-blue-600/30 mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">AICTE Grievance Portal</h2>
            <p className="text-xs text-slate-500 mt-1">
              Integrated Monitoring & Tracking Dashboard (SIH26264)
            </p>
          </div>

          {isExpired && (
            <div className="mb-4 p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs">
              Your session has expired. Please sign in again.
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Official Email Address"
              type="email"
              required
              placeholder="e.g. principal@dtie.edu.in or officer@aicte.gov.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
            />

            <div className="flex items-center justify-between text-xs">
              <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800 font-semibold">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign In to Dashboard
            </Button>
          </form>

          {/* 1-Click Fast Evaluator Login */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] uppercase font-bold text-slate-400 text-center tracking-wider mb-2.5">
              1-Click Demo Evaluation Sign-In
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoClick('admin')}
                className="p-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-xs font-semibold text-slate-700 transition-colors text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoClick('officer')}
                className="p-2 rounded-lg border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 text-xs font-semibold text-slate-700 transition-colors text-center"
              >
                Bureau Officer
              </button>
              <button
                type="button"
                onClick={() => handleDemoClick('institution')}
                className="p-2 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-xs font-semibold text-slate-700 transition-colors text-center"
              >
                Institution
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Represent an educational institution?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-800">
              Register Institution Account
            </Link>
          </div>
        </div>
      </div>

      <footer className="py-4 text-center text-xs text-slate-500">
        AICTE Smart India Hackathon 2026 Prototype • Problem Statement ID: SIH26264
      </footer>
    </div>
  );
};
