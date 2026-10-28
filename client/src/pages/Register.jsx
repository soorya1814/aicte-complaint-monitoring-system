import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../api/adminApi';
import { Shield, Building2, User, Mail, Lock, Phone, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { DemoBanner } from '../components/common/DemoBanner';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    designation: 'Principal / Registrar',
    role: 'institution',
    institutionName: '',
    aicteId: '',
    state: 'Delhi',
    district: '',
    institutionType: 'Engineering & Technology',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const indianStates = [
    'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Gujarat', 'Haryana',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha',
    'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await register(formData);
    setLoading(false);
    if (res?.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans">
      <DemoBanner />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Institution Onboarding</h2>
              <p className="text-xs text-slate-500 mt-1">
                Register authorized institution representative profile with AICTE Permanent ID
              </p>
            </div>
            <Link to="/login" className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center space-x-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Institution Details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Educational Institution Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Institution Legal Name"
                  name="institutionName"
                  required
                  placeholder="e.g. National Institute of Technology"
                  value={formData.institutionName}
                  onChange={handleChange}
                />
                <Input
                  label="AICTE Permanent ID"
                  name="aicteId"
                  required
                  placeholder="e.g. 1-4829104821"
                  value={formData.aicteId}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="Institution Type"
                  name="institutionType"
                  value={formData.institutionType}
                  onChange={handleChange}
                >
                  <option value="Engineering & Technology">Engineering & Tech</option>
                  <option value="Management">Management</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Architecture & Planning">Architecture & Planning</option>
                  <option value="Polytechnic / Diploma">Polytechnic / Diploma</option>
                  <option value="MCA & Applied Arts">MCA & Applied Arts</option>
                </Select>

                <Select label="State" name="state" value={formData.state} onChange={handleChange}>
                  {indianStates.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </Select>

                <Input
                  label="District"
                  name="district"
                  required
                  placeholder="e.g. Pune or New Delhi"
                  value={formData.district}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Representative Details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <User className="w-4 h-4 text-blue-600" />
                <span>Authorized Representative Account</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Full Name"
                  name="name"
                  required
                  placeholder="Prof. / Dr. Full Name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <Input
                  label="Designation"
                  name="designation"
                  required
                  placeholder="Principal / Registrar / Dean"
                  value={formData.designation}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Official Email Address"
                  type="email"
                  name="email"
                  required
                  placeholder="principal@institution.edu.in"
                  value={formData.email}
                  onChange={handleChange}
                />
                <Input
                  label="Contact Phone"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <Input
                label="Create Password (min 6 characters)"
                type="password"
                name="password"
                required
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Complete Registration & Access Dashboard
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
