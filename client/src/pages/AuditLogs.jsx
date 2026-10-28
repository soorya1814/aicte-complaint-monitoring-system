import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { useToast } from '../context/ToastContext';
import { History, Search, Shield, Filter } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { Pagination } from '../components/common/Pagination';
import { Spinner } from '../components/common/Spinner';
import { format } from 'date-fns';

export const AuditLogs = () => {
  const { toastError } = useToast();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [action, setAction] = useState('All');
  const [resourceType, setResourceType] = useState('All');
  const [userEmail, setUserEmail] = useState('');
  const [page, setPage] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAuditLogs({
        page,
        limit: 20,
        action: action !== 'All' ? action : undefined,
        resourceType: resourceType !== 'All' ? resourceType : undefined,
        userEmail: userEmail.trim() || undefined,
      });

      if (res.data.success) {
        setLogs(res.data.logs || []);
        setPagination(res.data.pagination);
      }
    } catch {
      toastError('Failed to fetch audit records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, action, resourceType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          System Security & Operational Audit Log
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Immutable audit record of user logins, case modifications, status updates, and administrative exports
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
          <Input
            placeholder="Search by user email..."
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
          />

          <Select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}>
            <option value="All">All Audit Actions</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
            <option value="COMPLAINT_CREATED">COMPLAINT_CREATED</option>
            <option value="STATUS_UPDATED">STATUS_UPDATED</option>
            <option value="OFFICER_ASSIGNED">OFFICER_ASSIGNED</option>
            <option value="COMPLAINT_REOPENED">COMPLAINT_REOPENED</option>
            <option value="EXPORT_CSV">EXPORT_CSV</option>
          </Select>

          <Select value={resourceType} onChange={(e) => { setResourceType(e.target.value); setPage(1); }}>
            <option value="All">All Resource Types</option>
            <option value="Complaint">Complaint</option>
            <option value="User">User</option>
            <option value="Department">Department</option>
            <option value="Institution">Institution</option>
            <option value="System">System</option>
          </Select>

          <Button type="submit" size="sm" icon={Filter}>
            Filter Audit Trail
          </Button>
        </form>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden p-0 border border-slate-200">
        {loading ? (
          <Spinner className="py-16" />
        ) : logs.length === 0 ? (
          <p className="p-12 text-center text-xs text-slate-400">No audit logs matching query.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {log.timestamp ? format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss') : 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-700">{log.action}</td>
                    <td className="py-3 px-4 text-slate-700">
                      <div>{log.userEmail || 'System'}</div>
                      <span className="text-[10px] text-slate-400 uppercase font-sans">({log.userRole || 'Daemon'})</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {log.resourceType}{' '}
                      {log.resourceId && <span className="text-[10px] text-slate-400">#{log.resourceId.slice(-6)}</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate font-sans text-[11px]">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            onPageChange={(p) => setPage(p)}
            limit={20}
          />
        </div>
      </Card>
    </div>
  );
};
