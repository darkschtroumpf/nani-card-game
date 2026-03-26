import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vcachzgxpjqylcekawzw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjYWNoemd4cGpxeWxjZWthd3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzM3ODQsImV4cCI6MjA5MDEwOTc4NH0.6MmzPoVUPjvWANtFxb57UnSpjY4rLvLrHQfaDpmb94I';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Auth ---

let _playerId: string | null = null;

export async function ensureAuth(): Promise<string> {
  if (_playerId) return _playerId;

  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    _playerId = session.user.id;
    return _playerId;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  _playerId = data.user!.id;
  return _playerId;
}

export function getPlayerId(): string {
  if (!_playerId) throw new Error('Not authenticated. Call ensureAuth() first.');
  return _playerId;
}

// --- Game Room API ---

export async function createGameRoom(maxPlayers: number, botCount: number, botDifficulty: string, nickname: string) {
  const hostId = getPlayerId();

  const { data: game, error } = await supabase
    .from('games')
    .insert({
      host_id: hostId,
      max_players: maxPlayers,
      bot_count: botCount,
      bot_difficulty: botDifficulty,
      status: 'waiting',
    })
    .select()
    .single();

  if (error) throw error;

  // Host joins as player 0
  const { error: joinError } = await supabase
    .from('game_players')
    .insert({
      game_id: game.id,
      player_id: hostId,
      seat_index: 0,
      nickname,
    });

  if (joinError) throw joinError;
  return game;
}

export async function joinGameRoom(code: string, nickname: string) {
  const playerId = getPlayerId();

  const { data: game, error: findError } = await supabase
    .from('games')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('status', 'waiting')
    .single();

  if (findError || !game) throw new Error('Salle introuvable ou partie deja lancee');

  const { count } = await supabase
    .from('game_players')
    .select('*', { count: 'exact', head: true })
    .eq('game_id', game.id);

  if ((count ?? 0) >= game.max_players) throw new Error('Salle pleine');

  const { error: joinError } = await supabase
    .from('game_players')
    .insert({
      game_id: game.id,
      player_id: playerId,
      seat_index: count ?? 0,
      nickname,
    });

  if (joinError) throw joinError;
  return game;
}

// --- Real-time subscriptions ---

export function subscribeToGame(gameId: string, onUpdate: (game: any) => void) {
  return supabase
    .channel(`game:${gameId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
      (payload) => onUpdate(payload.new),
    )
    .subscribe();
}

export function subscribeToGamePlayers(gameId: string, onUpdate: (players: any[]) => void) {
  // Initial fetch + realtime updates
  const fetch = async () => {
    const { data } = await supabase
      .from('game_players')
      .select('*')
      .eq('game_id', gameId)
      .order('seat_index');
    if (data) onUpdate(data);
  };
  fetch();

  return supabase
    .channel(`players:${gameId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'game_players', filter: `game_id=eq.${gameId}` },
      () => { fetch(); },
    )
    .subscribe();
}

export function subscribeToActions(gameId: string, onAction: (action: any) => void) {
  return supabase
    .channel(`actions:${gameId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'game_actions', filter: `game_id=eq.${gameId}` },
      (payload) => onAction(payload.new),
    )
    .subscribe();
}

// --- Game state ---

export async function updateGameState(gameId: string, state: any) {
  const { error } = await supabase
    .from('games')
    .update({ state })
    .eq('id', gameId);

  if (error) throw error;
}

export async function setGameStatus(gameId: string, status: 'waiting' | 'playing' | 'finished') {
  const { error } = await supabase
    .from('games')
    .update({ status, ...(status === 'finished' ? { finished_at: new Date().toISOString() } : {}) })
    .eq('id', gameId);

  if (error) throw error;
}

export async function getGameState(gameId: string) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();

  if (error) throw error;
  return data;
}

// --- Actions ---

export async function submitAction(gameId: string, action: any) {
  const playerId = getPlayerId();
  const { error } = await supabase
    .from('game_actions')
    .insert({
      game_id: gameId,
      player_id: playerId,
      action,
    });

  if (error) throw error;
}

export async function markActionProcessed(actionId: number) {
  const { error } = await supabase
    .from('game_actions')
    .update({ processed: true })
    .eq('id', actionId);

  if (error) throw error;
}

// --- Players ---

export async function getGamePlayers(gameId: string) {
  const { data, error } = await supabase
    .from('game_players')
    .select('*')
    .eq('game_id', gameId)
    .order('seat_index');

  if (error) throw error;
  return data;
}

// --- Heartbeat ---

export async function sendHeartbeat(gameId: string) {
  const playerId = getPlayerId();
  await supabase
    .from('game_players')
    .update({ last_seen_at: new Date().toISOString(), connected: true })
    .eq('game_id', gameId)
    .eq('player_id', playerId);
}
