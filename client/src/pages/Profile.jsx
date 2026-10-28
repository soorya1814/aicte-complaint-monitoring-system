import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/authApi';
import { User, Mail, Shield, Building2, School, Phone, CheckCircle } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const Profile = () => {
  const { user, setUser } = useAuth();
  const { toastSuccess, toastError } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    designation: user?.designation || '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authApi.updateProfile(formData);
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('aicte_user', JSON.stringify(res.data.user));
        toastSuccess('Profile information updated successfully');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Account Profile & Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal details and system authorization credentials
        </p>
      </div>

      {/* Role and Institution Banner */}
      <Card className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-0">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl uppercase shadow-lg shadow-blue-500/30">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">{user?.name}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-0.5">{user?.email}</p>
            {user?.institution && (
              <p className="text-xs text-indigo-200 mt-1 flex items-center space-x-1">
                <School className="w-3.5 h-3.5 text-indigo-400" />
                <span>{user.institution.name} (AICTE: {user.institution.aicteId})</span>
              </p>
            )}
            {user?.department && (
              <p className="text-xs text-indigo-200 mt-1 flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{user.department.name} ({user.department.code})</span>
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Edit Form */}
      <Card title="Update Profile Details">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Designation / Official Title"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
          />

          <Input
            label="Contact Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <Button type="submit" loading={saving}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
