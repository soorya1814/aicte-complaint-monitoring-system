import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Input } from '../common/Input';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';

export const AssignOfficerModal = ({ isOpen, onClose, complaint, onAssigned }) => {
  const [departments, setDepartments] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [deadline, setDeadline] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { toastSuccess, toastError } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Load departments
      adminApi.getDepartments().then((res) => {
        if (res.data.success) {
          setDepartments(res.data.departments || []);
        }
      });

      if (complaint) {
        setSelectedDept(complaint.department?._id || '');
        setSelectedOfficer(complaint.assignedOfficer?._id || '');
        setPriority(complaint.priority || 'Medium');
        if (complaint.deadline) {
          setDeadline(new Date(complaint.deadline).toISOString().split('T')[0]);
        }
      }
    }
  }, [isOpen, complaint]);

  useEffect(() => {
    if (selectedDept) {
      adminApi.getOfficers({ departmentId: selectedDept }).then((res) => {
        if (res.data.success) {
          setOfficers(res.data.officers || []);
        }
      });
    } else {
      setOfficers([]);
    }
  }, [selectedDept]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAssigned({
        departmentId: selectedDept,
        assignedOfficerId: selectedOfficer || null,
        priority,
        deadline: deadline || undefined,
        note,
      });
      toastSuccess('Officer and Bureau assignment updated successfully.');
      onClose();
    } catch (err) {
      toastError(err.response?.data?.message || 'Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Officer & Target Resolution">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Target AICTE Bureau"
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          required
        >
          <option value="">-- Select AICTE Bureau --</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name} ({d.code})
            </option>
          ))}
        </Select>

        <Select
          label="Responsible Officer"
          value={selectedOfficer}
          onChange={(e) => setSelectedOfficer(e.target.value)}
        >
          <option value="">-- Unassigned (Bureau Pool) --</option>
          {officers.map((o) => (
            <option key={o._id} value={o._id}>
              {o.name} — {o.designation || 'Officer'}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Priority Level"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="Low">Low (30 Days SLA)</option>
            <option value="Medium">Medium (14 Days SLA)</option>
            <option value="High">High (7 Days SLA)</option>
            <option value="Critical">Critical (48 Hours Urgent)</option>
          </Select>

          <Input
            label="Resolution Deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Assignment Remarks / Instructions
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add context or directives for the assigned officer..."
            className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save Assignment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
