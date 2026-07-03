import api from './axios'

export const tournamentApi = {
  getAll: () => api.get('/tournaments'),
  getById: (id) => api.get(`/tournaments/${id}`),
  create: (data) => api.post('/tournaments', data),
  update: (id, data) => api.put(`/tournaments/${id}`, data),
  delete: (id) => api.delete(`/tournaments/${id}`),
  getMy: () => api.get('/tournaments/my'),
  getParticipants: (id) => api.get(`/tournaments/${id}/participants`),
  registerParticipant: (id, data) => api.post(`/tournaments/${id}/participants`, data),
  unregisterParticipant: (tournamentId, participantId) => api.delete(`/tournaments/${tournamentId}/participants/${participantId}`),
  generateBracket: (id) => api.post(`/tournaments/${id}/generate-bracket`),
  getBracket: (id) => api.get(`/tournaments/${id}/bracket`),
}
