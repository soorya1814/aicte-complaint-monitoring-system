import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">404 — Page Not Found</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          The requested page URL does not exist or has been relocated within the AICTE grievance management portal.
        </p>
        <Link to="/dashboard">
          <Button size="sm" icon={ArrowLeft} className="mt-2">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
