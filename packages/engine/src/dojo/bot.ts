// ============================================================
// NANI?! Dojo — Smart Bot AI (v2)
// Each bot only sees its DojoPlayerView
// Features: threat assessment, political targeting, info tracking,
//           adaptive strategy, smart NANI calls, strategic Dojo buys
// ============================================================

import type {
  DojoPlayerView, CardInstance, Universe, Archetype,
  DojoPlayer, OpponentView, CardDef,
} from './types';
import { dominates, UNIVERSES } from './types';

export interface BotDecision {
  phase: string;
  action: string;
  params: any;
  reasoning: string;
}

export interface BotMemory {
  opponentDojoPicks: Record<string, string[]>;
  revealedCards: Record<string, string[]>;
  bluffHistory: { playerId: string; declared: Universe; actual: Universe | null; caught: boolean }[];
  // Per-opponent bluff tracking
  opponentBluffs: Record<string, { total: number; caught: number }>;
  enjoyedMoments: string[];
  frustratingMoments: string[];
  boringMoments: string[];
  cardUsageCount: Record<string, number>;
  cardSuccessCount: Record<string, number>;
}

export function createBotMemory(): BotMemory {
  return {
    opponentDojoPicks: {},
    revealedCards: {},
    bluffHistory: [],
    opponentBluffs: {},
    enjoyedMoments: [],
    frustratingMoments: [],
    boringMoments: [],
    cardUsageCount: {},
    cardSuccessCount: {},
  };
}

// ============================================================
// Threat Assessment — who is the biggest threat?
// ============================================================

function assessThreat(opp: OpponentView): number {
  let threat = 0;
  threat += opp.lp * 0.5; // more LP = more threat
  threat += opp.field.filter(s => s.hasFighter).length * 8; // board presence
  threat += opp.focus * 2; // focus for signatures
  threat += opp.handSize * 1.5; // cards = options
  // Concealed fighters are scarier
  threat += opp.field.filter(s => s.hasFighter && s.concealed).length * 3;
  // Traps make attacking risky
  threat += opp.traps.filter(t => t).length * 4;
  return threat;
}

function getMyPosition(view: DojoPlayerView): 'leading' | 'middle' | 'trailing' {
  const myLP = view.me.lp;
  const opponentLPs = view.opponents.map(o => o.lp).filter(lp => lp > 0);
  if (opponentLPs.length === 0) return 'leading';
  const avg = opponentLPs.reduce((a, b) => a + b, 0) / opponentLPs.length;
  if (myLP > avg + 5) return 'leading';
  if (myLP < avg - 5) return 'trailing';
  return 'middle';
}

// ============================================================
// Dojo Phase — strategic purchasing
// ============================================================

export function botDecideDojoPhase(view: DojoPlayerView, memory: BotMemory): BotDecision {
  const me = view.me;
  const position = getMyPosition(view);

  // Track opponent purchases
  for (const opp of view.opponents) {
    memory.opponentDojoPicks[opp.id] = opp.dojoPicksVisible;
  }

  const availableCards = view.dojo.cards.filter(c => c !== null) as CardInstance[];
  const myFighterCount = me.field.filter(s => s.fighter).length;
  const handFighters = me.hand.filter(c => c.card.type === 'fighter').length;
  const needsFighters = myFighterCount + handFighters < 2;
  const hasSignature = me.hand.some(c => c.card.type === 'signature');

  // Meditate if we have signature and need Focus
  if (hasSignature) {
    const sig = me.hand.find(c => c.card.type === 'signature')!;
    if (me.focus < (sig.card.focusCost ?? 0) && me.focus < 4) {
      return { phase: 'dojo', action: 'meditate', params: {}, reasoning: 'Focus pour Signature' };
    }
  }

  // Evaluate each card
  let bestBuy: { index: number; score: number; card: CardInstance } | null = null;
  for (const ci of availableCards) {
    if (ci.card.kiCost > me.ki) continue;
    const dojoIndex = view.dojo.cards.indexOf(ci);
    let score = evaluateCardForPurchase(ci.card, me, view.opponents, position, needsFighters, memory);
    if (!bestBuy || score > bestBuy.score) {
      bestBuy = { index: dojoIndex, score, card: ci };
    }
  }

  if (bestBuy && bestBuy.score >= 5) {
    return {
      phase: 'dojo', action: 'buy', params: { slotIndex: bestBuy.index },
      reasoning: `Achète ${bestBuy.card.card.name} (score ${bestBuy.score.toFixed(0)})`
    };
  }

  // Meditate if nothing good and low focus
  if (me.focus < 3) {
    return { phase: 'dojo', action: 'meditate', params: {}, reasoning: 'Focus pour plus tard' };
  }

  return { phase: 'dojo', action: 'skip', params: {}, reasoning: 'Rien d\'intéressant' };
}

function evaluateCardForPurchase(
  card: CardDef, me: DojoPlayer, opponents: OpponentView[],
  position: string, needsFighters: boolean, memory: BotMemory
): number {
  let score = 0;

  // Base value by type
  if (card.type === 'fighter') {
    score = (card.atk ?? 0) + (card.hp ?? 0);
    if (needsFighters) score += 5;
    // Diversity bonus: different universe from what we have
    const myUniverses = new Set(me.field.filter(s => s.fighter).map(s => s.fighter!.card.universe));
    if (!myUniverses.has(card.universe)) score += 2;
  } else if (card.type === 'technique') {
    score = 4;
    if (position === 'trailing' && ['heal', 'shield', 'negate'].includes(card.effectType ?? '')) score += 3;
    if (position === 'leading' && ['buff_atk', 'direct_damage'].includes(card.effectType ?? '')) score += 3;
  } else if (card.type === 'trap') {
    score = 3;
    if (me.traps.some(t => !t.card)) score += 2; // have empty trap slot
  } else if (card.type === 'equipment') {
    score = 3;
    if (me.field.some(s => s.fighter && !s.fighter.attachedEquipment)) score += 2;
  }

  // Counter-buy: buy cards from universe that dominates the leader
  const leader = opponents.reduce((a, b) => assessThreat(a) > assessThreat(b) ? a : b);
  const leaderUniverses = leader.field.filter(s => s.hasFighter && !s.concealed && s.fighter)
    .map(s => s.fighter!.universe);
  for (const lu of leaderUniverses) {
    if (dominates(card.universe, lu)) score += 2;
  }

  // Cost efficiency
  score -= card.kiCost * 0.5;

  return score;
}

// ============================================================
// Deploy Phase
// ============================================================

export function botDecideDeployPhase(view: DojoPlayerView, memory: BotMemory): BotDecision[] {
  const me = view.me;
  const decisions: BotDecision[] = [];
  const position = getMyPosition(view);

  // Deploy fighters
  const fighters = me.hand
    .map((c, i) => ({ card: c, index: i }))
    .filter(x => x.card.card.type === 'fighter')
    .sort((a, b) => (b.card.card.atk ?? 0) - (a.card.card.atk ?? 0));

  for (const f of fighters) {
    const emptySlot = me.field.findIndex(s => !s.fighter);
    if (emptySlot < 0) break;

    const shouldConceal = decideConcealment(f.card, position);
    const cost = shouldConceal ? Math.max(0, f.card.card.kiCost - 1) : f.card.card.kiCost;
    if (me.ki < cost) continue;

    decisions.push({
      phase: 'deploy', action: 'deploy_fighter',
      params: { handIndex: f.index, fieldSlot: emptySlot, concealed: shouldConceal },
      reasoning: shouldConceal ? `Pose ${f.card.card.name} face cachée` : `Deploie ${f.card.card.name}`,
    });
    break;
  }

  // Set traps (real or bluff)
  if (me.ki >= 1) {
    const trapInHand = me.hand.findIndex(c => c.card.type === 'trap');
    const emptyTrapSlot = me.traps.findIndex(t => !t.card);

    if (trapInHand >= 0 && emptyTrapSlot >= 0) {
      decisions.push({
        phase: 'deploy', action: 'set_trap',
        params: { handIndex: trapInHand, trapSlot: emptyTrapSlot },
        reasoning: 'Pose un vrai piège',
      });
    } else if (emptyTrapSlot >= 0 && me.hand.length > 3 && Math.random() < 0.25) {
      const bluffCard = me.hand.findIndex(c => c.card.type !== 'signature' && c.card.kiCost <= 1);
      if (bluffCard >= 0) {
        decisions.push({
          phase: 'deploy', action: 'set_trap',
          params: { handIndex: bluffCard, trapSlot: emptyTrapSlot },
          reasoning: 'FAUX piège pour intimider',
        });
        memory.enjoyedMoments.push('Poser un faux piège — j\'adore le bluff!');
      }
    }
  }

  // Equip
  const equipInHand = me.hand.findIndex(c => c.card.type === 'equipment');
  if (equipInHand >= 0) {
    const fighterSlot = me.field.findIndex(s => s.fighter && !s.fighter.attachedEquipment);
    if (fighterSlot >= 0 && me.ki >= me.hand[equipInHand].card.kiCost) {
      decisions.push({
        phase: 'deploy', action: 'equip',
        params: { handIndex: equipInHand, fieldSlot: fighterSlot, concealed: Math.random() < 0.5 },
        reasoning: `Equipe ${me.hand[equipInHand].card.name}`,
      });
    }
  }

  // Activate signature at good timing
  const sigIndex = me.hand.findIndex(c => c.card.type === 'signature');
  if (sigIndex >= 0) {
    const sig = me.hand[sigIndex].card;
    if (me.ki >= sig.kiCost && me.focus >= (sig.focusCost ?? 0)) {
      const shouldActivate =
        me.lp <= 15 || // desperate
        me.field.filter(s => s.fighter).length >= 2 || // good board
        (position === 'leading' && me.field.some(s => s.fighter)); // press advantage
      if (shouldActivate) {
        decisions.push({
          phase: 'deploy', action: 'signature', params: { handIndex: sigIndex },
          reasoning: `ACTIVE ${sig.name}!!!`,
        });
        memory.enjoyedMoments.push(`Activer ${sig.name} — moment épique!`);
      }
    }
  }

  return decisions;
}

function decideConcealment(card: CardInstance, position: string): boolean {
  // Leading: conceal less (don't need bluff advantage)
  // Trailing: conceal more (need surprise value)
  const base = position === 'trailing' ? 0.6 : position === 'leading' ? 0.35 : 0.5;
  // High ATK = more valuable to conceal
  const atkBonus = ((card.card.atk ?? 0) >= 6) ? 0.15 : 0;
  return Math.random() < (base + atkBonus);
}

// ============================================================
// Combat — smart target selection with political play
// ============================================================

export function botDecideCombat(view: DojoPlayerView, memory: BotMemory): BotDecision | null {
  const me = view.me;
  const position = getMyPosition(view);

  const myFighters = me.field
    .map((s, i) => ({ fighter: s.fighter, slot: i }))
    .filter(x => x.fighter !== null && !x.fighter.summonedThisTurn);

  if (myFighters.length === 0) {
    memory.frustratingMoments.push('Aucun fighter sur le terrain, impossible d\'attaquer');
    return null;
  }

  // Political targeting: attack the leader (highest threat)
  const aliveOpponents = view.opponents.filter(o => o.lp > 0);
  if (aliveOpponents.length === 0) return null;

  const threats = aliveOpponents.map(o => ({ opp: o, threat: assessThreat(o) }))
    .sort((a, b) => b.threat - a.threat);

  // Prefer attacking the leader, but sometimes go for easy kills
  let bestAttack: {
    attackerSlot: number;
    defenderId: string;
    defenderSlot: number | null;
    declaredUniverse: Universe;
    bluff: boolean;
    score: number;
  } | null = null;

  for (const atk of myFighters) {
    const atkCard = atk.fighter!.card;
    const atkAtk = (atkCard.atk ?? 0) + (atk.fighter!.attachedEquipment?.card.atkBonus ?? 0);

    for (const { opp, threat } of threats) {
      // Avoid attacking someone with traps if we have better targets
      const trapPenalty = opp.traps.filter(t => t).length * 3;

      // Direct attack if no fighters
      const oppFighters = opp.field.filter(s => s.hasFighter);
      if (oppFighters.length === 0) {
        // Direct attack to LP — very valuable, especially for high ATK
        const score = atkAtk * 1.5 + (opp.lp <= atkAtk ? 20 : 0) + threat * 0.15 - trapPenalty;
        const { universe, isBluff } = decideDeclaration(atk.fighter!, opp, memory);
        if (!bestAttack || score > bestAttack.score) {
          bestAttack = {
            attackerSlot: atk.slot, defenderId: opp.id, defenderSlot: null,
            declaredUniverse: universe, bluff: isBluff, score,
          };
        }
        continue;
      }

      // Mode B: attacker targets the PLAYER, not a specific fighter
      // The defender will choose which fighter blocks
      {
        let score = threat * 0.2 + atkAtk;
        const { universe: declU, isBluff } = decideDeclaration(atk.fighter!, opp, memory);
        score -= trapPenalty;
        if (isBluff) score += 1;

        // Pick the first fighter slot as a placeholder (defender will override)
        const firstFighterSlot = opp.field.findIndex(s => s.hasFighter);

        if (!bestAttack || score > bestAttack.score) {
          bestAttack = {
            attackerSlot: atk.slot, defenderId: opp.id,
            defenderSlot: firstFighterSlot >= 0 ? firstFighterSlot : null,
            declaredUniverse: declU, bluff: isBluff, score,
          };
        }
      }
    }
  }

  // Tournament Arc: must attack
  const forced = view.currentArc?.effect === 'tournament';

  if (!bestAttack) return null;
  if (bestAttack.score < -3 && !forced) {
    memory.boringMoments.push('Pas d\'attaque favorable — tour passif');
    return null;
  }

  if (bestAttack.bluff) {
    memory.enjoyedMoments.push(`Bluffer en déclarant ${bestAttack.declaredUniverse} — poker face!`);
  }

  return {
    phase: 'combat', action: 'attack', params: bestAttack,
    reasoning: bestAttack.bluff
      ? `Attaque ${bestAttack.defenderId} en bluffant ${bestAttack.declaredUniverse}`
      : `Attaque ${bestAttack.defenderId} avec ${bestAttack.declaredUniverse}`,
  };
}

// ============================================================
// Defense — smart NANI calls with per-opponent tracking
// ============================================================

// Defender chooses which fighter blocks (Mode B)
export function botChooseBlocker(view: DojoPlayerView, memory: BotMemory): number {
  const me = view.me;
  const combat = view.combat!;
  const declaredU = combat.declaredUniverse;

  const fighters = me.field
    .map((s, i) => ({ fighter: s.fighter, slot: i }))
    .filter(x => x.fighter !== null);

  if (fighters.length <= 1) return fighters[0]?.slot ?? 0;

  // Pick the fighter that best counters the declared universe
  let bestSlot = fighters[0].slot;
  let bestScore = -99;
  for (const f of fighters) {
    let score = 0;
    const fU = f.fighter!.card.universe;
    // Prefer fighter that dominates declared universe
    if (dominates(fU, declaredU)) score += 6;
    // Avoid fighter dominated by declared universe
    if (dominates(declaredU, fU)) score -= 4;
    // Prefer lower-value fighters as sacrificial blockers
    score -= (f.fighter!.card.atk ?? 0) * 0.3;
    // Prefer fighters with more HP (survive the hit)
    score += (f.fighter!.card.hp ?? 0) * 0.5;

    if (score > bestScore) { bestScore = score; bestSlot = f.slot; }
  }
  return bestSlot;
}

export function botDecideDefense(view: DojoPlayerView, memory: BotMemory): BotDecision {
  const me = view.me;
  const combat = view.combat!;

  // NANI?! call logic with per-opponent bluff tracking
  const attacker = view.opponents.find(o => o.id === combat.attackerId);
  const atkSlot = attacker?.field[combat.attackerSlot];

  if (atkSlot?.concealed && attacker) {
    const declaredU = combat.declaredUniverse;

    // Per-opponent bluff rate
    const oppBluffs = memory.opponentBluffs[combat.attackerId];
    const estimatedBluffRate = oppBluffs && oppBluffs.total > 0
      ? oppBluffs.caught / oppBluffs.total
      : 0.35; // default: assume 35% bluff rate

    let naniProb = estimatedBluffRate;

    // Info-based analysis: archetype unknown with draft, skip this check
    // (previously checked archetype match, but now archetype is hidden)

    // Check their Dojo purchases — did they ever buy this universe?
    const knownPicks = memory.opponentDojoPicks[combat.attackerId] ?? [];
    const uPrefix: Record<Universe, string> = {
      shonen: 'sh', magical: 'mg', mecha: 'mc', isekai: 'is', seinen: 'sn',
    };
    const hasBoughtThisUniverse = knownPicks.some(id => id.startsWith(uPrefix[declaredU]));
    if (!hasBoughtThisUniverse && knownPicks.length > 3) naniProb += 0.12;

    // Random noise (human-like imprecision)
    naniProb += (Math.random() - 0.5) * 0.25;

    // Risk assessment
    const riskyCall = me.lp <= 10;
    const threshold = riskyCall ? 0.5 : 0.35;

    // Gut feeling: sometimes just call it (human instinct)
    if (naniProb > threshold || Math.random() < 0.25) {
      memory.enjoyedMoments.push(`Appeler NANI?! — moment de vérité intense!`);
      return {
        phase: 'combat_response', action: 'call_nani', params: {},
        reasoning: `NANI?! (estimé ${Math.round(naniProb * 100)}% bluff)`,
      };
    }
  }

  // Play defensive technique if available and worth it
  const techIndex = me.hand.findIndex(c =>
    c.card.type === 'technique' && c.card.kiCost <= me.ki &&
    ['shield', 'negate', 'return_hand', 'heal'].includes(c.card.effectType ?? '')
  );

  if (techIndex >= 0 && me.lp <= 20) {
    return {
      phase: 'combat_response', action: 'play_technique',
      params: { handIndex: techIndex },
      reasoning: `Joue ${me.hand[techIndex].card.name} en défense`,
    };
  }

  return { phase: 'combat_response', action: 'none', params: {}, reasoning: 'Pas de réponse' };
}

// ============================================================
// Declaration — smart bluffing
// ============================================================

function decideDeclaration(
  fighter: CardInstance, opponent: OpponentView, memory: BotMemory,
): { universe: Universe; isBluff: boolean } {
  const actual = fighter.card.universe;

  if (!fighter.concealed) return { universe: actual, isBluff: false };

  // Bluff probability based on situation
  const oppFighters = opponent.field
    .filter(s => s.hasFighter && !s.concealed && s.fighter)
    .map(s => s.fighter!);

  // Try to bluff a universe that dominates opponent's fighters
  if (Math.random() < 0.4) {
    for (const oppF of oppFighters) {
      const dominant = UNIVERSES.find(u => dominates(u, oppF.universe) && u !== actual);
      if (dominant) return { universe: dominant, isBluff: true };
    }
    // Random bluff if no specific target
    if (Math.random() < 0.25) {
      const fakeU = UNIVERSES.filter(u => u !== actual)[Math.floor(Math.random() * 4)];
      return { universe: fakeU, isBluff: true };
    }
  }

  return { universe: actual, isBluff: false };
}

function cardMatchesArchetype(card: CardDef, archetype: Archetype): boolean {
  const archetypeUniverse: Record<Archetype, Universe> = {
    shonen_blitz: 'shonen', magical_ward: 'magical', mecha_fortress: 'mecha',
    isekai_thief: 'isekai', seinen_assassin: 'seinen',
  };
  return card.universe === archetypeUniverse[archetype];
}
