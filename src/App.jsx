import React, { useState, useEffect, useMemo } from 'react';
import {
  UserPlus, Pencil, Trash2, Shuffle, ArrowLeft, X, Users, UserX, CheckCircle2,
  Timer, Plus, Minus, Play, Pause, RotateCcw,
} from 'lucide-react';

import { drawTeams, teamAvg, teamSum } from './algorithm.js';
import { loadPlayers, savePlayers } from './storage.js';
import { TEAM_THEMES } from './themes.js';

// ============================================================================
// Componentes pequenos
// ============================================================================

function RatingBadge({ rating, size = 'md', highlight = false }) {
  const sizes = {
    sm: { w: 36, h: 36, fs: 16 },
    md: { w: 44, h: 44, fs: 20 },
    lg: { w: 60, h: 60, fs: 28 },
  };
  const s = sizes[size];
  const intensity = (rating - 1) / 9;
  const bg = highlight ? '#D0FF14' : '#1F1F1F';
  const fg = highlight ? '#0A0A0A' : '#FAFAFA';
  const border = highlight
    ? '#D0FF14'
    : `rgba(208, 255, 20, ${0.15 + intensity * 0.5})`;
  return (
    <div
      className="display num"
      style={{
        width: s.w, height: s.h,
        background: bg,
        color: fg,
        border: `2px solid ${border}`,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: s.fs,
        flexShrink: 0,
        transition: 'all 0.2s',
      }}
    >
      {rating}
    </div>
  );
}

function PlayerRow({ player, onToggle, onEdit }) {
  return (
    <div
      onClick={() => onToggle(player.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        background: player.present ? 'rgba(208, 255, 20, 0.06)' : '#0F0F0F',
        borderRadius: 16,
        border: `1px solid ${player.present ? 'rgba(208, 255, 20, 0.25)' : '#1F1F1F'}`,
        marginBottom: 8,
        transition: 'background 0.18s, border 0.18s',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <RatingBadge rating={player.rating} highlight={player.present} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 16, fontWeight: 600,
          color: player.present ? '#FAFAFA' : '#A1A1AA',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {player.name}
        </div>
        <div style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>
          {player.present ? 'Escalado pra hoje' : 'Tocar para escalar'}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(player); }}
        style={{
          width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 12, color: '#71717A',
        }}
        aria-label="Editar jogador"
      >
        <Pencil size={18} />
      </button>
    </div>
  );
}

function RatingPicker({ value, onChange }) {
  return (
    <div>
      <div style={{ fontSize: 13, color: '#71717A', marginBottom: 10, fontWeight: 500 }}>
        NOTA (1–10)
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
          const selected = n === value;
          return (
            <button
              key={n}
              onClick={() => onChange(n)}
              className="display num"
              style={{
                height: 52,
                background: selected ? '#D0FF14' : '#1F1F1F',
                color: selected ? '#0A0A0A' : '#FAFAFA',
                borderRadius: 12,
                fontSize: 22,
                border: `2px solid ${selected ? '#D0FF14' : 'transparent'}`,
                transition: 'all 0.15s',
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PlayerSheet({ open, onClose, onSave, onDelete, editing }) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? '');
      setRating(editing?.rating ?? 5);
    }
  }, [open, editing]);

  if (!open) return null;

  const trimmed = name.trim();
  const canSave = trimmed.length > 0;

  return (
    <div
      className="fade-in"
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        className="slide-up"
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0F0F0F',
          width: '100%',
          maxWidth: 520,
          margin: '0 auto',
          borderRadius: '24px 24px 0 0',
          border: '1px solid #262626',
          borderBottom: 'none',
          padding: 24,
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
        }}
      >
        <div style={{
          width: 40, height: 4, background: '#262626',
          borderRadius: 4, margin: '0 auto 20px',
        }} />

        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'baseline', marginBottom: 24,
        }}>
          <h2 className="display" style={{ fontSize: 32, margin: 0 }}>
            {editing ? 'EDITAR JOGADOR' : 'NOVO JOGADOR'}
          </h2>
          <button onClick={onClose} style={{ color: '#71717A' }} aria-label="Fechar">
            <X size={24} />
          </button>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 13, color: '#71717A',
            marginBottom: 10, fontWeight: 500,
          }}>
            NOME
          </div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: João da Silva"
            autoFocus={!editing}
            style={{
              width: '100%', padding: '14px 16px',
              background: '#1F1F1F', borderRadius: 12,
              fontSize: 17, fontWeight: 500, color: '#FAFAFA',
            }}
          />
        </div>

        <div style={{ marginBottom: 28 }}>
          <RatingPicker value={rating} onChange={setRating} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {editing && (
            <button
              onClick={() => {
                if (window.confirm(`Remover ${editing.name} do banco de jogadores?`)) {
                  onDelete(editing.id);
                  onClose();
                }
              }}
              style={{
                width: 56, height: 56,
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444', borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
              aria-label="Remover jogador"
            >
              <Trash2 size={20} />
            </button>
          )}
          <button
            onClick={() => {
              if (!canSave) return;
              onSave({ name: trimmed, rating });
              onClose();
            }}
            disabled={!canSave}
            style={{
              flex: 1, height: 56,
              background: canSave ? '#D0FF14' : '#262626',
              color: canSave ? '#0A0A0A' : '#71717A',
              borderRadius: 14,
              fontSize: 16, fontWeight: 700,
              letterSpacing: '0.02em',
              transition: 'all 0.15s',
            }}
          >
            {editing ? 'SALVAR' : 'ADICIONAR'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Cabeçalho de seção (Escalados / Banco de Reservas) com ação à direita
// ============================================================================

function SectionHeader({ title, count, accent, action }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0 4px 10px', marginTop: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <h3 style={{
          margin: 0, fontSize: 12, fontWeight: 700,
          letterSpacing: '0.1em', color: accent,
        }}>
          {title}
        </h3>
        <span className="num" style={{
          fontSize: 12, color: '#52525B', fontWeight: 600,
        }}>
          {count}
        </span>
      </div>
      {action}
    </div>
  );
}

function SmallActionButton({ icon: Icon, label, onClick, color = '#A1A1AA' }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 10px',
        background: '#161616',
        border: '1px solid #262626',
        borderRadius: 10,
        fontSize: 12, fontWeight: 600,
        color,
      }}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

// ============================================================================
// Tela de elenco (com banco de reservas)
// ============================================================================

function RosterScreen({
  players, onTogglePresence, onAddPlayer, onEditPlayer,
  onSortear, onSelectAll, onClearSelection,
}) {
  const [search, setSearch] = useState('');

  const totalSelected = players.filter(p => p.present).length;
  const totalReserves = players.length - totalSelected;
  const canDraw = totalSelected >= 2;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return players;
    return players.filter(p => p.name.toLowerCase().includes(q));
  }, [players, search]);

  const escalados = filtered
    .filter(p => p.present)
    .sort((a, b) => b.rating - a.rating);
  const reservas = filtered
    .filter(p => !p.present)
    .sort((a, b) => b.rating - a.rating);

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(10, 10, 10, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '20px 20px 16px',
        paddingTop: 'calc(20px + env(safe-area-inset-top))',
        borderBottom: '1px solid #1F1F1F',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div>
            <h1 className="display" style={{
              fontSize: 44, margin: 0, lineHeight: 0.9,
              background: 'linear-gradient(180deg, #FAFAFA 0%, #A1A1AA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              FUTODES
            </h1>
            <div style={{
              marginTop: 6, fontSize: 13, color: '#71717A', fontWeight: 500,
            }}>
              <span style={{ color: '#FAFAFA' }} className="num">{players.length}</span> no banco
              <span style={{ margin: '0 8px', color: '#404040' }}>·</span>
              <span style={{ color: '#D0FF14' }} className="num">{totalSelected}</span> escalados
            </div>
          </div>
          <button
            onClick={onAddPlayer}
            style={{
              width: 48, height: 48,
              background: '#D0FF14', color: '#0A0A0A',
              borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-label="Adicionar jogador"
          >
            <UserPlus size={22} strokeWidth={2.4} />
          </button>
        </div>

        {players.length > 4 && (
          <div style={{ marginTop: 16 }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar jogador..."
              style={{
                width: '100%', padding: '10px 14px',
                background: '#161616', borderRadius: 10,
                fontSize: 14, color: '#FAFAFA',
                border: '1px solid #262626',
              }}
            />
          </div>
        )}
      </header>

      <main style={{
        padding: '16px 16px 140px',
        maxWidth: 560, margin: '0 auto',
      }}>
        {players.length === 0 ? (
          <EmptyState onAdd={onAddPlayer} />
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px 20px', color: '#71717A',
          }}>
            Nenhum jogador encontrado para "{search}"
          </div>
        ) : (
          <>
            {/* Seção: ESCALADOS */}
            <SectionHeader
              title="ESCALADOS"
              count={escalados.length}
              accent="#D0FF14"
              action={
                totalSelected > 0 && !search ? (
                  <SmallActionButton
                    icon={UserX}
                    label="Limpar"
                    onClick={onClearSelection}
                    color="#A1A1AA"
                  />
                ) : null
              }
            />
            {escalados.length === 0 ? (
              <div style={{
                padding: '24px 16px',
                background: '#0F0F0F',
                border: '1px dashed #262626',
                borderRadius: 14,
                textAlign: 'center',
                color: '#52525B',
                fontSize: 13,
                marginBottom: 24,
              }}>
                Toque nos jogadores do banco abaixo para escalar
              </div>
            ) : (
              <div style={{ marginBottom: 24 }}>
                {escalados.map(p => (
                  <PlayerRow
                    key={p.id}
                    player={p}
                    onToggle={onTogglePresence}
                    onEdit={onEditPlayer}
                  />
                ))}
              </div>
            )}

            {/* Seção: BANCO DE RESERVAS */}
            {reservas.length > 0 && (
              <>
                <SectionHeader
                  title="BANCO DE RESERVAS"
                  count={reservas.length}
                  accent="#71717A"
                  action={
                    !search ? (
                      <SmallActionButton
                        icon={CheckCircle2}
                        label="Escalar todos"
                        onClick={onSelectAll}
                        color="#A1A1AA"
                      />
                    ) : null
                  }
                />
                <div>
                  {reservas.map(p => (
                    <PlayerRow
                      key={p.id}
                      player={p}
                      onToggle={onTogglePresence}
                      onEdit={onEditPlayer}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* Sticky bottom action */}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        padding: '16px 16px calc(16px + env(safe-area-inset-bottom))',
        background: 'linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.95) 30%)',
        zIndex: 5,
        pointerEvents: 'none',
      }}>
        <div style={{
          maxWidth: 560, margin: '0 auto', pointerEvents: 'auto',
        }}>
          <button
            onClick={onSortear}
            disabled={!canDraw}
            style={{
              width: '100%', height: 60,
              background: canDraw ? '#D0FF14' : '#1F1F1F',
              color: canDraw ? '#0A0A0A' : '#52525B',
              borderRadius: 16,
              fontSize: 16, fontWeight: 800,
              letterSpacing: '0.04em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all 0.18s',
              boxShadow: canDraw ? '0 8px 32px rgba(208, 255, 20, 0.25)' : 'none',
            }}
          >
            <Shuffle size={20} strokeWidth={2.6} />
            {canDraw
              ? `SORTEAR ${totalSelected} JOGADORES`
              : 'ESCALE AO MENOS 2 JOGADORES'}
          </button>
        </div>
      </div>
    </>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="pop-in" style={{ textAlign: 'center', padding: '60px 24px 40px' }}>
      <div style={{
        width: 80, height: 80,
        background: 'rgba(208, 255, 20, 0.08)',
        border: '2px dashed rgba(208, 255, 20, 0.3)',
        borderRadius: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        <Users size={32} color="#D0FF14" />
      </div>
      <h2 className="display" style={{ fontSize: 28, margin: '0 0 8px' }}>
        BANCO VAZIO
      </h2>
      <p style={{ color: '#71717A', fontSize: 15, margin: '0 0 28px', lineHeight: 1.5 }}>
        Comece cadastrando os jogadores com suas notas de 1 a 10. Eles ficam salvos pra próxima pelada.
      </p>
      <button
        onClick={onAdd}
        style={{
          padding: '14px 24px',
          background: '#D0FF14', color: '#0A0A0A',
          borderRadius: 12,
          fontWeight: 700, fontSize: 15,
          letterSpacing: '0.02em',
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}
      >
        <UserPlus size={18} strokeWidth={2.6} />
        ADICIONAR PRIMEIRO JOGADOR
      </button>
    </div>
  );
}

// ============================================================================
// Componentes de jogo em andamento
// ============================================================================

function PlayingTeamCard({ team, theme, onLoser }) {
  const avg = teamAvg(team);
  return (
    <div style={{
      background: '#0F0F0F',
      border: `1px solid ${theme.accent}33`,
      borderRadius: 20,
      overflow: 'hidden',
      marginBottom: 12,
    }}>
      <div style={{
        padding: '14px 16px',
        background: theme.accent, color: theme.dark,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div className="display" style={{ fontSize: 24, lineHeight: 1 }}>{theme.name}</div>
          <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.65, marginTop: 2, letterSpacing: '0.05em' }}>
            EM CAMPO
          </div>
        </div>
        <div className="display num" style={{ fontSize: 32 }}>{avg.toFixed(1)}</div>
      </div>
      <div style={{ padding: '6px 14px 0' }}>
        {team.map((p, i) => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 4px',
            borderBottom: i < team.length - 1 ? '1px solid #1F1F1F' : 'none',
          }}>
            <RatingBadge rating={p.rating} size="sm" />
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p.name}
            </span>
          </div>
        ))}
      </div>
      <div style={{ padding: '10px 14px 14px' }}>
        <button
          onClick={onLoser}
          style={{
            width: '100%', padding: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.28)',
            borderRadius: 10,
            color: '#EF4444', fontWeight: 700, fontSize: 13,
            letterSpacing: '0.04em',
          }}
        >
          PERDEU — SAIR
        </button>
      </div>
    </div>
  );
}

function QueueRow({ player, position, isTransitando, onRemove }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '11px 14px',
      background: isTransitando ? 'rgba(208, 255, 20, 0.05)' : '#0F0F0F',
      border: `1px solid ${isTransitando ? 'rgba(208, 255, 20, 0.2)' : '#1F1F1F'}`,
      borderRadius: 14, marginBottom: 8,
      transition: 'background 0.15s, border 0.15s',
    }}>
      <div className="display num" style={{
        width: 26, height: 26,
        background: isTransitando ? '#D0FF14' : '#1F1F1F',
        color: isTransitando ? '#0A0A0A' : '#52525B',
        borderRadius: 7,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, flexShrink: 0,
        transition: 'all 0.15s',
      }}>
        {position}
      </div>
      <RatingBadge rating={player.rating} size="sm" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {player.name}
        </div>
        {isTransitando && (
          <div style={{ fontSize: 10, color: '#D0FF14', fontWeight: 700, marginTop: 1, letterSpacing: '0.08em' }}>
            TRANSITANDO
          </div>
        )}
      </div>
      <button
        onClick={() => onRemove(player.id)}
        style={{
          width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 8, color: '#52525B',
          flexShrink: 0,
        }}
        aria-label="Remover da fila"
      >
        <Minus size={16} />
      </button>
    </div>
  );
}

function BenchRow({ player, onAdd }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px',
      background: '#0F0F0F', border: '1px solid #1F1F1F',
      borderRadius: 14, marginBottom: 8,
    }}>
      <RatingBadge rating={player.rating} size="sm" />
      <div style={{ flex: 1, fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#A1A1AA' }}>
        {player.name}
      </div>
      <button
        onClick={() => onAdd(player)}
        style={{
          width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(208, 255, 20, 0.1)',
          border: '1px solid rgba(208, 255, 20, 0.2)',
          borderRadius: 8, color: '#D0FF14',
          flexShrink: 0,
        }}
        aria-label="Adicionar à fila"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

const GAME_DURATION = 10 * 60; // 10 minutos em segundos

function formatTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function GameScreen({
  gameState, allPresentPlayers,
  onBack, onAddToQueue, onRemoveFromQueue, onMarkLoser, onSortearProximo,
}) {
  const [isSorteando, setIsSorteando] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [timerRunning, setTimerRunning] = useState(false);

  const { playingTeams, queue, transitandoIds, teamSize } = gameState;

  useEffect(() => {
    if (!timerRunning || timeLeft <= 0) return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setTimerRunning(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, timeLeft]);

  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(GAME_DURATION);
  };

  const handleMarkLoser = (teamIdx) => {
    resetTimer();
    onMarkLoser(teamIdx);
  };

  const playingIds = new Set(playingTeams.flat().map(p => p.id));
  const queueIds = new Set(queue.map(p => p.id));
  const bench = allPresentPlayers.filter(p => !playingIds.has(p.id) && !queueIds.has(p.id));

  const canDraw = queue.length >= teamSize;
  const needMore = queue.length > 0 && queue.length < teamSize;
  const isTimeUp = timeLeft === 0;

  const handleSortear = () => {
    if (!canDraw) return;
    setIsSorteando(true);
    onSortearProximo();
    setTimeout(() => setIsSorteando(false), 600);
  };

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(10, 10, 10, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '16px 16px 18px',
        paddingTop: 'calc(16px + env(safe-area-inset-top))',
        borderBottom: '1px solid #1F1F1F',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={onBack}
            style={{
              width: 40, height: 40, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#1F1F1F', color: '#FAFAFA',
            }}
            aria-label="Voltar"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="display" style={{ fontSize: 28, margin: 0, lineHeight: 0.9 }}>
              JOGO EM ANDAMENTO
            </h1>
            <div style={{ fontSize: 12, color: '#71717A', fontWeight: 500, marginTop: 4 }}>
              <span className="num" style={{ color: '#FAFAFA' }}>{playingTeams.length}</span> time(s) em campo
              <span style={{ margin: '0 6px', color: '#404040' }}>·</span>
              <span className="num" style={{ color: '#D0FF14' }}>{queue.length}</span> na fila
            </div>
          </div>
        </div>
      </header>

      <main style={{ padding: '16px 16px 60px', maxWidth: 560, margin: '0 auto' }}>

        {/* TIMER */}
        {(() => {
          const timerColor = isTimeUp ? '#EF4444' : timerRunning ? '#D0FF14' : '#FAFAFA';
          const borderColor = isTimeUp
            ? 'rgba(239,68,68,0.3)'
            : timerRunning ? 'rgba(208,255,20,0.25)' : '#1F1F1F';
          return (
            <div style={{
              background: '#0F0F0F',
              border: `1px solid ${borderColor}`,
              borderRadius: 20, padding: '18px 18px 14px',
              marginBottom: 20, textAlign: 'center',
              transition: 'border 0.3s',
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                color: '#52525B', marginBottom: 6,
              }}>
                TEMPO DE JOGO
              </div>
              <div className="display num" style={{
                fontSize: 68, lineHeight: 1, color: timerColor,
                marginBottom: 14, transition: 'color 0.3s',
              }}>
                {formatTime(timeLeft)}
              </div>
              {isTimeUp && (
                <div style={{
                  fontSize: 11, fontWeight: 700, color: '#EF4444',
                  letterSpacing: '0.1em', marginBottom: 10,
                }}>
                  TEMPO ESGOTADO
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { if (!isTimeUp) setTimerRunning(r => !r); }}
                  disabled={isTimeUp}
                  style={{
                    flex: 1, height: 42,
                    background: (!timerRunning && !isTimeUp) ? '#D0FF14' : '#1F1F1F',
                    color: (!timerRunning && !isTimeUp) ? '#0A0A0A' : isTimeUp ? '#52525B' : '#FAFAFA',
                    borderRadius: 11, fontSize: 13, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    border: timerRunning ? '1px solid #2a2a2a' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {timerRunning
                    ? <><Pause size={15} strokeWidth={2.5} /> PAUSAR</>
                    : <><Play size={15} strokeWidth={2.5} /> {isTimeUp ? 'ENCERRADO' : 'INICIAR'}</>}
                </button>
                <button
                  onClick={resetTimer}
                  style={{
                    width: 42, height: 42,
                    background: '#1F1F1F', borderRadius: 11,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#71717A', border: '1px solid #2a2a2a',
                  }}
                  aria-label="Reiniciar timer"
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            </div>
          );
        })()}

        {/* EM CAMPO */}
        <SectionHeader
          title="EM CAMPO"
          count={playingTeams.reduce((s, t) => s + t.length, 0)}
          accent="#FAFAFA"
        />
        {playingTeams.length === 0 ? (
          <div style={{
            padding: '24px 16px', textAlign: 'center',
            background: '#0F0F0F', border: '1px dashed #262626',
            borderRadius: 14, marginBottom: 24, color: '#52525B', fontSize: 13,
          }}>
            Nenhum time em campo
          </div>
        ) : (
          <div style={{ marginBottom: 8 }}>
            {playingTeams.map((team, i) => (
              <PlayingTeamCard
                key={i}
                team={team}
                theme={TEAM_THEMES[i % TEAM_THEMES.length]}
                onLoser={() => handleMarkLoser(i)}
              />
            ))}
          </div>
        )}

        {/* PRÓXIMOS */}
        <SectionHeader
          title="PRÓXIMOS"
          count={queue.length}
          accent="#D0FF14"
        />
        {queue.length === 0 ? (
          <div style={{
            padding: '24px 16px', textAlign: 'center',
            background: '#0F0F0F', border: '1px dashed #262626',
            borderRadius: 14, marginBottom: 12, color: '#52525B', fontSize: 13,
          }}>
            Fila vazia — adicione jogadores abaixo
          </div>
        ) : (
          <div>
            {queue.map((p, i) => (
              <QueueRow
                key={p.id}
                player={p}
                position={i + 1}
                isTransitando={transitandoIds.includes(p.id)}
                onRemove={onRemoveFromQueue}
              />
            ))}
          </div>
        )}

        {/* Botão de sortear / aviso */}
        {canDraw ? (
          <button
            onClick={handleSortear}
            style={{
              width: '100%', padding: '16px', marginTop: 4, marginBottom: 24,
              background: '#D0FF14', color: '#0A0A0A',
              borderRadius: 14, fontSize: 15, fontWeight: 800,
              letterSpacing: '0.04em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 4px 24px rgba(208, 255, 20, 0.25)',
            }}
          >
            <Shuffle size={18} strokeWidth={2.6} className={isSorteando ? 'spin' : ''} />
            SORTEAR PRÓXIMO TIME ({teamSize})
          </button>
        ) : needMore ? (
          <div style={{
            marginTop: 4, marginBottom: 24, padding: '14px 16px',
            background: '#0F0F0F', borderRadius: 12, border: '1px solid #1F1F1F',
            fontSize: 13, color: '#71717A', textAlign: 'center',
          }}>
            Faltam <span className="num" style={{ color: '#FAFAFA' }}>{teamSize - queue.length}</span> jogador(es) para sortear
          </div>
        ) : (
          <div style={{ marginBottom: 16 }} />
        )}

        {/* ADICIONAR À FILA */}
        {bench.length > 0 && (
          <>
            <SectionHeader
              title="ADICIONAR À FILA"
              count={bench.length}
              accent="#71717A"
            />
            {bench.map(p => (
              <BenchRow key={p.id} player={p} onAdd={onAddToQueue} />
            ))}
          </>
        )}
      </main>
    </>
  );
}

// ============================================================================
// Tela de times sorteados
// ============================================================================

function TeamCard({ team, theme, index }) {
  const avg = teamAvg(team);
  const sum = teamSum(team);

  return (
    <div
      className="pop-in"
      style={{
        background: '#0F0F0F',
        border: '1px solid #1F1F1F',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 14,
        animationDelay: `${index * 70}ms`,
      }}
    >
      <div style={{
        padding: '16px 18px',
        background: theme.accent, color: theme.dark,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div className="display" style={{ fontSize: 28, lineHeight: 1 }}>
            {theme.name}
          </div>
          <div style={{
            fontSize: 12, fontWeight: 600, marginTop: 2, opacity: 0.7,
          }}>
            {team.length} {team.length === 1 ? 'jogador' : 'jogadores'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="display num" style={{ fontSize: 36, lineHeight: 1 }}>
            {avg.toFixed(1)}
          </div>
          <div style={{
            fontSize: 11, fontWeight: 700,
            letterSpacing: '0.06em', opacity: 0.7,
          }}>
            MÉDIA · {sum} PTS
          </div>
        </div>
      </div>

      <div style={{ padding: '8px 14px 14px' }}>
        {team.map((p, i) => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 4px',
            borderBottom: i < team.length - 1 ? '1px solid #1F1F1F' : 'none',
          }}>
            <RatingBadge rating={p.rating} size="sm" />
            <div style={{
              flex: 1, fontSize: 15, fontWeight: 600,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {p.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamsScreen({ teams, onBack, onRedraw, onStartGame }) {
  const [isRedrawing, setIsRedrawing] = useState(false);

  const handleRedraw = () => {
    setIsRedrawing(true);
    onRedraw();
    setTimeout(() => setIsRedrawing(false), 600);
  };

  const avgs = teams.map(teamAvg);
  const maxAvg = Math.max(...avgs);
  const minAvg = Math.min(...avgs);
  const diff = maxAvg - minAvg;

  let qualityLabel, qualityColor;
  if (diff <= 0.2) { qualityLabel = 'Equilíbrio perfeito'; qualityColor = '#D0FF14'; }
  else if (diff <= 0.5) { qualityLabel = 'Times equilibrados'; qualityColor = '#D0FF14'; }
  else if (diff <= 1.0) { qualityLabel = 'Equilíbrio razoável'; qualityColor = '#F97316'; }
  else { qualityLabel = 'Times desbalanceados'; qualityColor = '#EF4444'; }

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(10, 10, 10, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '16px 16px 18px',
        paddingTop: 'calc(16px + env(safe-area-inset-top))',
        borderBottom: '1px solid #1F1F1F',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
        }}>
          <button
            onClick={onBack}
            style={{
              width: 40, height: 40, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#1F1F1F', color: '#FAFAFA',
            }}
            aria-label="Voltar"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="display" style={{ fontSize: 30, margin: 0, lineHeight: 0.9 }}>
            TIMES SORTEADOS
          </h1>
        </div>

        <div style={{
          padding: '10px 14px',
          background: '#0F0F0F',
          border: `1px solid ${qualityColor}33`,
          borderRadius: 12,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{
              fontSize: 11, color: '#71717A',
              fontWeight: 600, letterSpacing: '0.06em',
            }}>
              QUALIDADE
            </div>
            <div style={{
              fontSize: 14, fontWeight: 700,
              color: qualityColor, marginTop: 2,
            }}>
              {qualityLabel}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: 11, color: '#71717A',
              fontWeight: 600, letterSpacing: '0.06em',
            }}>
              DIFERENÇA
            </div>
            <div className="display num" style={{
              fontSize: 22, color: qualityColor, lineHeight: 1, marginTop: 2,
            }}>
              {diff.toFixed(2)}
            </div>
          </div>
        </div>
      </header>

      <main style={{
        padding: '16px 16px 140px',
        maxWidth: 560, margin: '0 auto',
      }}>
        {teams.map((team, i) => (
          <TeamCard
            key={i} team={team}
            theme={TEAM_THEMES[i % TEAM_THEMES.length]}
            index={i}
          />
        ))}
      </main>

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
        background: 'linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.97) 28%)',
        zIndex: 5,
        pointerEvents: 'none',
      }}>
        <div style={{
          maxWidth: 560, margin: '0 auto', pointerEvents: 'auto',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <button
            onClick={onStartGame}
            style={{
              width: '100%', height: 56,
              background: '#D0FF14', color: '#0A0A0A',
              borderRadius: 14,
              fontSize: 15, fontWeight: 800,
              letterSpacing: '0.04em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 8px 32px rgba(208, 255, 20, 0.25)',
            }}
          >
            <Timer size={18} strokeWidth={2.6} />
            INICIAR JOGO
          </button>
          <button
            onClick={handleRedraw}
            style={{
              width: '100%', height: 50,
              background: '#1F1F1F', color: '#FAFAFA',
              borderRadius: 14,
              fontSize: 14, fontWeight: 700,
              letterSpacing: '0.04em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              border: '1px solid #333333',
            }}
          >
            <Shuffle size={16} strokeWidth={2.6} className={isRedrawing ? 'spin' : ''} />
            SORTEAR NOVAMENTE
          </button>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// Root App
// ============================================================================

export default function App() {
  const [players, setPlayers] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState('roster'); // 'roster' | 'teams' | 'game'
  const [teams, setTeams] = useState([]);
  const [sheet, setSheet] = useState(null);
  const [gameState, setGameState] = useState(null);
  // gameState = { playingTeams, queue, transitandoIds, teamSize }

  useEffect(() => {
    setPlayers(loadPlayers());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) savePlayers(players);
  }, [players, loaded]);

  const togglePresence = (id) => {
    setPlayers(prev => prev.map(p =>
      p.id === id ? { ...p, present: !p.present } : p
    ));
  };

  const selectAll = () => {
    setPlayers(prev => prev.map(p => ({ ...p, present: true })));
  };

  const clearSelection = () => {
    setPlayers(prev => prev.map(p => ({ ...p, present: false })));
  };

  const savePlayer = ({ name, rating }) => {
    if (sheet?.editing) {
      const id = sheet.editing.id;
      setPlayers(prev => prev.map(p =>
        p.id === id ? { ...p, name, rating } : p
      ));
    } else {
      const id = (crypto?.randomUUID?.() ?? String(Date.now() + Math.random()));
      setPlayers(prev => [...prev, { id, name, rating, present: true }]);
    }
  };

  const deletePlayer = (id) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  const sortear = () => {
    const result = drawTeams(players);
    if (result.length === 0) return;
    setTeams(result);
    setGameState(null); // reset game state on new draw
    setView('teams');
  };

  const startGame = () => {
    if (!teams || teams.length < 2) return;
    const teamSize = teams[0].length;
    setGameState({
      playingTeams: teams.slice(0, 2),
      queue: teams.slice(2).flat(),
      transitandoIds: [],
      teamSize,
    });
    setView('game');
  };

  const addToGameQueue = (player) => {
    setGameState(prev => ({ ...prev, queue: [...prev.queue, player] }));
  };

  const removeFromGameQueue = (playerId) => {
    setGameState(prev => ({
      ...prev,
      queue: prev.queue.filter(p => p.id !== playerId),
      transitandoIds: prev.transitandoIds.filter(id => id !== playerId),
    }));
  };

  const markGameLoser = (teamIdx) => {
    setGameState(prev => {
      const losingTeam = prev.playingTeams[teamIdx];
      return {
        ...prev,
        playingTeams: prev.playingTeams.filter((_, i) => i !== teamIdx),
        queue: [...prev.queue, ...losingTeam],
      };
    });
  };

  const sortearProximoTime = () => {
    setGameState(prev => {
      if (prev.queue.length < prev.teamSize) return prev;

      // Transitando players get guaranteed spots first
      const transitando = prev.queue.filter(p => prev.transitandoIds.includes(p.id));
      const normal = prev.queue.filter(p => !prev.transitandoIds.includes(p.id));

      let newTeam, remaining;
      if (transitando.length >= prev.teamSize) {
        // More transitando than slots — shuffle among them
        const shuffled = [...transitando].sort(() => Math.random() - 0.5);
        newTeam = shuffled.slice(0, prev.teamSize);
        remaining = [...shuffled.slice(prev.teamSize), ...normal];
      } else {
        // Fill guaranteed transitando spots then randomly pick the rest
        const slotsLeft = prev.teamSize - transitando.length;
        const shuffledNormal = [...normal].sort(() => Math.random() - 0.5);
        newTeam = [...transitando, ...shuffledNormal.slice(0, slotsLeft)];
        remaining = shuffledNormal.slice(slotsLeft);
      }

      return {
        ...prev,
        playingTeams: [...prev.playingTeams, newTeam],
        queue: remaining,
        transitandoIds: remaining.map(p => p.id), // survivors have priority next round
      };
    });
  };

  if (!loaded) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', color: '#71717A',
      }}>
        Carregando...
      </div>
    );
  }

  return (
    <>
      {view === 'game' && gameState ? (
        <GameScreen
          gameState={gameState}
          allPresentPlayers={players.filter(p => p.present)}
          onBack={() => setView('teams')}
          onAddToQueue={addToGameQueue}
          onRemoveFromQueue={removeFromGameQueue}
          onMarkLoser={markGameLoser}
          onSortearProximo={sortearProximoTime}
        />
      ) : view === 'teams' ? (
        <TeamsScreen
          teams={teams}
          onBack={() => setView('roster')}
          onRedraw={sortear}
          onStartGame={startGame}
        />
      ) : (
        <RosterScreen
          players={players}
          onTogglePresence={togglePresence}
          onAddPlayer={() => setSheet({ editing: null })}
          onEditPlayer={(p) => setSheet({ editing: p })}
          onSortear={sortear}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
        />
      )}

      <PlayerSheet
        open={sheet !== null}
        editing={sheet?.editing}
        onClose={() => setSheet(null)}
        onSave={savePlayer}
        onDelete={deletePlayer}
      />
    </>
  );
}
