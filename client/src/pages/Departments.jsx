import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Building2, Plus, Edit, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Spinner } from '../components/common/Spinner';

export const Departments = () => {
  const { user } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    slaDaysDefault: 14,
    categories: '',
  });

  const fetchDepts = async () => {
    try {
      const res = await adminApi.getDepartments();
      if (res.data.success) {
        setDepartments(res.data.departments || []);
      }
    } catch {
      toastError('Failed to load bureaus');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleOpenModal = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        name: dept.name,
        code: dept.code,
        description: dept.description || '',
        slaDaysDefault: dept.slaDaysDefault || 14,
        categories: (dept.categories || []).join(', '),
      });
    } else {
      setEditingDept(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        slaDaysDefault: 14,
        categories: '',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        slaDaysDefault: Number(formData.slaDaysDefault),
        categories: formData.categories
          ? formData.categories.split(',').map((c) => c.trim()).filter(Boolean)
          : [],
      };

      if (editingDept) {
        await adminApi.updateDepartment(editingDept._id, payload);
        toastSuccess('Bureau updated successfully');
      } else {
        await adminApi.createDepartment(payload);
        toastSuccess('Bureau created successfully');
      }
      setModalOpen(false);
      fetchDepts();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to save bureau');
    }
  };

  if (loading) return <Spinner size="lg" className="min-h-[60vh]" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            AICTE Bureaus & Specialized Cells
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Directory of regulatory divisions, target resolution targets, and active caseload
          </p>
        </div>

        {user?.role === 'admin' && (
          <Button size="sm" onClick={() => handleOpenModal()} icon={Plus}>
            Add AICTE Bureau
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept) => (
          <Card key={dept._id} className="p-5 flex flex-col justify-between border border-slate-200">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {dept.code}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">{dept.name}</h3>
                    <p className="text-[11px] text-slate-500 font-mono">Code: {dept.code}</p>
                  </div>
                </div>

                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleOpenModal(dept)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                {dept.description || 'Dedicated AICTE bureau for grievance redressal and regulatory compliance.'}
              </p>

              {/* Badges / Metrics */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 mb-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Caseload</span>
                  <p className="font-bold text-slate-800 text-sm">{dept.openCases || 0} open</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Target SLA</span>
                  <p className="font-bold text-indigo-700 text-sm">{dept.slaDaysDefault} days</p>
                </div>
              </div>

              {/* Head Officer */}
              <div className="text-[11px] text-slate-500">
                Lead Officer:{' '}
                <strong className="text-slate-800">
                  {dept.headOfficer ? `${dept.headOfficer.name} (${dept.headOfficer.designation || 'Director'})` : 'Bureau Pool'}
                </strong>
              </div>
            </div>

            {/* Categories */}
            {dept.categories && dept.categories.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1">
                {dept.categories.slice(0, 3).map((cat, idx) => (
                  <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingDept ? 'Edit AICTE Bureau' : 'Create AICTE Bureau'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Bureau / Cell Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Approval Bureau"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Bureau Code"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. AB"
            />
            <Input
              label="Default Target SLA (Days)"
              type="number"
              min="1"
              max="90"
              required
              value={formData.slaDaysDefault}
              onChange={(e) => setFormData({ ...formData, slaDaysDefault: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description & Jurisdiction
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Input
            label="Handled Categories (Comma-separated)"
            value={formData.categories}
            onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
            placeholder="Affiliation, Scrutiny, EoA, Intake"
          />

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit">Save Bureau</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
