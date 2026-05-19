# Futodes ⚽

Sorteador de times equilibrados para pelada. Cadastre os jogadores com notas de 1 a 10, escolha quem joga hoje no banco de reservas e gere times balanceados.

## Funcionalidades

- **Banco de jogadores persistente** — cadastre uma vez, use em toda pelada (salvo em `localStorage` do navegador)
- **Banco de reservas** — separe quem está escalado pra hoje de quem está fora
- **Sorteio balanceado** — algoritmo combina snake draft + busca local com múltiplos inícios pra dar variedade nas re-rolagens
- **Times de 5** — distribui de forma equilibrada mesmo quando falta gente (11 jogadores → 3 times de 4+4+3)
- **Mobile-first** — interface otimizada pra usar no campo, no celular

## Como rodar localmente

Requisitos: Node.js 18+.

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

Pra gerar build de produção:

```bash
npm run build
npm run preview
```

## Deploy na Vercel

Opção 1 — pela interface web (recomendado):

1. Suba o código pro GitHub
2. No painel da Vercel, **Add New → Project**
3. Selecione o repositório
4. A Vercel detecta o Vite automaticamente (build: `npm run build`, output: `dist`)
5. **Deploy**

Opção 2 — pela CLI:

```bash
npm i -g vercel
vercel
```

Siga os prompts. O `vercel.json` já está configurado para SPA.

## Estrutura

```
src/
  main.jsx        Entry point
  App.jsx         Componente principal com estado e telas
  algorithm.js    Lógica de sorteio (snake draft + busca local)
  storage.js      Wrapper de localStorage
  themes.js       Cores dos times
  styles.css      Estilos globais
```

## Próximos passos sugeridos

- Posições (goleiro/linha) com regra de pelo menos 1 goleiro por time
- Restrições sociais ("não colocar X e Y juntos")
- Backend real (Supabase, Firebase ou API própria) — a camada `storage.js` já está isolada pra facilitar a migração
- Histórico de peladas anteriores
- Drag-and-drop pra ajustes manuais pós-sorteio
- Compartilhar resultado via WhatsApp
