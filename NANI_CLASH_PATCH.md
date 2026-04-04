# NANI?! Clash of Destinies -- Rules Patch v2.1

This patch addresses 15 critical and major issues identified in playtesting review.
Each fix states the problem, the solution, and why it works.

---

## CRITICAL FIX 1: NANI?! Risk/Reward Redesign (The Core Fix)

### Problem
Lying costs you your fighter (destroyed) + 2 LP if caught. Telling truth costs the defender 3 LP. The attacker risks a card AND LP damage to maybe avoid a +2 ATK dominance swing. No rational player bluffs -- the "pot" is tiny (avoid +2 ATK) and the "bet" is enormous (lose your fighter + 2 LP). The core mechanic of the game is dead on arrival.

### Fix: The Bluff Pot System
Redesign NANI?! resolution completely. The attacker now has a REWARD for lying successfully, not just penalty avoidance:

**New NANI?! Resolution:**

When attacking with a concealed fighter, you declare its universe (you may lie). The defender may call "NANI?!":

**If NANI?! is called:**
- **Attacker LIED and was CAUGHT**: Attacker's fighter is flipped face-up (NOT destroyed). Combat proceeds with true universe. Defender gains +1 Focus.
- **Attacker told TRUTH and was wrongly accused**: Defender loses 3 LP. Attacker's fighter gains **Momentum** (+2 ATK this combat, stacks with dominance).

**If NANI?! is NOT called:**
- **Attacker LIED and was NOT caught**: The declared universe is treated as real for this combat (dominance calculated on the LIE). Additionally, attacker deals +2 bonus LP damage if they win the combat (the "bluff pot"). The fighter is revealed after combat as normal.
- **Attacker told TRUTH**: Normal combat. No bonus.

### Why This Works
Now lying has a REAL reward: you get favorable dominance AND +2 bonus damage. This is the "pot." The risk (getting flipped face-up, losing the element of surprise) is proportional -- you lose your bluff but keep your fighter. Compare to poker: you risk your bet (the concealment) to win the pot (dominance + bonus damage). The defender's NANI?! call is also better calibrated: correct calls give Focus (useful) without costing the attacker their entire board position.

The old system was: "risk everything to avoid a small penalty." The new system is: "risk your concealment to gain a real advantage." Players will WANT to lie.

**Additional rule**: A fighter that has been flipped by a NANI?! call cannot be concealed again. It stays face-up permanently.

---

## CRITICAL FIX 2: Mecha Overclock Rework

### Problem
Overclock doubles equipment bonuses. With Canon Embarque (+2 ATK becoming +4 ATK) on a Titan Supreme (4 ATK, 7 HP), you get an 8/7 on turn 4-5. Combined with Dojo equipment purchases, Mecha creates unkillable voltron monsters. The 26% winrate in simulation confirms this is overtuned.

### Fix
Replace Overclock with **MODULAR FRAME**:

**MODULAR FRAME** (new passive): Your fighters may equip up to 2 equipment cards (other archetypes: max 1). When a Mecha fighter with 2 equipment is destroyed, you may salvage 1 equipment to your hand.

**Restat Mecha equipment:**
- Armure Renforcee: 1 Ki, +0 ATK / +2 HP (unchanged, no doubling)
- Canon Embarque: 2 Ki, +2 ATK / +0 HP (unchanged, no doubling)

**Restat Signature -- SYNCHRONISATION EVA**: (3 Ki, 3 Focus): One fighter gains +2 ATK and +2 HP permanently. If it has 2 equipment, also draw 2 cards.

### Why This Works
Mecha's fantasy is "build and upgrade." Modular Frame preserves that identity -- you stack MORE equipment, not BIGGER equipment. The ceiling is lower (a 2-equipment fighter gets maybe +2 ATK/+2 HP total instead of +4/+4 from doubled stats), but the floor is higher (salvage gives resilience). Opponents still have clear counterplay: destroy the fighter before the second equip lands. The signature is also toned down from the absurd Overclock ceiling.

---

## CRITICAL FIX 3: Seinen Cold Read Rework

### Problem
Cold Read lets Seinen peek at 1 face-down card per turn for free. In 2-player, this means Seinen sees EVERYTHING within 2-3 turns: every concealed fighter, every trap, every hidden equipment. Bluffing against Seinen is pointless, which kills Layer 2-5 of the bluff system for 50% of the table.

### Fix
Replace Cold Read with **KILLING INTENT**:

**KILLING INTENT** (new passive): Once per turn, when you declare an attack, you may name a card type (Fighter, Technique, Trap, or Equipment). If the defender plays or reveals a card of that type during this combat, you deal +2 damage to their LP after combat resolves.

**2-player adjustment removed**: Seinen no longer needs a special 2-player nerf because the passive no longer breaks information economy.

### Why This Works
Seinen's fantasy is "the cold, calculating killer who reads you." Killing Intent preserves that fantasy without giving free perfect information. Instead of passively peeking, Seinen must DECLARE what they expect, creating a mind game. The opponent has a choice: play their trap/technique and eat +2 LP damage, or hold it and take the normal combat hit. This is a BLUFF mechanic, not an anti-bluff mechanic. It makes Seinen the scariest attacker without destroying the information asymmetry the game needs.

Seinen's existing glass cannon statlines (high ATK, 3 HP) remain the counterplay -- they hit hard but die to everything.

---

## CRITICAL FIX 4: The Ronin Destiny Rework

### Problem
The Ronin destiny requires "Win with no cards in hand or draw pile." Emptying your hand AND draw pile means you have no cards to play, no fighters to deploy, and no way to defend. You die the turn you complete it -- or the next turn, guaranteed. The condition is functionally "lose the game, then win."

### Fix
**The Ronin** (revised): "Win with 0 cards in hand and 2 or fewer cards in your draw pile. Announce DESTINY! at the end of your turn."

### Why This Works
Having 0 cards in hand is achievable and dangerous (no techniques to react with, no traps to set). Allowing up to 2 cards in the draw pile means you can still draw and survive for 1-2 more turns. The Ronin must go all-in on deploying and playing everything, which is readable by opponents ("Why does that player keep playing every card they draw?"). It is risky but not suicidal.

---

## MAJOR FIX 5: Pacifist Anti-Turtle Conflict

### Problem
The Pacifist destiny requires "Survive 8 turns without attacking." The anti-turtle rule punishes 3 consecutive turns without attacking (lose 3 LP). Over 8 turns, that is at least 6 LP lost (turns 3 and 6 trigger anti-turtle). The Pacifist is being punished by a core system for pursuing their win condition.

### Fix
**Anti-turtle exemption**: The anti-turtle timer resets whenever you perform ANY offensive action, not just attacks. Offensive actions include:
- Attacking (as before)
- Calling NANI?!
- Triggering a trap that deals damage
- Using Expose

**The Pacifist** (revised): "Survive 8 turns without declaring an attack with a fighter."

NANI?! calls, Expose attempts, and traps do NOT count as "attacking" for the Pacifist's destiny. But they DO reset the anti-turtle timer.

### Why This Works
The Pacifist can now actively participate in the game (calling NANI?!, exposing destinies, setting real traps) without breaking their destiny condition. They are not just sitting idle -- they are playing a defensive bluff game. Anti-turtle still punishes truly passive players who do literally nothing.

---

## MAJOR FIX 6: Multiverse Convergence Accessibility

### Problem
Multiverse requires 3 different universes face-up simultaneously. The Dojo is the only source of off-universe cards, and it shows only 3 random cards. Getting the RIGHT universes from the Dojo is almost impossible without Isekai's World Hopper passive. The win condition exists on paper but is functionally Isekai-exclusive.

### Fix
Three changes:

1. **Dojo Diversity Guarantee**: When refilling the Dojo, if all 3 revealed cards share the same universe, discard one and reveal a replacement. Repeat until at least 2 universes are represented.

2. **Multiverse threshold lowered**: Control fighters from **2 different non-native universes** (total of at least 3 universes counting your own) face-up at end of turn. This is unchanged in number (still 3 universes) but the wording clarifies that your own archetype counts.

3. **Spar is more flexible**: When you Spar, you may look at the top 2 cards of the Dojo supply and choose one of those instead of a face-up card. (You still swap a hand card face-down as normal.) Others see what you took.

### Why This Works
Dojo diversity means off-universe cards appear more consistently. Enhanced Spar gives players agency in finding cross-universe cards without making it free. Multiverse remains a stretch goal but is now achievable for any archetype willing to invest in Dojo shopping, not just Isekai.

---

## MAJOR FIX 7: Focus Economy for Magical Ward

### Problem
Magical Ward's Constellation Celeste costs 4 Focus. Focus grows at +1 per combat win or +2 per Meditate. Magical plays defensively and rarely initiates combat, so Focus from combat wins is unreliable. Meditating 2 times (4 turns of skipping Dojo) to reach 4 Focus is glacially slow, and Magical needs the Dojo to build their board.

### Fix
Two changes:

1. **Constellation Celeste** cost reduced: 3 Ki, **3 Focus** (was 4 Focus).

2. **STARLIGHT BOND** (passive, revised): At the start of your turn, if you control 2+ fighters, heal all your fighters 1 HP AND gain +1 Focus.

### Why This Works
Magical now generates Focus passively by doing what it already wants to do (maintain a wide board). With 2+ fighters on field, Magical earns 1 Focus/turn automatically. Combined with an occasional Meditate, reaching 3 Focus for the Signature takes 3-4 turns instead of 6-8. This matches Shonen's Focus curve (they earn Focus from combat wins at a similar rate).

---

## MAJOR FIX 8: Dojo Slot Machine Fix

### Problem
The Dojo reveals 3 random cards from a large supply. You might see 3 cards that are useless to your strategy. There is no way to influence what appears. This makes the Dojo feel like a slot machine rather than a strategic market.

### Fix
**Dojo Cycling**: Once per Dojo phase, before choosing your Dojo action, you may pay 1 Ki to discard one face-up Dojo card to the bottom of the supply and reveal a replacement. You may only cycle once per turn.

### Why This Works
For 1 Ki (a real cost), you get one reroll on one slot. You cannot cycle the entire Dojo (only 1 card), so bad offerings still happen. But you have agency. Over several turns, players collectively shape the Dojo through cycling and purchasing. This is a small fix with large feel-good impact.

---

## MAJOR FIX 9: Tempo -- Summoning Sickness + 1 Attack

### Problem
You deploy a fighter (summoning sickness, cannot attack). Next turn, you attack once. That is 2 full turns to get ONE attack from a new fighter. In a 12-turn game, that is brutally slow. Combined with bidirectional combat (your attacker takes damage too), aggression is heavily punished.

### Fix
Two changes:

1. **Rush keyword**: Fighters that cost 1 Ki deploy with Rush (can attack the turn they are deployed). Fighters costing 2+ Ki still have summoning sickness. This gives cheap fighters a role as immediate threats.

2. **Combat Phase allows 1 attack per fighter that is eligible**, up to a maximum of **2 attacks per turn**. (Previously: 1 attack total.) You cannot attack with the same fighter twice. This is instead of OR in addition to an Expose.

### Why This Works
Rush on cheap fighters means Turn 1 is not dead. You can deploy a 1-Ki fighter and swing immediately, creating early interaction. 2 attacks per turn means a player with a developed board can pressure on two fronts, rewarding investment in multiple fighters (especially relevant for Magical's wide board and Shonen's powered-up roster). Games will be 2-3 turns shorter, hitting the 12-15 turn target.

**Expose remains an alternative to ONE of your attacks** (not both). You can attack once and Expose once, or attack twice, or Expose once and skip attacking.

---

## MAJOR FIX 10: Expose Guessing Game

### Problem
12 destinies with overlapping behavioral signals. The Collector and The Borrower both buy from the Dojo. The Assassin and the Rival both attack aggressively. Expose costs 2 Focus and guessing wrong costs 3 LP. With 12 options, even a good read gives you maybe 30% confidence, making Expose a terrible bet.

### Fix
Three changes:

1. **Reduce Destiny pool to 8** (cut 4 that overlap or are problematic):
   - CUT: The Hermit (too passive, overlaps with Pacifist's Meditate signal)
   - CUT: The Cheapshot (too narrow, burn damage is hard to track)
   - CUT: The Borrower (overlaps with Collector's Dojo signal)
   - CUT: The Rival (too political, kingmaker in multiplayer)

   **Remaining 8 Destinies:**
   | # | Name | Condition | Signal |
   |---|------|-----------|--------|
   | 1 | The Collector | Own 6+ Dojo cards | Buys constantly |
   | 2 | The Untouchable | Win without losing a fighter | Plays ultra-defensive |
   | 3 | The Assassin | Destroy 4 enemy fighters | Attacks relentlessly |
   | 4 | The Deceiver | Win 3 NANI?! bluffs (lied, not caught) | Attacks concealed constantly |
   | 5 | The Prophet | Successfully call NANI?! 3 times | Calls NANI?! frequently |
   | 6 | The Emperor | Control 3 fighters for 2 consecutive turns | Wide board |
   | 7 | The Ronin | Win with 0 hand, 2 or fewer in draw pile | Plays every card immediately |
   | 8 | The Pacifist | Survive 8 turns without fighter attacks | Never attacks with fighters |

2. **Expose gives a hint on failure**: When you Expose incorrectly, the target must say "Higher" or "Lower" (referring to the Destiny card number). This narrows the field for future attempts.

3. **Expose cost reduced**: 1 Focus (was 2). Wrong guess penalty stays at 3 LP.

### Why This Works
8 destinies with distinct signals are readable. Each destiny now maps to a unique, observable behavior pattern. The higher/lower hint on failure means Expose attempts are investments, not pure gambles. Lower Focus cost makes attempting Expose more viable, creating the cat-and-mouse deduction game that the Destiny system promises.

---

## MAJOR FIX 11: Arc Events Kingmaker Problem

### Problem
Arc Events are random and can decide games. Tournament Arc forces attacks, which can kill a player who was about to win via Destiny. Plot Twist reveals all hidden cards, destroying one player's bluff-heavy strategy while barely affecting another. They are random kingmakers.

### Fix
**Replace random Arc Events with a deterministic Arc Track:**

Arc Events now follow a fixed, publicly known sequence:
- **Turn 5**: Filler Episode (all draw 2) -- catch-up, low impact
- **Turn 8**: Power Up (all fighters +1 ATK) -- accelerates mid-to-late
- **Turn 11**: Tournament Arc (must attack or lose 3 LP) -- forces endgame

**Plot Twist and Betrayal Arc are cut.** Plot Twist randomly punished bluff-heavy players. Betrayal Arc was pure randomness with no counterplay.

The Arc Track is public knowledge from the start of the game. Players can plan around it.

### Why This Works
Deterministic events are strategic, not random. Players know Tournament Arc is coming on turn 11 and can prepare. No one gets blindsided by a random "all your bluffs are revealed" event. Three events at fixed intervals is cleaner than five random ones.

---

## MAJOR FIX 12: No LP Damage Prevention

### Problem
There is no way to prevent direct LP damage. Once a fighter dies or you have no fighters, opponents deal full ATK to your LP with no interaction. A player at low LP has no comeback tool.

### Fix
**Emergency Guard** (new universal rule): Once per turn, when you would take direct LP damage (from a direct attack, overflow, or effect), you may discard 1 card from your hand to reduce that damage by 2.

### Why This Works
It costs a card (real resource), it is limited (once per turn, only -2), and it requires a hand card (so The Ronin cannot abuse it when they have no hand). It gives losing players one more turn of agency without negating aggression. A 6 ATK direct hit still deals 4 LP damage after the guard.

---

## MAJOR FIX 13: First Player Advantage

### Problem
First player gets first Dojo buy, first deploy, first attack. In a 12-turn game, being one full turn ahead is significant.

### Fix
**Staggered start:**
- Player 1: Starts with 2 Ki, draws 4 cards.
- Player 2: Starts with 3 Ki, draws 4 cards.
- Player 3+: Starts with 2 Ki, draws 5 cards.

### Why This Works
Player 2 gets 1 extra Ki on turn 1, letting them match Player 1's tempo (P1 deployed a 2-cost fighter? P2 can deploy a 3-cost fighter). Player 3+ get an extra card, giving hand advantage to compensate for late position. Simple, no new rules to learn.

---

## MAJOR FIX 14: Anti-Turtle Punishes Unlucky Players

### Problem
Anti-turtle (lose 3 LP after 3 turns without attacking) punishes players who had no fighters to attack with (drew only techniques/traps) or whose fighters all got destroyed. They are not turtling by choice -- they are unlucky. Losing LP for bad draws feels terrible.

### Fix
Anti-turtle now checks INTENT, not just action:

**Revised Anti-Turtle**: If you have at least 1 fighter on field that could attack (no summoning sickness) and you choose not to attack for 3 consecutive turns, lose 3 LP.

If you have NO eligible attackers (no fighters, or all fighters have summoning sickness), the timer does NOT tick.

Additionally, per Fix 5, the timer resets on ANY offensive action (NANI?! call, trap damage, Expose).

### Why This Works
Players who cannot attack are not punished for something outside their control. Players who choose to turtle despite having attackers still get punished. The offensive action reset (Fix 5) gives additional outs.

---

## MAJOR FIX 15: Deceiver/Prophet Cooperation Problem

### Problem
The Deceiver needs opponents to call NANI?! on their truthful declarations (3 times). The Prophet needs to correctly call NANI?! (3 times). Both require the OPPONENT to do something specific, and the current NANI?! incentives discourage that cooperation. Defenders rarely call NANI?! because 3 LP is steep, so the Prophet struggles. Attackers rarely lie because the penalty is fighter destruction, so the Deceiver has few opportunities.

### Fix
This is largely resolved by Critical Fix 1 (NANI?! redesign). Under the new system:

- **More lying happens** because the reward for undetected lies is real (+2 bonus LP damage + false dominance). This means defenders MUST call NANI?! more often to police bluffs.
- **More NANI?! calls happen** because the defender penalty for a wrong call is still 3 LP but the attacker reward for lying is now strong enough that NOT calling is also risky.

**Revised Deceiver**: "Have 3 successful undetected bluffs (you lied about universe and were not called)."

This is better than the old version ("opponent called and you were truthful") because it rewards the Deceiver for doing what they naturally want to do -- lie and get away with it. It no longer requires opponent cooperation; it requires opponent FAILURE to detect.

**Prophet unchanged**: "Successfully call NANI?! 3 times." With more lying in the metagame (per Fix 1), there are more opportunities to catch liars.

### Why This Works
Fix 1 creates an ecosystem where lying is attractive (good reward) and NANI?! calling is necessary (to prevent that reward). Both the Deceiver and Prophet now operate within a healthy bluff economy rather than begging opponents to cooperate against their own interests.

---

## SUMMARY OF ALL CHANGES

### Mechanics Changed
| Area | Old | New |
|------|-----|-----|
| NANI?! (liar caught) | Fighter destroyed + 2 LP | Fighter flipped face-up, defender +1 Focus |
| NANI?! (liar not caught) | No bonus | +2 bonus LP damage + fake dominance |
| NANI?! (truth, wrongly accused) | Defender -3 LP | Defender -3 LP, attacker +2 ATK this combat |
| Mecha passive | Overclock (double equip stats) | Modular Frame (2 equip slots, salvage 1) |
| Seinen passive | Cold Read (peek 1 face-down/turn) | Killing Intent (name card type for +2 LP damage) |
| Magical passive | Starlight Bond (heal 1 HP) | Starlight Bond (heal 1 HP AND +1 Focus) |
| Constellation Celeste Focus cost | 4 Focus | 3 Focus |
| Synchronisation Eva | +3 ATK/+3 HP temp, ignores equip limit | +2 ATK/+2 HP permanent, draw 2 if 2 equip |
| Attacks per turn | 1 | Up to 2 (different fighters) |
| 1-Ki fighters | Summoning sickness | Rush (can attack immediately) |
| Anti-turtle | Ticks always | Only ticks if you HAVE an eligible attacker |
| Anti-turtle reset | Attack only | Any offensive action |
| Expose cost | 2 Focus | 1 Focus |
| Expose failure | Nothing happens, -3 LP | Higher/Lower hint, -3 LP |
| Destiny count | 12 | 8 |
| Arc Events | 5 random events | 3 fixed events on known turns |
| Dojo cycling | None | Pay 1 Ki to replace 1 Dojo card |
| Dojo Spar | Pick from face-up only | Pick from face-up OR top 2 of supply |
| Dojo refill | Pure random | Diversity guarantee (2+ universes) |
| LP damage prevention | None | Emergency Guard (discard 1 card, -2 damage) |
| First player | No compensation | Staggered Ki/cards for P2/P3+ |
| Ronin destiny | 0 hand + 0 draw pile | 0 hand + 2 or fewer in draw pile |
| Pacifist + anti-turtle | Direct conflict | Pacifist exempted; offensive actions reset timer |
| Deceiver destiny | 3x "opponent called, you were truthful" | 3x "you lied and were not caught" |

### Mechanics Cut
- Overclock (double equipment -- degenerate)
- Cold Read (free peek -- kills bluff in 2-player)
- Plot Twist arc event (random bluff punishment)
- Betrayal Arc event (pure random damage)
- 4 Destinies: Hermit, Cheapshot, Borrower, Rival (overlapping signals, problematic designs)

### Design Philosophy Check
After all fixes:
1. **Bluffing is the heart**: Lying now has a real reward (+2 LP damage + fake dominance). NANI?! calls are genuinely tense because both outcomes matter. The Deceiver and Prophet both thrive in this ecosystem.
2. **Readable opponents**: 8 distinct Destinies with clear signals. Expose with hints makes deduction rewarding, not gambling.
3. **Asymmetric mastery**: All 5 archetypes have distinct, functional identities. No archetype breaks a core system.
4. **Escalating tension**: Rush on 1-Ki fighters and 2 attacks/turn mean early game has action. Fixed Arc Track builds toward a known climax. Emergency Guard prevents feel-bad blowouts.
5. **15-20 minute games**: Faster tempo (Rush, 2 attacks) and deterministic arc events keep games on track.
