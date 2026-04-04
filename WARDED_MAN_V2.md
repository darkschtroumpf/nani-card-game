# The Warded Man: Sharak Ka — V2 Rules (Radical Redesign)

## Solo Strategy Game for Mobile

---

## DESIGN PHILOSOPHY

You are the **commander of the defense**, not a person walking between towns. You see the whole map. You act everywhere. Your hero determines HOW you defend, not WHERE. Every action matters. Every night, you fight back.

**Players:** 1 (future coop: 2-4)
**Modes:** Quick (~30 min, 10-15 meaningful decisions) | Campaign (~6 hours across 10 chapters)
**Core loop:** Day = build your ward network. Night = fight demons with real-time decisions every wave.

---

## WHAT CHANGED FROM V1 (Designer Notes)

| V1 Problem | V2 Solution |
|---|---|
| 3 AP vs 7 locations = helpless | 4 locations, 4 AP, and you act EVERYWHERE |
| Night phase 85% passive | You make a decision at EVERY location EVERY wave |
| Quick Mode = 1 decision | 1 Day (4 AP) + 1 Night (3 waves x 4 locations = 12 combat decisions) |
| Scouting is a trap | Removed as action; replaced by fog-of-war reveal system |
| Ward ordering is fake depth | Fewer wards to place, so each one is a real choice |
| Heroes all hit the same wall | Heroes modify HOW you interact with the whole map, not where you stand |
| Campaign death spiral | Catch-up mechanic: Fallen locations attract demons away from living ones |
| Mobile UX nightmare | 4 locations, each a simple card. Swipe between them. |
| Rojer unplayable solo | Rojer controls demons across the whole map; no need for personal combat |
| Combat cards trivially obvious | Replaced with a ward activation system with real tradeoffs |

---

## 1. THE MAP — 4 Locations as Cards

### Structure

The map is **4 location cards** arranged in a diamond. Each location is adjacent to 2 others. On mobile, you see all 4 at once or swipe between them.

```
        [North]
       /       \
   [West]     [East]
       \       /
        [South]
```

Every location is adjacent to its two neighbors (North-West, North-East, West-South, East-South). North and South are NOT directly adjacent. West and East are NOT directly adjacent.

### The 4 Locations

| Location | Name | Resource | Starting Pop | Flavor |
|---|---|---|---|---|
| **North** | Desert Spear | Ink | 4 | Krasian warrior culture. Far from supplies. |
| **West** | Cutter's Hollow | Wood | 5 | The heart of the Free Cities. Must not fall. |
| **East** | Lakton | Food | 4 | Fishing city on the lake. Vulnerable to Water Demons. |
| **South** | Miln | Ink | 5 | Mountain city of scholars. Strong but isolated. |

**Anoch Sun** is not a location on the map. It is a **quest destination** — a special action available from any location (see Quests).

### Location Stats

Each location has:
- **Population (HP):** 3-5. When it hits 0, the location Falls.
- **Ward Slots:** 2 per location. That's it. 2 wards, 1 combo. Choose wisely.
- **Resource production:** Generates 1 resource at dawn.
- **Stockpile:** Resources stored here (max 4 per location).

### Why 4 Locations Works

With 4 AP and 4 locations, you can meaningfully impact every part of the map each day. No location is "too far." The question isn't "can I reach it?" but "what do I spend my action on there?" This is real strategy, not travel logistics.

---

## 2. DAY PHASE — Command the Whole Map

### Actions

You have **4 Action Points (AP)** per day. You can spend them at ANY location — you are not physically at one place. Your hero's presence is abstract; you are commanding the defense of all the Free Cities.

Each action targets a specific location.

| Action | Cost | Effect |
|---|---|---|
| **Gather** | 1 AP | Collect 2 of the target location's resource into its stockpile. |
| **Craft Ward** | 1 AP | Spend resources from ANY stockpile(s) to create a ward. Place it in your Reserves (max 3 in reserves). |
| **Fortify** | 1 AP | Place a ward from your Reserves into a slot at the target location. |
| **Quest** | 1-2 AP | Complete a quest at the target location (see Quests). |
| **Hero Action** | 1 AP | Use one of your hero's unique day abilities (see Heroes). |
| **Reinforce** | 1 AP | Move 1 resource from one location's stockpile to an adjacent location's stockpile. |

### The Information Problem (Redesigned)

At the start of each day, you see a **Threat Forecast**: a rough indicator (Low / Medium / High / Extreme) for each location based on demon activity. This is free — no action required.

However, the forecast only shows intensity, not demon TYPES. You won't know if it's a swarm of Flame Demons (strength 1) or a single Rock Demon (strength 4) until nightfall. The forecast is just enough information to plan, but not enough to be certain. You are always gambling.

**Hero-specific scouting:** Some heroes can reveal exact spawns as part of their abilities (see Heroes).

### Quests

Quests cost AP + resources and give permanent rewards. Each location has 1 quest in Quick Mode, 2 in Campaign.

| Location | Quest | Cost | Reward |
|---|---|---|---|
| Desert Spear | "Krasian Alliance" | 1 AP + 2 Ink | +1 Population permanently. |
| Cutter's Hollow | "Rally the Cutters" | 1 AP + 2 Wood | This location gets +1 ward defense permanently. |
| Lakton | "Lakeward Research" | 1 AP + 2 Food | Learn 1 bonus ward combo (see Ward System). |
| Miln | "Warder's Library" | 1 AP + 2 Ink | Unlock Ancient Ward crafting. |
| Anoch Sun (any location) | "Translate the Ruins" | 2 AP + 1 Ink + 1 Food | Gain 1 Ancient Ward. |

---

## 3. NIGHT PHASE — You Fight Everywhere

This is the radical change. Night is no longer passive. You make decisions at every location, every wave.

### Demon Spawning

Night has **3 waves** (Early Night, Midnight, Pre-Dawn).

**Spawn procedure per wave:**
1. Draw demon cards equal to **Night Number + 2** (Quick Mode uses a fixed number).
2. Each card shows: demon type, target location, strength.
3. All cards are revealed simultaneously. You see the full wave before acting.

### The Night Decision: Ward Activations

Each wave, after demons are placed, you get **2 Ward Activations**. A Ward Activation lets you trigger one placed ward's ACTIVE effect at its location. Wards have both a passive effect (always on) and an active effect (costs an activation to use).

This is the night phase decision: you have wards at up to 4 locations, but only 2 activations per wave. Which wards do you trigger? Where is the crisis worst?

**Resolution order per wave:**
1. Demon cards revealed and placed at target locations.
2. **You choose 2 Ward Activations** (the core night decision).
3. Ward passive effects apply everywhere simultaneously.
4. Ward active effects resolve at their locations.
5. Surviving demons deal damage: strength minus ward defense = damage to Population.
6. Hero wave ability triggers (see Heroes — each hero has a free ability per wave).
7. Check for Fallen locations.

### What Makes This Interactive

In V1, you watched 6 locations get hit. In V2:
- Wave 1: 5 demons across 4 locations. You have 2 activations. Which fires do you put out?
- Wave 2: 6 demons, and that Rock Demon at Lakton will kill 2 Pop. Do you burn BOTH activations there, or spread them?
- Wave 3: 7 demons, Desert Spear is about to Fall, but your Fire ward at Cutter's Hollow could kill 3 Flame Demons if activated. Choose.

**3 waves x 2 decisions per wave = 6 tactical decisions per night, minimum.** Plus hero abilities. Plus ward combo triggers. The night phase is now the MAIN game.

### What Happens When a Location Falls

- Population reaches 0.
- Location stops producing resources.
- **Demon Magnet:** Fallen locations attract demons. Each wave, 1 demon that would target an adjacent location targets the Fallen location instead. This is the CATCH-UP mechanic — losing a location is bad, but it buys the survivors time.
- The Fallen location's wards are destroyed.
- **Reclaiming:** Spend 2 AP + 2 Food during a day phase to restore a Fallen location with 2 Population and 0 wards. Expensive but possible.

---

## 4. WARD SYSTEM — Streamlined But Deep

### Philosophy

With only 2 slots per location, every ward matters more. You will place 8 wards total across the map (maximum). Each one is a strategic commitment. The combo system now drives the night phase because ward activations are your primary way to fight.

### The 5 Base Wards

Each ward has a **Passive Effect** (always active) and an **Active Effect** (costs 1 Ward Activation during night).

| Ward | Craft Cost | Passive Effect | Active Effect (1 Activation) |
|---|---|---|---|
| **Fire** | 2 Wood | Deals 1 damage to all demons here each wave. | **Blaze:** Deal 3 damage to one demon here. |
| **Stone** | 2 Wood | +2 ward defense at this location. | **Bulwark:** This location takes 0 damage this wave (total immunity). |
| **Wind** | 2 Ink | Redirect 1 demon to an adjacent location before combat. | **Gale:** Redirect ALL demons here to adjacent locations (you choose distribution). |
| **Light** | 2 Ink | Reveals exact demon types targeting this location in the Threat Forecast. | **Flare:** All demons here take 1 damage AND you may rearrange 1 demon from here to any other location. |
| **Bone** | 1 Wood + 1 Ink | Heals 1 Population here at dawn. | **Mend:** Heal 1 Population here immediately (during the wave). |

### Ward Slots and Combos

Each location has **2 ward slots**. Two wards in the same location form a **Ward Pair** that grants a **Combo Passive** and a **Combo Activation** (a special active effect that costs 1 activation but is more powerful than either individual active).

| Pair | Combo Name | Combo Passive | Combo Activation |
|---|---|---|---|
| Fire + Stone | **Magma Ward** | +1 damage to Fire's passive (2 to all instead of 1). | **Eruption:** Deal 4 damage to the strongest demon here AND +3 defense this wave. |
| Fire + Wind | **Inferno Ward** | When Wind redirects a demon, it takes 1 damage. | **Firestorm:** Deal 2 damage to all demons at this location AND all adjacent locations. |
| Fire + Light | **Sunward** | Wave 1 each night: auto-kill all strength-1 demons here. | **Solar Flare:** Kill all demons with strength <= 2 at this location. |
| Fire + Bone | **Cauterize Ward** | Bone heals 2 Pop instead of 1 if a demon died here last night. | **Phoenix:** Heal 2 Population AND deal 2 damage to all demons here. |
| Stone + Wind | **Fortress Ward** | Stone gives +3 defense instead of +2. | **Rampart:** This location is immune this wave AND redirect 1 demon to here from each adjacent location (absorb hits). |
| Stone + Light | **Sentinel Ward** | Reveal all spawns at this AND adjacent locations. | **Aegis:** This location and 1 adjacent location take 0 damage this wave. |
| Stone + Bone | **Haven Ward** | +1 max Population at this location permanently. | **Sanctuary:** Heal 2 Population AND gain +2 defense this wave. |
| Wind + Light | **Storm Ward** | Preview the NEXT wave's demon cards before this wave resolves. | **Tempest:** Rearrange up to 3 demons between any locations on the map. |
| Wind + Bone | **Renewal Ward** | When a demon is redirected away, heal 1 Pop at this location. | **Restoration:** Heal 1 Pop at EVERY location on the map. |
| Light + Bone | **Sanctuary Ward** | Hero heals 1 HP per wave (if applicable). | **Blessing:** Cancel 1 demon card entirely (remove it from this wave). |

### Combo Activations vs Individual Activations

When you spend a Ward Activation at a location with a combo, you choose: trigger ONE ward's individual active, OR trigger the combo activation. You cannot do both. This creates tension — the combo is powerful but sometimes you need the specific individual effect.

### Ancient Wards

Ancient Wards are wild — they count as any type for combo purposes but have no individual passive or active effect. They are the only way to damage the final boss.

---

## 5. THE 4 HEROES — Map-Wide Commanders

Heroes no longer move between locations. Instead, each hero has a **Presence** — a location where their power is concentrated. Moving your Presence is free (once per day phase, once per night phase). Your hero's unique abilities are stronger at your Presence location.

### Universal Hero Rules

- Each hero has **10 HP**.
- Each hero has a **Wave Ability** — a free action that triggers once per wave during night (no activation cost).
- Each hero has **Day Abilities** that cost AP.
- **Presence:** Your hero's Presence is at one location. Abilities marked [P] are enhanced at your Presence location.

---

### ARLEN BALES — The Warded Man

**Theme:** Aggressive demon hunter. Kills demons personally. Gets stronger as he fights.

**Ward Charge Meter:** 0-5. Starts at 0 each night. Gains 1 charge per demon killed at his Presence location.

**Day Abilities:**
| Name | Cost | Effect |
|---|---|---|
| **Explore Anoch Sun** | 1 AP | Gain 1 Ancient Ward fragment (limit: once per day). Arlen is the only hero who can do this for 1 AP. |
| **Warded Flesh** | 1 AP | Place a temporary ward at any location for tonight only (choose type). Does not use a slot. |

**Wave Ability (Free):**
- **Warded Fist:** Kill 1 demon at your Presence location with strength <= your Ward Charge. Does not cost charge.

**Presence Bonus:**
- All ward ACTIVE effects at Arlen's Presence location deal +1 damage.

**Special — Mist Walk:** When Arlen's Ward Charge reaches 5, he may immediately move his Presence to any location (even during a wave). This resets charge to 0.

**Playstyle:** Arlen wants to park his Presence where the fighting is heaviest. Killing demons charges him up, and at 5 charge he teleports to the next crisis. He's a roaming wrecking ball. His temporary ward ability means he can patch a location for one night without committing a permanent slot.

---

### AHMANN JARDIR — The Shar'Dama Ka

**Theme:** Commander of warriors. Defends multiple locations through deployed troops.

**Warrior Pool:** Starts at 4, max 8. Warriors are deployed to locations and fight automatically.

**Day Abilities:**
| Name | Cost | Effect |
|---|---|---|
| **Rally** | 1 AP | Recruit 2 warriors to your pool. |
| **Deploy** | 1 AP | Station up to 3 warriors from your pool at ANY location. |

**Wave Ability (Free):**
- **Sharum Stand:** Each warrior at a location kills 1 demon with strength <= 2 this wave. Warriors that fight a demon with strength > 2 die instead.

**Presence Bonus:**
- Warriors at Jardir's Presence location fight at +1 strength (kill strength <= 3) and do not die from fighting stronger demons.

**Special — Crown of Kaji:** Once per night, Jardir may sacrifice any number of warriors at one location. They deal total damage equal to (warriors x 2) to the strongest demon there. Those warriors die.

**Playstyle:** Jardir spreads his warriors across the map to handle weak demons automatically, saving Ward Activations for the big threats. His Presence protects warriors from dying, so he moves it to wherever his army faces the worst odds. Managing warrior deployment and attrition is his unique puzzle.

---

### ROJER INN — The Fiddle Wizard

**Theme:** Demon controller. Manipulates where demons go and what they do. Zero personal combat.

**Song Slots:** Rojer has 3 Song Slots. During the day, he **composes** his setlist for the night — locking in which song plays each wave.

**Day Abilities:**
| Name | Cost | Effect |
|---|---|---|
| **Compose** | 1 AP | Set or change 1 Song Slot for tonight. |
| **Rehearse** | 1 AP | Set ALL 3 Song Slots at once. (Efficient but costs an action.) |

**Songs (one plays per wave, chosen during day):**

| Song | Effect |
|---|---|
| **Lullaby** | All demons at your Presence location skip their attack this wave. |
| **The Call** | Move up to 2 demons from adjacent locations to your Presence location. They attack next wave. |
| **Frenzy** | Demons at your Presence location attack each other: each deals 1 damage to another. |
| **Dissipation** | All demons with strength <= 2 at your Presence location are removed from the game this night. |

**Wave Ability (Free):**
- **Minor Charm:** Move 1 demon from your Presence location to an adjacent location OR from an adjacent location to your Presence location.

**Presence Bonus:**
- Songs affect your Presence location AND one adjacent location of your choice.

**Special — Harmony:** If Rojer plays 3 different songs across 3 waves, gain 1 bonus Ward Activation on the final wave.

**Playstyle:** Rojer is the puppet master. He plans his night during the day by composing songs, then manipulates demon positions to cluster them into kill zones (where Fire wards or other heroes' effects can destroy them) or stalls them with Lullaby to buy time. His Presence bonus makes songs affect 2 locations, so he covers half the map with crowd control. He needs ward infrastructure to kill — his job is to herd demons into the grinder.

---

### LEESHA PAPER — The Herb Gatherer

**Theme:** Support and preparation. Extra actions, consumable items, efficient crafting.

**Inventory:** Up to 4 consumable items.

**Day Abilities:**
| Name | Cost | Effect |
|---|---|---|
| **Brew** | 1 AP + 1 Food | Create a Healing Potion (use during night: heal 2 Pop at any location). |
| **Firespit** | 1 AP + 1 Wood | Create a Firespit flask (use during night: deal 3 damage to 1 demon at any location). |
| **Forbiddance** | 1 AP + 2 Ink | Create a Forbiddance Circle (use during night: 1 location takes 0 demon damage for 1 wave). |
| **Ward Catalyst** | 1 AP + 1 Ink | Create a Catalyst (use during Fortify: the placed ward counts as 2 types for combo). |

**Leesha gets 5 AP instead of 4.** She is the most productive day-phase hero.

**Leesha's wards cost 1 fewer total resource to craft** (minimum 1).

**Wave Ability (Free):**
- **Triage:** Use 1 consumable item from your Inventory. (This is IN ADDITION to your 2 Ward Activations — Leesha gets to use items for free.)

**Presence Bonus:**
- Consumable items used at Leesha's Presence location have enhanced effects:
  - Healing Potion heals 3 instead of 2.
  - Firespit deals 4 instead of 3.
  - Forbiddance lasts 2 waves instead of 1.

**Special — Hora Craft:** When a demon is killed at any location, Leesha gains 1 Ink to any stockpile (once per wave).

**Playstyle:** Leesha's 5 AP and cheap crafting let her build the ward network faster than anyone. During night, her consumables act as a third "activation" each wave, letting her patch holes everywhere. She plays a preparation-and-triage game: brew potions and firespits during the day, then spend them reactively at night to save wherever the wards aren't enough.

---

## 6. DEMONS

### The 5 Coreling Types

| Type | Strength | Targeting | Special |
|---|---|---|---|
| **Wood Demon** | 2 | Location with least ward defense. | Takes double damage from Fire wards. |
| **Rock Demon** | 4 | Location with highest Population. | Ignores 1 point of ward defense. |
| **Wind Demon** | 1 (appears as a group of 3) | Random location. | Cannot be redirected by Wind wards. |
| **Water Demon** | 3 | Lakton, or if Lakton has Fallen, random. | Ward defense halved (round down) against Water Demons. |
| **Flame Demon** | 1 | Random location. | On damage, destroys 1 resource at the location. |

### Demon Card Count Per Wave

| Night # | Cards per wave | Total per night |
|---|---|---|
| 1 | 3 | 9 |
| 2 | 4 | 12 |
| 3 | 5 | 15 |
| 4 | 6 | 18 |
| 5 | 7 | 21 |
| 6+ | 8 | 24 |

### Escalation (Campaign Mode)

| Night | Change |
|---|---|
| 1-2 | Wood Demons and Flame Demons only. |
| 3-4 | Wind Demons and Water Demons join. |
| 5-6 | Rock Demons join. +1 card per wave. |
| 7+ | Mind Demons enter the deck. |

### Boss Demons

**Mind Demon (Strength 5):**
- Appears from Night 7+.
- When it spawns, it **disables 1 ward** at its target location for the entire night.
- Cannot be redirected.
- Killing it rewards 1 Ancient Ward fragment.

**Consort (Strength 3, spawns with Mind Demon):**
- Makes the Mind Demon immune until the Consort is killed.
- Copies the active effect of 1 ward at its location and uses it against you (e.g., copies Fire to deal 1 damage to Population per wave).

**Alagai Ka — The Demon Prince (Campaign Final Boss, Strength 10):**
- Appears in the final chapter.
- Disables ALL wards at its location.
- Spawns 1 extra demon per wave at its location.
- Can ONLY be damaged by Ancient Wards or hero abilities.
- Has **15 HP** across multiple nights. Damage carries over.
- Moves to a new location each night (always the most populated).

---

## 7. QUICK MODE — A Real 30-Minute Game

### Setup
1. Choose a hero.
2. All 4 locations start at default Population and 0 wards placed.
3. You start with: 3 Wood, 3 Ink, 3 Food (distributed across stockpiles however you choose).
4. Place your Presence at any location.

### Structure
- **Day Phase:** 4 AP (5 for Leesha). Make your preparations.
- **Night Phase:** 3 waves. Fixed demon deck at Night 4 difficulty (6 cards per wave, 18 total).
- **Total:** 1 Day + 1 Night.

### Decision Count (Why This Works)

**Day Phase (4+ decisions):**
- 4 AP = 4 actions. Each is a meaningful choice: which location, which action, which ward, which resources.
- Resource allocation: where to stockpile, what to craft.
- Presence placement.

**Night Phase (9+ decisions):**
- 3 waves x 2 Ward Activations = 6 activation choices.
- 3 waves x 1 hero wave ability = 3 hero decisions (where to use, which target).
- Plus: Presence movement (1 free move during night), consumable usage, warrior deployment decisions, song effects...

**Total: 13-20 meaningful decisions in 25-30 minutes.** Every single one matters.

### Victory Condition
Survive the night with **at least 3 of 4 locations standing** (Population > 0).

### Defeat Condition
- 2 or more locations Fall, OR
- All resources at all locations depleted AND 2+ locations at Population 1 (doom state).

### Scoring
Score = total remaining Population + (total resources / 2) + quest bonuses completed. Leaderboard per hero.

### Difficulty Settings
- **Dusk** (Easy): Night 3 deck (5 cards/wave). Need only 2 locations standing.
- **Midnight** (Normal): Night 4 deck (6 cards/wave). Need 3 locations standing.
- **New Moon** (Hard): Night 6 deck (8 cards/wave). Need all 4 locations standing. Mind Demon in wave 3.

---

## 8. CAMPAIGN MODE — 10 Chapters

### Chapter Structure

Each chapter = 1 Day + 1 Night unless noted. The campaign represents 10 nights of escalating warfare.

| Ch | Title | Special Rules |
|---|---|---|
| 1 | **The First Night** | Tutorial. Only Wood Demons. 2 waves. Start with 1 free Stone ward at Cutter's Hollow. |
| 2 | **The Swarm** | Flame Demons join. Wave 3 has double spawns. |
| 3 | **The Storm** | Wind + Water Demons join. Lakton gets +2 demon cards targeting it. |
| 4 | **The Desert** | Rock Demons debut. Desert Spear quest unlocks. |
| 5 | **The Ruins** | Anoch Sun quest available. 2 Day phases before the Night. |
| 6 | **The Breach** | Choose 1 location to start Fallen. Mind Demon appears but flees after wave 1. |
| 7 | **The Mind** | First full Mind Demon + Consort fight. Kill reward: Ancient Ward. |
| 8 | **The War** | 2 Mind Demons. All locations lose 1 Pop before night. 5 Ward Activations per wave instead of 2. |
| 9 | **The Sacrifice** | You must permanently destroy 1 location (removed from game). 3 locations remain. |
| 10 | **Sharak Ka** | Alagai Ka appears. 3 Day/Night cycles to kill it. All demon types. 4 waves per night. |

### What Carries Over

- Ward layouts at all locations.
- Hero level and abilities.
- Resources (half, rounded down).
- Population (as-is — damage is permanent unless healed).
- Fallen locations remain Fallen unless reclaimed.

### Catch-Up Mechanics

1. **Demon Magnet:** Fallen locations draw demons away from living ones (see Section 3).
2. **Desperation Supplies:** If 2+ locations are at Population 1, you gain +1 AP next day.
3. **Survivor's Will:** After losing a location in campaign, your hero gains +1 to their Wave Ability for the rest of that night (Arlen kills +1 strength, Jardir warriors fight +1, etc.).

### Hero Progression

After each chapter, gain 1 **Skill Point**. Spend on:
- +2 max HP.
- +1 AP per day (costs 2 points, can only buy once).
- +1 Ward Activation per night (costs 2 points, can only buy once).
- Unlock **Advanced Ability** (each hero has 2; available at chapters 5+ and 8+).

**Advanced Abilities:**

| Hero | Ability 1 (Ch 5+) | Ability 2 (Ch 8+) |
|---|---|---|
| Arlen | **Unity:** Ward Charge persists between nights. | **Demon Form:** At 5 charge, instead of Mist Walk, kill ALL demons at Presence location. |
| Jardir | **Spear of Kaji:** Warriors deal double damage to boss demons. | **Warlord:** Deploy costs 0 AP (free action, once per day). |
| Rojer | **Waning Song:** New song — all demons at target location(s) permanently lose 1 strength. | **Crescendo:** Songs affect ALL locations, not just Presence + 1 adjacent. |
| Leesha | **Hora Craft:** Craft wards using 0 resources (once per day). | **Master Alchemist:** Consumables can target 2 locations instead of 1. |

### Story Beats

Between chapters, brief narrative passages (2-3 screens):
- Ch 1-3: Discovery — Demons are getting smarter. Wards are failing.
- Ch 4-6: The Old World — Anoch Sun reveals humanity once fought back.
- Ch 7-9: The War — Mind Demons coordinate. Cities fall. Choose what to save.
- Ch 10: Sharak Ka — The final battle for humanity.

---

## 9. RESOURCE ECONOMY

### The 3 Resources

| Resource | Produced By | Used For |
|---|---|---|
| **Wood** | Cutter's Hollow | Fire wards, Stone wards, Firespit |
| **Ink** | Desert Spear, Miln | Wind wards, Light wards, Forbiddance, Ward Catalyst |
| **Food** | Lakton | Healing Potions, Reclaiming locations, Quests |

### Economy Math (Quick Mode)

- Start: 3 of each (9 total).
- Dawn production: 4 resources (1 per location).
- 4 AP. Each Gather gives 2 resources. Each ward costs 2 resources.
- In Quick Mode you get 1 day. If you Gather twice, you have 13 resources. That's enough for ~5 wards if you do nothing else. But you also need to Fortify (1 AP each), so realistically you place 2-3 wards and do 1-2 other things.
- 2-3 wards across 4 locations means most locations are partially defended. You MUST use night-phase decisions (activations, hero abilities) to survive. The day is preparation; the night is the game.

### Why Resources Matter

Resources are stored at locations. When a location Falls, its stockpile is destroyed. This creates a reason to spread resources across locations — don't put all your Wood at Cutter's Hollow or you lose everything if it Falls.

The **Reinforce** action (move 1 resource between adjacent locations) exists for this logistics puzzle.

---

## 10. MOBILE UX DESIGN

### Screen Layout

The game is designed for a phone held vertically.

**Day Phase Screen:**
```
┌─────────────────────┐
│   THREAT FORECAST    │
│  N:Med W:High E:Low  │
│       S:Med          │
├─────────────────────┤
│                      │
│   [LOCATION CARD]    │
│   Pop: 4  Wards: 🔥⛰ │
│   Stock: 2W 1I 0F   │
│   ← swipe →          │
│                      │
├─────────────────────┤
│  AP: ●●●●  Reserves  │
│  [Gather] [Craft]    │
│  [Fortify] [Quest]   │
│  [Hero] [Reinforce]  │
└─────────────────────┘
```

Swipe left/right between the 4 location cards. Tap an action, tap a location. Done.

**Night Phase Screen:**
```
┌─────────────────────┐
│  WAVE 2 - MIDNIGHT   │
├─────────────────────┤
│  N: 🐉x2 (str 2,4)  │
│  W: 🐉x1 (str 1x3)  │
│  E: 🐉x1 (str 3)    │
│  S: 🐉x2 (str 1,1)  │
├─────────────────────┤
│  ACTIVATIONS: ●●     │
│  Tap a location to   │
│  activate its ward   │
├─────────────────────┤
│  [Hero Ability]      │
│  Presence: NORTH ▼   │
└─────────────────────┘
```

All 4 locations visible at once during night. Tap to activate. No scrolling, no complexity. The entire game state fits on one phone screen.

---

## 11. WHY THIS GAME IS NOW SPECIAL

### Every Action Matters
4 AP, 4 locations, 2 ward slots each. There is no wasted action. Every Gather, every Craft, every Fortify shapes the coming night. You cannot over-prepare. You will always wish you had one more action.

### Night Is the Game
The night phase is where you prove your strategy works — or improvise when it doesn't. 2 Ward Activations per wave across 4 locations means you are always triaging, always sacrificing somewhere to save somewhere else. The question is never "what do I do?" but "what do I sacrifice?"

### Heroes Are Truly Different
- **Arlen** plays an aggressive game: hunting kills, building charge, teleporting to crises.
- **Jardir** plays a deployment game: spreading warriors, protecting them with Presence, sacrificing them in emergencies.
- **Rojer** plays a planning game: composing songs during the day, herding demons at night, turning the map into a puzzle.
- **Leesha** plays a preparation game: crafting items and wards faster than anyone, then using consumables as a third activation each wave.

### The Ward Network Still Matters
With 2 slots per location and 10 combos, the positional grammar is preserved but simplified. You make 4 combo decisions (one per location) instead of 7. Each matters more because each location is more important.

### The "One More Night" Feeling
You always see a path forward. "If I activate the Magma Ward at Desert Spear to kill the Rock Demon, I can use my other activation on Wind at Lakton to redirect the Water Demon to Cutter's Hollow where the Fire ward passive will weaken it..." That chain of reasoning — seeing the network work — is the heart of the game.

---

## APPENDIX A: TURN STRUCTURE SUMMARY

```
=== DAY PHASE ===
1. Dawn: Each location produces 1 of its resource.
2. Threat Forecast revealed (Low/Med/High/Extreme per location).
3. Hero gets 4 AP (5 for Leesha). Move Presence for free (optional).
4. Spend AP on actions targeting any location, in any order.

=== NIGHT PHASE ===
1. Move Presence for free (optional, once during night).
2. WAVE 1 (Early Night):
   a. Draw demon cards. Reveal all. Place at target locations.
   b. Choose 2 Ward Activations (tap locations).
   c. Resolve: passives → actives → demon damage → hero wave ability.
   d. Check for Fallen locations.
3. WAVE 2 (Midnight): Repeat.
4. WAVE 3 (Pre-Dawn): Repeat.
5. Night ends. All surviving demons removed.
6. Proceed to next Day Phase.
```

## APPENDIX B: QUICK REFERENCE — WARD COMBOS

```
Each location: 2 slots → 1 combo pair

FIRE + STONE  = Magma       (passive: +1 fire dmg | active: 4 dmg + 3 def)
FIRE + WIND   = Inferno     (passive: redirect dmg | active: 2 dmg all here + adjacent)
FIRE + LIGHT  = Sunward     (passive: auto-kill str 1 wave 1 | active: kill all str ≤2)
FIRE + BONE   = Cauterize   (passive: heal 2 if kill | active: heal 2 + 2 dmg all)
STONE + WIND  = Fortress    (passive: +3 def | active: immune + absorb from neighbors)
STONE + LIGHT = Sentinel    (passive: reveal adjacent | active: 2 locations immune)
STONE + BONE  = Haven       (passive: +1 max pop | active: heal 2 + 2 def)
WIND + LIGHT  = Storm       (passive: preview next wave | active: rearrange 3 demons)
WIND + BONE   = Renewal     (passive: heal on redirect | active: heal 1 all locations)
LIGHT + BONE  = Sanctuary   (passive: hero heals | active: cancel 1 demon card)
```

## APPENDIX C: HERO SELECTION GUIDE

```
ARLEN    — "I want to hunt demons and teleport to crises."
           Aggressive. Ward Charge snowball. Temporary wards.

JARDIR   — "I want to command an army across the map."
           Warrior deployment. Multi-location auto-defense. Sacrifice plays.

ROJER    — "I want to plan the perfect night."
           Day: compose songs. Night: herd demons into kill zones.

LEESHA   — "I want to be ready for everything."
           5 AP. Cheap wards. Consumable items as bonus activations.
```

## APPENDIX D: QUICK MODE DECISION MAP

```
A typical Quick Mode game (Midnight difficulty):

DAY (4 AP, ~10 min):
  Decision 1: Where to place Presence?
  Decision 2: Gather at which location?
  Decision 3: Craft which ward type?
  Decision 4: Fortify which location? Or second Gather?
  Bonus: Resource distribution, quest attempt?

NIGHT (3 waves, ~15 min):
  Wave 1 (6 demons):
    Decision 5-6: Which 2 ward activations?
    Decision 7: Hero wave ability target?
  Wave 2 (6 demons):
    Decision 8-9: Which 2 ward activations?
    Decision 10: Hero wave ability target?
    Decision 11: Move Presence?
  Wave 3 (6 demons):
    Decision 12-13: Which 2 ward activations?
    Decision 14: Hero wave ability target?

Total: 14+ meaningful decisions in ~25 minutes.
```

---

*"There is nothing to fear in the night — if you know which wards to activate."*
