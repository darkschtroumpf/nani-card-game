import type { Card, Player, GameState, DuelResult, UniverseBonus, Universe } from './types';
import { dominates, DOMINANCE_BONUS, MAX_SHIELDS } from './constants';
import { drawCards } from './deck';

/**
 * Resolve a duel between two cards.
 * Pure function — returns the result without mutating anything.
 */
export function resolveDuel(
  attackerCard: Card,
  defenderCard: Card,
  attackerId: string,
  defenderId: string,
): DuelResult {
  const outsider1Beats7 =
    (attackerCard.value === 1 && defenderCard.value === 7) ||
    (defenderCard.value === 1 && attackerCard.value === 7);

  let attackerTotal = attackerCard.value;
  let defenderTotal = defenderCard.value;
  let dominanceResult: 'attacker' | 'defender' | 'none' = 'none';

  if (attackerCard.universe !== defenderCard.universe) {
    if (dominates(attackerCard.universe, defenderCard.universe)) {
      attackerTotal += DOMINANCE_BONUS;
      dominanceResult = 'attacker';
    } else if (dominates(defenderCard.universe, attackerCard.universe)) {
      defenderTotal += DOMINANCE_BONUS;
      dominanceResult = 'defender';
    }
  }

  let winnerId: string | null = null;
  let loserId: string | null = null;
  let tie = false;

  if (outsider1Beats7) {
    if (attackerCard.value === 1) {
      winnerId = attackerId;
      loserId = defenderId;
    } else {
      winnerId = defenderId;
      loserId = attackerId;
    }
  } else if (attackerTotal > defenderTotal) {
    winnerId = attackerId;
    loserId = defenderId;
  } else if (defenderTotal > attackerTotal) {
    winnerId = defenderId;
    loserId = attackerId;
  } else {
    tie = true;
  }

  const winnerCard =
    winnerId === attackerId ? attackerCard : winnerId === defenderId ? defenderCard : attackerCard;

  const bonusApplied: UniverseBonus = winnerId
    ? {
        type: winnerCard.universe,
        doubled: winnerCard.value === 7,
        description: getBonusDescription(winnerCard.universe, winnerCard.value === 7),
      }
    : { type: attackerCard.universe, doubled: false, description: '' };

  return {
    attackerId,
    defenderId,
    winnerId,
    loserId,
    attackerCard,
    defenderCard,
    attackerTotal,
    defenderTotal,
    dominanceBonus: dominanceResult,
    outsiderVictory: outsider1Beats7 && winnerId !== null,
    tie,
    bonusApplied,
  };
}

function getBonusDescription(universe: Universe, doubled: boolean): string {
  const descriptions: Record<Universe, [string, string]> = {
    shonen: ['Pioche 1 carte', 'Pioche 2 cartes'],
    magical: ['+1 Plot Armor', '+2 Plot Armor'],
    mecha: ['+1 Bouclier', '+2 Boucliers'],
    isekai: ['Vole la carte adverse', 'Vole la carte + voit la main'],
    seinen: ['Identité OU 2 cartes', 'Identité ET 2 cartes'],
  };
  return descriptions[universe][doubled ? 1 : 0];
}

/**
 * Apply the duel result to the game state.
 * Mutates state. Returns event descriptions for the game log.
 */
export function applyDuelResult(state: GameState, result: DuelResult): string[] {
  const events: string[] = [];

  if (result.tie) {
    events.push('Égalité ! Les deux joueurs reprennent leur carte.');
    return events;
  }

  const winner = state.players.find((p) => p.id === result.winnerId)!;
  const loser = state.players.find((p) => p.id === result.loserId)!;

  const winnerCard = result.winnerId === result.attackerId ? result.attackerCard : result.defenderCard;
  const loserCard = result.loserId === result.attackerId ? result.attackerCard : result.defenderCard;

  // Remove both cards from hands
  removeCardFromHand(winner, winnerCard);
  removeCardFromHand(loser, loserCard);

  // Winner gets their card back
  winner.hand.push(winnerCard);

  // Loser's card goes to discard (may be stolen by Isekai bonus)
  state.discard.push(loserCard);

  // Loser takes damage
  if (loser.shields > 0) {
    loser.shields--;
    events.push(`${loser.name} absorbe le dégât avec un Bouclier.`);
  } else {
    loser.plotArmor--;
    events.push(`${loser.name} perd 1 Plot Armor (${loser.plotArmor} restant).`);
  }

  // Track damage for Antagoniste objective
  winner.damagedPlayerIds.add(loser.id);

  // Apply universe bonus
  const bonusEvents = applyUniverseBonus(state, winner, loser, loserCard, result.bonusApplied);
  events.push(...bonusEvents);

  // Special: if outsider (1) won, reveal loser's identity
  if (result.outsiderVictory) {
    loser.identityRevealed = true;
    events.push(
      `L'Outsider triomphe ! L'identité de ${loser.name} est révélée : ${loser.identity.type}.`,
    );
  }

  // Check elimination
  if (loser.plotArmor <= 0 || loser.hand.length === 0) {
    loser.eliminated = true;
    events.push(`${loser.name} est éliminé !`);
    winner.eliminatedPlayerIds.push(loser.id);
  }

  return events;
}

function removeCardFromHand(player: Player, card: Card): void {
  const index = player.hand.findIndex((c) => c.id === card.id);
  if (index !== -1) {
    player.hand.splice(index, 1);
  }
}

function applyUniverseBonus(
  state: GameState,
  winner: Player,
  loser: Player,
  loserCard: Card,
  bonus: UniverseBonus,
): string[] {
  const events: string[] = [];
  const amount = bonus.doubled ? 2 : 1;

  switch (bonus.type) {
    case 'shonen': {
      const drawn = drawCards(state.deck, amount);
      winner.hand.push(...drawn);
      events.push(`${winner.name} pioche ${drawn.length} carte(s) (Shonen Force).`);
      break;
    }
    case 'magical': {
      winner.plotArmor += amount;
      events.push(`${winner.name} récupère ${amount} Plot Armor (Magical Sparkle).`);
      break;
    }
    case 'mecha': {
      const shieldsToAdd = Math.min(amount, MAX_SHIELDS - winner.shields);
      winner.shields += shieldsToAdd;
      if (shieldsToAdd > 0) {
        events.push(`${winner.name} gagne ${shieldsToAdd} Bouclier(s) (Mecha Titanium).`);
      }
      break;
    }
    case 'isekai': {
      // Steal the loser's discarded card (move from discard to winner's hand)
      const discardIndex = state.discard.findIndex((c) => c.id === loserCard.id);
      if (discardIndex !== -1) {
        state.discard.splice(discardIndex, 1);
        winner.hand.push(loserCard);
        events.push(`${winner.name} vole ${loserCard.universe}-${loserCard.value} (Isekai Cheat).`);
      }
      if (bonus.doubled) {
        events.push(`${winner.name} voit toute la main de ${loser.name} (Isekai 7).`);
      }
      break;
    }
    case 'seinen': {
      if (bonus.doubled) {
        loser.identityRevealed = true;
        events.push(
          `${winner.name} découvre l'identité de ${loser.name} ET voit 2 cartes (Seinen Shadow).`,
        );
      } else {
        // Choice handled by the UI layer — defaults logged here
        events.push(`${winner.name} peut utiliser Seinen Shadow (identité ou 2 cartes).`);
      }
      break;
    }
  }

  return events;
}
