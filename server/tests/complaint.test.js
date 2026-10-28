import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';
import { Institution } from '../src/models/Institution.js';
import { Department } from '../src/models/Department.js';
import { Complaint } from '../src/models/Complaint.js';

const app = createApp();

describe('Complaint Lifecycle & Permissions API', () => {
  let inst1, inst2;
  let instUser1, instUser2, officerUser, adminUser;
  let tokenInst1, tokenInst2, tokenOfficer, tokenAdmin;
  let deptApproval;

  beforeEach(async () => {
    // Create Institutions
    inst1 = await Institution.create({
      name: 'College Alpha',
      aicteId: '1-11111111',
      state: 'Delhi',
      district: 'Central',
    });

    inst2 = await Institution.create({
      name: 'College Beta',
      aicteId: '1-22222222',
      state: 'Maharashtra',
      district: 'Pune',
    });

    // Create Department
    deptApproval = await Department.create({
      name: 'Approval Bureau',
      code: 'AB',
      slaDaysDefault: 14,
    });

    // Create Users
    instUser1 = await User.create({
      name: 'Alpha Principal',
      email: 'alpha@test.edu',
      password: 'Password@123',
      role: 'institution',
      institution: inst1._id,
    });

    instUser2 = await User.create({
      name: 'Beta Principal',
      email: 'beta@test.edu',
      password: 'Password@123',
      role: 'institution',
      institution: inst2._id,
    });

    officerUser = await User.create({
      name: 'Officer Deshmukh',
      email: 'officer.ab@test.gov.in',
      password: 'Password@123',
      role: 'officer',
      department: deptApproval._id,
    });

    adminUser = await User.create({
      name: 'Admin Sharma',
      email: 'admin@test.gov.in',
      password: 'Password@123',
      role: 'admin',
    });

    // Logins to obtain tokens
    const loginInst1 = await request(app).post('/api/auth/login').send({ email: 'alpha@test.edu', password: 'Password@123' });
    tokenInst1 = loginInst1.body.token;

    const loginInst2 = await request(app).post('/api/auth/login').send({ email: 'beta@test.edu', password: 'Password@123' });
    tokenInst2 = loginInst2.body.token;

    const loginOfficer = await request(app).post('/api/auth/login').send({ email: 'officer.ab@test.gov.in', password: 'Password@123' });
    tokenOfficer = loginOfficer.body.token;

    const loginAdmin = await request(app).post('/api/auth/login').send({ email: 'admin@test.gov.in', password: 'Password@123' });
    tokenAdmin = loginAdmin.body.token;
  });

  it('should create a complaint with generated AICTE reference ID and initial status', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${tokenInst1}`)
      .send({
        title: 'Delay in annual EoA approval certificate',
        description: 'Detailed grievance report regarding EoA certificate delay on portal.',
        category: 'Affiliation & Approval',
        priority: 'High',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.complaint).toBeDefined();
    expect(res.body.complaint.referenceId).toMatch(/^AICTE-\d{4}-\d{5}$/);
    expect(res.body.complaint.status).toBe('Submitted');
    expect(res.body.complaint.deadline).toBeDefined();
  });

  it('should enforce strict institution-level data isolation', async () => {
    // Institution 1 creates complaint
    const createRes = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${tokenInst1}`)
      .send({
        title: 'Alpha Private Grievance Issue',
        description: 'Confidential institutional grievance details for Alpha.',
        category: 'General Grievance',
      });

    const complaintId = createRes.body.complaint._id;

    // Institution 2 attempts to fetch it directly
    const fetchRes = await request(app)
      .get(`/api/complaints/${complaintId}`)
      .set('Authorization', `Bearer ${tokenInst2}`);

    expect(fetchRes.status).toBe(403);
    expect(fetchRes.body.success).toBe(false);

    // Institution 2 complaint list must NOT include Institution 1's complaint
    const listRes = await request(app)
      .get('/api/complaints')
      .set('Authorization', `Bearer ${tokenInst2}`);

    expect(listRes.body.complaints.some((c) => c._id === complaintId)).toBe(false);
  });

  it('should allow officer to transition complaint status and add internal notes', async () => {
    const createRes = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${tokenInst1}`)
      .send({
        title: 'Approval inspection schedule enquiry',
        description: 'Enquiring on schedule for annual physical inspection.',
        category: 'Affiliation & Approval',
        departmentId: deptApproval._id,
      });

    const complaintId = createRes.body.complaint._id;

    // Officer updates status to In Progress
    const statusRes = await request(app)
      .patch(`/api/complaints/${complaintId}/status`)
      .set('Authorization', `Bearer ${tokenOfficer}`)
      .send({
        status: 'In Progress',
        reason: 'Inspection team roster prepared.',
      });

    expect(statusRes.status).toBe(200);
    expect(statusRes.body.complaint.status).toBe('In Progress');

    // Officer posts internal confidential note
    const noteRes = await request(app)
      .post(`/api/complaints/${complaintId}/messages`)
      .set('Authorization', `Bearer ${tokenOfficer}`)
      .send({
        message: 'Internal examiner note: check land deed before final inspection.',
        isInternal: true,
      });

    expect(noteRes.status).toBe(201);

    // When Institution views complaint, internal note MUST NOT be visible!
    const instView = await request(app)
      .get(`/api/complaints/${complaintId}`)
      .set('Authorization', `Bearer ${tokenInst1}`);

    expect(instView.body.messages.some((m) => m.isInternal === true)).toBe(false);

    // When Officer views complaint, internal note IS visible
    const officerView = await request(app)
      .get(`/api/complaints/${complaintId}`)
      .set('Authorization', `Bearer ${tokenOfficer}`);

    expect(officerView.body.messages.some((m) => m.isInternal === true)).toBe(true);
  });

  it('should allow reopening a resolved complaint with a mandatory reason', async () => {
    const complaint = await Complaint.create({
      referenceId: 'AICTE-2026-99999',
      title: 'Resolved Fee Grievance',
      description: 'Fee complaint that was closed previously.',
      category: 'Fee Structure & Refund',
      institution: inst1._id,
      submittedBy: instUser1._id,
      status: 'Resolved',
      resolvedAt: new Date(),
    });

    const reopenRes = await request(app)
      .post(`/api/complaints/${complaint._id}/reopen`)
      .set('Authorization', `Bearer ${tokenInst1}`)
      .send({
        reason: 'Fee refund credit has bounced due to invalid account IFSC code.',
      });

    expect(reopenRes.status).toBe(200);
    expect(reopenRes.body.complaint.status).toBe('Reopened');
    expect(reopenRes.body.complaint.reopenedCount).toBe(1);
  });
});
