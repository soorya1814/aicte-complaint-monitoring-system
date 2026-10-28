import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintApi } from '../api/complaintApi';
import { aiApi } from '../api/aiApi';
import { adminApi } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  FileText,
  Sparkles,
  AlertTriangle,
  Send,
  Upload,
  Building2,
  CheckCircle2,
  Brain,
  HelpCircle,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { AiAssistantDrawer } from '../components/complaints/AiAssistantDrawer';

export const SubmitComplaint = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toastSuccess, toastError, toastWarning } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Affiliation & Approval',
    subcategory: '',
    priority: 'Medium',
    departmentId: '',
    institutionId: '',
  });

  const [departments, setDepartments] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [similarCases, setSimilarCases] = useState([]);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const categories = [
    'Affiliation & Approval',
    'Curriculum & Faculty Norms',
    'Grant & Funding Disbursal',
    'Fee Structure & Refund',
    'Ragging & Student Safety',
    'Scholarships (Pragati/Saksham/PMSSS)',
    'Research Grants & Faculty Development',
    'Administration & RTI',
    'General Grievance',
  ];

  useEffect(() => {
    adminApi.getDepartments().then((res) => {
      if (res.data.success) {
        setDepartments(res.data.departments || []);
      }
    });

    if (user?.role === 'admin') {
      adminApi.getInstitutions({ limit: 100 }).then((res) => {
        if (res.data.success) {
          setInstitutions(res.data.institutions || []);
        }
      });
    }
  }, [user]);

  // Run AI analysis manually or upon request
  const handleRunAiAnalysis = async () => {
    if (!formData.title && !formData.description) {
      toastWarning('Please enter a title or description before triggering AI analysis.');
      return;
    }

    setAnalyzingAi(true);
    try {
      const res = await aiApi.analyzeText({
        title: formData.title,
        description: formData.description,
      });

      if (res.data.success) {
        setAiResult(res.data.data);
        toastSuccess('AI analysis complete! Review suggestions below.');

        // Search similar complaints
        if (formData.title) {
          const simRes = await aiApi.getSimilarComplaints({
            title: formData.title,
            category: res.data.data.suggestedCategory || formData.category,
          });
          if (simRes.data.success) {
            setSimilarCases(simRes.data.data || []);
          }
        }
      }
    } catch (err) {
      toastError('AI assistance unavailable right now.');
    } finally {
      setAnalyzingAi(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.title.length < 5) {
      toastError('Title must be at least 5 characters');
      return;
    }
    if (formData.description.length < 20) {
      toastError('Description must be at least 20 characters');
      return;
    }

    setSubmitting(true);
    try {
      const res = await complaintApi.createComplaint(formData);
      if (res.data.success) {
        toastSuccess(res.data.message);
        if (res.data.potentialDuplicateWarning) {
          toastWarning(res.data.potentialDuplicateWarning);
        }
        navigate(`/complaints/${res.data.complaint._id}`);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to submit grievance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Lodge Official Grievance Case
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Submit formal institution representation for review by AICTE Directorates & Cells
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Main Complaint Form */}
        <Card className="p-6 border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* If Admin, select which institution this is filed for */}
            {user?.role === 'admin' && (
              <Select
                label="Filing on behalf of Institution (Admin Override)"
                value={formData.institutionId}
                onChange={(e) => setFormData({ ...formData, institutionId: e.target.value })}
                required
              >
                <option value="">-- Select Target Institution --</option>
                {institutions.map((i) => (
                  <option key={i._id} value={i._id}>
                    {i.name} ({i.aicteId}) - {i.state}
                  </option>
                ))}
              </Select>
            )}

            {/* Title */}
            <div>
              <Input
                label="Grievance Title / Subject"
                name="title"
                required
                placeholder="e.g. Delay in Approval Scrutiny Clearance for New Academic Year"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                helperText="Provide a clear, specific headline describing the core regulatory or institutional grievance."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Description & Factual Grounds *
              </label>
              <textarea
                rows={6}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detail the complete chronologic history, portal application dates, specific regulatory references, and relief sought..."
                className="w-full text-xs rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
              <p className="mt-1 text-[11px] text-slate-400">Minimum 20 characters.</p>
            </div>

            {/* AI Assistant Button Trigger */}
            <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200/80">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">AI Category & Bureau Routing Assistant</h4>
                  <p className="text-[11px] text-slate-500">
                    Auto-evaluates priority, category, and matching precedent cases
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleRunAiAnalysis}
                loading={analyzingAi}
                icon={Sparkles}
                className="bg-white hover:bg-slate-50 border-indigo-200 text-indigo-700 font-bold"
              >
                Analyze Grievance
              </Button>
            </div>

            {/* AI Result Drawer */}
            {aiResult && (
              <AiAssistantDrawer
                analysis={aiResult}
                similar={similarCases}
                onApplyCategory={(cat) => setFormData((prev) => ({ ...prev, category: cat }))}
                onApplyPriority={(prio) => setFormData((prev) => ({ ...prev, priority: prio }))}
                onApplyDepartment={(dept) => setFormData((prev) => ({ ...prev, departmentId: dept._id }))}
              />
            )}

            {/* Category and Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Complaint Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>

              <Input
                label="Subcategory / Scheme Reference (Optional)"
                placeholder="e.g. B.Tech Approval / PMSSS Portal"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              />
            </div>

            {/* Priority & Target Bureau */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Requested Priority Level"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Low">Low Priority (30 Days Target)</option>
                <option value="Medium">Medium Priority (14 Days Target)</option>
                <option value="High">High Priority (7 Days Target)</option>
                <option value="Critical">Critical Urgent (48 Hours Target)</option>
              </Select>

              <Select
                label="Target AICTE Bureau / Cell"
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              >
                <option value="">-- Auto-Route Based on Category --</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </Select>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
              <Button type="button" variant="ghost" onClick={() => navigate('/complaints')}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting} size="lg" icon={Send}>
                Submit Complaint & Generate Tracking ID
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
