const base = 'http://localhost:8080/api';
const defaultHeaders = { 'Content-Type': 'application/json' };

async function request(path, opts = {}) {
  const options = {
    ...opts,
    headers: { ...defaultHeaders, ...(opts.headers || {}) },
  };
  const res = await fetch(base + path, options);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!res.ok) {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${message}`);
  }
  return data;
}

(async () => {
  try {
    console.log('=== AUTH VALID LOGIN ===');
    const login = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin', password: 'Admin123!' }),
    });
    console.log('login ok:', login.message);
    const token = login.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    console.log('=== AUTH INVALID LOGIN ===');
    try {
      await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password: 'wrong' }),
      });
      console.error('invalid login unexpectedly succeeded');
    } catch (err) {
      console.log('invalid login rejected as expected:', err.message);
    }

    console.log('=== UNAUTHORIZED DASHBOARD ===');
    try {
      await request('/dashboard');
      console.error('unauthorized dashboard unexpectedly succeeded');
    } catch (err) {
      console.log('unauthorized dashboard blocked as expected:', err.message);
    }

    console.log('=== AUTHORIZED DASHBOARD ===');
    const dashboard = await request('/dashboard', { headers: authHeaders });
    console.log('dashboard totals:', dashboard.data.totalTournaments, dashboard.data.totalParticipants, dashboard.data.totalMatches);

    console.log('=== CREATE PARTICIPANTS ===');
    const p1 = await request('/participants', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name: `Integration Participant A ${Date.now()}` }),
    });
    const p2 = await request('/participants', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name: `Integration Participant B ${Date.now()}` }),
    });
    console.log('created participants:', p1.data.id, p2.data.id);

    console.log('=== CREATE TOURNAMENT ===');
    const tournament = await request('/tournaments', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: `Integration Tournament ${Date.now()}`,
        game: 'Chess',
        host: 'Integration Host',
        description: 'Integration test',
        maxParticipants: 2,
      }),
    });
    console.log('created tournament:', tournament.data.id, tournament.data.status);

    console.log('=== REGISTER PARTICIPANT 1 ===');
    const reg1 = await request(`/tournaments/${tournament.data.id}/participants`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ participantId: p1.data.id }),
    });
    console.log('registered 1:', reg1.data.registeredCount, reg1.data.tournamentStatus);

    console.log('=== DUPLICATE REGISTRATION ===');
    try {
      await request(`/tournaments/${tournament.data.id}/participants`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ participantId: p1.data.id }),
      });
      console.error('duplicate registration unexpectedly succeeded');
    } catch (err) {
      console.log('duplicate registration rejected as expected:', err.message);
    }

    console.log('=== REGISTER PARTICIPANT 2 ===');
    const reg2 = await request(`/tournaments/${tournament.data.id}/participants`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ participantId: p2.data.id }),
    });
    console.log('registered 2:', reg2.data.registeredCount, reg2.data.tournamentStatus);

    console.log('=== TOURNAMENT STATUS AFTER REGISTRATION ===');
    const tournamentAfter = await request(`/tournaments/${tournament.data.id}`, { headers: authHeaders });
    console.log('status after registration:', tournamentAfter.data.status);

    console.log('=== GENERATE BRACKET ===');
    const bracketGen = await request(`/tournaments/${tournament.data.id}/generate-bracket`, {
      method: 'POST',
      headers: authHeaders,
    });
    console.log('generate bracket:', bracketGen.message);

    console.log('=== FETCH BRACKET ===');
    const bracket = await request(`/tournaments/${tournament.data.id}/bracket`, { headers: authHeaders });
    console.log('bracket totalMatches:', bracket.data.totalMatches, 'rounds:', Object.keys(bracket.data.rounds).length);

    console.log('=== FETCH MATCHES ===');
    const matches = await request(`/tournaments/${tournament.data.id}/matches`, { headers: authHeaders });
    console.log('matches count:', matches.data.length);
    const firstMatch = matches.data[0];
    console.log('first match:', firstMatch.id, firstMatch.status, firstMatch.participant1Name, firstMatch.participant2Name);

    console.log('=== SCORE FIRST MATCH ===');
    const updatedMatch = await request(`/matches/${firstMatch.id}/score`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ score1: 1, score2: 0 }),
    });
    console.log('updated match status:', updatedMatch.data.status, 'winner:', updatedMatch.data.winnerName);

    console.log('=== TOURNAMENT STATUS AFTER MATCH ===');
    const tournamentFinal = await request(`/tournaments/${tournament.data.id}`, { headers: authHeaders });
    console.log('final tournament status:', tournamentFinal.data.status);

    console.log('=== DELETE EMPTY TOURNAMENT ===');
    const emptyTournament = await request('/tournaments', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: `Delete Test ${Date.now()}`,
        game: 'Chess',
        host: 'Integration Host',
        description: 'Delete test',
        maxParticipants: 2,
      }),
    });
    const deleteResult = await request(`/tournaments/${emptyTournament.data.id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    console.log('deleted empty tournament:', deleteResult.message);

    console.log('=== PARTICIPANTS STILL EXIST ===');
    const allParticipants = await request('/participants', { headers: authHeaders });
    console.log('participants count:', allParticipants.data.length);

    console.log('ALL INTEGRATION STEPS PASSED');
  } catch (err) {
    console.error('INTEGRATION ERROR:', err.message);
    process.exit(1);
  }
})();
