import React from 'react';
import { Badge } from '../common/Badge';

export const PriorityBadge = ({ priority }) => {
  switch (priority) {
    case 'Critical':
      return (
        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
          <span>Critical (48h)</span>
        </span>
      );
    case 'High':
      return <Badge variant="red">High (7d)</Badge>;
    case 'Medium':
      return <Badge variant="amber">Medium (14d)</Badge>;
    case 'Low':
      return <Badge variant="neutral">Low (30d)</Badge>;
    default:
      return <Badge variant="neutral">{priority || 'Normal'}</Badge>;
  }
};
