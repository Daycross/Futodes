// ============================================================================
// Algoritmo de balanceamento de times
// Estratégia: snake draft + busca local com múltiplos inícios para variedade
// ============================================================================

export const teamAvg = (team) =>
  team.length ? team.reduce((s, p) => s + p.rating, 0) / team.length : 0;

export const teamSum = (team) =>
  team.reduce((s, p) => s + p.rating, 0);

export function teamVariance(teams) {
  if (teams.length < 2) return 0;
  const avgs = teams.map(teamAvg);
  const mean = avgs.reduce((a, b) => a + b, 0) / avgs.length;
  return avgs.reduce((s, a) => s + (a - mean) ** 2, 0);
}

function snakeDraft(playersSorted, numTeams) {
  const teams = Array.from({ length: numTeams }, () => []);
  let dir = 1, idx = 0;
  for (const p of playersSorted) {
    teams[idx].push(p);
    if (numTeams === 1) continue;
    if (dir === 1) {
      if (idx === numTeams - 1) dir = -1;
      else idx++;
    } else {
      if (idx === 0) dir = 1;
      else idx--;
    }
  }
  return teams;
}

function randomEvenSplit(players, numTeams) {
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  const base = Math.floor(shuffled.length / numTeams);
  const extras = shuffled.length % numTeams;
  const out = [];
  let i = 0;
  for (let t = 0; t < numTeams; t++) {
    const size = base + (t < extras ? 1 : 0);
    out.push(shuffled.slice(i, i + size));
    i += size;
  }
  return out;
}

// Troca pares entre times se reduz a variância das médias.
// Como é swap 1-por-1, o tamanho de cada time é preservado.
function optimize(teams) {
  if (teams.length < 2) return;
  let improved = true, iter = 0;
  while (improved && iter < 100) {
    improved = false; iter++;
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        for (let a = 0; a < teams[i].length; a++) {
          for (let b = 0; b < teams[j].length; b++) {
            const before = teamVariance(teams);
            const tmp = teams[i][a];
            teams[i][a] = teams[j][b];
            teams[j][b] = tmp;
            const after = teamVariance(teams);
            if (after < before - 1e-9) {
              improved = true;
            } else {
              teams[j][b] = teams[i][a];
              teams[i][a] = tmp;
            }
          }
        }
      }
    }
  }
}

export function drawTeams(players) {
  const active = players.filter(p => p.present);
  if (active.length < 2) return [];

  // numTimes = max(2, teto(N/5))
  const numTeams = Math.max(2, Math.ceil(active.length / 5));
  const sorted = [...active].sort((a, b) => b.rating - a.rating);

  const candidates = [];

  // Início 1: snake draft (estado inicial determinístico bom)
  const snake = snakeDraft(sorted, numTeams);
  optimize(snake);
  candidates.push(snake);

  // Inícios 2..8: aleatórios (dão variedade entre re-rolagens)
  for (let k = 0; k < 7; k++) {
    const init = randomEvenSplit(active, numTeams);
    optimize(init);
    candidates.push(init);
  }

  // Pega todos com variância mínima e escolhe um aleatoriamente
  let minVar = Infinity;
  candidates.forEach(c => { minVar = Math.min(minVar, teamVariance(c)); });
  const best = candidates.filter(c => teamVariance(c) - minVar < 1e-9);
  const chosen = best[Math.floor(Math.random() * best.length)];

  // Ordena times pela média desc e cada time pelos melhores primeiro
  chosen.sort((a, b) => teamAvg(b) - teamAvg(a));
  chosen.forEach(t => t.sort((a, b) => b.rating - a.rating));
  return chosen;
}
