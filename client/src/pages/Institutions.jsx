import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { School, Search, Filter, Plus, Edit, CheckCircle, MapPin, Mail, Phone } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Pagination } from '../components/common/Pagination';
import { Spinner } from '../components/common/Spinner';

export const Institutions = () => {
  const { user } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const [institutions, setInstitutions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [state, setState] = useState('All');
  const [page, setPage] = useState(1);

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getInstitutions({
        page,
        limit: 12,
        search,
        state: state !== 'All' ? state : undefined,
      });
      if (res.data.success) {
        setInstitutions(res.data.institutions || []);
        setPagination(res.data.pagination);
      }
    } catch {
      toastError('Failed to load institutions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, [page, state]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchInstitutions();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Approved Institutions Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered educational institutions with AICTE Permanent Identification Numbers
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="p-4 bg-white border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search by institution name, AICTE ID, district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
          <Select value={state} onChange={(e) => { setState(e.target.value); setPage(1); }}>
            <option value="All">All Indian States</option>
            <option value="Delhi">Delhi</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
          </Select>
          <Button type="submit" size="sm" icon={Filter}>
            Filter Directory
          </Button>
        </form>
      </Card>

      {/* Grid */}
      {loading ? (
        <Spinner className="py-16" />
      ) : institutions.length === 0 ? (
        <div className="p-12 text-center text-slate-400">
          <School className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
          <p className="text-sm font-semibold text-slate-700">No institutions match the filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {institutions.map((inst) => (
            <Card key={inst._id} className="p-5 flex flex-col justify-between border border-slate-200 hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                    AICTE: {inst.aicteId}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {inst.type}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 line-clamp-2 mb-2 leading-snug">
                  {inst.name}
                </h3>

                <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                  <div className="flex items-center space-x-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{inst.district}, {inst.state}</span>
                  </div>
                  {inst.contactEmail && (
                    <div className="flex items-center space-x-1.5 text-slate-500 truncate">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{inst.contactEmail}</span>
                    </div>
                  )}
                  {inst.contactPhone && (
                    <div className="flex items-center space-x-1.5 text-slate-500">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{inst.contactPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Total Cases Filed:</span>
                <span className="font-bold text-slate-800">{inst.complaintCount || 0}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        onPageChange={(p) => setPage(p)}
        limit={12}
      />
    </div>
  );
};
