import swaggerUi from 'swagger-ui-express';

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'AICTE Complaint Monitoring & Tracking API (SIH26264)',
    version: '1.0.0',
    description:
      'Production REST API for AICTE Bureau grievance tracking, institutional complaints, role-based workflows, and analytics.',
    contact: {
      name: 'AICTE Grievance System Technical Team',
      email: 'grievance-support@aicte-india.org',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'aicte_auth_token',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          errors: { type: 'array', items: { type: 'object' } },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'officer', 'institution'] },
          designation: { type: 'string' },
        },
      },
      Complaint: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          referenceId: { type: 'string', example: 'AICTE-2026-10492' },
          title: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Critical'] },
          status: {
            type: 'string',
            enum: ['Submitted', 'Under Review', 'In Progress', 'Awaiting Institution Response', 'Resolved', 'Closed', 'Reopened'],
          },
          deadline: { type: 'string', format: 'date-time' },
          isOverdue: { type: 'boolean' },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        summary: 'System health check and database status',
        tags: ['Health'],
        responses: {
          200: { description: 'API is healthy' },
        },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Register new institution user or officer',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                  role: { type: 'string', enum: ['institution', 'officer', 'admin'] },
                  institutionName: { type: 'string' },
                  aicteId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Account registered successfully' } },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'User login and JWT cookie issuance',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Authenticated successfully' } },
      },
    },
    '/api/auth/logout': {
      post: {
        summary: 'User logout and session clearance',
        tags: ['Authentication'],
        responses: { 200: { description: 'Logged out' } },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Get current user profile',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: 'Current profile data' } },
      },
    },
    '/api/complaints': {
      get: {
        summary: 'List complaints with server-side pagination, search & filters',
        tags: ['Complaints'],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'priority', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'isOverdue', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: { 200: { description: 'Paginated complaints' } },
      },
      post: {
        summary: 'Submit a new complaint',
        tags: ['Complaints'],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 201: { description: 'Complaint created' } },
      },
    },
    '/api/complaints/{id}': {
      get: {
        summary: 'Get complaint detail, timeline, and communication thread',
        tags: ['Complaints'],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Complaint detail' } },
      },
    },
    '/api/complaints/{id}/status': {
      patch: {
        summary: 'Update status of complaint (Officer / Admin)',
        tags: ['Complaints'],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: 'Status updated' } },
      },
    },
    '/api/complaints/{id}/assignment': {
      patch: {
        summary: 'Assign officer or route department (Officer / Admin)',
        tags: ['Complaints'],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: 'Assignment updated' } },
      },
    },
    '/api/complaints/{id}/messages': {
      post: {
        summary: 'Post public message or private officer note',
        tags: ['Complaints'],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 201: { description: 'Message saved' } },
      },
    },
    '/api/complaints/{id}/reopen': {
      post: {
        summary: 'Reopen a resolved complaint with reason (Institution / Admin)',
        tags: ['Complaints'],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: 'Complaint reopened' } },
      },
    },
    '/api/dashboard/summary': {
      get: {
        summary: 'Get dashboard KPIs and chart data',
        tags: ['Dashboard'],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: 'Dashboard metrics' } },
      },
    },
    '/api/reports/complaints.csv': {
      get: {
        summary: 'Export filtered complaints to CSV',
        tags: ['Reports'],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: 'CSV file download' } },
      },
    },
    '/api/ai/analyze': {
      post: {
        summary: 'AI-assisted classification, priority & routing suggestion',
        tags: ['AI Assisted'],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: 'AI recommendations' } },
      },
    },
  },
};

export const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'AICTE Complaint Portal API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  }));
};
