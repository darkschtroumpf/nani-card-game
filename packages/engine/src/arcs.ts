import type { GameState, ArcEvent } from './types';
import { ARC_EVENTS } from './constants';
import { shuffle, drawCards } from './deck';

/** Create a shuffled arc deck */
export function createArcDeck(): ArcEvent[] {
  return shuffle([...ARC_EVENTS]);
}

/** Draw the next arc event */
export function drawArc(state: GameState): ArcEvent | null {
  if (state.arcDeck.length === 0) {
    state.arcDeck = createArcDeck();
  }
  return state.arcDeck.shift() ?? null;
}

/**
 * Apply an arc event to the game state.
 * Returns event descriptions for the log.
 */
export function applyArc(state: GameState, arc: ArcEvent): string[] {
  const events: string[] = [`Arc Narratif : ${arc.name} — ${arc.description}`];
  const alivePlayers = state.players.filter((p) => !p.eliminated);

  switch (arc.type) {
    case 'tournament':
      // Forced attack — handled by the turn logic (restricts action choice)
      break;

    case 'beach_episode':
      // Everyone draws 2 cards, no attacks allowed this round
      for (const player of alivePlayers) {
        const drawn = drawCards(state.deck, 2);
        player.hand.push(...drawn);
      }
      events.push('Tout le monde pioche 2 cartes. Pas d\'attaque ce tour.');
      break;

    case 'trahison': {
      // Two random alive players swap identities
      if (alivePlayers.length >= 2) {
        const shuffled = shuffle([...alivePlayers]);
        const p1 = shuffled[0];
        const p2 = shuffled[1];
        const temp = p1.identity;
        p1.identity = p2.identity;
        p2.identity = temp;
        const tempRevealed = p1.identityRevealed;
        p1.identityRevealed = p2.identityRevealed;
        p2.identityRevealed = tempRevealed;
        events.push(`${p1.name} et ${p2.name} échangent leurs identités secrètes !`);
      }
      break;
    }

    case 'final_boss':
      // Boss appears with 5 HP — handled by turn logic
      state.finalBossHp = 5;
      events.push('Un Final Boss (5 PV) apparaît !');
      break;

    case 'flashback': {
      // A random eliminated player comes back
      const eliminated = state.players.filter((p) => p.eliminated);
      if (eliminated.length > 0) {
        const revived = shuffle([...eliminated])[0];
        revived.eliminated = false;
        revived.plotArmor = 1;
        const drawn = drawCards(state.deck, 2);
        revived.hand.push(...drawn);
        events.push(`Flashback ! ${revived.name} revient avec 1 PA et 2 cartes !`);
      } else {
        events.push('Flashback... mais personne à ramener.');
      }
      break;
    }

    case 'filler':
      events.push('...');
      break;

    case 'power_up':
      // Players CAN (optional) discard 2 cards to gain 1 PA — handled by UI
      events.push('Les joueurs peuvent défausser 2 cartes pour gagner 1 Plot Armor.');
      break;

    case 'plot_twist': {
      // Collect all hands, shuffle, redistribute evenly
      const allCards = alivePlayers.flatMap((p) => {
        const cards = [...p.hand];
        p.hand = [];
        return cards;
      });
      shuffle(allCards);
      const perPlayer = Math.floor(allCards.length / alivePlayers.length);
      for (let i = 0; i < alivePlayers.length; i++) {
        alivePlayers[i].hand = allCards.slice(i * perPlayer, (i + 1) * perPlayer);
      }
      // Remaining cards go to the deck
      const remaining = allCards.slice(alivePlayers.length * perPlayer);
      state.deck.push(...remaining);
      events.push('Plot Twist ! Toutes les mains sont redistribuées !');
      break;
    }
  }

  return events;
}
