import { stringify } from 'csv-stringify';

export const exportComplaintsToCSV = (complaints, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="aicte_complaints_report_${Date.now()}.csv"`);

  const stringifier = stringify({
    header: true,
    columns: [
      { key: 'referenceId', header: 'Reference ID' },
      { key: 'title', header: 'Complaint Title' },
      { key: 'institutionName', header: 'Institution Name' },
      { key: 'aicteId', header: 'AICTE Permanent ID' },
      { key: 'state', header: 'State' },
      { key: 'category', header: 'Category' },
      { key: 'priority', header: 'Priority' },
      { key: 'status', header: 'Status' },
      { key: 'department', header: 'Assigned Bureau' },
      { key: 'assignedOfficer', header: 'Responsible Officer' },
      { key: 'submissionDate', header: 'Submission Date' },
      { key: 'deadline', header: 'Resolution Deadline' },
      { key: 'isOverdue', header: 'Is Overdue' },
      { key: 'resolvedAt', header: 'Resolution Date' },
    ],
  });

  stringifier.pipe(res);

  complaints.forEach((c) => {
    stringifier.write({
      referenceId: c.referenceId || '',
      title: c.title || '',
      institutionName: c.institution?.name || 'N/A',
      aicteId: c.institution?.aicteId || 'N/A',
      state: c.institution?.state || 'N/A',
      category: c.category || '',
      priority: c.priority || '',
      status: c.status || '',
      department: c.department?.name || 'Unassigned',
      assignedOfficer: c.assignedOfficer?.name || 'Unassigned',
      submissionDate: c.submissionDate ? new Date(c.submissionDate).toISOString().split('T')[0] : '',
      deadline: c.deadline ? new Date(c.deadline).toISOString().split('T')[0] : '',
      isOverdue: c.isOverdue ? 'YES' : 'NO',
      resolvedAt: c.resolvedAt ? new Date(c.resolvedAt).toISOString().split('T')[0] : 'N/A',
    });
  });

  stringifier.end();
};
