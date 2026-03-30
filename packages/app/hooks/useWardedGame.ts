import { useState, useCallback, useRef } from 'react';
import type {
  GameState, LocationId, WardType, HeroId, Difficulty, SongType, Consumable,
} from '../../engine/src/warded/types';
import {
  createGame, processDawn, craftWard, fortifyLocation, gather,
  startNight, movePresence, startWave, activateWard, resolveDamage,
  endNight, arlenWardedFist, arlenMistWalk, arlenWardedFlesh, arlenBloodWard,
  getThreatForecast, resolveWardPassives,
  jardir_deployWarrior, jardir_crownOfKaji, jardir_rally, jardir_sacrifice, resolveWarriorCombat,
  rojer_rehearse, rojer_symphony, rojer_minorCharm, rojer_desperateMelody, resolveSongs,
  leesha_craftConsumable, leesha_useConsumable, leesha_greaterWardCircle, leesha_triage, leesha_bloodPotion,
  surgeOfWill,
} from '../../engine/src/warded/game';

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

  // Transition
  startNewDay: () => void;

  // Arlen
  doWardedFlesh: (wardType: WardType, locationId: LocationId) => void;
  doWardedFist: () => void;
  doMistWalk: (locationId: LocationId) => void;

  // Jardir
  doDeployWarrior: (locationId: LocationId) => void;
  doCrownOfKaji: () => void;
  doRally: () => void;

  // Rojer
  doRehearse: (songs: [SongType | null, SongType | null, SongType | null]) => void;
  doSymphony: () => void;
  doMinorCharm: () => void;

  // Leesha
  doCraftConsumable: (type: Consumable['type'], fromLocationId: LocationId) => void;
  doUseConsumable: (index: number, targetLocationId?: LocationId) => void;
  doGreaterWardCircle: () => void;
  doTriage: (consumableIndex: number, targetLocationId?: LocationId) => void;

  // HP-cost abilities
  doSurgeOfWill: () => void;
  doBloodWard: (wardType: WardType, locationId: LocationId) => void;
  doSacrifice: (locationId: LocationId) => void;
  doDesperateMelody: (songType: SongType) => void;
  doBloodPotion: () => void;

  // Wind redirect (interactive)
  doWindRedirect: (fromLocationId: LocationId, demonIndex: number, toLocationId: LocationId) => void;

  // Night actions
  doMovePresence: (locationId: LocationId) => void;
  doStartWave: () => void;
  doActivateWard: (locationId: LocationId, useCombo: boolean) => void;
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
    arlenWardedFlesh(s, wardType, locationId);
    sync(s);
  }, [sync]);

  const endDay = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    startNight(s);
    setForecast(null);
    sync(s);
  }, [sync]);

  // --- Transition ---

  const startNewDay = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    processDawn(s);
    setEvents([]);
    setForecast(getThreatForecast(s));
    sync(s);
  }, [sync]);

  // --- Jardir ---

  const doDeployWarrior = useCallback((locationId: LocationId) => {
    const s = stateRef.current;
    if (!s) return;
    const evts = jardir_deployWarrior(s, locationId);
    addEvents(evts);
    sync(s);
  }, [sync, addEvents]);

  const doCrownOfKaji = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    const evts = jardir_crownOfKaji(s);
    addEvents(evts);
    sync(s);
  }, [sync, addEvents]);

  const doRally = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    const evts = jardir_rally(s);
    addEvents(evts);
    sync(s);
  }, [sync, addEvents]);

  // --- Rojer ---

  const doRehearse = useCallback((songs: [SongType | null, SongType | null, SongType | null]) => {
    const s = stateRef.current;
    if (!s) return;
    const evts = rojer_rehearse(s, songs);
    addEvents(evts);
    sync(s);
  }, [sync, addEvents]);

  const doSymphony = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    const evts = rojer_symphony(s);
    addEvents(evts);
    sync(s);
  }, [sync, addEvents]);

  const doMinorCharm = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    const evts = rojer_minorCharm(s);
    addEvents(evts);
    sync(s);
  }, [sync, addEvents]);

  // --- Leesha ---

  const doCraftConsumable = useCallback((type: Consumable['type'], fromLocationId: LocationId) => {
    const s = stateRef.current;
    if (!s) return;
    const evts = leesha_craftConsumable(s, type, fromLocationId);
    addEvents(evts);
    sync(s);
  }, [sync, addEvents]);

  const doUseConsumable = useCallback((index: number, targetLocationId?: LocationId) => {
    const s = stateRef.current;
    if (!s) return;
    const evts = leesha_useConsumable(s, index, targetLocationId);
    addEvents(evts);
    sync(s);
  }, [sync, addEvents]);

  const doGreaterWardCircle = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    const evts = leesha_greaterWardCircle(s);
    addEvents(evts);
    sync(s);
  }, [sync, addEvents]);

  const doTriage = useCallback((consumableIndex: number, targetLocationId?: LocationId) => {
    const s = stateRef.current;
    if (!s) return;
    const evts = leesha_triage(s, consumableIndex, targetLocationId);
    addEvents(evts);
    sync(s);
  }, [sync, addEvents]);

  // --- HP-Cost Abilities ---

  const doSurgeOfWill = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    const evts = surgeOfWill(s);
    addEvents(evts);
    sync(s);
  }, [sync, addEvents]);

  const doBloodWard = useCallback((wardType: WardType, locationId: LocationId) => {
    const s = stateRef.current;
    if (!s) return;
    const evts = arlenBloodWard(s, wardType, locationId);
    addEvents(evts);
    sync(s);
  }, [sync, addEvents]);

  const doSacrifice = useCallback((locationId: LocationId) => {
    const s = stateRef.current;
    if (!s) return;
    const evts = jardir_sacrifice(s, locationId);
    addEvents(evts);
    sync(s);
  }, [sync, addEvents]);

  const doDesperateMelody = useCallback((songType: SongType) => {
    const s = stateRef.current;
    if (!s) return;
    const evts = rojer_desperateMelody(s, songType);
    addEvents(evts);
    sync(s);
  }, [sync, addEvents]);

  const doBloodPotion = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    const evts = leesha_bloodPotion(s);
    addEvents(evts);
    sync(s);
  }, [sync, addEvents]);

  // --- Wind Redirect ---

  const doWindRedirect = useCallback((fromLocationId: LocationId, demonIndex: number, toLocationId: LocationId) => {
    const s = stateRef.current;
    if (!s) return;
    const fromDemons = s.demonsAtLocations[fromLocationId];
    if (!fromDemons || demonIndex < 0 || demonIndex >= fromDemons.length) return;
    const demon = fromDemons[demonIndex];
    if (demon.demon.isLocked || demon.demon.isBoss) return;
    fromDemons.splice(demonIndex, 1);
    s.demonsAtLocations[toLocationId].push(demon);
    const fromName = s.locations.find(l => l.id === fromLocationId)?.name ?? fromLocationId;
    const toName = s.locations.find(l => l.id === toLocationId)?.name ?? toLocationId;
    addEvents([`🌀 ${demon.demon.type} redirigé de ${fromName} vers ${toName}.`]);
    sync(s);
  }, [sync, addEvents]);

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

    // Rojer: auto-resolve songs for this wave
    if (s.hero.id === 'rojer') {
      const songEvts = resolveSongs(s, s.waveNumber - 1);
      if (songEvts.length > 0) addEvents(songEvts);
    }

    // Jardir: auto-resolve warrior combat
    if (s.hero.id === 'jardir') {
      const warriorEvts = resolveWarriorCombat(s);
      if (warriorEvts.length > 0) addEvents(warriorEvts);
    }

    // Auto-resolve ward passives
    const passiveEvents = resolveWardPassives(s);
    addEvents(passiveEvents);

    // Auto-activate ALL ward actives — no limit, all wards fire
    const allEvents: string[] = [];
    for (const loc of s.locations) {
      if (loc.fallen) continue;
      if (!loc.wards.some(ws => ws.ward)) continue;
      const hasCombo = loc.wards.filter(ws => ws.ward).length >= 2;
      const evts = activateWard(s, loc.id, hasCombo);
      allEvents.push(...evts);
    }
    // Force activations to 0 so UI shows resolve button
    s.activationsRemaining = 0;
    if (allEvents.length > 0) addEvents(allEvents);

    // Arlen: auto Warded Fist if charge > 0
    if (s.hero.id === 'arlen' && (s.hero.arlenCharge ?? 0) > 0) {
      const fistEvts = arlenWardedFist(s);
      addEvents(fistEvts);
    }

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
    startGame, startNewDay,
    doCraft, doFortify, doGather, endDay,
    // Arlen
    doWardedFlesh, doWardedFist, doMistWalk,
    // Jardir
    doDeployWarrior, doCrownOfKaji, doRally,
    // Rojer
    doRehearse, doSymphony, doMinorCharm,
    // Leesha
    doCraftConsumable, doUseConsumable, doGreaterWardCircle, doTriage,
    // HP-cost
    doSurgeOfWill, doBloodWard, doSacrifice, doDesperateMelody, doBloodPotion,
    // Wind redirect
    doWindRedirect,
    // Night
    doMovePresence, doStartWave, doActivateWard, doResolveDamage, doEndWave,
  };
}
