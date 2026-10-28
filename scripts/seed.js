import mongoose from '../server/node_modules/mongoose/index.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../server/.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import models
import { User } from '../server/src/models/User.js';
import { Institution } from '../server/src/models/Institution.js';
import { Department } from '../server/src/models/Department.js';
import { Complaint } from '../server/src/models/Complaint.js';
import { ComplaintMessage } from '../server/src/models/ComplaintMessage.js';
import { ComplaintStatusHistory } from '../server/src/models/ComplaintStatusHistory.js';
import { Notification } from '../server/src/models/Notification.js';
import { AuditLog } from '../server/src/models/AuditLog.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aicte_complaints';

const seedData = async () => {
  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 4000 });
    console.log('Connected to MongoDB. Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Institution.deleteMany({}),
      Department.deleteMany({}),
      Complaint.deleteMany({}),
      ComplaintMessage.deleteMany({}),
      ComplaintStatusHistory.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    console.log('Cleared existing records.');

    // 1. Create AICTE Bureaus / Departments
    console.log('Seeding AICTE Bureaus & Cells...');
    const departmentsData = [
      {
        name: 'Approval Bureau',
        code: 'AB',
        description: 'Processes Extension of Approval (EoA), new institutions, intake variations, and compliance inspections.',
        slaDaysDefault: 14,
        categories: ['Affiliation & Approval', 'Intake Increase/Decrease', 'Closure of Courses', 'New Institution Approval'],
      },
      {
        name: 'Policy & Academic Planning Bureau',
        code: 'PAPB',
        description: 'Governs model curriculum, teacher qualifications, cadre ratios, NEP 2020 alignment, and academic norms.',
        slaDaysDefault: 14,
        categories: ['Curriculum & Faculty Norms', 'Pay Scale Compliance', 'NEP 2020 Implementation', 'Faculty Cadre Ratio'],
      },
      {
        name: 'Finance Bureau',
        code: 'FB',
        description: 'Audits fee structures, mandatory refund policies, institutional accounts, and financial compliance.',
        slaDaysDefault: 10,
        categories: ['Fee Structure & Refund', 'Capitation Fee Complaints', 'Excess Fee Verification'],
      },
      {
        name: 'Administration Bureau',
        code: 'ADMIN',
        description: 'Handles general administrative procedures, RTI queries, portal operational access, and dispatches.',
        slaDaysDefault: 7,
        categories: ['Administration & RTI', 'Portal Technical Assistance', 'Dispatch & Documentation'],
      },
      {
        name: 'Research, Institutional & Faculty Development Bureau',
        code: 'RIFDB',
        description: 'Oversees research grants (MODROBS, RPS), ATAL academy faculty training, and institutional upgrade funds.',
        slaDaysDefault: 21,
        categories: ['Research Grants & Faculty Development', 'MODROBS Disbursal', 'ATAL Academy FDP'],
      },
      {
        name: 'Student Development Cell',
        code: 'SDC',
        description: 'Administers scholarship schemes including Pragati, Saksham, Swanath, PMSSS, and student internships.',
        slaDaysDefault: 10,
        categories: ['Scholarships (Pragati/Saksham/PMSSS)', 'Student Internship Grievance', 'DBT / PFMS Issues'],
      },
      {
        name: 'Grievance Redressal Cell',
        code: 'GRC',
        description: 'Investigates harassment, anti-ragging non-compliance, severe faculty harassment, and institutional disputes.',
        slaDaysDefault: 7,
        categories: ['Ragging & Student Safety', 'Harassment & Safety Violations', 'General Grievance'],
      },
    ];

    const departments = await Department.insertMany(departmentsData);
    const deptMap = {};
    departments.forEach((d) => {
      deptMap[d.code] = d;
    });

    // 2. Create Institutions
    console.log('Seeding Sample Institutions...');
    const institutionsData = [
      {
        name: 'Delhi Technical Institute of Engineering & Technology',
        aicteId: '1-3928172901',
        type: 'Engineering & Technology',
        state: 'Delhi',
        district: 'New Delhi',
        address: 'Sector 14, Institutional Area, Rohini, New Delhi 110085',
        contactEmail: 'principal@dtie.edu.in',
        contactPhone: '+91 11 2788 4400',
        website: 'https://www.dtie.edu.in',
      },
      {
        name: 'Maharashtra Academy of Technology & Research',
        aicteId: '1-4829104821',
        type: 'Engineering & Technology',
        state: 'Maharashtra',
        district: 'Pune',
        address: 'Survey 44, Paud Road, Kothrud, Pune 411038',
        contactEmail: 'director@matr.ac.in',
        contactPhone: '+91 20 2544 1200',
        website: 'https://www.matr.ac.in',
      },
      {
        name: 'Bengaluru National Institute of Management Studies',
        aicteId: '1-5729103810',
        type: 'Management',
        state: 'Karnataka',
        district: 'Bengaluru Urban',
        address: 'Bannerghatta Main Road, Hulimavu, Bengaluru 560076',
        contactEmail: 'registrar@bnims.edu.in',
        contactPhone: '+91 80 2658 9900',
        website: 'https://www.bnims.edu.in',
      },
      {
        name: 'Rajasthan College of Pharmacy & Allied Sciences',
        aicteId: '1-7910284712',
        type: 'Pharmacy',
        state: 'Rajasthan',
        district: 'Jaipur',
        address: 'Sitapura Industrial Area, Tonk Road, Jaipur 302022',
        contactEmail: 'dean@rcpas.edu.in',
        contactPhone: '+91 141 277 1100',
        website: 'https://www.rcpas.edu.in',
      },
    ];

    const institutions = await Institution.insertMany(institutionsData);
    const instMap = {
      delhi: institutions[0],
      pune: institutions[1],
      bengaluru: institutions[2],
      jaipur: institutions[3],
    };

    // 3. Create Sample Users
    console.log('Seeding Sample Users...');
    // Demo password for all synthetic accounts: "Password@123"
    const commonPassword = 'Password@123';

    // Administrator
    const adminUser = await User.create({
      name: 'Dr. Ramesh Sharma',
      email: 'admin@aicte.gov.in',
      password: commonPassword,
      role: 'admin',
      designation: 'Advisor & Chief Vigilance Officer',
      phone: '+91 11 2958 1000',
      isActive: true,
    });

    // Department Officers
    const officerAB = await User.create({
      name: 'Dr. Sunita Deshmukh',
      email: 'officer.ab@aicte.gov.in',
      password: commonPassword,
      role: 'officer',
      designation: 'Director (Approval Bureau)',
      department: deptMap['AB']._id,
      phone: '+91 11 2958 1021',
      isActive: true,
    });

    const officerGRC = await User.create({
      name: 'Col. Vikramaditya Rathore',
      email: 'officer.grc@aicte.gov.in',
      password: commonPassword,
      role: 'officer',
      designation: 'Joint Director (Grievance Cell)',
      department: deptMap['GRC']._id,
      phone: '+91 11 2958 1042',
      isActive: true,
    });

    const officerFB = await User.create({
      name: 'Sh. Anil K. Chawla',
      email: 'officer.fb@aicte.gov.in',
      password: commonPassword,
      role: 'officer',
      designation: 'Finance Controller',
      department: deptMap['FB']._id,
      phone: '+91 11 2958 1055',
      isActive: true,
    });

    const officerSDC = await User.create({
      name: 'Smt. Priya Nair',
      email: 'officer.sdc@aicte.gov.in',
      password: commonPassword,
      role: 'officer',
      designation: 'Assistant Director (Scholarships)',
      department: deptMap['SDC']._id,
      phone: '+91 11 2958 1078',
      isActive: true,
    });

    // Update bureau head officers
    await Department.findByIdAndUpdate(deptMap['AB']._id, { headOfficer: officerAB._id });
    await Department.findByIdAndUpdate(deptMap['GRC']._id, { headOfficer: officerGRC._id });
    await Department.findByIdAndUpdate(deptMap['FB']._id, { headOfficer: officerFB._id });
    await Department.findByIdAndUpdate(deptMap['SDC']._id, { headOfficer: officerSDC._id });

    // Institution Users
    const instUserDelhi = await User.create({
      name: 'Prof. Alok Mukherjee',
      email: 'principal@dtie.edu.in',
      password: commonPassword,
      role: 'institution',
      designation: 'Principal & Head of Institution',
      institution: instMap.delhi._id,
      phone: '+91 98110 23456',
      isActive: true,
    });

    const instUserPune = await User.create({
      name: 'Dr. Manisha Kulkarni',
      email: 'director@matr.ac.in',
      password: commonPassword,
      role: 'institution',
      designation: 'Director',
      institution: instMap.pune._id,
      phone: '+91 94220 87654',
      isActive: true,
    });

    const instUserBangalore = await User.create({
      name: 'Dr. K. Srinivas',
      email: 'registrar@bnims.edu.in',
      password: commonPassword,
      role: 'institution',
      designation: 'Registrar',
      institution: instMap.bengaluru._id,
      phone: '+91 98450 11223',
      isActive: true,
    });

    // 4. Create Realistic Synthetic Complaints
    console.log('Seeding Synthetic Complaints...');
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const complaintsData = [
      {
        referenceId: 'AICTE-2026-10492',
        title: 'Delay in Scrutiny Committee Clearance for B.Tech AI & Data Science Course Addition',
        description: 'Our institution submitted the online application along with all land conversion deeds, faculty appointment orders, and lab readiness reports on the AICTE portal for new course addition in Artificial Intelligence & Data Science (intake 60) for Academic Year 2026-27. Scrutiny committee portal status remains in verification stage for over 45 days past the scheduled approval calendar. Kindly expedite issuance of final letter.',
        institution: instMap.delhi._id,
        submittedBy: instUserDelhi._id,
        department: deptMap['AB']._id,
        assignedOfficer: officerAB._id,
        category: 'Affiliation & Approval',
        subcategory: 'Course Addition Scrutiny',
        priority: 'High',
        priorityRationale: 'Imminent admission counseling schedule necessitates timely approval letter dispatch.',
        status: 'In Progress',
        submissionDate: new Date(now - 12 * dayMs),
        deadline: new Date(now + 2 * dayMs), // Approaching deadline
        tags: ['Approval', 'B.Tech AI', 'Scrutiny'],
        aiSummary: '• Core Issue: Course addition scrutiny pending\n• Details: Application submitted 45 days prior with all documentation\n• Action Needed: Expedited committee clearance',
        aiConfidence: 92,
      },
      {
        referenceId: 'AICTE-2026-10385',
        title: 'Student Ragging Incident in Hostel Campus — Anti-Ragging Committee Report Submitted',
        description: 'A formal complaint regarding intimidation and abusive ragging was lodged by 1st year diploma boarders against senior students in Hostel Block-B. The Institutional Anti-Ragging Committee convened within 24 hours, placed 3 errant students under suspension, and filed a preliminary incident report with the local police precinct. AICTE Grievance Cell guidelines requested immediate intimation.',
        institution: instMap.pune._id,
        submittedBy: instUserPune._id,
        department: deptMap['GRC']._id,
        assignedOfficer: officerGRC._id,
        category: 'Ragging & Student Safety',
        subcategory: 'Hostel Anti-Ragging Compliance',
        priority: 'Critical',
        priorityRationale: 'High sensitivity matter involving physical security and statutory Supreme Court anti-ragging mandates.',
        status: 'Under Review',
        submissionDate: new Date(now - 3 * dayMs),
        deadline: new Date(now - 1 * dayMs), // OVERDUE
        tags: ['Ragging', 'Anti-Ragging', 'Safety'],
        aiSummary: '• Core Issue: Hostel ragging incident reported\n• Action Taken: 3 students suspended, FIR logged\n• Action Needed: AICTE oversight committee inquiry confirmation',
        aiConfidence: 98,
      },
      {
        referenceId: 'AICTE-2026-10214',
        title: 'Unlawful Retention of Original Higher Secondary Certificates and Caution Fee Non-Refund',
        description: 'A parent grievance was redirected to our cell regarding an affiliate sister campus demanding capitation and refusing to return original certificates upon seat cancellation before cut-off date. We require guidance from AICTE Finance Bureau on penalty recovery and immediate return of original credentials.',
        institution: instMap.bengaluru._id,
        submittedBy: instUserBangalore._id,
        department: deptMap['FB']._id,
        assignedOfficer: officerFB._id,
        category: 'Fee Structure & Refund',
        subcategory: 'Mandatory Refund Violation',
        priority: 'High',
        priorityRationale: 'Violation of AICTE Public Notice prohibiting retention of original student academic certificates.',
        status: 'Awaiting Institution Response',
        submissionDate: new Date(now - 20 * dayMs),
        deadline: new Date(now - 6 * dayMs), // OVERDUE
        tags: ['Fee Refund', 'Certificates', 'Finance Bureau'],
        aiSummary: '• Core Issue: Certificate withholding and caution deposit delay\n• Guidelines: Direct violation of AICTE public notice\n• Required: Clarification on student cancellation timeline',
        aiConfidence: 94,
      },
      {
        referenceId: 'AICTE-2026-09841',
        title: 'Pragati & Saksham Scholarship Direct Benefit Transfer (DBT) Portal Sync Failure',
        description: '42 female engineering students eligible under AICTE Pragati Scholarship scheme have had their PFMS token numbers rejected with error "Mismatch in IFSC validation code". The students are from economically disadvantaged backgrounds and require immediate stipend crediting for academic term continuation.',
        institution: instMap.delhi._id,
        submittedBy: instUserDelhi._id,
        department: deptMap['SDC']._id,
        assignedOfficer: officerSDC._id,
        category: 'Scholarships (Pragati/Saksham/PMSSS)',
        subcategory: 'PFMS DBT Disbursal',
        priority: 'Medium',
        priorityRationale: 'Student financial welfare requiring coordinated resolution with Ministry PFMS portal gateway.',
        status: 'Resolved',
        submissionDate: new Date(now - 28 * dayMs),
        deadline: new Date(now - 14 * dayMs),
        resolvedAt: new Date(now - 5 * dayMs),
        resolutionSummary: 'PFMS gateway technical reconciliation completed. All 42 bank account IFSC records re-verified and scholarship stipends credited via direct DBT on 19th.',
        tags: ['Pragati', 'Scholarship', 'PFMS', 'DBT'],
        aiSummary: '• Issue: 42 female students scholarship PFMS sync error\n• Cause: Bank IFSC migration\n• Status: Successfully reconciled and disbursed',
        aiConfidence: 95,
      },
      {
        referenceId: 'AICTE-2026-09722',
        title: 'Query Regarding Cadre Ratio for Associate Professors Under Revised 7th Pay Regulations',
        description: 'Clarification required regarding the permissible cadre ratio of Professor : Associate Professor : Assistant Professor for autonomous technical institutes offering postgraduate M.Tech programs, specifically whether adjunct faculty with 10+ years industry experience may be counted against Associate Professor quota.',
        institution: instMap.pune._id,
        submittedBy: instUserPune._id,
        department: deptMap['PAPB']._id,
        assignedOfficer: null,
        category: 'Curriculum & Faculty Norms',
        subcategory: 'Faculty Cadre Norms',
        priority: 'Low',
        priorityRationale: 'General regulatory clarification regarding faculty recruitment ratios.',
        status: 'Submitted',
        submissionDate: new Date(now - 2 * dayMs),
        deadline: new Date(now + 28 * dayMs),
        tags: ['Faculty Ratio', '7th Pay', 'PAPB'],
        aiSummary: '• Query: Cadre ratio interpretation under 7th pay norms\n• Question: Industry adjunct faculty inclusion\n• Action Needed: Bureau policy clarification letter',
        aiConfidence: 89,
      },
      {
        referenceId: 'AICTE-2026-09411',
        title: 'MODROBS Research Grant Utilization Certificate Submission & 2nd Tranche Release',
        description: 'Submission of Audited Utilization Certificate (UC) and Statement of Expenditure for modernization of Robotics & Automation Laboratory sanctioned under Scheme Reference 8-42/RIFD/RPS/POLICY-1/2024-25. Requesting release of final 20% grant installment of Rs. 4,50,000.',
        institution: instMap.delhi._id,
        submittedBy: instUserDelhi._id,
        department: deptMap['RIFDB']._id,
        assignedOfficer: null,
        category: 'Research Grants & Faculty Development',
        subcategory: 'MODROBS Grant Release',
        priority: 'Medium',
        priorityRationale: 'Standard grant disbursal tracking following audit verification.',
        status: 'Under Review',
        submissionDate: new Date(now - 8 * dayMs),
        deadline: new Date(now + 13 * dayMs),
        tags: ['MODROBS', 'Research Grant', 'RIFDB'],
        aiSummary: '• Grant Modernization: Robotics lab project\n• Submitted: Audited UC and expenditure statement\n• Request: 2nd tranche release Rs. 4.5 Lakhs',
        aiConfidence: 93,
      },
      {
        referenceId: 'AICTE-2026-09105',
        title: 'AICTE Web Portal File Upload Error during Annual Deficiency Rectification Filing',
        description: 'When uploading the consolidated 15MB fire safety certificate and occupancy certificate on the web portal, the server terminates the upload connection with HTTP error 504 Gateway Timeout. Need urgent extension or alternative SFTP upload channel.',
        institution: instMap.jaipur._id,
        submittedBy: instUserDelhi._id,
        department: deptMap['ADMIN']._id,
        assignedOfficer: null,
        category: 'Administration & RTI',
        subcategory: 'Portal Technical Defect',
        priority: 'Medium',
        priorityRationale: 'Portal technical issue hindering regulatory documentation submission.',
        status: 'Submitted',
        submissionDate: new Date(now - 1 * dayMs),
        deadline: new Date(now + 6 * dayMs),
        tags: ['Portal', 'Upload Timeout', 'Admin'],
        aiSummary: '• Issue: 504 Gateway Timeout on 15MB PDF upload\n• Files: Fire safety & occupancy certificate\n• Resolution: Server limit adjustment or alternate upload link',
        aiConfidence: 91,
      },
      {
        referenceId: 'AICTE-2026-08873',
        title: 'Appeal Against Imposition of Zero-Intake Penalty on Civil Engineering Diploma',
        description: 'The institution received a penalty order reducing intake to zero due to deficiency in total lab carpet area reported by physical inspection team. Subsequent renovation has doubled the concrete technology lab space meeting all AICTE Approval Process Handbook (APH) specifications. Comprehensive geotagged video and architectural floor plans enclosed.',
        institution: instMap.bengaluru._id,
        submittedBy: instUserBangalore._id,
        department: deptMap['AB']._id,
        assignedOfficer: officerAB._id,
        category: 'Affiliation & Approval',
        subcategory: 'Zero Intake Appeal',
        priority: 'Critical',
        priorityRationale: 'Severe institutional consequence; appeal committee review required before final counseling.',
        status: 'Reopened',
        reopenedCount: 1,
        reopenReason: 'New architectural compliance evidence ready following complete physical renovation of concrete lab.',
        submissionDate: new Date(now - 35 * dayMs),
        deadline: new Date(now + 5 * dayMs),
        tags: ['Appeal', 'Zero Intake', 'Approval Bureau'],
        aiSummary: '• Core Issue: Appeal against zero-intake penalty\n• Deficiency: Lab carpet area shortfall\n• Rectification: Renovations complete with geotagged evidence',
        aiConfidence: 96,
      },
    ];

    const createdComplaints = await Complaint.insertMany(complaintsData);

    // 5. Create Status History & Messages for Active Complaints
    console.log('Seeding Timelines and Communication Threads...');
    for (const c of createdComplaints) {
      // Create initial history
      await ComplaintStatusHistory.create({
        complaint: c._id,
        changedBy: c.submittedBy,
        changedByName: 'Authorized Institution Officer',
        changedByRole: 'institution',
        action: 'SUBMITTED',
        newStatus: 'Submitted',
        reason: 'Grievance submitted by institution on portal.',
        timestamp: c.submissionDate,
      });

      if (c.status !== 'Submitted') {
        await ComplaintStatusHistory.create({
          complaint: c._id,
          changedBy: c.assignedOfficer || adminUser._id,
          changedByName: c.assignedOfficer ? 'AICTE Bureau Officer' : 'System Administrator',
          changedByRole: 'officer',
          action: 'STATUS_CHANGE',
          previousStatus: 'Submitted',
          newStatus: c.status,
          reason: `Case evaluated and status progressed to ${c.status}.`,
          timestamp: new Date(new Date(c.submissionDate).getTime() + 2 * dayMs),
        });
      }

      // Add a public clarification message
      await ComplaintMessage.create({
        complaint: c._id,
        sender: c.submittedBy,
        senderRole: 'institution',
        senderName: 'Institution Representative',
        message: 'All supplementary annexures, financial receipts, and committee resolutions have been uploaded for bureau review.',
        isInternal: false,
        createdAt: new Date(new Date(c.submissionDate).getTime() + 1 * dayMs),
      });

      // Add an internal officer note (VISIBLE ONLY TO OFFICERS & ADMINS!)
      await ComplaintMessage.create({
        complaint: c._id,
        sender: c.assignedOfficer || officerAB._id,
        senderRole: 'officer',
        senderName: 'Assigned Bureau Examiner',
        message: '[INTERNAL CONFIDENTIAL NOTE]: Cross-referenced file with State Higher Education Directorate records. Scrutiny team to verify land title deed clause 4(b) before committee recommendation.',
        isInternal: true,
        createdAt: new Date(new Date(c.submissionDate).getTime() + 3 * dayMs),
      });

      // Create in-app notifications
      await Notification.create({
        recipient: c.submittedBy,
        complaint: c._id,
        referenceId: c.referenceId,
        title: `Status: ${c.referenceId}`,
        message: `Your grievance "${c.title.slice(0, 45)}..." is currently marked as ${c.status}.`,
        type: 'STATUS_CHANGE',
        isRead: false,
        createdAt: new Date(),
      });
    }

    // 6. Record Audit Logs
    console.log('Seeding Sample Audit Logs...');
    await AuditLog.create([
      {
        user: adminUser._id,
        userEmail: adminUser.email,
        userRole: 'admin',
        action: 'SYSTEM_INITIALIZED',
        resourceType: 'System',
        details: { message: 'AICTE Grievance Monitoring System initialized with AICTE bureaus and initial seed baseline.' },
        ipAddress: '127.0.0.1',
        userAgent: 'Node/Script',
        timestamp: new Date(now - 40 * dayMs),
      },
      {
        user: adminUser._id,
        userEmail: adminUser.email,
        userRole: 'admin',
        action: 'DEPARTMENT_CREATED',
        resourceType: 'Department',
        details: { count: departments.length, codes: ['AB', 'PAPB', 'FB', 'ADMIN', 'RIFDB', 'SDC', 'GRC'] },
        ipAddress: '127.0.0.1',
        userAgent: 'Node/Script',
        timestamp: new Date(now - 39 * dayMs),
      },
      {
        user: officerAB._id,
        userEmail: officerAB.email,
        userRole: 'officer',
        action: 'OFFICER_ASSIGNED',
        resourceType: 'Complaint',
        resourceId: createdComplaints[0]._id,
        details: { assignedOfficer: officerAB.name, referenceId: createdComplaints[0].referenceId },
        ipAddress: '127.0.0.1',
        userAgent: 'Chrome/128.0',
        timestamp: new Date(now - 10 * dayMs),
      },
    ]);

    console.log('\n' + '='.repeat(70));
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log('SYNTHETIC DEMO CREDENTIALS:');
    console.log('1. AICTE Administrator:');
    console.log('   Email:    admin@aicte.gov.in');
    console.log('   Password: Password@123');
    console.log('2. Bureau Officers:');
    console.log('   Approval Bureau:   officer.ab@aicte.gov.in   (Password@123)');
    console.log('   Grievance Cell:    officer.grc@aicte.gov.in  (Password@123)');
    console.log('   Finance Bureau:    officer.fb@aicte.gov.in   (Password@123)');
    console.log('   Scholarships (SDC):officer.sdc@aicte.gov.in  (Password@123)');
    console.log('3. Institution Users:');
    console.log('   DTIE Delhi:        principal@dtie.edu.in     (Password@123)');
    console.log('   MATR Pune:         director@matr.ac.in       (Password@123)');
    console.log('   BNIMS Bengaluru:   registrar@bnims.edu.in    (Password@123)');
    console.log('='.repeat(70) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n' + '='.repeat(75));
    console.error('❌ DATABASE SEEDING FAILED: COULD NOT CONNECT TO MONGODB');
    console.error('='.repeat(75));
    console.error(`Target URI: ${MONGODB_URI}`);
    console.error(`Error details: ${error.message}`);
    console.error('\nHOW TO RESOLVE:');
    console.error('1. If using Local MongoDB on Windows:');
    console.error('   - Ensure MongoDB is installed: https://www.mongodb.com/try/download/community');
    console.error('   - Open PowerShell as Admin and run: "net start MongoDB"');
    console.error('2. If using MongoDB Atlas (Cloud Free Tier):');
    console.error('   - Add your connection string in server/.env:');
    console.error('     MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/aicte_complaints?retryWrites=true&w=majority');
    console.error('3. Note on automated test suite:');
    console.error('   - Running "npm test" uses an embedded in-memory MongoDB and succeeds independently!');
    console.error('='.repeat(75) + '\n');
    process.exit(1);
  }
};

seedData();
