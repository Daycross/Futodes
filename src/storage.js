const STORAGE_KEY = 'futodes-players-v1';

export function loadPlayers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {
    // ignore
  }
  return [];
}

export function savePlayers(players) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  } catch (e) {
    console.warn('Falha ao salvar jogadores:', e);
  }
}
