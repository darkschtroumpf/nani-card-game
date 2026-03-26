import { createClient } from '@supabase/supabase-js';

// Supabase project: vcachzgxpjqylcekawzw
// Get the anon key from: Supabase Dashboard > Settings > API > anon/public (JWT format)
const SUPABASE_URL = 'https://vcachzgxpjqylcekawzw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjYWNoemd4cGpxeWxjZWthd3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzM3ODQsImV4cCI6MjA5MDEwOTc4NH0.6MmzPoVUPjvWANtFxb57UnSpjY4rLvLrHQfaDpmb94I';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Game Room API ---

export async function createGameRoom(hostId: string, maxPlayers: number, botCount: number, botDifficulty: string) {
  const { data, error } = await supabase
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
  return data;
}

export async function joinGameRoom(code: string, playerId: string) {
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
    });

  if (joinError) throw joinError;
  return game;
}

export function subscribeToGame(gameId: string, onUpdate: (state: any) => void) {
  return supabase
    .channel(`game:${gameId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
      (payload) => {
        onUpdate(payload.new);
      },
    )
    .subscribe();
}

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
