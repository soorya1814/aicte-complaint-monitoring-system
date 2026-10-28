import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../api/dashboardApi';
import { adminApi } from '../api/adminApi';
import { complaintApi } from '../api/complaintApi';
import {
  BarChart3,
  Download,
  Calendar,
  Building2,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Spinner';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const getBureauShortName = (name, code) => {
  if (code) {
    const map = {
      AB: 'Approval (AB)',
      GRC: 'Grievance (GRC)',
      FB: 'Finance (FB)',
      SDC: 'Student Dev (SDC)',
      RIFDB: 'Research (RIFDB)',
      PAPB: 'Academic (PAPB)',
      ADMIN: 'Admin (ADMIN)',
    };
    if (map[code]) return map[code];
  }
  if (!name) return 'Other';
  if (name.includes('Student')) return 'Student Dev (SDC)';
  if (name.includes('Finance')) return 'Finance (FB)';
  if (name.includes('Approval')) return 'Approval (AB)';
  if (name.includes('Research')) return 'Research (RIFDB)';
  if (name.includes('Grievance')) return 'Grievance (GRC)';
  if (name.includes('Policy') || name.includes('Academic')) return 'Academic (PAPB)';
  if (name.includes('Admin')) return 'Admin (ADMIN)';
  return name.length > 16 ? name.substring(0, 14) + '..' : name;
};

export const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    adminApi.getDepartments().then((res) => {
      if (res.data.success) setDepartments(res.data.departments || []);
    });
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getSummary({
        dateRange,
        departmentId: departmentId || undefined,
      });
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [dateRange, departmentId]);

  const handleExportCSV = () => {
    const url = complaintApi.exportCSVUrl({
      departmentId: departmentId || undefined,
    });
    window.open(url, '_blank');
  };

  if (loading && !data) return <Spinner size="lg" className="min-h-[60vh]" />;

  const charts = data?.charts || {
    departmentWorkload: [],
    topCategories: [],
  };

  const formattedWorkload = (charts.departmentWorkload || []).map((d) => ({
    ...d,
    displayName: getBureauShortName(d.name, d.code),
    fullName: d.name,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Bureau Reports & Operational Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Departmental performance metrics, category distributions, and downloadable CSV exports
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button size="sm" onClick={handleExportCSV} icon={Download}>
            Download Full Case Ledger (CSV)
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 bg-white border border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600">Time Range:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">Complete All-Time Records</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600">Bureau Filter:</span>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
            >
              <option value="">All AICTE Bureaus</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Top Categories Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Top Grievance Categories Generating Cases" subtitle="Case frequency ranked by regulatory area">
          <div className="space-y-3 pt-2">
            {charts.topCategories.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No category records in range.</p>
            ) : (
              charts.topCategories.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-semibold text-slate-800">{cat.name}</span>
                  <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    {cat.count} cases
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Bureau Caseload Breakdown */}
        <Card title="Bureau Caseload Performance Comparison" subtitle="Open cases vs. successfully resolved files">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedWorkload} margin={{ top: 15, right: 20, left: -20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="displayName"
                  tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={50}
                  stroke="#cbd5e1"
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }} />
                <Bar dataKey="open" fill="#f59e0b" name="Pending Cases" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#10b981" name="Resolved Cases" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
