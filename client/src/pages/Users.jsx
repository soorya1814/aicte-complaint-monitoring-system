import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Users as UsersIcon, Search, Shield, UserCheck, School, Edit, Check, X } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { Spinner } from '../components/common/Spinner';

export const Users = () => {
  const { user: currentUser } = useAuth();
  const { toastSuccess, toastError } = useToast();

  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All');
  const [departmentId, setDepartmentId] = useState('All');
  const [page, setPage] = useState(1);

  // Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    role: 'officer',
    department: '',
    designation: '',
    isActive: true,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({
        page,
        limit: 15,
        search,
        role: role !== 'All' ? role : undefined,
        departmentId: departmentId !== 'All' ? departmentId : undefined,
      });

      if (res.data.success) {
        setUsers(res.data.users || []);
        setPagination(res.data.pagination);
      }
    } catch {
      toastError('Failed to fetch user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    adminApi.getDepartments().then((res) => {
      if (res.data.success) setDepartments(res.data.departments || []);
    });
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, role, departmentId]);

  const handleEditClick = (u) => {
    setSelectedUser(u);
    setEditForm({
      role: u.role,
      department: u.department?._id || '',
      designation: u.designation || '',
      isActive: u.isActive !== false,
    });
    setEditModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updateUser(selectedUser._id, editForm);
      toastSuccess('User account updated successfully');
      setEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      toastError(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            User Accounts & Role Permissions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage AICTE administrative officers, bureau investigators, and verified institutional representatives
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="p-4 bg-white border border-slate-200">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchUsers(); }} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search user by name, email, designation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <Select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
            <option value="All">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="officer">Bureau Officers</option>
            <option value="institution">Institution Representatives</option>
          </Select>
          <Button type="submit" size="sm">Search Directory</Button>
        </form>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden p-0 border border-slate-200">
        {loading ? (
          <Spinner className="py-16" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Bureau / Institution</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  let roleBadge = 'bg-blue-100 text-blue-800';
                  if (u.role === 'admin') roleBadge = 'bg-slate-900 text-white';
                  if (u.role === 'officer') roleBadge = 'bg-purple-100 text-purple-800';
                  if (u.role === 'institution') roleBadge = 'bg-amber-100 text-amber-800';

                  return (
                    <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800">{u.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${roleBadge}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{u.designation || 'N/A'}</td>
                      <td className="py-3 px-4 max-w-xs truncate">
                        {u.role === 'officer' && (
                          <span className="font-semibold text-purple-700">
                            {u.department ? `${u.department.name} (${u.department.code})` : 'Unassigned Bureau'}
                          </span>
                        )}
                        {u.role === 'institution' && (
                          <span className="font-semibold text-slate-700 truncate block">
                            {u.institution?.name || 'Unlinked Institution'}
                          </span>
                        )}
                        {u.role === 'admin' && <span className="text-slate-400">Headquarters HQ</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {u.isActive !== false ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>{u.isActive !== false ? 'Active' : 'Disabled'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(u)}
                          className="px-2 py-1 text-xs"
                          icon={Edit}
                        >
                          Modify
                        </Button>
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
            onPageChange={(p) => setPage(p)}
            limit={15}
          />
        </div>
      </Card>

      {/* Edit User Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Modify User Account & Permissions">
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg text-xs border border-slate-200">
            <p className="font-bold text-slate-900">{selectedUser?.name}</p>
            <p className="text-slate-500 font-mono">{selectedUser?.email}</p>
          </div>

          <Select
            label="User Role"
            value={editForm.role}
            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
          >
            <option value="institution">Institution User</option>
            <option value="officer">Department Officer</option>
            <option value="admin">System Administrator</option>
          </Select>

          {editForm.role === 'officer' && (
            <Select
              label="Assigned AICTE Bureau"
              value={editForm.department}
              onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
            >
              <option value="">-- Select Bureau --</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </Select>
          )}

          <Input
            label="Official Designation"
            value={editForm.designation}
            onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
          />

          <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={editForm.isActive}
              onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Account Active (Uncheck to suspend login permissions)</span>
          </label>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setEditModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
