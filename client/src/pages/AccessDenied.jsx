import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const AccessDenied = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">403 — Access Denied</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          You do not possess the required role permissions to access this administrative bureau resource.
          If you believe this is in error, contact your AICTE System Administrator.
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
