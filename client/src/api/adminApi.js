import api from './axios';

export const adminApi = {
  // Departments
  getDepartments: () => api.get('/departments'),
  createDepartment: (data) => api.post('/departments', data),
  updateDepartment: (id, data) => api.patch(`/departments/${id}`, data),

  // Institutions
  getInstitutions: (params) => api.get('/institutions', { params }),
  getPublicInstitutions: () => api.get('/institutions/public'),
  createInstitution: (data) => api.post('/institutions', data),
  updateInstitution: (id, data) => api.patch(`/institutions/${id}`, data),

  // Users
  getUsers: (params) => api.get('/users', { params }),
  getOfficers: (params) => api.get('/users/officers', { params }),
  updateUser: (id, data) => api.patch(`/users/${id}`, data),

  // Audit Logs
  getAuditLogs: (params) => api.get('/audit-logs', { params }),
};
