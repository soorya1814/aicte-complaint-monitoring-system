import api from './axios';

export const dashboardApi = {
  getSummary: (params) => api.get('/dashboard/summary', { params }),
};
