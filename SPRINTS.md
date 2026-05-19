# Futodes — Sprints & Próximos Passos

> Consulte este arquivo no início de cada sessão para entender o que já foi feito e o que vem a seguir.

---

## Concluído

- [x] **Banco de jogadores persistente** — cadastro com nota 1-10, salvo em localStorage
- [x] **Banco de reservas** — toggle de presença, seções Escalados / Banco
- [x] **Algoritmo de sorteio** — snake draft + busca local com múltiplos inícios
- [x] **Re-sorteio com variedade** — re-rolagem gera combinações diferentes
- [x] **Feedback visual no Sortear novamente** — ícone gira ao clicar
- [x] **GameScreen — Sistema de próximos** — jogo em andamento com fila de jogadores
  - Times em campo com botão PERDEU
  - Fila ordenada com badge TRANSITANDO (prioridade garantida no próximo sorteio)
  - Sortear Próximo Time: transitandos entram primeiro, restante aleatório
  - Adicionar jogadores do banco direto à fila

---

## Sprint 1 — Qualidade de vida (próxima)

- [ ] **Posições** — marcar jogador como Goleiro (GK) ou Linha
  - Regra: pelo menos 1 GK por time no sorteio
  - UI: badge GK na ficha do jogador
- [ ] **Compartilhar resultado via WhatsApp** — exportar lista dos times como texto formatado
  - Ex: "Time A: João (8), Maria (7)..." copiado ou compartilhado diretamente
- [ ] **Drag-and-drop pós-sorteio** — trocar jogadores entre times manualmente na TeamsScreen

---

## Sprint 2 — Social & histórico

- [ ] **Restrições sociais** — "não colocar X e Y no mesmo time"
  - UI na ficha do jogador: selecionar quem evitar
  - Algoritmo respeita restrições no sorteio
- [ ] **Histórico de peladas** — salvar resultado de cada sorteio com data
  - Tela de histórico com lista de peladas anteriores
  - Ver times de cada pelada passada
- [ ] **Estatísticas por jogador** — frequência, média de time ganho/perdido (quando histórico existir)

---

## Sprint 3 — Infra & escala

- [ ] **Backend real** — migrar `storage.js` para Supabase ou Firebase
  - Múltiplos dispositivos sincronizados
  - Banco de jogadores compartilhado entre amigos
- [ ] **Autenticação** — login simples (Google OAuth) para separar grupos de pelada
- [ ] **PWA offline** — service worker para funcionar sem internet no campo
