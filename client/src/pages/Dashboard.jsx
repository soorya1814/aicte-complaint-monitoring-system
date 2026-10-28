import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../api/dashboardApi';
import { adminApi } from '../api/adminApi';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  TrendingUp,
  Percent,
  Calendar,
  Building2,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Spinner } from '../components/common/Spinner';
import { StatusBadge } from '../components/complaints/StatusBadge';
import { PriorityBadge } from '../components/complaints/PriorityBadge';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
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

export const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [dateRange, setDateRange] = useState('30d');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    adminApi.getDepartments().then((res) => {
      if (res.data.success) {
        setDepartments(res.data.departments || []);
      }
    });
  }, []);

  const fetchDashboard = async () => {
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
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [dateRange, departmentId]);

  if (loading && !data) {
    return <Spinner size="lg" className="min-h-[60vh]" />;
  }

  const kpis = data?.kpis || {
    totalComplaints: 0,
    newlySubmitted: 0,
    pendingComplaints: 0,
    inProgress: 0,
    resolvedComplaints: 0,
    overdueComplaints: 0,
    avgResolutionDays: 0,
    resolutionRate: 0,
  };

  const charts = data?.charts || {
    statusDistribution: [],
    priorityDistribution: [],
    departmentWorkload: [],
    topCategories: [],
    trends: [],
  };

  const formattedWorkload = (charts.departmentWorkload || []).map((d) => ({
    ...d,
    displayName: getBureauShortName(d.name, d.code),
    fullName: d.name,
  }));

  const STATUS_COLORS = {
    Submitted: '#3b82f6',
    'Under Review': '#8b5cf6',
    'In Progress': '#7c3aed',
    'Awaiting Institution Response': '#f59e0b',
    Resolved: '#10b981',
    Closed: '#64748b',
    Reopened: '#ef4444',
  };

  const PRIORITY_COLORS = {
    Critical: '#ef4444',
    High: '#f97316',
    Medium: '#f59e0b',
    Low: '#3b82f6',
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {user?.role === 'admin'
              ? 'AICTE National Oversight Dashboard'
              : user?.role === 'officer'
              ? `${user?.department?.name || 'Bureau'} Officer Dashboard`
              : 'Institution Grievance Portal'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time tracking, SLA target monitoring, and AICTE bureau case metrics
          </p>
        </div>

        {/* Global Filters */}
        <div className="flex items-center flex-wrap gap-2.5">
          {user?.role === 'admin' && (
            <div className="flex items-center space-x-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="text-xs bg-transparent focus:outline-none font-medium text-slate-700"
              >
                <option value="">All AICTE Bureaus</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center space-x-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-xs bg-transparent focus:outline-none font-medium text-slate-700"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All-Time Dataset</option>
            </select>
          </div>
        </div>
      </div>

      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Cases</p>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-slate-900">{kpis.totalComplaints}</h3>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Newly Submitted */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">New Submitted</p>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-blue-700">{kpis.newlySubmitted}</h3>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Pending Review</p>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-amber-700">{kpis.pendingComplaints}</h3>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-600">In Progress</p>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-purple-700">{kpis.inProgress}</h3>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Resolved</p>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-emerald-700">{kpis.resolvedComplaints}</h3>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-red-600">SLA Overdue</p>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-red-700">{kpis.overdueComplaints}</h3>
            <Flame className="w-4 h-4 text-red-500 animate-bounce" />
          </div>
        </div>

        {/* Avg Resolution Days */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Avg Resolution</p>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-slate-800">{kpis.avgResolutionDays}d</h3>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Resolution %</p>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-indigo-700">{kpis.resolutionRate}%</h3>
            <Percent className="w-4 h-4 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Row 1 Charts: Trends & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Trends Over Time */}
        <Card
          title="Complaint Submission & Resolution Trends"
          subtitle="Daily volume comparison across the active time window"
          className="lg:col-span-2"
        >
          <div className="h-72 w-full">
            {charts.trends.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No activity trend records in selected period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.trends} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="submitted" stroke="#3b82f6" strokeWidth={2.5} name="Submitted" />
                  <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2.5} name="Resolved" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Donut Chart: Status Distribution */}
        <Card title="Status Distribution" subtitle="Breakdown of all filtered complaints">
          <div className="h-72 w-full flex flex-col justify-center">
            {charts.statusDistribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No complaint status data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.statusDistribution}
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {charts.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Row 2 Charts: Department Workload & Priority Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Department Workload */}
        <Card
          title="Complaints by AICTE Bureau (Workload)"
          subtitle="Open vs. Resolved volume across specialized cells"
          className="lg:col-span-2"
        >
          <div className="h-72 w-full">
            {formattedWorkload.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No bureau data available.
              </div>
            ) : (
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
                  <Bar dataKey="open" fill="#6366f1" name="Open Cases" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolved" fill="#10b981" name="Resolved" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Priority Distribution Chart */}
        <Card title="Priority Distribution" subtitle="Urgency classification profile">
          <div className="h-72 w-full">
            {charts.priorityDistribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No priority data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={charts.priorityDistribution}
                  layout="vertical"
                  margin={{ top: 15, right: 20, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} stroke="#cbd5e1" width={65} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" name="Cases" radius={[0, 4, 4, 0]}>
                    {charts.priorityDistribution.map((entry, idx) => (
                      <Cell key={`bar-${idx}`} fill={PRIORITY_COLORS[entry.name] || '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Row 3: Overdue Complaints Table & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overdue Alert Table */}
        <Card
          title="Critical & Overdue Escalations"
          subtitle="Cases exceeding configured SLA targets"
          headerAction={
            <Link to="/complaints?isOverdue=true" className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center space-x-1">
              <span>View All Overdue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
          className="lg:col-span-2 border-red-200"
        >
          {data?.overdueList?.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">All cases currently within SLA resolution targets!</p>
              <p className="text-slate-400 mt-0.5">No unresolved complaints past deadline.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="pb-2.5">Case ID</th>
                    <th className="pb-2.5">Title & Institution</th>
                    <th className="pb-2.5">Bureau</th>
                    <th className="pb-2.5">Priority</th>
                    <th className="pb-2.5 text-right">Overdue By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.overdueList?.slice(0, 5).map((caseItem) => (
                    <tr key={caseItem._id} className="hover:bg-red-50/40 transition-colors">
                      <td className="py-2.5 font-mono font-bold text-red-600">
                        <Link to={`/complaints/${caseItem._id}`} className="hover:underline">
                          {caseItem.referenceId}
                        </Link>
                      </td>
                      <td className="py-2.5 max-w-xs">
                        <p className="font-bold text-slate-800 truncate">{caseItem.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">{caseItem.institutionName}</p>
                      </td>
                      <td className="py-2.5 text-slate-600">{caseItem.departmentName}</td>
                      <td className="py-2.5">
                        <PriorityBadge priority={caseItem.priority} />
                      </td>
                      <td className="py-2.5 text-right font-bold text-red-600">
                        +{caseItem.daysOverdue} days
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Live Recent Activity Feed */}
        <Card title="Live Activity Feed" subtitle="Latest status transitions and audit events">
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {data?.recentActivity?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No recent activity.</p>
            ) : (
              data?.recentActivity?.map((act, index) => (
                <div key={act._id || index} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-bold text-slate-700">{act.changedByName || 'Officer'}</span>
                    <span className="font-mono">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="font-semibold text-slate-800">
                    {act.action.replace(/_/g, ' ')}{' '}
                    {act.complaint?.referenceId && (
                      <Link to={`/complaints/${act.complaint._id}`} className="text-blue-600 hover:underline font-mono">
                        [{act.complaint.referenceId}]
                      </Link>
                    )}
                  </p>
                  {act.reason && <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{act.reason}</p>}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
