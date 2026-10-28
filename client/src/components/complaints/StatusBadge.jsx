import React from 'react';
import { Badge } from '../common/Badge';

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'Submitted':
      return <Badge variant="blue">Submitted</Badge>;
    case 'Under Review':
      return <Badge variant="violet">Under Review</Badge>;
    case 'In Progress':
      return <Badge variant="violet">In Progress</Badge>;
    case 'Awaiting Institution Response':
      return <Badge variant="amber">Awaiting Response</Badge>;
    case 'Resolved':
      return <Badge variant="green">Resolved</Badge>;
    case 'Closed':
      return <Badge variant="neutral">Closed</Badge>;
    case 'Reopened':
      return <Badge variant="red">Reopened</Badge>;
    default:
      return <Badge variant="neutral">{status || 'Unknown'}</Badge>;
  }
};
