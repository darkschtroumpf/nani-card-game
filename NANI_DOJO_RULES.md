# NANI?! Dojo — Game Design Document

## Overview
NANI?! Dojo is a card game combining **deck building** and **bluff** mechanics.
2-5 players, ~12 turns per game, anime-themed with 5 universe archetypes.

---

## Core Concepts

### Two-Deck System
Each player has TWO decks shuffled together:
- **Sensei Deck** (10 cards, pre-built) — SECRET, opponents never see its composition
- **Dojo Cards** (acquired mid-game from shared market) — VISIBLE when purchased

This creates permanent information asymmetry: opponents track your Dojo purchases but never know your base cards.

### Five Bluff Layers
1. **Deck Composition** — Sensei Deck is hidden, Dojo picks are visible
2. **Concealed Fighters** — deployed face-down, could be anything
3. **Universe Declaration** — declare universe when attacking with concealed fighter (can lie)
4. **Trap Zone Bluff** — any card can be set as a "trap" face-down
5. **Dojo Seeding** — swap cards into the Dojo face-down (poisoned gifts)

---

## Resources

| Resource | Start | Growth | Cap | Usage |
|----------|-------|--------|-----|-------|
| **Ki** | 2 | +1 max/turn | 7 | Play cards, buy from Dojo |
| **Focus** | 0 | +1 per duel won, +2 per meditate | — | Signatures, special abilities |
| **LP** | 50 | — | 50 | Life points, lose = eliminated |

---

## Card Types

### Fighters (Ki cost 1-4)
- Have ATK and HP stats
- Can be deployed **face-up** or **concealed** (face-down, costs 1 less Ki)
- Max 3 on field simultaneously
- Both fighters deal damage in combat (bidirectional)
- Permanent HP reduction on damage taken

### Techniques (Ki cost 1-2)
- Instant effects from hand
- Can be played during combat as reaction
- Effects: buff_atk (+3 ATK), heal (+3 LP), draw (2 cards), shield (block 4 dmg), negate (cancel technique), return_hand, steal_ki, direct_damage (3 LP), peek (reveal concealed)

### Traps (Ki cost 1 to set)
- Set face-down in Trap Zone (max 2 slots)
- Trigger on opponent's attack
- Auto-removed after 3 turns
- **ANY card** can be set as a fake trap (bluff)
- Effects: damage (3-4 to attacker), heal (+2 LP), destroy (if ATK ≤ 3)

### Equipment (Ki cost 1-2)
- Attach to a fighter (max 1 per fighter)
- Can be attached face-down (hidden bonus)
- Destroyed when fighter is destroyed
- Bonuses: ATK +1-3, HP +0-2

### Signatures (Ki cost 2-4 + Focus cost 2-4)
- 1 per deck, extremely powerful
- Require Focus to activate
- Each archetype has a unique signature

---

## Universes & Dominance

5 universes in a rock-paper-scissors cycle:
```
Shonen > Magical > Mecha > Isekai > Seinen > Shonen
```

**Dominance bonus: +3 ATK** when your universe dominates the opponent's.

---

## Turn Structure (6 phases)

### 1. Ki Phase
- Max Ki +1 (cap 7)
- Ki refills to max
- Draw 1 card (if empty draw pile, shuffle discard into new draw pile)
- If no cards anywhere: deck out (LP = 0)
- Arc Event check every 5 turns

### 2. Dojo Phase (optional, pick one)
- **Buy**: pay Ki cost, card goes to discard pile. ALL players see what you bought.
- **Spar**: swap a hand card (face-down) with a Dojo card. Others see what you took but not what you put back.
- **Meditate**: skip Dojo, gain +2 Focus
- **Skip**: do nothing

### 3. Deploy Phase
- Play fighters (face-up or concealed)
- Set traps (real or bluff)
- Equip items
- Activate Signature

### 4. Combat Phase (1 attack max)
- Choose attacking fighter and target (opponent's fighter, or direct LP if they have no fighters)
- **Declaration**: must declare attacker's universe. If concealed, can lie.
- **Defender Response**: play technique, trigger trap, or do nothing
- **NANI?! Call**: defender can call "NANI?!" on a concealed attacker (free, but 3 LP penalty if wrong)
  - If attacker **lied**: attacker's fighter destroyed, defender draws 1 card
  - If attacker **told truth**: defender loses 3 LP
- **Resolution**: fighters revealed, dominance calculated, damage applied
- **Both fighters deal ATK damage simultaneously** (bidirectional combat)
- **Overflow damage** goes to defender's LP
- **Kill reward**: destroying an enemy fighter = draw 1 card

### 5. End Phase
- **Anti-turtle**: if player hasn't attacked in 3 turns, lose 5 LP
- Discard to 7 cards
- Refill Dojo to 3 cards
- Check victory conditions

### 6. Arc Events (every 5 turns)
- **Tournament Arc**: must attack this turn
- **Filler Episode**: all players draw 2 cards
- **Power Up**: all fighters +1 ATK
- **Plot Twist**: all traps revealed
- **Betrayal Arc**: all players lose 2 LP

---

## Victory Conditions

1. **LP Victory**: reduce all opponents to 0 LP (last standing wins)
2. **Multiverse Convergence**: control face-up fighters from 3+ different universes simultaneously
3. **Deck Out**: if you must draw and can't, you lose (LP = 0)
4. **Stalemate**: after 60 turns, highest LP wins

---

## Archetypes & Sensei Decks

### Shonen Blitz (aggressive, burst damage)
- **Signature**: BANKAI! (3 Ki, 2 Focus) — all fighters +4 ATK
- **Identity**: high ATK fighters, combat tricks, overwhelm with damage
- **Fighters**: 3/3, 5/3, 6/4, 7/5

### Magical Ward (balanced, healing)
- **Signature**: Constellation Celeste (3 Ki, 4 Focus) — heal all fighters + 4 LP
- **Identity**: balanced stats, healing, technique negation, resilient
- **Fighters**: 2/4, 4/4, 5/5, 6/5

### Mecha Fortress (defensive, tanky)
- **Signature**: Synchronisation Eva (4 Ki, 4 Focus) — one fighter +4 HP
- **Identity**: high HP fighters, shields, equipment synergy, slow but hard to kill
- **Fighters**: 2/4, 3/5, 4/5, 5/5

### Isekai Thief (disruptive, versatile)
- **Signature**: Respawn (3 Ki, 3 Focus) — revive a fighter from discard
- **Identity**: Ki steal, board flexibility, deception, recursion
- **Fighters**: 2/4, 4/4, 5/4, 6/5

### Seinen Assassin (glass cannon, bluff-heavy)
- **Signature**: Death Note (2 Ki, 3 Focus) — destroy any enemy fighter instantly
- **Identity**: highest ATK, always conceals, frequent bluffer, burst kills
- **Fighters**: 3/3, 5/3, 7/3, 9/3

---

## Sensei Deck Compositions (10 cards each)

```
shonen_blitz:   sig, f1, f2×2, f3, f4, t1×2 (Coup de Poing), t2 (Deuxième Souffle), eq1
magical_ward:   sig, f1×2, f2×2, f3, t1 (Soin), t2 (Bouclier), tr1 (Miroir), eq1
mecha_fortress: sig, f1, f2×2, f3, t1 (Surcharge), t2 (Champ de Force), tr1 (Mine), eq1, mg-f1 (splash)
isekai_thief:   sig, f1×2, f2×2, f3, t1 (Portail), t2 (Vol de Ki), tr1 (Piège), eq1
seinen_assassin: sig, f1×2, f2×2, f3, t1×2 (Frappe Fatale), tr1 (Embuscade), eq1
```

---

## Complete Card Database

### Fighters
| ID | Name | Universe | Ki | ATK | HP |
|----|------|----------|-----|-----|-----|
| sh-f1 | Apprenti Ninja | shonen | 1 | 3 | 3 |
| sh-f2 | Duelliste Fougueux | shonen | 2 | 5 | 3 |
| sh-f3 | Rival Eternel | shonen | 3 | 6 | 4 |
| sh-f4 | Heros Legendaire | shonen | 4 | 7 | 5 |
| mg-f1 | Familier Lunaire | magical | 1 | 2 | 4 |
| mg-f2 | Sorciere Etoilee | magical | 2 | 4 | 4 |
| mg-f3 | Gardienne Celeste | magical | 3 | 5 | 5 |
| mg-f4 | Deesse de Lumiere | magical | 4 | 6 | 5 |
| mc-f1 | Drone Eclaireur | mecha | 1 | 2 | 4 |
| mc-f2 | Pilote Recrue | mecha | 2 | 3 | 5 |
| mc-f3 | Mecha Gardien | mecha | 3 | 4 | 5 |
| mc-f4 | Titan Supreme | mecha | 4 | 5 | 5 |
| is-f1 | Voyageur Perdu | isekai | 1 | 2 | 4 |
| is-f2 | Invocateur Sombre | isekai | 2 | 4 | 4 |
| is-f3 | Champion Reincarne | isekai | 3 | 5 | 4 |
| is-f4 | Roi Demon | isekai | 4 | 6 | 5 |
| sn-f1 | Enqueteur Discret | seinen | 1 | 3 | 3 |
| sn-f2 | Mercenaire Froid | seinen | 2 | 5 | 3 |
| sn-f3 | Tueur Fantome | seinen | 3 | 7 | 3 |
| sn-f4 | Stratege Absolu | seinen | 4 | 9 | 3 |

### Techniques
| ID | Name | Universe | Ki | Effect |
|----|------|----------|-----|--------|
| sh-t1 | Coup de Poing Final | shonen | 1 | +3 ATK this combat |
| sh-t2 | Deuxieme Souffle | shonen | 2 | Draw 2 cards |
| mg-t1 | Soin Stellaire | magical | 1 | +3 LP |
| mg-t2 | Bouclier Prismatique | magical | 2 | Negate a technique |
| mc-t1 | Surcharge Reacteur | mecha | 1 | +2 ATK, +2 HP this combat |
| mc-t2 | Champ de Force | mecha | 2 | Block 4 damage |
| is-t1 | Portail Dimensionnel | isekai | 1 | +3 ATK this combat |
| is-t2 | Vol de Ki | isekai | 2 | Steal 2 Ki |
| sn-t1 | Frappe Fatale | seinen | 1 | 3 direct LP damage |
| sn-t2 | Analyse Tactique | seinen | 2 | Reveal a concealed fighter |

### Traps (all 1 Ki to set)
| ID | Name | Universe | Effect |
|----|------|----------|--------|
| sh-tr1 | Contre-Attaque | shonen | Reflect 3 damage to attacker |
| mg-tr1 | Miroir Magique | magical | Cancel attack + heal 2 LP |
| mc-tr1 | Mine Electrique | mecha | 4 damage to attacking fighter |
| is-tr1 | Piege Dimensionnel | isekai | 3 damage to attacking fighter |
| sn-tr1 | Embuscade | seinen | Destroy attacker if ATK ≤ 3 |

### Equipment
| ID | Name | Universe | Ki | ATK+ | HP+ |
|----|------|----------|-----|------|------|
| sh-eq1 | Bandeau du Heros | shonen | 1 | +2 | 0 |
| mg-eq1 | Baguette Enchantee | magical | 1 | +1 | +1 |
| mc-eq1 | Armure Renforcee | mecha | 2 | 0 | +2 |
| is-eq1 | Cape du Voyageur | isekai | 1 | +1 | +1 |
| sn-eq1 | Lame Empoisonnee | seinen | 1 | +3 | 0 |

### Signatures
| ID | Name | Universe | Ki | Focus | Effect |
|----|------|----------|-----|-------|--------|
| sh-sig | BANKAI! | shonen | 3 | 2 | All your fighters +4 ATK |
| mg-sig | Constellation Celeste | magical | 3 | 4 | Heal all fighters + 4 LP |
| mc-sig | Synchronisation Eva | mecha | 4 | 4 | One fighter +4 HP |
| is-sig | Respawn | isekai | 3 | 3 | Revive a fighter from discard |
| sn-sig | Death Note | seinen | 2 | 3 | Destroy any enemy fighter |

---

## Dojo Supply (shared market)
- 3 face-up cards visible at all times
- Refills from a shared supply each turn
- Supply contains: 2 copies of each fighter, technique, equipment; 1 of each trap
- No signatures in the supply (only in Sensei Decks)

---

## Field Layout (per player)
```
[Trap 1] [Trap 2]                    <- Face-down trap zone
[Fighter 1] [Fighter 2] [Fighter 3]  <- Face-up or concealed
Hand: [hidden cards, max 7]
Ki: X/Y  |  Focus: Z  |  LP: ##
```

---

## Balance Notes (from 200-game simulation)

### Winrates (with smart bots)
- Mecha: 26%, Seinen: 22%, Magical: 21%, Isekai: 19%, Shonen: 13%
- Best achieved: 26/22/21/19/13 (11-point spread)

### Key Metrics
- Game duration: ~12 turns
- Bluff success rate: ~67%
- NANI?! calls: ~9/game, ~31% precision
- Multiverse victories: ~10%
- Dojo purchases: ~5/player/game

### Design Insights
- HP bonuses (equipment, signatures) are very powerful — use sparingly
- Return-to-hand effects are OP (essentially free removal) — replaced with damage/buff
- Anti-turtle mechanic (-5 LP after 3 turns no attack) is essential for FFA
- Kill reward (draw 1 card) helps aggressive archetypes
- Political targeting (attack the leader) is crucial for FFA balance
- Concealment rate ~50% creates best bluff dynamics
- NANI?! being free (risk = 3 LP penalty) creates exciting moments every game
