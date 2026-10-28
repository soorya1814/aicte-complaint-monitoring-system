import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { complaintApi } from '../api/complaintApi';
import { adminApi } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  Download,
  PlusCircle,
  Eye,
  AlertCircle,
  Clock,
  ArrowUpDown,
  Building2,
  Calendar,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Pagination } from '../components/common/Pagination';
import { Spinner } from '../components/common/Spinner';
import { StatusBadge } from '../components/complaints/StatusBadge';
import { PriorityBadge } from '../components/complaints/PriorityBadge';
import { format } from 'date-fns';

export const ComplaintsList = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [priority, setPriority] = useState(searchParams.get('priority') || 'All');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [departmentId, setDepartmentId] = useState(searchParams.get('departmentId') || '');
  const [isOverdue, setIsOverdue] = useState(searchParams.get('isOverdue') === 'true');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  useEffect(() => {
    adminApi.getDepartments().then((res) => {
      if (res.data.success) {
        setDepartments(res.data.departments || []);
      }
    });
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintApi.getComplaints({
        page,
        limit: 10,
        search,
        status: status !== 'All' ? status : undefined,
        priority: priority !== 'All' ? priority : undefined,
        category: category !== 'All' ? category : undefined,
        departmentId: departmentId || undefined,
        isOverdue: isOverdue ? 'true' : undefined,
        sortBy,
        sortOrder,
      });

      if (res.data.success) {
        setComplaints(res.data.complaints || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, status, priority, category, departmentId, isOverdue, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const handleExportCSV = () => {
    const url = complaintApi.exportCSVUrl({
      status: status !== 'All' ? status : undefined,
      priority: priority !== 'All' ? priority : undefined,
      category: category !== 'All' ? category : undefined,
      departmentId: departmentId || undefined,
    });
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Institutional Grievances & Case Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, track status, and inspect departmental resolution workflows
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Button variant="outline" size="sm" onClick={handleExportCSV} icon={Download}>
            Export Filtered CSV
          </Button>

          {(user?.role === 'institution' || user?.role === 'admin') && (
            <Link to="/complaints/new">
              <Button size="sm" icon={PlusCircle}>
                New Grievance
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filter and Search Panel */}
      <Card className="p-4 bg-white border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="md:col-span-2">
              <Input
                placeholder="Search reference ID, title, keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={Search}
              />
            </div>

            {/* Status Filter */}
            <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Awaiting Institution Response">Awaiting Response</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Reopened">Reopened</option>
            </Select>

            {/* Priority Filter */}
            <Select value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }}>
              <option value="All">All Priorities</option>
              <option value="Critical">Critical (48h)</option>
              <option value="High">High (7d)</option>
              <option value="Medium">Medium (14d)</option>
              <option value="Low">Low (30d)</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 items-center">
            {/* Bureau Filter */}
            <Select value={departmentId} onChange={(e) => { setDepartmentId(e.target.value); setPage(1); }}>
              <option value="">All AICTE Bureaus</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </Select>

            {/* Sort Field */}
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="createdAt">Sort: Submission Date</option>
              <option value="deadline">Sort: Resolution Deadline</option>
              <option value="priority">Sort: Priority Urgency</option>
              <option value="title">Sort: Case Title</option>
            </Select>

            {/* Overdue Checkbox */}
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isOverdue}
                onChange={(e) => { setIsOverdue(e.target.checked); setPage(1); }}
                className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4"
              />
              <span className="flex items-center space-x-1 text-red-700">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Show SLA Overdue Only</span>
              </span>
            </label>

            <div className="flex justify-end">
              <Button type="submit" size="sm" variant="secondary" icon={Filter}>
                Apply Filters
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Complaints Table */}
      <Card className="overflow-hidden p-0 border border-slate-200">
        {loading ? (
          <Spinner className="py-16" />
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
            <p className="text-sm font-semibold text-slate-700">No grievance records found.</p>
            <p className="text-xs text-slate-400 mt-1">Try modifying your search or clearing active filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Case ID</th>
                  <th className="py-3.5 px-4">Title & Details</th>
                  <th className="py-3.5 px-4">Institution</th>
                  <th className="py-3.5 px-4">Bureau</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Deadline</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((c) => {
                  const deadlineDate = c.deadline ? new Date(c.deadline) : null;
                  const isPastDeadline = c.isOverdue;

                  return (
                    <tr
                      key={c._id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isPastDeadline ? 'bg-red-50/30' : ''
                      }`}
                    >
                      {/* Case ID */}
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">
                        <Link to={`/complaints/${c._id}`} className="hover:underline">
                          {c.referenceId}
                        </Link>
                      </td>

                      {/* Title */}
                      <td className="py-3 px-4 max-w-xs">
                        <Link to={`/complaints/${c._id}`} className="font-bold text-slate-800 hover:text-blue-600 truncate block">
                          {c.title}
                        </Link>
                        <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                          {c.category}
                        </span>
                      </td>

                      {/* Institution */}
                      <td className="py-3 px-4 max-w-[160px] truncate">
                        <span className="font-semibold text-slate-700 truncate block">
                          {c.institution?.name || 'N/A'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {c.institution?.aicteId || 'N/A'}
                        </span>
                      </td>

                      {/* Department / Bureau */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700">
                          {c.department?.code || 'Unassigned'}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4">
                        <PriorityBadge priority={c.priority} />
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <StatusBadge status={c.status} />
                      </td>

                      {/* Deadline */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {deadlineDate ? (
                          <div className={isPastDeadline ? 'text-red-600 font-bold' : 'text-slate-600'}>
                            {format(deadlineDate, 'dd MMM yyyy')}
                            {isPastDeadline && <span className="block text-[9px] uppercase tracking-wide">Overdue</span>}
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <Link to={`/complaints/${c._id}`}>
                          <Button size="sm" variant="outline" className="px-2 py-1 text-xs" icon={Eye}>
                            Inspect
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </Card>
    </div>
  );
};
