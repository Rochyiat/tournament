import api from './axios'

export const participantApi = {
  getAll: () => api.get('/participants'),
  create: (data) => api.post('/participants', data),
  update: (id, data) => api.put(`/participants/${id}`, data),
  delete: (id) => api.delete(`/participants/${id}`),
}
