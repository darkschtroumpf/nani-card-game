// ============================================================
// NANI?! Dojo — Game Simulator
// Runs multiple games with bots and collects feedback
// ============================================================

import type { DojoGameState, Archetype, BotFeedback, DojoPlayerView, Universe } from './types';
import {
  createDojoGame, processKiPhase, processDojoBuy, processDojoMeditate,
  deployFighter, setTrap, equipCard, initiateCombat, defenderPlayTechnique,
  callNani, resolveCombat, processEndPhase, getDojoPlayerView,
  activateSignature,
} from './game';
import {
  botDecideDojoPhase, botDecideDeployPhase, botDecideCombat,
  botDecideDefense, createBotMemory,
  type BotMemory, type BotDecision,
} from './bot';

interface SimulationResult {
  winnerId: string | null;
  winnerArchetype: Archetype | null;
  winCondition: string | null;
  totalTurns: number;
  playerStats: {
    id: string;
    archetype: Archetype;
    finalLP: number;
    damageDealt: number;
    damageReceived: number;
    bluffsAttempted: number;
    bluffsSuccessful: number;
    bluffsCaught: number;
    naniCalls: number;
    naniCallsCorrect: number;
    fightersPlayed: number;
    fightersLost: number;
    dojoPicksCount: number;
  }[];
}

function simulateOneGame(
  configs: { name: string; archetype: Archetype }[],
  memories: BotMemory[],
  verbose: boolean = false,
): SimulationResult {
  const state = createDojoGame(configs);
  let safetyCounter = 0;
  const MAX_ACTIONS = 2000;

  while (!state.gameOver && safetyCounter < MAX_ACTIONS) {
    safetyCounter++;
    const playerIdx = state.currentPlayerIndex;
    const player = state.players[playerIdx];
    const memory = memories[playerIdx];

    if (player.lp <= 0) {
      processEndPhase(state);
      continue;
    }

    const view = getDojoPlayerView(state, player.id);

    switch (state.turnPhase) {
      case 'ki':
        processKiPhase(state);
        break;

      case 'dojo': {
        const decision = botDecideDojoPhase(view, memory);
        if (verbose) logDecision(player.name, decision);

        if (decision.action === 'buy') {
          processDojoBuy(state, decision.params.slotIndex);
        } else if (decision.action === 'meditate') {
          processDojoMeditate(state);
        }
        state.turnPhase = 'deploy';
        break;
      }

      case 'deploy': {
        const decisions = botDecideDeployPhase(view, memory);
        for (const d of decisions) {
          if (verbose) logDecision(player.name, d);
          // Re-get view after each action (hand indices change)
          const freshView = getDojoPlayerView(state, player.id);

          if (d.action === 'deploy_fighter') {
            // Find the card in current hand
            const handIdx = findHandIndex(player, d.params.handIndex, view);
            if (handIdx >= 0) {
              deployFighter(state, handIdx, d.params.fieldSlot, d.params.concealed);
            }
          } else if (d.action === 'set_trap') {
            const handIdx = findHandIndex(player, d.params.handIndex, view);
            if (handIdx >= 0) {
              setTrap(state, handIdx, d.params.trapSlot);
            }
          } else if (d.action === 'equip') {
            const handIdx = findHandIndex(player, d.params.handIndex, view);
            if (handIdx >= 0) {
              equipCard(state, handIdx, d.params.fieldSlot, d.params.concealed);
            }
          } else if (d.action === 'signature') {
            const sigIdx = player.hand.findIndex(c => c.card.type === 'signature');
            if (sigIdx >= 0) {
              activateSignature(state, sigIdx);
            }
          }
        }
        state.turnPhase = 'combat_select';
        break;
      }

      case 'combat_select': {
        const decision = botDecideCombat(view, memory);
        if (!decision) {
          state.turnPhase = 'end';
          break;
        }
        if (verbose) logDecision(player.name, decision);

        const { attackerSlot, defenderId, defenderSlot, declaredUniverse } = decision.params;
        const success = initiateCombat(state, attackerSlot, defenderId, defenderSlot, declaredUniverse);

        if (!success) {
          state.turnPhase = 'end';
          break;
        }

        // Track bluff in memory
        const fighter = player.field[attackerSlot]?.fighter;
        if (fighter && decision.params.bluff) {
          memory.bluffHistory.push({
            playerId: player.id,
            declared: declaredUniverse,
            actual: fighter.card.universe,
            caught: false, // will update if caught
          });
        }

        state.turnPhase = 'combat_response';
        break;
      }

      case 'combat_declare':
        state.turnPhase = 'combat_response';
        break;

      case 'combat_response': {
        if (!state.combat) { state.turnPhase = 'end'; break; }

        // Defender decides
        const defender = state.players.find(p => p.id === state.combat!.defenderId)!;
        const defIdx = state.players.indexOf(defender);
        const defView = getDojoPlayerView(state, defender.id);
        const defMemory = memories[defIdx];
        const defDecision = botDecideDefense(defView, defMemory);

        if (verbose) logDecision(defender.name, defDecision);

        // Capture combat state before resolution for bluff tracking
        const combat_before = state.combat ? { ...state.combat } : null;

        if (defDecision.action === 'call_nani') {
          callNani(state);

          // Update bluff tracking in ALL memories
          const atkId = state.combat!.attackerId;
          const atkIdx = state.players.findIndex(p => p.id === atkId);
          for (const mem of memories) {
            if (!mem.opponentBluffs[atkId]) mem.opponentBluffs[atkId] = { total: 0, caught: 0 };
            mem.opponentBluffs[atkId].total++;
            if (state.combat!.isBluff) mem.opponentBluffs[atkId].caught++;
          }
          if (state.combat.isBluff) {
            const lastBluff = memories[atkIdx].bluffHistory[memories[atkIdx].bluffHistory.length - 1];
            if (lastBluff) lastBluff.caught = true;
            memories[atkIdx].frustratingMoments.push('Mon bluff a été percé avec NANI?!');
            defMemory.enjoyedMoments.push('J\'ai deviné le bluff avec NANI?!');
          } else {
            defMemory.frustratingMoments.push('J\'ai appelé NANI?! à tort — perdu 3 LP');
          }
        } else if (defDecision.action === 'play_technique') {
          const techIdx = defender.hand.findIndex(c =>
            c.card.type === 'technique' &&
            ['shield', 'negate', 'return_hand', 'heal'].includes(c.card.effectType ?? '')
          );
          if (techIdx >= 0) {
            defenderPlayTechnique(state, techIdx);
          }
        }

        // Resolve combat
        const events = resolveCombat(state);
        if (verbose && events.length > 0) {
          console.log(`  ⚔ ${events.join(' | ')}`);
        }

        // Track revealed bluffs even without NANI call (learn from combat reveals)
        if (combat_before && combat_before.isBluff && !combat_before.naniCalled) {
          // All bots observe that the declared universe didn't match
          for (const mem of memories) {
            if (!mem.opponentBluffs[combat_before.attackerId]) {
              mem.opponentBluffs[combat_before.attackerId] = { total: 0, caught: 0 };
            }
            mem.opponentBluffs[combat_before.attackerId].total++;
            mem.opponentBluffs[combat_before.attackerId].caught++;
          }
        } else if (combat_before && !combat_before.isBluff && !combat_before.naniCalled) {
          // Honest play observed
          for (const mem of memories) {
            if (!mem.opponentBluffs[combat_before.attackerId]) {
              mem.opponentBluffs[combat_before.attackerId] = { total: 0, caught: 0 };
            }
            mem.opponentBluffs[combat_before.attackerId].total++;
          }
        }

        break;
      }

      case 'combat_nani':
      case 'combat_resolve':
        // Should be handled above
        state.turnPhase = 'end';
        break;

      case 'end':
        processEndPhase(state);
        break;

      case 'arc':
        state.turnPhase = 'dojo';
        break;
    }
  }

  return {
    winnerId: state.winnerId,
    winnerArchetype: state.winnerId
      ? state.players.find(p => p.id === state.winnerId)?.archetype ?? null
      : null,
    winCondition: state.winCondition,
    totalTurns: state.turnNumber,
    playerStats: state.players.map(p => ({
      id: p.id,
      archetype: p.archetype,
      finalLP: p.lp,
      damageDealt: p.totalDamageDealt,
      damageReceived: p.totalDamageReceived,
      bluffsAttempted: p.bluffsAttempted,
      bluffsSuccessful: p.bluffsSuccessful,
      bluffsCaught: p.bluffsCaught,
      naniCalls: p.naniCalls,
      naniCallsCorrect: p.naniCallsCorrect,
      fightersPlayed: p.fightersPlayed,
      fightersLost: p.fightersLost,
      dojoPicksCount: p.dojoPicksVisible.length,
    })),
  };
}

function findHandIndex(player: any, originalIndex: number, view: DojoPlayerView): number {
  // The hand might have changed, return the closest valid index
  return Math.min(originalIndex, player.hand.length - 1);
}

function logDecision(name: string, d: BotDecision) {
  console.log(`  [${name}] ${d.phase}/${d.action}: ${d.reasoning}`);
}

// ============================================================
// Run Simulation
// ============================================================

export function runSimulation(numGames: number = 20, verbose: boolean = false): void {
  const archetypes: { name: string; archetype: Archetype }[] = [
    { name: 'Ryu (Shonen)', archetype: 'shonen_blitz' },
    { name: 'Sakura (Magical)', archetype: 'magical_ward' },
    { name: 'Rei (Mecha)', archetype: 'mecha_fortress' },
    { name: 'Subaru (Isekai)', archetype: 'isekai_thief' },
    { name: 'Light (Seinen)', archetype: 'seinen_assassin' },
  ];

  // Persistent memories across games
  const memories = archetypes.map(() => createBotMemory());

  // Aggregate stats
  const wins: Record<Archetype, number> = {
    shonen_blitz: 0, magical_ward: 0, mecha_fortress: 0,
    isekai_thief: 0, seinen_assassin: 0,
  };
  const totalTurns: number[] = [];
  const winConditions: Record<string, number> = {};
  const perArchetype: Record<Archetype, {
    games: number; avgLP: number; avgDmgDealt: number; avgDmgReceived: number;
    avgBluffs: number; bluffSuccessRate: number; avgNani: number; naniAccuracy: number;
    avgDojoPicks: number; avgFightersPlayed: number; avgFightersLost: number;
    totalBluffs: number; totalBluffSuccess: number; totalNani: number; totalNaniCorrect: number;
  }> = {} as any;

  for (const a of archetypes) {
    perArchetype[a.archetype] = {
      games: 0, avgLP: 0, avgDmgDealt: 0, avgDmgReceived: 0,
      avgBluffs: 0, bluffSuccessRate: 0, avgNani: 0, naniAccuracy: 0,
      avgDojoPicks: 0, avgFightersPlayed: 0, avgFightersLost: 0,
      totalBluffs: 0, totalBluffSuccess: 0, totalNani: 0, totalNaniCorrect: 0,
    };
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  NANI?! DOJO — Simulation de ${numGames} parties (${archetypes.length} joueurs)`);
  console.log(`${'='.repeat(60)}\n`);

  for (let g = 0; g < numGames; g++) {
    if (verbose) console.log(`\n--- Partie ${g + 1} ---`);

    const result = simulateOneGame(archetypes, memories, verbose);

    totalTurns.push(result.totalTurns);
    if (result.winnerArchetype) wins[result.winnerArchetype]++;
    if (result.winCondition) winConditions[result.winCondition] = (winConditions[result.winCondition] ?? 0) + 1;

    for (const ps of result.playerStats) {
      const a = perArchetype[ps.archetype];
      a.games++;
      a.avgLP += ps.finalLP;
      a.avgDmgDealt += ps.damageDealt;
      a.avgDmgReceived += ps.damageReceived;
      a.totalBluffs += ps.bluffsAttempted;
      a.totalBluffSuccess += ps.bluffsSuccessful;
      a.totalNani += ps.naniCalls;
      a.totalNaniCorrect += ps.naniCallsCorrect;
      a.avgDojoPicks += ps.dojoPicksCount;
      a.avgFightersPlayed += ps.fightersPlayed;
      a.avgFightersLost += ps.fightersLost;
    }

    if (!verbose && (g + 1) % 5 === 0) {
      process.stdout.write(`  Parties ${g + 1}/${numGames} complétées\r`);
    }
  }

  // ============================================================
  // Print Results
  // ============================================================

  console.log(`\n\n${'='.repeat(60)}`);
  console.log(`  RÉSULTATS GLOBAUX`);
  console.log(`${'='.repeat(60)}\n`);

  const avgTurns = totalTurns.reduce((a, b) => a + b, 0) / numGames;
  console.log(`  Durée moyenne: ${avgTurns.toFixed(1)} tours`);
  console.log(`  Conditions de victoire:`);
  for (const [cond, count] of Object.entries(winConditions)) {
    console.log(`    ${cond}: ${count} (${(count / numGames * 100).toFixed(0)}%)`);
  }

  console.log(`\n  Victoires par archétype:`);
  for (const [arch, count] of Object.entries(wins).filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1])) {
    const pct = (count / numGames * 100).toFixed(0);
    const bar = '█'.repeat(Math.round(count / numGames * 20));
    console.log(`    ${arch.padEnd(20)} ${count} victoires (${pct}%) ${bar}`);
  }

  // Per-archetype stats
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  STATS PAR ARCHÉTYPE`);
  console.log(`${'='.repeat(60)}`);

  for (const [arch, stats] of Object.entries(perArchetype).filter(([, s]) => s.games > 0)) {
    const n = stats.games;
    console.log(`\n  --- ${arch.toUpperCase()} ---`);
    console.log(`    LP moyen en fin de partie: ${(stats.avgLP / n).toFixed(1)}`);
    console.log(`    Dégâts infligés/reçus: ${(stats.avgDmgDealt / n).toFixed(1)} / ${(stats.avgDmgReceived / n).toFixed(1)}`);
    console.log(`    Fighters joués/perdus: ${(stats.avgFightersPlayed / n).toFixed(1)} / ${(stats.avgFightersLost / n).toFixed(1)}`);
    console.log(`    Achats au Dojo: ${(stats.avgDojoPicks / n).toFixed(1)} par partie`);
    console.log(`    Bluffs: ${(stats.totalBluffs / n).toFixed(1)}/partie, succès: ${stats.totalBluffs > 0 ? (stats.totalBluffSuccess / stats.totalBluffs * 100).toFixed(0) : 0}%`);
    console.log(`    Appels NANI?!: ${(stats.totalNani / n).toFixed(1)}/partie, précision: ${stats.totalNani > 0 ? (stats.totalNaniCorrect / stats.totalNani * 100).toFixed(0) : 0}%`);
  }

  // ============================================================
  // Bot Feedback (impressions from memories)
  // ============================================================

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  FEEDBACK DES BOTS`);
  console.log(`${'='.repeat(60)}`);

  for (let i = 0; i < archetypes.length; i++) {
    const bot = archetypes[i];
    const mem = memories[i];
    const arch = perArchetype[bot.archetype];
    const n = arch.games;

    console.log(`\n  🎮 ${bot.name} (${bot.archetype})`);

    // Likes
    console.log(`\n    ❤ Ce que j'ai aimé:`);
    const likeCounts = countStrings(mem.enjoyedMoments);
    const topLikes = [...likeCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    for (const [text, count] of topLikes) {
      console.log(`      - "${text}" (${count}x)`);
    }
    if (topLikes.length === 0) console.log(`      (rien de mémorable)`);

    // Dislikes
    console.log(`\n    💔 Ce qui m'a frustré:`);
    const dislikeCounts = countStrings(mem.frustratingMoments);
    const topDislikes = [...dislikeCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    for (const [text, count] of topDislikes) {
      console.log(`      - "${text}" (${count}x)`);
    }
    if (topDislikes.length === 0) console.log(`      (rien de frustrant)`);

    // Boring
    console.log(`\n    😴 Ce qui m'a ennuyé:`);
    const boreCounts = countStrings(mem.boringMoments);
    const topBore = [...boreCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
    for (const [text, count] of topBore) {
      console.log(`      - "${text}" (${count}x)`);
    }
    if (topBore.length === 0) console.log(`      (jamais ennuyé)`);

    // Suggestions based on stats
    console.log(`\n    💡 Observations:`);
    const bluffRate = arch.totalBluffs > 0 ? arch.totalBluffSuccess / arch.totalBluffs : 0;
    const naniRate = arch.totalNani > 0 ? arch.totalNaniCorrect / arch.totalNani : 0;

    if (arch.totalBluffs / n < 0.5) {
      console.log(`      - "Je bluffe rarement (${(arch.totalBluffs / n).toFixed(1)}/partie). Le risque ne vaut pas le coup?"`);
    } else if (bluffRate > 0.7) {
      console.log(`      - "Mes bluffs passent trop souvent (${(bluffRate * 100).toFixed(0)}%). NANI?! devrait être moins cher?"`);
    } else {
      console.log(`      - "Bon équilibre de bluff: ${(bluffRate * 100).toFixed(0)}% de succès"`);
    }

    if (arch.totalNani / n < 0.3) {
      console.log(`      - "J'appelle rarement NANI?!. Le coût en Focus est trop élevé?"`);
    } else if (naniRate < 0.3) {
      console.log(`      - "Mes appels NANI?! ratent souvent (${(naniRate * 100).toFixed(0)}% précision). Frustrant."`);
    }

    if (arch.avgDojoPicks / n < 1) {
      console.log(`      - "J'achète peu au Dojo (${(arch.avgDojoPicks / n).toFixed(1)}/partie). Trop cher?"`);
    }

    const killRatio = arch.avgFightersLost > 0
      ? (arch.avgFightersPlayed - arch.avgFightersLost) / arch.avgFightersLost
      : 99;
    if (killRatio < 0.5) {
      console.log(`      - "Je perds trop de fighters. Ma stratégie est trop aggressive?"`);
    }

    if (arch.avgLP / n > 15) {
      console.log(`      - "Je finis souvent avec beaucoup de LP (${(arch.avgLP / n).toFixed(0)}). Pas assez d'aggression ciblée?"`);
    }
  }

  // ============================================================
  // Global Game Design Feedback
  // ============================================================

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ANALYSE DU GAME DESIGN`);
  console.log(`${'='.repeat(60)}\n`);

  // Game length
  if (avgTurns < 10) {
    console.log(`  ⚠ Parties trop courtes (${avgTurns.toFixed(1)} tours). Augmenter les LP de départ?`);
  } else if (avgTurns > 40) {
    console.log(`  ⚠ Parties trop longues (${avgTurns.toFixed(1)} tours). Plus de dégâts ou moins de healing?`);
  } else {
    console.log(`  ✓ Durée de partie OK (${avgTurns.toFixed(1)} tours)`);
  }

  // Balance
  const winValues = Object.values(wins).filter(v => v > 0);
  const maxWins = Math.max(...winValues);
  const minWins = Math.min(...winValues);
  if (maxWins > minWins * 3 && numGames >= 10) {
    const bestArch = Object.entries(wins).sort((a, b) => b[1] - a[1])[0];
    const worstArch = Object.entries(wins).filter(([, v]) => v > 0).sort((a, b) => a[1] - b[1])[0];
    console.log(`  ⚠ Déséquilibre: ${bestArch[0]} gagne ${bestArch[1]}x vs ${worstArch?.[0]} ${worstArch?.[1]}x`);
  } else {
    console.log(`  ✓ Équilibre entre archétypes acceptable`);
  }

  // Bluff viability
  const totalBluffs = Object.values(perArchetype).reduce((s, a) => s + a.totalBluffs, 0);
  const totalBluffSuccess = Object.values(perArchetype).reduce((s, a) => s + a.totalBluffSuccess, 0);
  const globalBluffRate = totalBluffs > 0 ? totalBluffSuccess / totalBluffs : 0;
  console.log(`  ${globalBluffRate > 0.3 && globalBluffRate < 0.7 ? '✓' : '⚠'} Taux de bluff global: ${(globalBluffRate * 100).toFixed(0)}% succès (idéal: 40-60%)`);

  // NANI viability
  const totalNani = Object.values(perArchetype).reduce((s, a) => s + a.totalNani, 0);
  const totalNaniCorrect = Object.values(perArchetype).reduce((s, a) => s + a.totalNaniCorrect, 0);
  const globalNaniRate = totalNani > 0 ? totalNaniCorrect / totalNani : 0;
  console.log(`  ${globalNaniRate > 0.3 && globalNaniRate < 0.7 ? '✓' : '⚠'} Précision NANI?! globale: ${(globalNaniRate * 100).toFixed(0)}% (idéal: 40-60%)`);
  console.log(`  ${totalNani / numGames > 1 ? '✓' : '⚠'} Fréquence NANI?!: ${(totalNani / numGames).toFixed(1)} appels/partie`);

  // Multiverse victories
  const multiverseWins = winConditions['multiverse'] ?? 0;
  console.log(`  ${multiverseWins > 0 ? '✓' : '⚠'} Victoires Multiverse: ${multiverseWins}/${numGames} (condition de victoire alternative)`);

  // Dojo engagement
  const totalDojoPicks = Object.values(perArchetype).reduce((s, a) => s + a.avgDojoPicks, 0);
  const avgDojo = totalDojoPicks / (numGames * archetypes.length);
  console.log(`  ${avgDojo > 1 ? '✓' : '⚠'} Achats au Dojo: ${avgDojo.toFixed(1)} par joueur par partie`);

  console.log(`\n${'='.repeat(60)}\n`);
}

function countStrings(arr: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const s of arr) {
    map.set(s, (map.get(s) ?? 0) + 1);
  }
  return map;
}

// Run if called directly
runSimulation(200, false);
