import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { useToast } from '../../context/ToastContext';

export const StatusChangeModal = ({ isOpen, onClose, complaint, onStatusUpdated }) => {
  const [status, setStatus] = useState(complaint?.status || 'In Progress');
  const [reason, setReason] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const { toastSuccess, toastError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'Resolved' && !resolutionSummary.trim()) {
      toastError('Please provide a resolution summary describing how the grievance was resolved.');
      return;
    }

    setLoading(true);
    try {
      await onStatusUpdated({
        status,
        reason: reason.trim(),
        resolutionSummary: status === 'Resolved' ? resolutionSummary.trim() : undefined,
      });
      toastSuccess(`Complaint status successfully updated to ${status}`);
      onClose();
    } catch (err) {
      toastError(err.response?.data?.message || 'Status transition failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Complaint Lifecycle Status">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="New Complaint Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          required
        >
          <option value="Under Review">Under Review (Initial Examination)</option>
          <option value="In Progress">In Progress (Active Investigation)</option>
          <option value="Awaiting Institution Response">Awaiting Institution Response (Clarification Requested)</option>
          <option value="Resolved">Resolved (Resolution Complete)</option>
          <option value="Closed">Closed (Case Formally Archived)</option>
        </Select>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Transition Rationale / Public Comment
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain reason for this status change (visible to institution)..."
            className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {status === 'Resolved' && (
          <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-200">
            <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1.5">
              Official Resolution Summary *
            </label>
            <textarea
              rows={3}
              value={resolutionSummary}
              onChange={(e) => setResolutionSummary(e.target.value)}
              placeholder="State the formal resolution, official directive issued, or compliance fulfilled..."
              required
              className="w-full text-xs rounded-lg border border-emerald-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>
        )}

        <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={loading} variant={status === 'Resolved' ? 'success' : 'primary'}>
            Confirm Status Change
          </Button>
        </div>
      </form>
    </Modal>
  );
};
