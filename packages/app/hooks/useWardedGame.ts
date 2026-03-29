import { useState, useCallback, useRef } from 'react';
import type {
  GameState, LocationId, WardType, HeroId, Difficulty,
} from '../../engine/src/warded/types';
import {
  createGame, processDawn, craftWard, fortifyLocation, gather,
  startNight, movePresence, startWave, activateWard, resolveDamage,
  endNight, arlenWardedFist, arlenMistWalk, arlenWardedFlesh,
  getThreatForecast, resolveWardPassives,
} from '../../engine/src/warded/game';
import type { WardType as EngineWardType } from '../../engine/src/warded/types';

export interface WardedGameController {
  state: GameState | null;
  events: string[];
  forecast: Record<LocationId, string> | null;

  // Setup
  startGame: (heroId: HeroId, difficulty: Difficulty) => void;

  // Day actions
  doCraft: (wardType: WardType, fromLocationId: LocationId) => void;
  doFortify: (wardType: WardType, targetLocationId: LocationId) => void;
  doGather: (locationId: LocationId) => void;
  endDay: () => void;

  // Night actions
  doWardedFlesh: (wardType: WardType, locationId: LocationId) => void;
  doMovePresence: (locationId: LocationId) => void;
  doStartWave: () => void;
  doActivateWard: (locationId: LocationId, useCombo: boolean) => void;
  doWardedFist: () => void;
  doMistWalk: (locationId: LocationId) => void;
  doResolveDamage: () => void;
  doEndWave: () => void;
}

export function useWardedGame(): WardedGameController {
  const [state, setState] = useState<GameState | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const [forecast, setForecast] = useState<Record<LocationId, string> | null>(null);
  const stateRef = useRef<GameState | null>(null);

  const sync = useCallback((s: GameState) => {
    stateRef.current = s;
    setState({ ...s });
  }, []);

  const addEvents = useCallback((newEvents: string[]) => {
    setEvents(prev => [...prev, ...newEvents]);
  }, []);

  const startGame = useCallback((heroId: HeroId, difficulty: Difficulty) => {
    const s = createGame(heroId, 'quick', difficulty);
    processDawn(s);
    stateRef.current = s;
    setEvents([]);
    setForecast(getThreatForecast(s));
    sync(s);
  }, [sync]);

  // --- Day Actions ---

  const doCraft = useCallback((wardType: WardType, fromLocationId: LocationId) => {
    const s = stateRef.current;
    if (!s) return;
    craftWard(s, wardType, fromLocationId);
    sync(s);
  }, [sync]);

  const doFortify = useCallback((wardType: WardType, targetLocationId: LocationId) => {
    const s = stateRef.current;
    if (!s) return;
    fortifyLocation(s, wardType, targetLocationId);
    sync(s);
  }, [sync]);

  const doGather = useCallback((locationId: LocationId) => {
    const s = stateRef.current;
    if (!s) return;
    gather(s, locationId);
    sync(s);
  }, [sync]);

  const doWardedFlesh = useCallback((wardType: WardType, locationId: LocationId) => {
    const s = stateRef.current;
    if (!s) return;
    arlenWardedFlesh(s, wardType as EngineWardType, locationId);
    sync(s);
  }, [sync]);

  const endDay = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    startNight(s);
    setForecast(null);
    sync(s);
  }, [sync]);

  // --- Night Actions ---

  const doMovePresence = useCallback((locationId: LocationId) => {
    const s = stateRef.current;
    if (!s) return;
    movePresence(s, locationId);
    sync(s);
  }, [sync]);

  const doStartWave = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    startWave(s);
    // Auto-resolve ward passives after demons spawn
    const passiveEvents = resolveWardPassives(s);
    addEvents(passiveEvents);
    sync(s);
  }, [sync, addEvents]);

  const doActivateWard = useCallback((locationId: LocationId, useCombo: boolean) => {
    const s = stateRef.current;
    if (!s) return;
    const evts = activateWard(s, locationId, useCombo);
    addEvents(evts);
    sync(s);
  }, [sync, addEvents]);

  const doWardedFist = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    const evts = arlenWardedFist(s);
    addEvents(evts);
    sync(s);
  }, [sync, addEvents]);

  const doMistWalk = useCallback((locationId: LocationId) => {
    const s = stateRef.current;
    if (!s) return;
    arlenMistWalk(s, locationId);
    sync(s);
  }, [sync]);

  const doResolveDamage = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    const evts = resolveDamage(s);
    addEvents(evts);
    sync(s);
  }, [sync, addEvents]);

  const doEndWave = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    if (s.waveNumber >= 3) {
      endNight(s);
    }
    sync(s);
  }, [sync]);

  return {
    state, events, forecast,
    startGame,
    doCraft, doFortify, doGather, doWardedFlesh, endDay,
    doMovePresence, doStartWave, doActivateWard,
    doWardedFist, doMistWalk, doResolveDamage, doEndWave,
  };
}
