import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { complaintApi } from '../api/complaintApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  FileText,
  Clock,
  Building2,
  User,
  School,
  Calendar,
  AlertTriangle,
  RotateCcw,
  UserCheck,
  CheckCircle,
  ArrowLeft,
  Lock,
  Sparkles,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Spinner } from '../components/common/Spinner';
import { StatusBadge } from '../components/complaints/StatusBadge';
import { PriorityBadge } from '../components/complaints/PriorityBadge';
import { ComplaintTimeline } from '../components/complaints/ComplaintTimeline';
import { MessageThread } from '../components/complaints/MessageThread';
import { AssignOfficerModal } from '../components/complaints/AssignOfficerModal';
import { StatusChangeModal } from '../components/complaints/StatusChangeModal';
import { format } from 'date-fns';

export const ComplaintDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toastSuccess, toastError } = useToast();

  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [reopening, setReopening] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await complaintApi.getComplaintById(id);
      if (res.data.success) {
        setComplaint(res.data.complaint);
        setHistory(res.data.history || []);
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to fetch complaint detail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleSendMessage = async ({ message, isInternal }) => {
    setSendingMsg(true);
    try {
      const res = await complaintApi.addMessage(id, { message, isInternal });
      if (res.data.success) {
        toastSuccess(res.data.message);
        fetchDetail();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to post message');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleReopen = async (e) => {
    e.preventDefault();
    if (reopenReason.trim().length < 10) {
      toastError('Please provide a detailed reason (at least 10 characters) to reopen this case.');
      return;
    }

    setReopening(true);
    try {
      const res = await complaintApi.reopenComplaint(id, { reason: reopenReason.trim() });
      if (res.data.success) {
        toastSuccess(res.data.message);
        setReopenModalOpen(false);
        fetchDetail();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to reopen case');
    } finally {
      setReopening(false);
    }
  };

  if (loading) return <Spinner size="lg" className="min-h-[60vh]" />;
  if (!complaint) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p className="font-bold text-slate-800">Complaint Record Not Found</p>
        <Link to="/complaints">
          <Button variant="outline" size="sm" className="mt-3">
            Back to Complaints
          </Button>
        </Link>
      </div>
    );
  }

  const canManageStatus = user?.role === 'admin' || user?.role === 'officer';
  const canReopen =
    (user?.role === 'institution' || user?.role === 'admin') &&
    (complaint.status === 'Resolved' || complaint.status === 'Closed');

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <Link
            to="/complaints"
            className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-base font-black text-blue-700">{complaint.referenceId}</span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
              {complaint.isOverdue && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>SLA Overdue</span>
                </span>
              )}
            </div>
            <h1 className="text-lg font-bold text-slate-900 mt-1">{complaint.title}</h1>
          </div>
        </div>

        {/* Action Buttons for Authorized Roles */}
        <div className="flex items-center flex-wrap gap-2">
          {canManageStatus && (
            <>
              <Button size="sm" variant="outline" onClick={() => setAssignModalOpen(true)} icon={UserCheck}>
                Assign Officer
              </Button>
              <Button size="sm" onClick={() => setStatusModalOpen(true)}>
                Change Status
              </Button>
            </>
          )}

          {canReopen && (
            <Button size="sm" variant="danger" onClick={() => setReopenModalOpen(true)} icon={RotateCcw}>
              Reopen Case
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Case Overview & Communications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case Narrative Card */}
          <Card title="Grievance Details & Factual Background">
            <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
              {complaint.description}
            </p>

            {/* AI Summary Banner if present */}
            {complaint.aiSummary && (
              <div className="mt-4 p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-xl">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-900 mb-1">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>AI Executive Briefing</span>
                </div>
                <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                  {complaint.aiSummary}
                </div>
              </div>
            )}

            {/* Resolution Summary if resolved */}
            {complaint.status === 'Resolved' && complaint.resolutionSummary && (
              <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900 mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Official Bureau Resolution Summary</span>
                </div>
                <p className="text-xs text-emerald-950 whitespace-pre-wrap leading-relaxed">
                  {complaint.resolutionSummary}
                </p>
              </div>
            )}

            {/* Reopen note if reopened */}
            {complaint.status === 'Reopened' && complaint.reopenReason && (
              <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900 mb-1">
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  <span>Case Reopen Grounds</span>
                </div>
                <p className="text-xs text-amber-950 leading-relaxed">{complaint.reopenReason}</p>
              </div>
            )}
          </Card>

          {/* Public Clarifications & Confidential Officer Notes */}
          <MessageThread
            messages={messages}
            onSendMessage={handleSendMessage}
            isSending={sendingMsg}
            currentUserRole={user?.role}
          />
        </div>

        {/* Right Column: Metadata, Institution, and Status History Timeline */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <Card title="Case File Metadata">
            <dl className="divide-y divide-slate-100 text-xs">
              <div className="py-2 flex justify-between">
                <dt className="text-slate-500 font-medium">Category:</dt>
                <dd className="font-semibold text-slate-800 text-right">{complaint.category}</dd>
              </div>

              {complaint.subcategory && (
                <div className="py-2 flex justify-between">
                  <dt className="text-slate-500 font-medium">Subcategory:</dt>
                  <dd className="font-semibold text-slate-800 text-right">{complaint.subcategory}</dd>
                </div>
              )}

              <div className="py-2 flex justify-between">
                <dt className="text-slate-500 font-medium">Assigned Bureau:</dt>
                <dd className="font-semibold text-blue-700 text-right">
                  {complaint.department?.name || 'Unassigned (General Pool)'}
                </dd>
              </div>

              <div className="py-2 flex justify-between">
                <dt className="text-slate-500 font-medium">Responsible Officer:</dt>
                <dd className="font-semibold text-slate-800 text-right">
                  {complaint.assignedOfficer?.name || 'Pending Bureau Assignment'}
                </dd>
              </div>

              <div className="py-2 flex justify-between">
                <dt className="text-slate-500 font-medium">Lodged On:</dt>
                <dd className="font-mono text-slate-700">
                  {complaint.submissionDate ? format(new Date(complaint.submissionDate), 'dd MMM yyyy') : 'N/A'}
                </dd>
              </div>

              <div className="py-2 flex justify-between">
                <dt className="text-slate-500 font-medium">Resolution Target:</dt>
                <dd className={`font-mono font-bold ${complaint.isOverdue ? 'text-red-600' : 'text-slate-800'}`}>
                  {complaint.deadline ? format(new Date(complaint.deadline), 'dd MMM yyyy') : 'N/A'}
                </dd>
              </div>
            </dl>
          </Card>

          {/* Institution Information Card */}
          <Card title="Institution Information">
            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-900 text-sm">{complaint.institution?.name}</p>
              <p className="text-slate-500 font-mono">
                AICTE Permanent ID: <strong className="text-slate-800">{complaint.institution?.aicteId}</strong>
              </p>
              <p className="text-slate-600">
                {complaint.institution?.district}, {complaint.institution?.state}
              </p>
              {complaint.institution?.contactEmail && (
                <p className="text-slate-500">
                  Email: <span className="font-medium text-slate-700">{complaint.institution?.contactEmail}</span>
                </p>
              )}
            </div>
          </Card>

          {/* Chronological Audit Timeline */}
          <Card title="Lifecycle Audit Timeline">
            <ComplaintTimeline history={history} />
          </Card>
        </div>
      </div>

      {/* Assignment Modal */}
      {canManageStatus && (
        <AssignOfficerModal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          complaint={complaint}
          onAssigned={async (data) => {
            await complaintApi.assignComplaint(complaint._id, data);
            fetchDetail();
          }}
        />
      )}

      {/* Status Change Modal */}
      {canManageStatus && (
        <StatusChangeModal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          complaint={complaint}
          onStatusUpdated={async (data) => {
            await complaintApi.updateStatus(complaint._id, data);
            fetchDetail();
          }}
        />
      )}

      {/* Reopen Modal */}
      <Modal isOpen={reopenModalOpen} onClose={() => setReopenModalOpen(false)} title="Reopen Resolved Case">
        <form onSubmit={handleReopen} className="space-y-4">
          <p className="text-xs text-slate-600">
            Explain the detailed reason or ongoing deficiency requiring further bureau examination:
          </p>
          <textarea
            rows={4}
            required
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
            placeholder="Specify why the previous resolution was unsatisfactory or what grounds persist (minimum 10 characters)..."
            className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" onClick={() => setReopenModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={reopening} variant="danger">
              Confirm Reopen
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
