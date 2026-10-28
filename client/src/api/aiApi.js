import api from './axios';

export const aiApi = {
  analyzeText: (data) => api.post('/ai/analyze', data),
  getSimilarComplaints: (params) => api.get('/ai/similar', { params }),
};
