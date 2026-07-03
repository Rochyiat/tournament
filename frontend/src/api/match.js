import api from './axios'

export const matchApi = {
  updateScore: (id, data) => api.put(`/matches/${id}/score`, data),
}
