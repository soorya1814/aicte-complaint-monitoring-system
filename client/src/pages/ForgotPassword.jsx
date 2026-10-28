import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useToast } from '../context/ToastContext';
import { Shield, KeyRound, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { DemoBanner } from '../components/common/DemoBanner';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = Request, 2 = Reset
  const [loading, setLoading] = useState(false);
  const { toastSuccess, toastError } = useToast();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      if (res.data.demoToken) {
        setToken(res.data.demoToken);
        setStep(2);
        toastSuccess('Password reset verification token generated!');
      } else {
        toastSuccess(res.data.message);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.resetPassword(token, newPassword);
      toastSuccess(res.data.message);
      setStep(3); // Completed
    } catch (err) {
      toastError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans">
      <DemoBanner />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white mx-auto flex items-center justify-center shadow-md shadow-blue-600/30 mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Account Recovery</h2>
            <p className="text-xs text-slate-500 mt-1">
              Reset credentials securely for AICTE Grievance System
            </p>
          </div>

          {step === 1 && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <Input
                label="Registered Account Email"
                type="email"
                required
                placeholder="e.g. principal@dtie.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
              />

              <Button type="submit" loading={loading} className="w-full" size="lg">
                Generate Password Reset Token
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3 bg-blue-50 text-blue-900 rounded-lg text-xs font-mono break-all border border-blue-200">
                <strong>Reset Token:</strong> {token}
              </div>

              <Input
                label="Enter New Password (min 6 characters)"
                type="password"
                required
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <Button type="submit" loading={loading} className="w-full" size="lg">
                Confirm & Set New Password
              </Button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">
                Your password has been successfully reset!
              </p>
              <Link to="/login">
                <Button className="w-full" size="lg">
                  Proceed to Sign In
                </Button>
              </Link>
            </div>
          )}

          <div className="mt-6 text-center text-xs">
            <Link to="/login" className="font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center space-x-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
