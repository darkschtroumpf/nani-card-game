# The Warded Man: Sharak Ka — Complete Game Rules

## Solo Strategy/Adventure Game for Mobile

---

## OVERVIEW

You are one of four heroes in a world where demons rise from the earth every night. Your job: protect the Free Cities, push back the darkness, and survive long enough to reach Sharak Ka — the final battle. You will never save everyone. Choose wisely.

**Players:** 1 (future coop: 2)
**Modes:** Quick (~30 min) | Campaign (~8 hours across chapters)
**Core loop:** Day = prepare. Night = survive. Repeat. Escalate.

---

## 1. WORLD MAP

### Structure

The map is a **network of 7 locations** connected by roads. The layout is fixed but demon spawns are variable.

```
         [Anoch Sun]
            |
    [Fort Rizon]---[Desert Spear]
        |               |
    [Cutter's Hollow]---[Lakton]
        |               |
    [Angiers]-------[Miln]
```

Each road connecting two locations takes **1 movement action** to traverse.

### Locations

Each location has three attributes:

| Location | Resource Produced | Population (HP) | Starting Wards |
|---|---|---|---|
| **Cutter's Hollow** | Wood (1/day) | 4 | 1 |
| **Fort Rizon** | Food (1/day) | 3 | 0 |
| **Miln** | Ink (1/day) | 5 | 2 |
| **Angiers** | Wood (1/day) | 4 | 1 |
| **Lakton** | Food (1/day) | 3 | 1 |
| **Desert Spear** | Ink (1/day) | 4 | 2 |
| **Anoch Sun** | Ancient Wards (special) | 0 | 0 |

**Anoch Sun** is a ruin. It cannot be populated or destroyed. It is the only source of Ancient Ward fragments (see Ward System). It is always dangerous — demons are present there even during the day.

### How Demons Threaten Locations

Each night, demons deal **damage equal to their combined strength** minus the location's **ward defense value**. Damage reduces Population. When Population reaches 0, the location is **Fallen** — it no longer produces resources and becomes a demon nest (spawns +1 demon per night to adjacent locations).

---

## 2. DAY PHASE

### Actions

The hero has **3 Action Points (AP)** per day. Each action costs 1 AP unless noted.

| Action | Effect |
|---|---|
| **Move** | Travel one road to an adjacent location. |
| **Gather** | Collect 2 of the current location's resource. |
| **Craft Ward** | Spend resources to create a ward tile (see Ward System). |
| **Fortify** | Place a crafted ward tile onto the current location's ward net. |
| **Rest** | Heal 2 HP (hero only). |
| **Scout** | Reveal demon spawns for the coming night at your location and all adjacent locations. Without scouting, spawns are hidden until nightfall. |
| **Quest** | Location-specific. Spend 1 AP + required resources to complete a quest for a permanent reward. Each location has 1 quest in Quick mode, 3 in Campaign. |

### Key Design: The Information Problem

You do NOT know where demons will spawn tonight unless you Scout. Scouting costs a precious action. Do you spend your limited day preparing blindly, or sacrifice preparation time to know where the threat is? This is the game's central tension.

### Quests (examples)

- **Cutter's Hollow:** "Rally the Cutters" — spend 2 Wood. Reward: this location gets +1 Population permanently.
- **Miln:** "Warder's Library" — spend 2 Ink. Reward: learn a new ward combination.
- **Anoch Sun:** "Translate the Ruins" — spend 1 Ink + 1 Food. Reward: gain 1 Ancient Ward fragment.

---

## 3. NIGHT PHASE

### Demon Spawning

Night plays out in **3 waves** (Early Night, Midnight, Pre-Dawn).

**Spawn procedure per wave:**
1. Draw from the **Demon Deck** — a deck of demon cards shuffled at the start of each night.
2. Each card shows: demon type, target location, strength.
3. Number of cards drawn per wave = **Current Night Number + 1**.
   - Night 1: 2 cards per wave (6 total)
   - Night 3: 4 cards per wave (12 total)
   - Night 7: 8 cards per wave (24 total)

This is the escalation. By night 5, it feels relentless.

### Combat

Combat is **deterministic with a hidden-information twist**. No dice. No randomness in resolution — only in what shows up.

**Each wave, at the hero's current location:**

1. Demons at this location attack the ward net first. Each demon's strength reduces the ward net's defense. If ward defense is exceeded, remaining damage hits Population.
2. The hero may **fight**. The hero has a **Combat Hand** of 3 cards drawn from their personal 10-card ability deck. Play 1 card per demon present. Each card has a power value — if power >= demon strength, the demon is killed. If not, the demon survives and the hero takes damage equal to the difference.
3. Unplayed demons at hero's location deal their full strength to Population (after wards).

**At locations WITHOUT the hero:** Demons attack ward net, then Population. No one fights back.

This creates the Spirit Island dilemma: you are one hero, there are 7 locations, and you cannot be everywhere.

### What Happens When a Location Falls

- Population reaches 0.
- Location stops producing resources.
- Location becomes a **Demon Nest**: each night, 1 extra demon card is added to the Demon Deck targeting a random adjacent location.
- Fallen locations can be **Reclaimed** by spending a full day there (all 3 AP) + 3 Food. Population resets to 2.

### Hero Defeat

If the hero reaches 0 HP, they are **Wounded**. They lose the rest of the night phase, wake at dawn with 1 HP, and lose all crafted wards in their inventory (placed wards remain). This is devastating but not game-ending.

---

## 4. WARD SYSTEM — The Core Mechanic

### Philosophy

Wards are not cards you play and forget. They are **permanent infrastructure** placed on locations that define your defensive strategy for the rest of the game. Placing a ward is a commitment. Choosing WHICH ward to craft and WHERE to place it is the deepest decision in the game.

### The 5 Base Wards

| Ward | Symbol | Craft Cost | Passive Effect |
|---|---|---|---|
| **Fire** | Flame | 2 Wood | Deals 1 damage to all demons at this location each wave. |
| **Stone** | Mountain | 2 Wood | +2 ward defense at this location. |
| **Wind** | Spiral | 2 Ink | Redirects 1 demon per wave to an adjacent location (your choice). |
| **Light** | Star | 2 Ink | Reveals all demon spawns targeting this location (free scouting). |
| **Bone** | Skull | 1 Wood + 1 Ink | Heals 1 Population at this location each dawn. |

### Ward Slots

Each location has **3 ward slots**. That's it. You can never have more than 3 wards on one location. Choose carefully.

### Ward Combinations — The Depth

When two wards are placed in **adjacent slots** at the same location, they form a **Ward Pair** that triggers a bonus effect IN ADDITION to their individual effects. A location with 3 wards has 2 adjacent pairs (slots 1-2 and slots 2-3).

| Pair | Combo Name | Bonus Effect |
|---|---|---|
| Fire + Stone | **Magma Ward** | Deals 2 damage to the strongest demon each wave (instead of 1 to all). Focused destruction. |
| Fire + Wind | **Inferno Ward** | Fire damage applies to the destination when Wind redirects a demon. Burns the neighbor. |
| Fire + Light | **Sunward** | During the first wave each night, kills all demons with strength 1 at this location. |
| Fire + Bone | **Cauterize Ward** | Heals 2 Population instead of 1, but only if a demon was killed here this night. |
| Stone + Wind | **Fortress Ward** | +3 defense instead of +2, and redirected demons take 1 damage. |
| Stone + Light | **Sentinel Ward** | Reveals spawns AND forces 1 demon targeting an adjacent location to target this one instead. Draws fire. |
| Stone + Bone | **Haven Ward** | +1 max Population at this location permanently. |
| Wind + Light | **Storm Ward** | You may look at the next wave's demon cards before they are revealed. |
| Wind + Bone | **Renewal Ward** | When a demon is redirected away, heal 1 Population at the destination. |
| Light + Bone | **Sanctuary Ward** | Hero heals 1 HP per wave while at this location during night. |

**10 combinations from 5 wards. Each meaningful. No filler.**

### What Makes This System Unique

1. **Permanence with consequence.** Wards are not consumable. Once placed, they stay. But you only have 3 slots. Replacing a ward destroys it. Your ward layout is your long-term strategy — changing it mid-campaign is expensive.
2. **Positional grammar.** The ORDER of wards in the 3 slots matters because only adjacent pairs combine. Placing Fire-Stone-Wind gives you Magma (1-2) and Fortress (2-3). Placing Stone-Fire-Wind gives you Magma (1-2) and Inferno (2-3). Same three wards, different combos. This is the strategic depth.
3. **Network defense.** Wind wards push problems to neighbors. Light wards pull information. Stone wards absorb. The entire map becomes an interconnected defense network where each location's wards affect its neighbors. You're not defending 7 isolated locations — you're building a system.

### Acquiring Wards

- **Crafting:** Spend AP + resources during the day (see table above).
- **Quests:** Some quests reward pre-crafted wards or unlock the ability to craft Ancient Wards (see below).
- **Anoch Sun:** Ancient Ward fragments found here can be used as **wild wards** — they count as any type for combo purposes, but have no individual passive effect.

---

## 5. THE 4 HEROES

---

### ARLEN BALES — The Warded Man

**Unique Mechanic:** Arlen has wards tattooed on his body. He does not use crafted wards for personal combat — instead, he has a **Ward Charge** meter (0-5) that fills when he kills demons and drains when he uses ward powers.

**Playstyle:** Aggressive

**Abilities:**
| Name | Effect |
|---|---|
| **Warded Fist** | Kill 1 demon with strength <= your current Ward Charge. Costs 0 charge. |
| **Draw Wards** | Spend 2 Ward Charge: place a temporary ward on your location for tonight only (any type). |
| **Mist Walk** | Spend 3 Ward Charge: teleport to any location on the map. Can be used during night. |
| **Overcharge** | Spend 5 Ward Charge: destroy ALL demons at your location this wave. Then take 2 damage. |

**Day Phase Difference:** Arlen can **Gather any resource from any location** (he knows the wild). He also gets +1 AP when at Anoch Sun (he reads the wards faster than anyone).

**Night Phase Difference:** Arlen fights without cards. Instead, every demon he kills adds 1 to his Ward Charge. He snowballs in combat — killing fuels more killing. But if he's at a quiet location, his charge stalls.

---

### AHMANN JARDIR — The Shar'Dama Ka

**Unique Mechanic:** Jardir commands **Sharum warriors** — a personal army. He has a Warrior Pool (starts at 4, max 8). Warriors can be stationed at locations to fight autonomously during the night.

**Playstyle:** Strategic

**Abilities:**
| Name | Effect |
|---|---|
| **Rally** | Recruit 2 warriors to your pool (only at Desert Spear or populated locations with Pop >= 3). |
| **Deploy** | Station up to 3 warriors from your pool at your current location. Each warrior kills 1 demon with strength <= 2 per wave. |
| **Crown of Kaji** | All warriors at your location fight at +1 strength this night. |
| **Shararak** | Spend all warriors at a location: they deal damage equal to their count x2 to the strongest demon. Those warriors die. |

**Day Phase Difference:** Jardir uses 1 AP to move warriors between adjacent locations (up to 3 at once). He also gets a free Rally action at Desert Spear each dawn.

**Night Phase Difference:** Jardir himself fights with a combat hand like the base rules, but his warriors handle weaker demons automatically. This means Jardir can defend MULTIPLE locations per night through deployed warriors, but he must manage his army carefully — dead warriors are gone.

---

### ROJER INN — The Fiddle Wizard

**Unique Mechanic:** Rojer doesn't fight demons. He **charms** them. He has a **Song Track** — a sequence of 4 song slots. During night, he plays a song each wave that affects ALL demons at his location.

**Playstyle:** Controller

**Abilities:**
| Name | Effect |
|---|---|
| **Lullaby** | All demons at your location skip their attack this wave. They remain and attack next wave. |
| **Frenzy** | Demons at your location attack each other. Each demon deals 1 damage to another demon. |
| **The Call** | Draw all demons from one adjacent location to yours. Dangerous but concentrates targets. |
| **Dissipation** | All demons with strength <= 2 at your location flee (removed from the game this night). |

**Day Phase Difference:** Rojer does not Craft wards. Instead, he **Composes** — spending AP to arrange his Song Track for the coming night. He locks in his 3 wave songs during the day (one per wave). Once night falls, songs play in order and cannot be changed. Planning is everything.

**Night Phase Difference:** Rojer has 0 personal combat ability. He cannot fight. His songs manipulate demons — delaying, scattering, or turning them on each other — but he needs wards or allies to actually kill. In exchange, his songs affect ALL demons at his location, not one at a time. Against swarms, he is unmatched.

---

### LEESHA PAPER — The Herb Gatherer

**Unique Mechanic:** Leesha crafts **consumables** — one-use items with powerful effects. She has an **Inventory** of up to 6 items. She is the only hero who can craft items in addition to wards.

**Playstyle:** Support

**Abilities:**
| Name | Effect |
|---|---|
| **Brew Potion** | Spend 1 Food + 1 AP: create a Healing Potion (restores 2 HP to hero or 2 Population to location). |
| **Ward Ink** | Spend 1 Ink + 1 AP: create a Ward Catalyst (when used during Fortify, the placed ward counts as 2 types of your choice for combo purposes). |
| **Firespit** | Spend 1 Wood + 1 AP: create a Firespit flask (during night, throw to deal 3 damage to 1 demon). |
| **Forbiddance** | Spend 2 Ink + 1 AP: create a Forbiddance circle (place at a location — blocks ALL demons for 1 full night, then it breaks). |

**Day Phase Difference:** Leesha gets **4 AP instead of 3** but cannot fight during the night at all. She must prepare everything in advance. She is also the most efficient ward crafter — her wards cost 1 fewer total resource.

**Night Phase Difference:** Leesha uses her consumables during night instead of fighting. She can use 1 item per wave. She excels at triage — healing the most damaged location, blocking the worst spawn, patching the holes. She plays a reactive, medic-style game.

---

## 6. DEMONS

### The 5 Coreling Types

| Type | Strength | Behavior | Special |
|---|---|---|---|
| **Wood Demon** | 2 | Targets locations with the most Wood stockpiled. | Takes double damage from Fire wards. |
| **Rock Demon** | 4 | Targets the nearest location to Anoch Sun. | Ignores 1 point of ward defense. |
| **Wind Demon** | 1 | Appears in groups of 3 on a single card. | Can bypass Wind ward redirection. |
| **Water Demon** | 3 | Only targets Lakton and locations adjacent to it. | Ward defense is halved against Water Demons. |
| **Flame Demon** | 1 | Targets random locations. | On hit, destroys 1 resource stockpiled at the location. |

### Escalation (Campaign Mode)

| Night | Change |
|---|---|
| 1-3 | Only Wood Demons and Flame Demons. |
| 4-5 | Wind Demons and Water Demons join the deck. |
| 6-7 | Rock Demons join. All spawn counts +1 per wave. |
| 8+ | **Mind Demon** cards enter the deck (see Bosses). |

### Boss Demons

**Mind Demon (Strength 5):**
- Appears from Night 8+.
- Special: when a Mind Demon spawns, it **disables one ward** at its target location for the entire night (your choice which ward, but you must disable one).
- Cannot be redirected by Wind wards.
- Killing a Mind Demon rewards 1 Ancient Ward fragment.

**Consort (Strength 3, always spawns with a Mind Demon):**
- The Consort makes the Mind Demon immune to all damage until the Consort is killed first.
- The Consort mimics the last ward combo triggered at its location, turning its effect against the hero (e.g., mimics Fire ward to deal 1 damage to the hero per wave).

**Demon Prince — Alagai Ka (Campaign Final Boss, Strength 10):**
- Appears in the final chapter.
- Disables ALL wards at its location.
- Spawns 2 extra demons per wave at its location.
- Can only be damaged by Ancient Wards or hero abilities. Normal wards and combat cards deal 0 damage.
- Has 20 HP across multiple nights. Damage carries over between nights. This is a war, not a battle.

---

## 7. QUICK MODE

### Setup
1. Choose a hero.
2. The map starts with all 7 locations populated at their default values and starting wards.
3. Shuffle the Quick Night Demon Deck (pre-built for a Night 4 difficulty level — mixed demon types).
4. You begin at Cutter's Hollow with 3 of each resource.

### Structure
- **Day Phase:** 3 AP as normal.
- **Night Phase:** 3 waves as normal. Only 1 night.
- **Total:** 1 Day + 1 Night. Approximately 25-30 minutes.

### Victory Condition
Survive the night with **at least 5 of 7 locations still standing** (Population > 0).

### Defeat Condition
- 3 or more locations fall, OR
- Hero is Wounded (reaches 0 HP).

### Scoring
After victory, score = total remaining Population across all locations + (resources left / 2) + quest bonuses. Leaderboard per hero.

### Difficulty Settings
- **Dusk** (Easy): Night 3 deck, only need 4 locations standing.
- **Midnight** (Normal): Night 4 deck, need 5 locations.
- **New Moon** (Hard): Night 6 deck, need 6 locations, Mind Demon appears in wave 3.

---

## 8. CAMPAIGN MODE

### Chapter Structure — 12 Chapters

Each chapter = 1 Day + 1 Night except where noted. The campaign represents 12 nights of escalating warfare.

| Chapter | Title | Special Rules |
|---|---|---|
| 1 | **The Night** | Tutorial. Only Wood Demons. 2 waves instead of 3. |
| 2 | **The Road** | You start displaced — random location, not your home base. |
| 3 | **The Swarm** | Flame Demons added. Wave 3 has double spawns. |
| 4 | **The Storm** | Wind Demons and Water Demons added. Lakton is under siege (+2 demons there). |
| 5 | **The Desert** | Desert Spear is attacked. Rock Demons debut. Quest: unlock Anoch Sun. |
| 6 | **The Ruins** | Anoch Sun is explorable. 2 Day phases before the Night (extra prep time). |
| 7 | **The Breach** | A location of your choice starts Fallen. Mind Demon foreshadowed (appears but flees). |
| 8 | **The Mind** | First Mind Demon + Consort fight. If you kill it, gain Ancient Ward. |
| 9 | **The War** | 2 Mind Demons. All locations lose 1 Population before the night begins. |
| 10 | **The Sacrifice** | You must choose 1 location to abandon entirely (removed from the game). Resources there are lost. |
| 11 | **The Core** | Anoch Sun reveals the path to the Core. 4 waves instead of 3. Everything spawns. |
| 12 | **Sharak Ka** | Final battle. Alagai Ka appears. You have 3 nights (3 Day/Night cycles) to defeat it. |

### What Carries Over Between Chapters

- **Ward layouts** at all locations (your infrastructure persists).
- **Hero level** (see Progression below).
- **Resources** (half, rounded down — attrition between chapters).
- **Location Population** (carried over as-is — damage is permanent unless healed).
- **Fallen locations remain Fallen** unless reclaimed.

### Hero Progression

After each chapter, the hero gains 1 **Skill Point**. Spend it on:
- +1 max HP
- +1 AP per day (max once, costs 2 points)
- Unlock a hero-specific **advanced ability** (each hero has 2, unlockable at chapters 6+ and 10+)

**Advanced Abilities (examples):**
- Arlen: **Unity** — Ward Charge no longer drains between nights.
- Jardir: **Spear of Kaji** — Jardir personally deals double damage to boss demons.
- Rojer: **The Song of Waning** — New song: all demons at your location lose 1 strength permanently.
- Leesha: **Hora Craft** — Leesha can craft wards using demon parts (killed demons drop 1 Ink equivalent).

### Story Beats

Between chapters, brief narrative passages (2-3 screens of text) tell the story:
- Ch 1-4: Discovery — the hero learns that corelings are getting smarter. Wards are failing.
- Ch 5-7: The Old World — Anoch Sun reveals that humanity once fought back. The wards are weapons, not just shields.
- Ch 8-10: The War — Mind Demons coordinate attacks. Cities fall. Allies die. The hero must choose what to save.
- Ch 11-12: Sharak Ka — The path to the Core is opened. The final battle for humanity.

---

## 9. RESOURCE ECONOMY

### The 3 Resources

| Resource | Earned From | Spent On | Tension |
|---|---|---|---|
| **Wood** | Cutter's Hollow, Angiers (Gather: 2/AP) | Fire wards, Stone wards, Firespit | Needed for offense AND defense. Never enough for both. |
| **Ink** | Miln, Desert Spear (Gather: 2/AP) | Wind wards, Light wards, advanced crafting | Comes from far-apart locations. Travel costs AP. |
| **Food** | Fort Rizon, Lakton (Gather: 2/AP) | Healing, Reclaiming fallen locations, Quest costs | You need it when things go wrong, but gathering it means less prep. The "insurance" resource. |

**Ancient Wards** are a special fourth resource — only found at Anoch Sun or as boss kill rewards. They cannot be gathered normally. They are the key to fighting the final boss.

### The Core Tension

You have 3 AP per day. Gathering resources takes AP. Crafting takes AP. Placing wards takes AP. Moving takes AP. Scouting takes AP.

You cannot do all of these. Every day forces you to choose: do I strengthen where I am, or rush to where I'm needed? Do I prepare for tonight, or invest in the long term?

Resources are deliberately scarce. A full ward costs 2 resources. You earn 2 per Gather action. That means 1 action to gather, 1 action to craft, 1 action to place = your entire day for ONE ward at ONE location. Meanwhile, 6 other locations are undefended.

---

## 10. WHY THIS GAME IS SPECIAL

### The Mechanic That Exists in No Other Game: Positional Ward Grammar

The ward combination system — where the ORDER of 3 wards in a location's slots determines which combos activate — creates a spatial puzzle that's unique. It's not just "collect and play." It's:
- Choose 3 from 5 ward types (10 possible trios)
- Arrange them in order (each trio has 3 possible orderings)
- Each ordering activates different combo pairs
- Each location's ward net interacts with its neighbors via Wind and Light effects

This means 30 possible ward configurations per location, across 7 locations, creating a **defensive network** that plays differently every game. No other mobile strategy game has a permanent, positional, combinatorial defense system like this.

### What Brings Players Back

1. **4 heroes play completely differently.** Arlen's aggressive demon-hunting game feels nothing like Leesha's triage-and-prepare game. Each hero demands a different map strategy and ward priority.
2. **The campaign punishes and rewards.** Carrying over damaged locations between chapters means every mistake compounds. But so does every smart ward placement. By chapter 8, your map is a monument to your decisions — some locations are fortresses, others are ruins.
3. **Quick Mode is a puzzle.** With 1 day of prep and 1 night to survive, Quick Mode becomes a tight optimization puzzle. "Can I save 5 locations with only 3 actions?" Different heroes offer different solutions to the same demon draw.

### The "Just One More Night" Feeling

The escalation curve is tuned so that each night feels barely survivable. You lose locations. You lose resources. You patch one hole and another opens. But each dawn, you have 3 actions and a chance to turn it around. The game is designed so that the player always sees a PATH to victory — even when the situation looks hopeless. "If I just place a Wind ward at Angiers, I can redirect the Rock Demons to Cutter's Hollow where my Magma Ward will handle them..." That chain of reasoning — that feeling of building a plan from the wreckage — is what keeps you playing.

---

## APPENDIX A: TURN STRUCTURE SUMMARY

```
=== DAY PHASE ===
1. Dawn: All locations produce their resource (add to stockpile).
2. Hero gets 3 AP (4 for Leesha).
3. Spend AP on actions in any order.
4. Discard down to 10 total resources if over limit.

=== NIGHT PHASE ===
1. Demon Deck is shuffled.
2. WAVE 1 (Early Night):
   a. Draw demon cards (Night Number + 1 cards).
   b. Place demons at their target locations.
   c. At hero's location: Hero fights/acts, then remaining demons attack wards, then Population.
   d. At all other locations: Demons attack wards, then Population.
   e. Check for Fallen locations.
3. WAVE 2 (Midnight): Repeat step 2.
4. WAVE 3 (Pre-Dawn): Repeat step 2.
5. Night ends. All surviving demons on the map are removed.
6. Proceed to next Day Phase.
```

## APPENDIX B: QUICK REFERENCE — WARD COMBOS

```
Slots:  [1] — [2] — [3]
Pairs:  (1+2)  and  (2+3)

FIRE + STONE  = Magma      (focused 2 dmg to strongest)
FIRE + WIND   = Inferno    (fire burns redirect target)
FIRE + LIGHT  = Sunward    (kills str-1 demons wave 1)
FIRE + BONE   = Cauterize  (heal 2 pop if demon killed)
STONE + WIND  = Fortress   (extra defense + redirect dmg)
STONE + LIGHT = Sentinel   (reveals + draws aggro)
STONE + BONE  = Haven      (+1 max population)
WIND + LIGHT  = Storm      (preview next wave)
WIND + BONE   = Renewal    (heal pop at redirect target)
LIGHT + BONE  = Sanctuary  (hero heals 1 HP/wave here)
```

## APPENDIX C: HERO SELECTION GUIDE

```
ARLEN    — "I want to fight demons personally."
           High risk, high reward. Snowball combat. Teleportation.

JARDIR   — "I want to command an army."
           Multi-location defense. Army management. Sacrifice plays.

ROJER    — "I want to control the battlefield."
           No combat. Song planning. Crowd control. Needs ward support.

LEESHA   — "I want to prepare for everything."
           Extra actions. Consumable crafting. Triage healing. No combat.
```

---

*"There is nothing to fear in the night if you know the right wards."*
