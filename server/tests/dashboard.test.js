import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';
import { Institution } from '../src/models/Institution.js';
import { Department } from '../src/models/Department.js';
import { Complaint } from '../src/models/Complaint.js';

const app = createApp();

describe('Dashboard Analytics API', () => {
  let adminToken, officerToken;

  beforeEach(async () => {
    const dept = await Department.create({ name: 'Approval Bureau', code: 'AB' });
    const inst = await Institution.create({ name: 'Tech College', aicteId: '1-99999', state: 'Delhi', district: 'Delhi' });

    const admin = await User.create({ name: 'Admin', email: 'admin@dash.gov.in', password: 'Password@123', role: 'admin' });
    const officer = await User.create({ name: 'Officer', email: 'officer@dash.gov.in', password: 'Password@123', role: 'officer', department: dept._id });

    const loginAdmin = await request(app).post('/api/auth/login').send({ email: 'admin@dash.gov.in', password: 'Password@123' });
    adminToken = loginAdmin.body.token;

    const loginOfficer = await request(app).post('/api/auth/login').send({ email: 'officer@dash.gov.in', password: 'Password@123' });
    officerToken = loginOfficer.body.token;

    // Create 3 sample complaints
    await Complaint.create([
      {
        referenceId: 'AICTE-2026-00001',
        title: 'New Case 1',
        description: 'Case description 1 long enough for test',
        institution: inst._id,
        submittedBy: admin._id,
        department: dept._id,
        status: 'Submitted',
        category: 'Affiliation & Approval',
        priority: 'Medium',
      },
      {
        referenceId: 'AICTE-2026-00002',
        title: 'Resolved Case 2',
        description: 'Case description 2 long enough for test',
        institution: inst._id,
        submittedBy: admin._id,
        department: dept._id,
        status: 'Resolved',
        resolvedAt: new Date(),
        category: 'Affiliation & Approval',
        priority: 'High',
      },
      {
        referenceId: 'AICTE-2026-00003',
        title: 'Overdue Case 3',
        description: 'Case description 3 long enough for test',
        institution: inst._id,
        submittedBy: admin._id,
        department: dept._id,
        status: 'In Progress',
        deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days past deadline
        category: 'Affiliation & Approval',
        priority: 'Critical',
      },
    ]);
  });

  it('should return aggregated KPI cards and charts for admin', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary?dateRange=all')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.kpis).toBeDefined();
    expect(res.body.kpis.totalComplaints).toBe(3);
    expect(res.body.kpis.resolvedComplaints).toBe(1);
    expect(res.body.kpis.overdueComplaints).toBe(1);
    expect(res.body.charts).toBeDefined();
    expect(res.body.charts.statusDistribution.length).toBeGreaterThan(0);
    expect(res.body.overdueList.length).toBe(1);
  });
});
