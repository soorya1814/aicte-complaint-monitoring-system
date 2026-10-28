import api from './axios';

export const complaintApi = {
  getComplaints: (params) => api.get('/complaints', { params }),
  getComplaintById: (id) => api.get(`/complaints/${id}`),
  createComplaint: (data) => api.post('/complaints', data),
  updateStatus: (id, data) => api.patch(`/complaints/${id}/status`, data),
  assignComplaint: (id, data) => api.patch(`/complaints/${id}/assignment`, data),
  addMessage: (id, data) => api.post(`/complaints/${id}/messages`, data),
  reopenComplaint: (id, data) => api.post(`/complaints/${id}/reopen`, data),
  exportCSVUrl: (params) => {
    const query = new URLSearchParams(params).toString();
    return `/api/reports/complaints.csv${query ? `?${query}` : ''}`;
  },
};
