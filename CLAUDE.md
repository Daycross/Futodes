# Futodes — Claude Code Project Guide

## O que é o projeto

Aplicativo mobile-first de gerenciamento de times para peladas (futsal/futebol casual). Permite cadastrar jogadores com notas, escalar quem vai jogar, sortear times equilibrados, e gerenciar a fila de próximos jogadores.

## Stack

- **React 18** com hooks (`useState`, `useEffect`, `useMemo`)
- **Vite 6** para bundling/dev server
- **lucide-react** para ícones
- **localStorage** para persistência (sem backend)
- Mobile-first, dark theme com accent `#D0FF14` (lime)
- Fontes: `Bebas Neue` (display) + `Manrope` (corpo)

## Comandos

```bash
npm run dev      # Dev server em http://localhost:5173
npm run build    # Build de produção
npm run preview  # Preview do build
```

## Arquitetura

```
src/
├── App.jsx        # Componente raiz + todo o estado + todas as telas
├── algorithm.js   # Snake draft + busca local para balancear times
├── storage.js     # Wrapper de localStorage (fácil trocar por backend)
├── themes.js      # 6 temas de cores dos times (A–F)
├── styles.css     # Reset global + 4 animações CSS
└── main.jsx       # Entry point
```

### Fluxo de telas

```
RosterScreen → TeamsScreen → GameScreen
     ↑               ↓
   (voltar)       (iniciar jogo)
```

- **RosterScreen** — gerenciar jogadores, escalar os de hoje, sortear
- **TeamsScreen** — exibir times sorteados, iniciar jogo, re-sortear
- **GameScreen** — jogo em andamento: times em campo, fila de próximos, sortear próximo time

## Estado da aplicação (App.jsx)

| Estado | Tipo | Descrição |
|--------|------|-----------|
| `players` | `Player[]` | Todos os jogadores salvos |
| `teams` | `Player[][]` | Resultado do último sorteio |
| `view` | `'roster' \| 'teams' \| 'game'` | Tela atual |
| `gameState` | `GameState \| null` | Estado do jogo em andamento |
| `sheet` | `null \| { editing }` | Controle do modal de jogador |

### Tipo GameState

```typescript
{
  playingTeams: Player[][],   // times em campo (normalmente 2)
  queue: Player[],            // fila de próximos (em ordem)
  transitandoIds: string[],   // ids dos jogadores com prioridade (sobreviveram último sorteio)
  teamSize: number,           // tamanho dos times (definido no início do jogo)
}
```

## Convenções de código

- Componentes em funções nomeadas no mesmo arquivo (`App.jsx`)
- Estilos inline com objetos JS (sem CSS Modules, sem Tailwind)
- Cores: `#D0FF14` accent, `#0A0A0A` bg, `#FAFAFA` texto, `#71717A` muted
- Classes CSS: `.display` (Bebas Neue), `.num` (tabular), `.pop-in`, `.fade-in`, `.slide-up`, `.spin`
- Animações via keyframes em `styles.css`, aplicadas por className

## Algoritmo de balanceamento (`algorithm.js`)

1. **Snake draft** — distribui por rating em zigue-zague
2. **7 splits aleatórios** — para variedade no re-sorteio
3. **Busca local** — swaps 1-a-1 para minimizar variância de médias
4. Escolhe o candidato com menor variância (aleatório entre empates)

## Lógica do GameScreen (fila de próximos)

- **Iniciar jogo**: times 0 e 1 do sorteio entram em campo; demais (se houver) vão para a fila
- **PERDEU**: time perdedor vai pro fim da fila
- **SORTEAR PRÓXIMO TIME**: sorteia `teamSize` jogadores da fila
  - Jogadores "transitando" (sobraram do sorteio anterior) têm spots garantidos
  - Restantes são sorteados aleatoriamente entre os normais
  - Quem não foi sorteado fica no topo da fila como "transitando" na próxima rodada
- **Adicionar à fila**: jogadores presentes mas fora do jogo/fila aparecem na seção "Adicionar à fila"

## Deploy

Configurado para Vercel (SPA routing via `vercel.json`). `npm run build` gera `dist/`.
