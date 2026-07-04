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
  unregisterParticipant: (tournamentId, participantId) =>
    api.delete(`/tournaments/${tournamentId}/participants/${participantId}`),
  /**
   * Generate bracket.
   * @param {string|number} id  tournament id
   * @param {{ seedingType: 'RANDOM'|'CUSTOM', participantIds?: number[] }} [body]
   *        Optional. Omit or pass null for random (backward-compatible).
   */
  generateBracket: (id, body) =>
    api.post(`/tournaments/${id}/generate-bracket`, body ?? null),
  getBracket: (id) => api.get(`/tournaments/${id}/bracket`),
}
