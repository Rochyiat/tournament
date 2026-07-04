/**
 * publicApi.js
 *
 * Public-facing API helpers — no auth redirect on failure.
 * Used by Landing, PublicTournamentList, PublicTournamentDetail.
 */
import publicApi from './publicAxios'

export const publicTournamentApi = {
  getAll:         ()   => publicApi.get('/tournaments'),
  getById:        (id) => publicApi.get(`/tournaments/${id}`),
  getParticipants:(id) => publicApi.get(`/tournaments/${id}/participants`),
  getBracket:     (id) => publicApi.get(`/tournaments/${id}/bracket`),
}
