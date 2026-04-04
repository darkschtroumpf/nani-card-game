# NANI?! Clash of Destinies -- Complete Rules v2.0

2-5 players | 15-20 minutes | Mobile-first | Anime theme

---

## DESIGN PHILOSOPHY

Every mechanic earns its place. If a phase has no meaningful choice, it is removed. If a system has no consequence, it is removed. The game is built on three pillars:

1. **Readable opponents** -- you can deduce their plan from their actions, but never be certain
2. **Asymmetric mastery** -- each archetype plays a fundamentally different game
3. **Escalating tension** -- early game is setup, mid game is probing, late game is explosive

---

## 1. WIN CONDITIONS

You win by completing ONE of these:

### A. Knockout (default)
Reduce all opponents to 0 LP. Last player standing wins.

### B. Destiny Fulfilled
Complete your secret Destiny card's condition. Announce "DESTINY!" and reveal it. If the condition is met, you win immediately. If you lied or the condition is not met, you lose 10 LP and your Destiny is discarded (you can no longer win this way).

### C. Multiverse Convergence
Control face-up fighters from 3 different universes simultaneously at end of your turn. Announce it; opponents get one reaction each (technique or trap). If you still control 3 universes after reactions, you win.

**Tiebreaker**: If two players fulfill win conditions simultaneously, Destiny > Multiverse > Knockout. If still tied, highest LP wins.

---

## 2. RESOURCES

| Resource | Start | Growth | Cap | Purpose |
|----------|-------|--------|-----|---------|
| **LP** | 30 | -- | 30 | Life. 0 = eliminated. |
| **Ki** | 2 | +1 max/turn | 7 | Spend to play cards, buy from Dojo. Refills to max each turn. |
| **Focus** | 0 | See below | 10 | Spend on Signatures and archetype abilities. |

**How Focus grows** (pick ONE per turn during Ki Phase):
- **Win a duel**: +1 Focus (automatic, no choice)
- **Meditate in Dojo Phase**: +2 Focus (but skip your Dojo action)
- **Lose LP from a NANI?! call**: +1 Focus (automatic consolation)

**Why Focus exists**: It gates your most powerful plays. Aggressive players earn Focus from combat wins. Passive players Meditate. You always see how much Focus an opponent has, so you know when their Signature is online.

**LP at 30 (not 50)**: Games must end in 15-20 minutes. Lower LP means every attack matters. No padding.

---

## 3. THE DESTINY SYSTEM

### Setup
At game start, each player draws 2 Destiny cards, keeps 1 (the other is removed from the game face-down). Your Destiny is secret.

### Destiny Cards (12 total, draw 2 keep 1)

| # | Name | Condition | Why it changes how you play |
|---|------|-----------|---------------------------|
| 1 | **The Collector** | Own 6+ cards acquired from the Dojo | You buy aggressively, opponents see you shopping |
| 2 | **The Untouchable** | Win without ever losing a fighter | You play extremely defensive, which is readable |
| 3 | **The Assassin** | Destroy 4 enemy fighters | You attack relentlessly, picking off weak targets |
| 4 | **The Deceiver** | Win 3 NANI?! bluffs (opponent called, you were truthful) | You bait NANI?! calls, playing mind games |
| 5 | **The Prophet** | Successfully call NANI?! 3 times | You call NANI?! often, risking LP each time |
| 6 | **The Hermit** | Reach 8 Focus | You Meditate frequently, skipping Dojo buys |
| 7 | **The Emperor** | Control 3 fighters simultaneously for 2 consecutive turns | You build wide boards, vulnerable to AOE |
| 8 | **The Cheapshot** | Deal 10+ direct LP damage (not from fighter combat) | You play burn techniques and traps aggressively |
| 9 | **The Borrower** | Have 3+ cards from other universes on field/hand | You buy cross-universe, signaling Multiverse (or bluffing) |
| 10 | **The Ronin** | Win with no cards in hand or draw pile | You dump your hand fast, living dangerously |
| 11 | **The Pacifist** | Survive 8 turns without attacking | Extremely readable, but you stockpile Focus and cards |
| 12 | **The Rival** | Destroy the player with the most LP | You target the leader, political and visible |

### Reading Destinies
Every Destiny changes your behavior in observable ways. Opponents can DEDUCE your Destiny by watching:
- The Collector buys lots of Dojo cards (public information)
- The Hermit Meditates frequently (visible)
- The Prophet calls NANI?! often (public)
- The Emperor keeps a wide board (visible)

### Exposing a Destiny
During your Combat Phase, instead of attacking, you may spend 2 Focus to **Expose** an opponent: name their Destiny card.
- **Correct**: Their Destiny is revealed and discarded. They lose their Destiny win condition and lose 5 LP. You gain +2 Focus.
- **Wrong**: You lose 3 LP. Nothing else happens.

**Why Expose exists**: It creates a counterplay loop. The more obviously you pursue your Destiny, the more likely someone Exposes you. This forces Destiny players to be subtle, which creates interesting tension between "pursue my goal" and "don't be obvious."

**Why 2 Focus cost**: Prevents spam Expose attempts. You have to be somewhat confident.

---

## 4. CARD TYPES

All card effects are **10 words or fewer**. No exceptions.

### Fighters (Ki cost 1-4)
- Have ATK and HP
- Deploy face-up or **concealed** (face-down, costs 1 less Ki, minimum 1)
- Max 3 on field
- **Summoning sickness**: cannot attack the turn deployed (can defend)
- Combat is **bidirectional**: both fighters deal their ATK as damage simultaneously
- HP damage is permanent. Destroyed at 0 HP.

### Techniques (Ki cost 1-2)
- Play from hand, instant effect
- Can be played as a **reaction** during opponent's combat (costs Ki as normal)
- Resolved immediately

### Traps (Ki cost 1 to set)
- Set face-down in trap zone (max 2 slots)
- **Any card** can be set as a fake trap (bluff)
- Trigger when an opponent attacks you
- Auto-removed after 3 turns if not triggered
- When triggered, revealed and resolved before combat damage

### Equipment (Ki cost 1-2)
- Attach to a fighter (max 1 per fighter)
- Can be attached face-down (opponent doesn't see the bonus)
- Destroyed when the fighter is destroyed

### Signatures (Ki cost 2-4, Focus cost 2-4)
- 1 per Sensei Deck. Extremely powerful.
- Once per game. Goes to "used" pile, not discard.

---

## 5. UNIVERSES AND DOMINANCE

Five universes in a cycle:

```
Shonen beats Magical beats Mecha beats Isekai beats Seinen beats Shonen
```

**Dominance bonus**: +2 ATK when your fighter's universe beats the opponent's.

*Why +2 and not +3*: At +3, dominance was too swingy in testing. +2 matters but doesn't make combat predetermined.

### Universe Declaration (Bluff Core)
When attacking with a **concealed** fighter, you MUST declare its universe. **You may lie.**

The defender can then:
- Respond normally (technique, trap, or nothing)
- Call **"NANI?!"** (see Combat Phase)

This is the heart of the bluff system. If you have a Seinen fighter (weak to Shonen), you might declare "Shonen" to avoid the dominance penalty. But if caught lying, consequences are severe.

---

## 6. TURN STRUCTURE

### Phase 1: Ki Phase (automatic)
- Max Ki +1 (cap 7)
- Ki refills to max
- Draw 1 card
- If draw pile empty: shuffle discard into draw pile. If both empty: lose (LP = 0).
- Trap timers tick (+1 turn). Remove traps at 3 turns.

No choices here. Fully automatic. Keeps the game fast.

### Phase 2: Dojo Phase (pick ONE)
- **Buy**: Pay Ki cost of a face-up Dojo card. It goes to your discard pile. ALL players see what you bought.
- **Spar**: Swap a card from your hand (face-down) with a Dojo card. Others see what you TOOK but not what you PUT BACK. The swapped card enters the Dojo face-up next refill.
- **Meditate**: Skip Dojo action, gain +2 Focus.
- **Skip**: Do nothing.

**Why Spar exists**: It lets you seed the Dojo with bad cards (or your own card you don't need) while grabbing something useful. Opponents see your take but not your give -- information asymmetry.

### Phase 3: Deploy Phase (spend Ki freely)
In any order:
- Deploy fighters (face-up or concealed)
- Set traps (real or bluff)
- Attach equipment
- Activate Signature (if you have the Ki AND Focus)

You can do multiple actions. Deploy 2 fighters and set a trap if you have the Ki.

### Phase 4: Combat Phase (1 attack OR 1 Expose)
Choose ONE:
- **Attack** with one fighter (that wasn't deployed this turn)
- **Expose** an opponent's Destiny (costs 2 Focus, no attack)
- **Skip** combat

#### Attack Resolution:
1. **Declare**: Choose your attacking fighter and a target (opponent's fighter, or direct LP if they have no fighters). If your attacker is concealed, declare its universe (may lie).
2. **Defend**: Defender may play ONE technique from hand AND/OR trigger ONE set trap. Attacker may also play ONE technique as a counter-reaction.
3. **NANI?! Window**: If the attacker is concealed, defender may call "NANI?!" (free action):
   - **Attacker lied about universe**: Attacker's fighter is destroyed. Defender draws 1 card. Attacker loses 2 LP.
   - **Attacker told truth**: Defender loses 3 LP. Attacker gains +1 Focus.
4. **Reveal and Resolve**: Both fighters are revealed (if concealed). Calculate dominance. Both fighters deal their ATK as damage to each other simultaneously. Overflow damage (damage beyond the defender's remaining HP) hits the defender's LP.
5. **Direct attack** (no defending fighter): Attacker deals full ATK to defender's LP.

**Kill reward**: Destroying an enemy fighter in combat = draw 1 card.

### Phase 5: End Phase (automatic)
- **Anti-turtle**: If you haven't attacked in 3 consecutive turns, lose 3 LP.
- Discard down to 7 cards.
- Refill Dojo to 3 face-up cards.
- Check win conditions (Multiverse Convergence check happens here).

---

## 7. THE FIVE ARCHETYPES

Each archetype has:
- A Sensei Deck (10 cards, pre-built, SECRET composition)
- A **unique passive ability** (always active, defines playstyle)
- A Signature card (ultimate move)
- Unique fighters, techniques, traps, equipment

### SHONEN BLITZ -- "The Protagonist"
**Fantasy**: You're the anime hero. You power up through combat. You get stronger the more you fight.

**Passive -- FIGHTING SPIRIT**: When one of your fighters survives combat (takes damage but doesn't die), it gets +1 ATK permanently. This stacks.

**Why this works**: Shonen wants to trade blows, not one-shot. Your fighters grow through battle. Opponents must decide: kill the fighter now before it snowballs, or ignore it and face a monster later. This is the Shonen anime arc -- getting beaten up and coming back stronger.

**Signature -- BANKAI!** (3 Ki, 2 Focus): All your fighters gain +3 ATK this turn.

**Playstyle**: Deploy mid-range fighters, trade combat to power them up, then BANKAI! for a lethal swing turn. You READ as aggressive but patient -- opponents see you trading and know the explosion is coming.

**Fighters**:
| ID | Name | Ki | ATK | HP | Notes |
|----|------|----|-----|----|-------|
| sh-f1 | Apprenti Ninja | 1 | 2 | 4 | Durable early body, grows via passive |
| sh-f2 | Duelliste Fougueux | 2 | 4 | 4 | Solid mid-range, good trade target |
| sh-f3 | Rival Eternel | 3 | 5 | 5 | Main beater, survives well |
| sh-f4 | Heros Legendaire | 4 | 6 | 6 | Finisher, hard to kill |

**Techniques**:
| ID | Name | Ki | Effect |
|----|------|----|--------|
| sh-t1 | Coup de Poing Final | 1 | Your fighter gets +3 ATK this combat |
| sh-t2 | Deuxieme Souffle | 1 | Draw 2 cards |

**Trap**:
| ID | Name | Effect |
|----|------|--------|
| sh-tr1 | Contre-Attaque | Reflect 3 damage back to attacker |

**Equipment**:
| ID | Name | Ki | Bonus |
|----|------|----|-------|
| sh-eq1 | Bandeau du Heros | 1 | +2 ATK |
| sh-eq2 | Gants d'Entrainement | 1 | +1 ATK, +1 HP |

**Sensei Deck (10 cards)**:
sh-sig, sh-f1, sh-f2 x2, sh-f3, sh-f4, sh-t1 x2, sh-t2, sh-eq1

---

### MAGICAL WARD -- "The Guardian"
**Fantasy**: You're the magical girl. You protect your team and outlast everyone. Your fighters heal and shield each other.

**Passive -- STARLIGHT BOND**: At the start of your turn, if you control 2+ fighters, heal all your fighters 1 HP (up to their printed HP).

**Why this works**: Magical Ward wants a wide board. Two or three fighters on the field sustain each other. Opponents must focus fire to break the bond -- killing one fighter makes the others vulnerable. This creates interesting targeting decisions.

**Signature -- CONSTELLATION CELESTE** (3 Ki, 4 Focus): Heal all your fighters to full HP. Gain 4 LP.

**Playstyle**: Build a board of 2-3 fighters, keep them alive, grind opponents down. You READ as defensive and stable -- opponents see your healing and know they need burst damage or removal.

**Fighters**:
| ID | Name | Ki | ATK | HP | Notes |
|----|------|----|-----|----|-------|
| mg-f1 | Familier Lunaire | 1 | 2 | 4 | Cheap, extends the bond |
| mg-f2 | Sorciere Etoilee | 2 | 3 | 5 | Workhorse defender |
| mg-f3 | Gardienne Celeste | 3 | 4 | 6 | Anchor, very hard to kill |
| mg-f4 | Deesse de Lumiere | 4 | 5 | 6 | Finisher with bulk |

**Techniques**:
| ID | Name | Ki | Effect |
|----|------|----|--------|
| mg-t1 | Soin Stellaire | 1 | Heal a fighter 3 HP or gain 3 LP |
| mg-t2 | Bouclier Prismatique | 2 | Negate one technique this combat |

**Trap**:
| ID | Name | Effect |
|----|------|--------|
| mg-tr1 | Miroir Magique | Cancel attack, heal 2 LP |

**Equipment**:
| ID | Name | Ki | Bonus |
|----|------|----|-------|
| mg-eq1 | Baguette Enchantee | 1 | +1 ATK, +2 HP |
| mg-eq2 | Tiare Stellaire | 2 | +0 ATK, +3 HP |

**Sensei Deck (10 cards)**:
mg-sig, mg-f1 x2, mg-f2 x2, mg-f3, mg-t1, mg-t2, mg-tr1, mg-eq1

---

### MECHA FORTRESS -- "The Engineer"
**Fantasy**: You're the mech pilot. You build and upgrade. Your equipment makes your fighters exponentially stronger.

**Passive -- OVERCLOCK**: Your equipment gives DOUBLE its printed bonuses. A +1 ATK equipment gives +2 ATK on your fighters.

**Why this works**: Mecha plays a building game. You deploy a fighter, then equip it, and suddenly it's a monster. Opponents see you equipping and know they need to destroy the fighter before it's fully online. The counterplay is clear: kill the fighter to waste the equipment investment.

**Signature -- SYNCHRONISATION EVA** (4 Ki, 3 Focus): Equip a fighter with a temporary +3 ATK, +3 HP equipment (lasts 2 turns, doesn't count toward equipment limit).

**Playstyle**: Deploy one or two key fighters, stack equipment, create an unkillable voltron. You READ as slow and deliberate -- opponents see equipment going on and know exactly which fighter is the threat.

**Fighters**:
| ID | Name | Ki | ATK | HP | Notes |
|----|------|----|-----|----|-------|
| mc-f1 | Drone Eclaireur | 1 | 2 | 4 | Cheap equip target |
| mc-f2 | Pilote Recrue | 2 | 3 | 5 | Main equip carrier |
| mc-f3 | Mecha Gardien | 3 | 3 | 6 | Tank, loves HP equipment |
| mc-f4 | Titan Supreme | 4 | 4 | 7 | Ultimate platform |

**Techniques**:
| ID | Name | Ki | Effect |
|----|------|----|--------|
| mc-t1 | Surcharge Reacteur | 1 | Fighter gets +2 ATK, +1 HP this combat |
| mc-t2 | Champ de Force | 2 | Block 4 damage to one fighter |

**Trap**:
| ID | Name | Effect |
|----|------|--------|
| mc-tr1 | Mine Electrique | Deal 4 damage to attacking fighter |

**Equipment**:
| ID | Name | Ki | Bonus (before Overclock) |
|----|------|----|--------------------------|
| mc-eq1 | Armure Renforcee | 1 | +0 ATK, +2 HP (becomes +0/+4) |
| mc-eq2 | Canon Embarque | 2 | +2 ATK, +0 HP (becomes +4/+0) |

**Sensei Deck (10 cards)**:
mc-sig, mc-f1, mc-f2 x2, mc-f3, mc-t1, mc-t2, mc-tr1, mc-eq1, mc-eq2

---

### ISEKAI THIEF -- "The Trickster"
**Fantasy**: You're the isekai protagonist who steals powers from every world. You use everyone's cards against them.

**Passive -- WORLD HOPPER**: When you destroy an enemy fighter in combat, add a copy of it to your discard pile (it keeps its original universe). You now own that card.

**Why this works**: Isekai gets stronger by fighting. Unlike Shonen (who powers up existing fighters), Isekai literally steals the opponent's roster. This creates a unique tension: opponents don't want to lose fighters to you because you'll USE them. It also naturally fuels the Multiverse Convergence win condition.

**Signature -- RESPAWN** (3 Ki, 3 Focus): Return any fighter from your discard pile to the field with full HP.

**Playstyle**: Attack aggressively to steal fighters, build a diverse roster, threaten Multiverse Convergence. You READ as a scavenger -- opponents see stolen fighters appearing and know your collection is growing.

**Fighters**:
| ID | Name | Ki | ATK | HP | Notes |
|----|------|----|-----|----|-------|
| is-f1 | Voyageur Perdu | 1 | 3 | 3 | Cheap aggressive body |
| is-f2 | Invocateur Sombre | 2 | 4 | 4 | Solid trader |
| is-f3 | Champion Reincarne | 3 | 5 | 5 | Good at securing kills |
| is-f4 | Roi Demon | 4 | 7 | 4 | Glass cannon finisher |

**Techniques**:
| ID | Name | Ki | Effect |
|----|------|----|--------|
| is-t1 | Portail Dimensionnel | 1 | Your fighter gets +3 ATK this combat |
| is-t2 | Vol de Ki | 2 | Steal 2 Ki from target opponent |

**Trap**:
| ID | Name | Effect |
|----|------|--------|
| is-tr1 | Piege Dimensionnel | Deal 3 damage to attacking fighter |

**Equipment**:
| ID | Name | Ki | Bonus |
|----|------|----|-------|
| is-eq1 | Cape du Voyageur | 1 | +1 ATK, +1 HP |
| is-eq2 | Orbe Dimensionnel | 2 | +2 ATK, +1 HP |

**Sensei Deck (10 cards)**:
is-sig, is-f1 x2, is-f2 x2, is-f3, is-t1, is-t2, is-tr1, is-eq1

---

### SEINEN ASSASSIN -- "The Mastermind"
**Fantasy**: You're the cold, calculating killer. You know everything. You strike precisely. Your glass cannons die easily but hit like trucks.

**Passive -- COLD READ**: Once per turn (free), you may look at one face-down card on any opponent's field (a concealed fighter, a face-down trap, or face-down equipment). Only you see it.

**Why this works**: Seinen's fighters have high ATK but die to anything. To compensate, you have PERFECT INFORMATION. You know what's concealed, what traps are real, what equipment is hidden. This makes your attacks surgical -- you never walk into a trap blind. Opponents know you're peeking and must play around it (deploying openly, setting real traps they don't mind you seeing).

**Signature -- DEATH NOTE** (2 Ki, 3 Focus): Destroy any one enemy fighter, regardless of HP. No combat.

**Playstyle**: Peek at hidden information, strike when you know it's safe, use Death Note on the biggest threat. You READ as patient and scary -- opponents know you see everything and can't bluff you.

**Fighters**:
| ID | Name | Ki | ATK | HP | Notes |
|----|------|----|-----|----|-------|
| sn-f1 | Enqueteur Discret | 1 | 3 | 3 | Cheap scout |
| sn-f2 | Mercenaire Froid | 2 | 5 | 3 | High ATK glass cannon |
| sn-f3 | Tueur Fantome | 3 | 7 | 3 | Deadly but fragile |
| sn-f4 | Stratege Absolu | 4 | 9 | 3 | Massive ATK, paper HP |

**Techniques**:
| ID | Name | Ki | Effect |
|----|------|----|--------|
| sn-t1 | Frappe Fatale | 1 | Deal 3 damage directly to opponent's LP |
| sn-t2 | Analyse Tactique | 1 | Draw 2 cards |

**Trap**:
| ID | Name | Effect |
|----|------|--------|
| sn-tr1 | Embuscade | Destroy attacking fighter if ATK 3 or less |

**Equipment**:
| ID | Name | Ki | Bonus |
|----|------|----|-------|
| sn-eq1 | Lame Empoisonnee | 1 | +3 ATK, +0 HP |
| sn-eq2 | Manteau d'Ombre | 1 | +0 ATK, +2 HP |

**Sensei Deck (10 cards)**:
sn-sig, sn-f1 x2, sn-f2 x2, sn-f3, sn-t1 x2, sn-tr1, sn-eq1

---

## 8. THE DOJO (Shared Market)

### Setup
Create a shared supply of neutral and cross-universe cards:
- 2 copies of every fighter from all universes
- 2 copies of every technique from all universes
- 2 copies of every equipment from all universes
- 1 copy of every trap from all universes
- NO Signatures (only in Sensei Decks)

Shuffle the supply. Reveal 3 cards face-up. This is the Dojo.

### Dojo Actions (Phase 2, pick one)
- **Buy**: Pay the card's Ki cost. Card goes to your discard pile. Everyone sees what you bought.
- **Spar**: Swap a hand card (placed face-down into Dojo supply) with a Dojo card. Others see what you took. The card you put in enters the supply (shuffled in, not visible).
- **Meditate**: +2 Focus, skip Dojo.
- **Skip**: Nothing.

### Refill
At end of each turn, refill the Dojo back to 3 face-up cards from the supply.

### Why the Dojo matters
- It's the ONLY way to get cards from other universes (for Multiverse Convergence)
- Every purchase is PUBLIC, so opponents can track your strategy
- Spar lets you offload dead cards while gaining useful ones (but reveals what you took)
- The Dojo creates shared information that fuels deduction

---

## 9. SENSEI DRAFT (Game Setup Variant)

Instead of using pre-built Sensei Decks:

1. Each player picks an archetype (or is assigned one randomly).
2. Generate a pool of 15 cards: the archetype's Signature + 8 cards from the archetype's universe + 6 cards from other universes (random).
3. Player picks 10 cards to form their Sensei Deck. The other 5 are removed from the game.
4. Opponents do NOT see your draft picks. Your Sensei Deck composition is secret.

**Why draft**: It adds replayability and lets you tailor your deck. A Shonen player might draft Mecha equipment for tankiness, or Seinen techniques for burn. Your choices are hidden, creating deeper information asymmetry.

---

## 10. BLUFF SYSTEM (Five Layers)

### Layer 1: Deck Composition
Your Sensei Deck is secret. Opponents never see what's in it. They only see your Dojo purchases (public). So if you buy a Mecha card, they know you have it -- but they don't know the 10 cards you started with.

### Layer 2: Concealed Fighters
Deploy face-down for 1 less Ki. Could be anything. A cheap 1-Ki fighter, or your 4-Ki ace. Opponents don't know until it's revealed.

### Layer 3: Universe Declaration
When attacking with a concealed fighter, you declare its universe. You can lie. This sets up dominance calculations and NANI?! calls.

### Layer 4: Trap Zone
Any card can be set as a fake trap. If you set your Signature face-down, the opponent sees a set trap and might play around it -- wasting their turn. But if they call your bluff and attack anyway, you lost your Signature for nothing.

### Layer 5: Hidden Equipment
Equipment can be attached face-down. A fighter with hidden equipment might be much stronger than it appears. Opponents must decide whether to attack into the unknown.

### NANI?! Call (Layer 3 Response)
When a concealed attacker declares a universe, the defender may call "NANI?!":
- **Attacker lied**: Attacker's fighter is destroyed. Defender draws 1 card. Attacker loses 2 LP.
- **Attacker was honest**: Defender loses 3 LP. Attacker gains +1 Focus.

NANI?! is free to call (no Ki or Focus cost), but wrong calls cost 3 LP. This makes it a genuine risk/reward decision every time.

---

## 11. COMBAT EXAMPLES

### Example 1: Clean Combat
Alice attacks Bob's Sorciere Etoilee (3 ATK, 5 HP) with her Rival Eternel (5 ATK, 5 HP, Shonen). Bob's fighter is Magical. Shonen dominates Magical: +2 ATK. Alice's effective ATK = 7. Both deal damage: Alice deals 7 to Bob's fighter (5 HP - 7 = dead, 2 overflow to LP). Bob deals 3 to Alice's fighter (5 HP - 3 = 2 HP remaining). Alice's fighter survives, gains +1 ATK from Fighting Spirit (now 6 ATK).

### Example 2: NANI?! Bluff
Alice has a concealed Seinen fighter (Tueur Fantome, 7/3). She declares "Shonen" (a lie, to avoid Seinen's weakness to Shonen). Bob suspects a lie and calls NANI?!. The fighter is revealed as Seinen, not Shonen. Alice lied! Her fighter is destroyed. Bob draws 1 card. Alice loses 2 LP.

### Example 3: Destiny Win
Charlie has "The Collector" Destiny (own 6+ Dojo cards). Over 8 turns, he's bought 5 cards from the Dojo. He buys his 6th. On his End Phase, he declares "DESTINY!" and reveals The Collector. He has 6 Dojo-acquired cards. He wins immediately.

But if Alice noticed Charlie buying aggressively and spent 2 Focus to Expose him on turn 7 (correctly guessing The Collector), Charlie's Destiny would have been discarded, costing him 5 LP and his Destiny win condition.

---

## 12. ARC EVENTS (Global Events)

Every 5 turns, reveal an Arc Event. It affects ALL players that round.

| Event | Effect | Why it exists |
|-------|--------|---------------|
| **Tournament Arc** | Every player MUST attack this turn (skip = 5 LP loss) | Forces action, breaks stalemates |
| **Filler Episode** | All players draw 2 cards | Refills hands, enables comebacks |
| **Power Up** | All fighters on field get +1 ATK permanently | Accelerates late game |
| **Plot Twist** | All face-down cards are revealed (traps, concealed fighters, hidden equipment) | Punishes over-reliance on bluff, creates chaos |
| **Betrayal Arc** | All players lose 3 LP | Speeds up endgame, hurts leader most politically |

---

## 13. MULTIPLAYER DYNAMICS (3-5 Players)

### Political Targeting
In free-for-all, the game naturally creates politics:
- Attack the leader (highest LP)
- Attack the player closest to their Destiny (if you can read it)
- Form temporary truces (no mechanics for alliances -- just table talk)

### Simultaneous Elimination
If multiple players reach 0 LP in the same turn phase, the one who took the most damage that turn is eliminated first. If still tied, they're eliminated simultaneously (and the surviving player with highest LP wins).

### Scaling
- **2 players**: Start at 25 LP. No Destiny Expose (too easy to guess with only 2 options). Tournament Arc triggers every 4 turns.
- **3 players**: Standard rules. 30 LP.
- **4-5 players**: Standard rules. 30 LP. Dojo refills to 4 cards (more options needed).

---

## 14. FIELD LAYOUT

```
[Trap 1] [Trap 2]                         Face-down trap zone (any card can be set here)
[Fighter 1] [Fighter 2] [Fighter 3]       Face-up or concealed (face-down)
Ki: X/Y  |  Focus: Z  |  LP: ##           Public resources
Hand: [hidden cards, max 7]                Private
Destiny: [hidden]                          Secret win condition
```

---

## 15. COMPLETE GAME SETUP

1. Each player picks (or is assigned) an archetype.
2. Each player takes their Sensei Deck (10 cards) OR does a Sensei Draft.
3. Deal 2 Destiny cards to each player. Each keeps 1, removes the other face-down.
4. Build the Dojo supply and reveal 3 cards.
5. Shuffle the Arc Event deck.
6. Each player shuffles their Sensei Deck and draws 4 cards.
7. Set LP to 30 (25 for 2-player), Ki to 2/2, Focus to 0.
8. Randomly determine first player. Play clockwise.

---

## 16. POWER PROGRESSION CURVE

The game has three natural phases:

### Early Game (Turns 1-4)
- Ki 2-5. Deploy cheap fighters. Set traps. Buy from Dojo.
- Probe opponents: who's aggressive? Who's hoarding Focus?
- Start reading Destinies from behavior patterns.

### Mid Game (Turns 5-8)
- Ki 5-7. Deploy expensive fighters. Equipment matters now.
- Focus accumulates. Signatures become possible.
- Dojo purchases create cross-universe options.
- NANI?! calls become more frequent (higher stakes).
- Expose attempts begin (if you've read an opponent's Destiny).

### Late Game (Turns 9-12)
- Signatures fire. Destiny conditions near completion.
- Arc Events accelerate the endgame.
- Anti-turtle ensures someone dies. LP pools are low.
- Final BANKAI! / Death Note / Constellation moments decide the game.

---

## 17. DESIGN NOTES

### Why not Magic/Yu-Gi-Oh
- No mana screw (Ki grows automatically)
- No combo chains (max 1 attack per turn, effects are simple)
- No stack/chain resolution complexity (one technique per side per combat)
- Cards have 10-word effects max
- Games end in 15-20 minutes, not 40+

### Why Asymmetry Matters
Each archetype plays a DIFFERENT game:
- **Shonen** plays a midrange war of attrition (power up through combat)
- **Magical** plays a board-control grind (sustain through healing)
- **Mecha** plays a voltron builder (stack equipment on one champion)
- **Isekai** plays a tempo-theft game (steal opponent cards, threaten Multiverse)
- **Seinen** plays an information-advantage assassin (peek, then strike precisely)

You can tell WHAT archetype someone is playing by HOW they play, even before you see their cards.

### Why Destinies Work
Destinies create a metagame layer. You're not just playing your cards -- you're reading opponents' behavior for clues about their hidden objective. The Expose mechanic gives you a way to ACT on your deduction. And the LP penalty for wrong Exposes prevents fishing.

### Balance Levers
If testing reveals imbalance:
- Adjust LP cost of wrong NANI?! calls (currently 3)
- Adjust Focus costs for Signatures
- Adjust Overclock multiplier (currently 2x)
- Adjust Fighting Spirit ATK gain (currently +1)
- Adjust Starlight Bond healing (currently 1 HP)
- Adjust Cold Read frequency (currently 1/turn)

---

## APPENDIX A: NEUTRAL DOJO CARDS

These cards have no universe affiliation and appear only in the Dojo supply:

| ID | Name | Type | Ki | Effect/Stats |
|----|------|------|----|-------------|
| n-f1 | Ronin Errant | Fighter | 2 | 4 ATK, 3 HP (no universe) |
| n-f2 | Marchand Ambulant | Fighter | 1 | 1 ATK, 3 HP. Draw 1 card when deployed. |
| n-t1 | Cri de Guerre | Technique | 1 | All your fighters +1 ATK this turn |
| n-t2 | Brouillard | Technique | 1 | Cancel one NANI?! call this combat |
| n-tr1 | Fosse Cachee | Trap | 1 | Deal 2 damage to attacker, draw 1 card |
| n-eq1 | Amulette Ancienne | Equipment | 1 | +1 ATK, +1 HP |

**Why neutral cards**: They give all archetypes access to generic tools. The Marchand Ambulant is a draw engine anyone can use. Brouillard protects bluffers. They're deliberately weaker than universe-specific cards so splashing has a real cost.

---

## APPENDIX B: QUICK REFERENCE

**Your turn**: Ki Phase (auto) -> Dojo (pick 1) -> Deploy (spend Ki) -> Combat (1 attack or Expose) -> End (auto)

**Win by**: Kill everyone (LP) | Complete Destiny (secret) | 3 universes on field (Multiverse)

**NANI?! call**: Free. Liar caught = their fighter dies + 2 LP. Honest = you lose 3 LP.

**Expose**: 2 Focus. Correct = their Destiny gone + 5 LP. Wrong = you lose 3 LP.

**Dominance**: Shonen > Magical > Mecha > Isekai > Seinen > Shonen. Bonus: +2 ATK.

**Anti-turtle**: 3 turns no attack = lose 3 LP.

**Card limit**: 10 words max per card effect. 7 cards max in hand. 3 fighters max. 2 traps max.
