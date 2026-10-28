import React, { useState } from 'react';
import { Sparkles, Brain, Check, Copy, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const AiAssistantDrawer = ({
  analysis,
  similar = [],
  onApplyCategory,
  onApplyPriority,
  onApplyDepartment,
}) => {
  const [copied, setCopied] = useState(false);

  if (!analysis) return null;

  const handleCopySummary = () => {
    if (analysis.aiSummary) {
      navigator.clipboard.writeText(analysis.aiSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/70 border border-indigo-200 rounded-xl p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-indigo-100">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">AI Decision-Support Insights</h4>
            <p className="text-[11px] text-slate-500">
              Provider: <span className="font-mono text-indigo-700 font-medium capitalize">{analysis.provider || 'Rule-Based NLP'}</span> (
              {analysis.confidenceScore || 90}% confidence)
            </p>
          </div>
        </div>

        <Badge variant="blue" size="xs">Reviewable Suggestions</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Suggested Bureau & Routing */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
              Suggested Bureau Routing
            </span>
            {onApplyDepartment && analysis.suggestedDepartment && (
              <button
                type="button"
                onClick={() => onApplyDepartment(analysis.suggestedDepartment)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <span>Apply</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="font-bold text-slate-800 text-xs flex items-center space-x-2">
            <span>{analysis.suggestedDepartment?.name || 'Grievance Redressal Cell'}</span>
            <span className="text-xs font-mono text-indigo-600">
              ({analysis.suggestedDepartment?.code || 'GRC'})
            </span>
          </div>
        </div>

        {/* Suggested Priority & Rationale */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
              Suggested Priority
            </span>
            {onApplyPriority && analysis.suggestedPriority && (
              <button
                type="button"
                onClick={() => onApplyPriority(analysis.suggestedPriority)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <span>Apply</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xs text-slate-800">{analysis.suggestedPriority}</span>
          </div>
        </div>
      </div>

      {/* Rationale explanation */}
      {analysis.priorityRationale && (
        <div className="mt-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-xs text-slate-700 leading-relaxed">
          <strong className="text-indigo-900 font-semibold">Priority Rationale: </strong>
          {analysis.priorityRationale}
        </div>
      )}

      {/* Executive Summary */}
      {analysis.aiSummary && (
        <div className="mt-3 bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 flex items-center space-x-1">
              <Brain className="w-3.5 h-3.5 text-purple-600" />
              <span>Officer TL;DR Briefing Summary</span>
            </span>
            <button
              onClick={handleCopySummary}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center space-x-1"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans bg-slate-50 p-2.5 rounded border border-slate-100">
            {analysis.aiSummary}
          </div>
        </div>
      )}

      {/* Similar Complaints */}
      {similar && similar.length > 0 && (
        <div className="mt-3 bg-white p-3.5 rounded-lg border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Similar Precedent Cases Detected ({similar.length})</span>
            </span>
          </div>
          <div className="space-y-1.5">
            {similar.map((s) => (
              <a
                key={s._id}
                href={`/complaints/${s._id}`}
                className="flex items-center justify-between p-2 rounded hover:bg-slate-50 border border-slate-100 text-xs transition-colors"
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className="font-mono font-semibold text-blue-600">{s.referenceId}</span>
                  <span className="truncate text-slate-700">{s.title}</span>
                </div>
                <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-full shrink-0">
                  {s.similarityScore}% match
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
