# The Warded Man: Sharak Ka -- V3 Rules (Playtest Revision)

## Solo Strategy Game for Mobile

---

## DESIGN PHILOSOPHY

You are the **commander of the defense**, not a person walking between towns. You see the whole map. You act everywhere. Your hero determines HOW you defend, not WHERE. Every action matters. Every night, you fight back.

**Players:** 1 (future coop: 2-4)
**Modes:** Quick (~30 min, 10-15 meaningful decisions) | Campaign (~6 hours across 10 chapters)
**Core loop:** Day = build your ward network. Night = fight demons with real-time decisions every wave.

---

## WHAT CHANGED FROM V2 (Playtest Fixes)

| V2 Problem | V3 Fix |
|---|---|
| Quick Mode: 4 AP can only place 2 wards, 2 locations are naked and die instantly | Quick Mode starts with 2 pre-placed wards + 5 AP for all heroes |
| Kill zone dominates: stack wards at 1 location, herd everything there | Swarm rule (+1 str when 3+ demons), boss demons immune to redirection, location-locked demons |
| Flat 2 ward activations wasted when wards only at 1-2 locations | 1 activation PER warded location (spread wards = more activations) |
| Dissipation (Rojer) is a board wipe | Nerfed to "up to 2 demons, str<=2, Presence only" |
| Food single-sourced from Lakton; if Lakton falls, game breaks | All locations produce 1 Food every other turn; Lakton still primary |
| Fallen locations are safe demon sinks | Demons at Fallen locations grow +1 str/night; after 3 nights form Hordes |
| Hero HP never explained | Overflow damage + Mind Demon direct damage rules added |
| Temporary wards and combos unclear | Temp wards form combos but are removed at dawn |
| Solved puzzles: same kill zone pattern every wave | Demon Surge events (1/night, random) force adaptation |
| Arlen's early ramp too slow | Arlen starts each night with Ward Charge = 1; Warded Flesh gives +1 Charge on damage |
| Arlen's Warded Fist useless vs big demons | Warded Fist now deals damage = Ward Charge (not binary kill). Scales: charge 3 = 3 dmg to a Rock Demon. |
| Leesha OP with cheap wards | Removed "-1 resource cost on wards" discount. Identity is 6 AP + consumables + Hora Craft. |
| Water Demons only target Lakton | Water Demons target Lakton (60%) or Desert Spear (40%). Spreads pressure. |
| Sanctuary combo name collision | Light+Bone combo renamed to Consecration Ward (Haven active is still Sanctuary). |
| Presence movement timing unclear | Free Presence move is BEFORE any wave. Arlen's Mist Walk is BETWEEN waves. |
| Wind Demons vs Swarm unclear | Wind Demon group = 3 individual demons for Swarm. Each is str 1 separately. |

---

## 1. THE MAP -- 4 Locations as Cards

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

| Location | Name | Primary Resource | Secondary | Starting Pop | Flavor |
|---|---|---|---|---|---|
| **North** | Desert Spear | Ink | -- | 5 | Krasian warrior culture. Far from supplies. |
| **West** | Cutter's Hollow | Wood | Food (odd turns) | 5 | The heart of the Free Cities. Must not fall. |
| **East** | Lakton | Food | -- | 4 | Fishing city on the lake. Vulnerable to Water Demons. |
| **South** | Miln | Ink | Food (even turns) | 5 | Mountain city of scholars. Strong but isolated. |

**Anoch Sun** is not a location on the map. It is a **quest destination** -- a special action available from any location (see Quests).

### Location Stats

Each location has:
- **Population (HP):** 3-5. When it hits 0, the location Falls.
- **Ward Slots:** 2 per location. That's it. 2 wards, 1 combo. Choose wisely.
- **Resource production:** Generates 1 of its primary resource at dawn. (See Food Production below.)
- **Stockpile:** Resources stored here (max 4 per location).

### Food Production (V3 Fix)

Lakton produces 1 Food every dawn (its primary resource). In addition, **Cutter's Hollow produces 1 Food on odd turns (Nights 1, 3, 5...)** and **Miln produces 1 Food on even turns (Nights 2, 4, 6...)**. This means Food is never single-sourced. Even if Lakton falls, the other cities can sustain themselves -- at reduced capacity, creating pressure without a death spiral.

In Quick Mode (single day/night): Cutter's Hollow produces 1 Food at dawn (it's turn 1 = odd).

### Why 4 Locations Works

With 5 AP and 4 locations, you can meaningfully impact every part of the map each day. No location is "too far." The question isn't "can I reach it?" but "what do I spend my action on there?" This is real strategy, not travel logistics.

---

## 2. DAY PHASE -- Command the Whole Map

### Actions

You have **5 Action Points (AP)** per day. You can spend them at ANY location -- you are not physically at one place. Your hero's presence is abstract; you are commanding the defense of all the Free Cities.

Each action targets a specific location.

| Action | Cost | Effect |
|---|---|---|
| **Gather** | 1 AP | Collect 2 of the target location's primary resource into its stockpile. |
| **Craft Ward** | 1 AP | Spend resources from ANY stockpile(s) to create a ward. Place it in your Reserves (max 3 in reserves). |
| **Fortify** | 1 AP | Place a ward from your Reserves into a slot at the target location. |
| **Quest** | 1-2 AP | Complete a quest at the target location (see Quests). |
| **Hero Action** | 1 AP | Use one of your hero's unique day abilities (see Heroes). |
| **Reinforce** | 1 AP | Move 1 resource from one location's stockpile to an adjacent location's stockpile. |

### The Information Problem

At the start of each day, you see a **Threat Forecast**: a rough indicator (Low / Medium / High / Extreme) for each location based on demon activity. This is free -- no action required.

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

## 3. NIGHT PHASE -- You Fight Everywhere

This is the core of the game. Night is not passive. You make decisions at every location, every wave.

### Demon Spawning

Night has **3 waves** (Early Night, Midnight, Pre-Dawn).

**Spawn procedure per wave:**
1. Draw demon cards equal to **Night Number + 2** (Quick Mode uses a fixed number).
2. Each card shows: demon type, target location, strength.
3. All cards are revealed simultaneously. You see the full wave before acting.

### Demon Surge Events (V3 -- 1 per Night)

At the start of each night, before Wave 1, draw 1 **Demon Surge** card. This event applies to the ENTIRE night and forces you to adapt your strategy. You cannot plan around the same patterns every game.

| Surge Event | Effect |
|---|---|
| **Blood Moon** | All demons gain +1 strength this night. |
| **Rising Tide** | Demons spawn at the Presence location instead of their printed target (Wave 1 only). |
| **Warding Blight** | Ward passives are disabled this night. Actives still work. |
| **Swarming Dark** | +2 demon cards per wave this night. |
| **Demon Frenzy** | Demons at Fallen locations immediately attack adjacent living locations (in addition to Horde rules). |
| **Coreling Prince** | One random demon per wave is upgraded to +2 strength. **(Campaign only — excluded from Quick Mode.)** |
| **Mist Shroud** | Threat Forecast was wrong: swap the target locations of 2 random demon cards per wave. |
| **Night of Courage** | No surge effect. (1 in 8 chance -- a reprieve.) |

In Quick Mode, draw from a reduced deck (remove Swarming Dark and Demon Frenzy). In Campaign, all surges are in the deck.

### The Night Decision: Ward Activations

Each wave, after demons are placed, you get **Ward Activations equal to the number of locations that have at least 1 ward placed.** Minimum 1 activation even if no wards are placed (representing your hero's baseline effort).

**Example:** If you have wards at Cutter's Hollow, Lakton, and Desert Spear but not Miln, you get 3 activations per wave. If all 4 locations are warded, you get 4. This rewards spreading your ward network instead of stacking everything at one location.

A Ward Activation lets you trigger one placed ward's ACTIVE effect at its location. Wards have both a passive effect (always on) and an active effect (costs an activation to use).

**Resolution order per wave:**
1. Demon cards revealed and placed at target locations.
2. **Swarm check:** At any location with 3 or more demons, all demons there gain +1 strength (see Swarm rule).
3. **You choose your Ward Activations** (the core night decision).
4. Ward passive effects apply everywhere simultaneously.
5. Ward active effects resolve at their locations.
6. Surviving demons deal damage: total demon strength minus total ward defense = damage to Population. Excess damage beyond what kills the location's Population is **overflow damage** (see Hero HP).
7. Hero wave ability triggers (see Heroes -- each hero has a free ability per wave).
8. Check for Fallen locations.

### The Swarm Rule (V3 -- Anti-Kill-Zone)

When **3 or more demons** occupy the same location at the start of combat resolution (step 2), they gain a pack bonus: **each demon at that location gains +1 strength.**

This means herding all demons to one kill zone has diminishing returns. A location with 5 demons faces 5 extra total strength on top of their base. The optimal play is to spread your defenses and manage demons across multiple locations, not funnel everything into one spot.

Swarm bonuses are checked AFTER redirection effects (Wind ward, Rojer's songs, etc.) resolve but BEFORE damage calculation.

### Hero HP (V3 -- Clarified)

Heroes have **10 HP**. Heroes take damage in two ways:

1. **Overflow damage:** When demons breach the hero's Presence location (damage exceeds remaining Population), the overflow deals damage to the hero. Example: Location has 2 Pop, demons deal 5 damage. Location falls (2 Pop lost), hero takes 3 damage.
2. **Mind Demon attacks (Ch5+):** Mind Demons deal 2 direct damage to the hero per wave if they are at the hero's Presence location, regardless of ward defense.

If a hero reaches 0 HP, they are **incapacitated** for the remainder of the night (no wave abilities, no Presence bonus). They recover to 5 HP at dawn. In Campaign, incapacitation carries a penalty: -1 AP next day.

### What Happens When a Location Falls

- Population reaches 0.
- Location stops producing resources.
- The Fallen location's wards are destroyed.
- **Reclaiming:** Spend 2 AP + 2 Food during a day phase to restore a Fallen location with 2 Population and 0 wards. Expensive but possible.

### Fallen Locations: Ticking Time Bombs (V3 Fix)

Fallen locations are NOT safe demon sinks. They are escalating threats.

- **Demon Magnet:** Fallen locations still attract demons. Each wave, 1 demon that would target an adjacent location targets the Fallen location instead.
- **Festering:** Demons at Fallen locations grow **+1 strength per night** they remain there. A Wood Demon (str 2) sitting at a Fallen location for 2 nights becomes str 4.
- **Horde Formation:** After a Fallen location has had demons for **3 consecutive nights**, those demons form a **Horde**. The Horde attacks an adjacent living location at the start of the NEXT night (before Wave 1). The Horde's total strength equals the sum of all demons there. After attacking, the Horde dissipates (demons are removed).

This means you MUST either reclaim Fallen locations quickly or deal with the demons accumulating there. Ignoring a Fallen location creates a ticking bomb that will eventually devastate a neighbor.

---

## 4. WARD SYSTEM -- Streamlined But Deep

### Philosophy

With only 2 slots per location, every ward matters more. You will place 8 wards total across the map (maximum). Each one is a strategic commitment. The combo system drives the night phase because ward activations are your primary way to fight.

**Spreading wards is now mechanically rewarded:** more warded locations = more activations per wave.

### The 5 Base Wards

Each ward has a **Passive Effect** (always active) and an **Active Effect** (costs 1 Ward Activation during night).

| Ward | Craft Cost | Passive Effect | Active Effect (1 Activation) |
|---|---|---|---|
| **Fire** | 2 Wood | Deals 1 damage to all demons here each wave. | **Blaze:** Deal 3 damage to one demon here. |
| **Stone** | 2 Wood | +2 ward defense at this location. | **Bulwark:** This location takes 0 damage this wave (total immunity). |
| **Wind** | 2 Ink | Redirect 1 non-locked demon to an adjacent location before combat. | **Gale:** Redirect up to 3 non-locked, non-boss demons here to adjacent locations (you choose distribution). |
| **Light** | 2 Ink | Reveals exact demon types targeting this location in the Threat Forecast. | **Flare:** All demons here take 1 damage AND you may rearrange 1 non-locked, non-boss demon from here to any other location. |
| **Bone** | 1 Wood + 1 Ink | Heals 1 Population here at dawn. | **Mend:** Heal 1 Population here immediately (during the wave). |

**Redirection restrictions (V3):** Wind ward passive, Wind active (Gale), Light active (Flare), and any other redirection effects CANNOT move:
- **Boss demons** (Mind Demon, Consort, Alagai Ka).
- **Location-locked demons** (marked with a lock icon on their card; see Demons section).

### Temporary Wards (V3 -- Clarified)

Temporary wards (placed by Arlen's Warded Flesh or other effects) occupy a special "temp" slot -- they do NOT use a permanent ward slot. Temporary wards:
- **DO** provide passive and active effects.
- **DO** form combos with permanent wards at the same location (granting combo passive and combo activation options).
- **DO** count toward the "warded location" check for activation count.
- Are **removed at dawn** (do not persist between nights).
- Are marked with a "TEMP" indicator in the UI.

A location can have up to 2 permanent wards + 1 temporary ward. If a temp ward forms a combo with a permanent ward, you choose which combo to use when activating (you can only use one combo per activation).

### Ward Slots and Combos

Each location has **2 ward slots**. Two wards in the same location form a **Ward Pair** that grants a **Combo Passive** and a **Combo Activation** (a special active effect that costs 1 activation but is more powerful than either individual active).

| Pair | Combo Name | Combo Passive | Combo Activation |
|---|---|---|---|
| Fire + Stone | **Magma Ward** | +1 damage to Fire's passive (2 to all instead of 1). | **Eruption:** Deal 4 damage to the strongest demon here AND +3 defense this wave. |
| Fire + Wind | **Inferno Ward** | When Wind redirects a demon, it takes 1 damage. | **Firestorm:** Deal 2 damage to all demons at this location AND all adjacent locations. |
| Fire + Light | **Sunward** | Wave 1 each night: auto-kill all strength-1 demons here. | **Solar Flare:** Kill all demons with strength <= 2 at this location. |
| Fire + Bone | **Cauterize Ward** | Bone heals 2 Pop instead of 1 if a demon died here last night. | **Phoenix:** Heal 2 Population AND deal 2 damage to all demons here. |
| Stone + Wind | **Fortress Ward** | Stone gives +3 defense instead of +2. | **Rampart:** This location is immune this wave AND redirect 1 non-locked, non-boss demon to here from each adjacent location (absorb hits). |
| Stone + Light | **Sentinel Ward** | Reveal all spawns at this AND adjacent locations. | **Aegis:** This location and 1 adjacent location take 0 damage this wave. |
| Stone + Bone | **Haven Ward** | +1 max Population at this location permanently. | **Sanctuary:** Heal 2 Population AND gain +2 defense this wave. |
| Wind + Light | **Storm Ward** | Preview the NEXT wave's demon cards before this wave resolves. | **Tempest:** Rearrange up to 3 non-locked, non-boss demons between any locations on the map. |
| Wind + Bone | **Renewal Ward** | When a demon is redirected away, heal 1 Pop at this location. | **Restoration:** Heal 1 Pop at EVERY location on the map. |
| Light + Bone | **Consecration Ward** | Hero heals 1 HP per wave (if applicable). | **Blessing:** Cancel 1 demon card entirely (remove it from this wave). |

### Combo Activations vs Individual Activations

When you spend a Ward Activation at a location with a combo, you choose: trigger ONE ward's individual active, OR trigger the combo activation. You cannot do both in the same activation. This creates tension -- the combo is powerful but sometimes you need the specific individual effect.

### Ancient Wards

Ancient Wards are wild -- they count as any type for combo purposes but have no individual passive or active effect. They are the only way to damage the final boss.

---

## 5. THE 4 HEROES -- Map-Wide Commanders

Heroes no longer move between locations. Instead, each hero has a **Presence** -- a location where their power is concentrated. Moving your Presence is free (once per day phase, once per night phase). Your hero's unique abilities are stronger at your Presence location.

### Universal Hero Rules

- Each hero has **10 HP** (see Hero HP in Section 3 for damage rules).
- Each hero has a **Wave Ability** -- a free action that triggers once per wave during night (no activation cost).
- Each hero has **Day Abilities** that cost AP.
- **Presence:** Your hero's Presence is at one location. You get **1 free Presence move per night**, usable BEFORE Wave 1 only (not between waves, not during waves). Arlen's Mist Walk is the sole exception: it can move Presence BETWEEN waves. Abilities marked [P] are enhanced at your Presence location.

---

### ARLEN BALES -- The Warded Man

**Theme:** Aggressive demon hunter. Kills demons personally. Gets stronger as he fights.

**Ward Charge Meter:** 0-5. **Starts at 1 each night** (V3 fix -- not 0). Gains 1 charge per demon killed at his Presence location.

**Warded Flesh (Passive, V3):** When Arlen takes damage (overflow damage at his Presence location or Mind Demon attacks), he gains **+1 Ward Charge.** Getting hurt makes Arlen angrier and stronger. This fixes his early ramp: even in a bad Wave 1 where demons breach his location, he's charging up for a comeback.

**Day Abilities:**
| Name | Cost | Effect |
|---|---|---|
| **Explore Anoch Sun** | 1 AP | Gain 1 Ancient Ward fragment (limit: once per day). Arlen is the only hero who can do this for 1 AP. |
| **Warded Flesh** | 1 AP | Place a temporary ward at any location for tonight only (choose type). Does not use a permanent slot. Forms combos with existing wards (see Temporary Wards). |

**Wave Ability (Free):**
- **Warded Fist:** Deal damage equal to your Ward Charge to 1 demon at your Presence location. Does not cost charge.

**Presence Bonus:**
- All ward ACTIVE effects at Arlen's Presence location deal +1 damage.

**Special -- Mist Walk:** When Arlen's Ward Charge reaches 5, he may immediately move his Presence to any location (even during a wave). This resets charge to 0.

**Playstyle:** Arlen starts each night at charge 1, so his Warded Fist deals 1 damage from Wave 1 -- enough to finish off a weakened demon or kill a Flame Demon. As he charges up, Warded Fist scales: at charge 3 he punches 3 damage into a Rock Demon, at charge 4 he threatens almost anything. If he takes hits, Warded Flesh charges him further -- he's a comeback machine. At 5 charge he teleports to the next crisis. His temporary ward ability patches locations for one night AND can create combos with existing wards, making him the most flexible ward user.

---

### AHMANN JARDIR -- The Shar'Dama Ka

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

**Special -- Crown of Kaji:** Once per night, Jardir may sacrifice any number of warriors at one location. They deal total damage equal to (warriors x 2) to the strongest demon there. Those warriors die.

**Playstyle:** Jardir spreads his warriors across the map to handle weak demons automatically, saving Ward Activations for the big threats. His Presence protects warriors from dying, so he moves it to wherever his army faces the worst odds. Managing warrior deployment and attrition is his unique puzzle. Warriors are especially valuable now that the Swarm rule punishes clustering demons -- Jardir picks off weak demons before they pile up.

---

### ROJER INN -- The Fiddle Wizard

**Theme:** Demon controller. Manipulates where demons go and what they do. Zero personal combat.

**Song Slots:** Rojer has 3 Song Slots. During the day, he **composes** his setlist for the night -- locking in which song plays each wave.

**Day Abilities:**
| Name | Cost | Effect |
|---|---|---|
| **Compose** | 1 AP | Set or change 1 Song Slot for tonight. |
| **Rehearse** | 1 AP | Set ALL 3 Song Slots at once. (Efficient but costs an action.) |

**Songs (one plays per wave, chosen during day):**

| Song | Effect |
|---|---|
| **Lullaby** | All demons at your Presence location skip their attack this wave. |
| **The Call** | Move up to 2 **non-locked, non-boss** demons from adjacent locations to your Presence location. They attack next wave, not this wave. |
| **Frenzy** | Demons at your Presence location attack each other: each deals 1 damage to another (randomly assigned). |
| **Dissipation** | Remove **up to 2 demons** with strength <= 2 at your **Presence location only**. (V3 nerf: no longer affects adjacent locations, no longer removes all -- just up to 2.) |

**Wave Ability (Free):**
- **Minor Charm:** Move 1 **non-locked, non-boss** demon from your Presence location to an adjacent location OR from an adjacent location to your Presence location.

**Presence Bonus:**
- Songs affect your Presence location AND one adjacent location of your choice. **Exception: Dissipation affects Presence location ONLY** (even with Presence Bonus).

**Special -- Harmony:** If Rojer plays 3 different songs across 3 waves, gain 1 bonus Ward Activation on the final wave.

**Playstyle:** Rojer is the puppet master. He plans his night during the day by composing songs, then manipulates demon positions to cluster them into kill zones (where Fire wards or other effects can destroy them) or stalls them with Lullaby. The Swarm rule means he must be careful about over-clustering -- herding 4+ demons to one spot makes them stronger. The art is herding exactly 2-3 demons into a warded location, not creating a ball of 6. Dissipation is now surgical removal (2 weak demons) rather than a board wipe, so Rojer must combine it with other tools.

---

### LEESHA PAPER -- The Herb Gatherer

**Theme:** Support and preparation. Extra actions, consumable items, efficient crafting.

**Inventory:** Up to 4 consumable items.

**Day Abilities:**
| Name | Cost | Effect |
|---|---|---|
| **Brew** | 1 AP + 1 Food | Create a Healing Potion (use during night: heal 2 Pop at any location). |
| **Firespit** | 1 AP + 1 Wood | Create a Firespit flask (use during night: deal 3 damage to 1 demon at any location). |
| **Forbiddance** | 1 AP + 2 Ink | Create a Forbiddance Circle (use during night: 1 location takes 0 demon damage for 1 wave). |
| **Ward Catalyst** | 1 AP + 1 Ink | Create a Catalyst (use during Fortify: the placed ward counts as 2 types for combo). |

**Leesha gets 6 AP instead of 5.** She is the most productive day-phase hero.

**Wave Ability (Free):**
- **Triage:** Use 1 consumable item from your Inventory. (This is IN ADDITION to your Ward Activations -- Leesha gets to use items for free.)

**Presence Bonus:**
- Consumable items used at Leesha's Presence location have enhanced effects:
  - Healing Potion heals 3 instead of 2.
  - Firespit deals 4 instead of 3.
  - Forbiddance lasts 2 waves instead of 1.

**Special -- Hora Craft:** When a demon is killed at any location, Leesha gains 1 Ink to any stockpile (once per wave).

**Playstyle:** Leesha's 6 AP let her build the ward network faster than anyone and still have actions left for consumables. During night, her consumables act as an extra "activation" each wave, letting her patch holes everywhere. She plays a preparation-and-triage game: brew potions and firespits during the day, then spend them reactively at night to save wherever the wards aren't enough. Hora Craft feeds her Ink economy, keeping her productive even when stockpiles run low.

---

## 6. DEMONS

### The 5 Coreling Types

| Type | Strength | Targeting | Special | Locked? |
|---|---|---|---|---|
| **Wood Demon** | 2 | Location with least ward defense. | Takes double damage from Fire wards. | No |
| **Rock Demon** | 4 | Location with highest Population. | Ignores 1 point of ward defense. | No |
| **Wind Demon** | 1 (group of 3) | Random location. | Cannot be redirected by Wind wards. A Wind Demon group counts as 3 individual demons for Swarm. Each Wind Demon is a separate entity with str 1. **UI hint: a warning icon appears when Wind Demons target a Wind-only warded location.** | No |
| **Water Demon** | 3 | Lakton (60%) or Desert Spear (40%). If both Fallen, random. | Ward defense halved (round down) against Water Demons. | **Yes -- Location-Locked** |
| **Flame Demon** | 1 | Random location. | On damage, destroys 1 resource at the location. | No |

### Location-Locked Demons (V3)

Some demon cards are printed with a **lock icon**. Location-locked demons CANNOT be redirected by any effect (Wind ward, Rojer's songs, Storm Ward combo, etc.). They are bound to their target location and must be dealt with there.

**Which demons are locked:**
- **Water Demons** are always location-locked (they emerge from specific waterways).
- **Rock Demons** from Night 5+ have a 50% chance of being locked (they burrow in and won't move).
- **Boss demons** (Mind Demon, Consort, Alagai Ka) are always effectively locked (immune to redirection as a boss trait, not the lock mechanic).
- In Campaign Mode, specific demon cards in later chapters are marked locked.

This prevents the strategy of redirecting every threat to one super-warded location. Some demons MUST be fought where they spawn.

### The Swarm Rule

When **3 or more demons** are at the same location at the start of combat resolution, each demon there gains **+1 strength** for that wave. This stacks with other strength bonuses.

**Example:** 4 Flame Demons (str 1 each) clustered at Cutter's Hollow. Swarm triggers: each is now str 2. Total threat: 8 instead of 4. Herding all demons to one spot is now dangerous.

This discourages the "kill zone" strategy where you funnel all demons to one heavily warded location. The optimal play is spreading wards AND spreading demons across manageable groups.

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
- **Immune to all redirection effects.**
- **Deals 2 direct damage to the hero per wave** if at the hero's Presence location (bypasses ward defense).
- Killing it rewards 1 Ancient Ward fragment.

**Consort (Strength 3, spawns with Mind Demon):**
- Makes the Mind Demon immune to damage until the Consort is killed.
- Copies the active effect of 1 ward at its location and uses it against you (e.g., copies Fire to deal 1 damage to Population per wave).
- **Immune to all redirection effects.**

**Alagai Ka -- The Demon Prince (Campaign Final Boss, Strength 10):**
- Appears in the final chapter.
- Disables ALL wards at its location.
- Spawns 1 extra demon per wave at its location.
- Can ONLY be damaged by Ancient Wards or hero abilities.
- Has **15 HP** across multiple nights. Damage carries over.
- Moves to a new location each night (always the most populated).
- **Immune to all redirection effects.**

---

## 7. QUICK MODE -- A Real 30-Minute Game

### Setup
1. Choose a hero.
2. All 4 locations start at default Population.
3. **Pre-placed wards (V3):** Fire Ward at Cutter's Hollow (Slot 1). Wind Ward at Miln (Slot 1). These are already fortified -- no AP cost.
4. You start with: 3 Wood, 3 Ink, 3 Food (distributed across stockpiles however you choose).
5. Place your Presence at any location.

### Structure
- **Day Phase:** 5 AP (6 for Leesha). Make your preparations.
- **Night Phase:** 3 waves. Fixed demon deck at Night 4 difficulty (6 cards per wave, 18 total). 1 Demon Surge event.
- **Total:** 1 Day + 1 Night.

### Quick Mode Math (V3 -- Verified)

**Day Phase Budget (5 AP):**

With 2 pre-placed wards, you already have:
- Cutter's Hollow: Fire Ward (passive: 1 dmg/wave to all demons here).
- Miln: Wind Ward (passive: redirect 1 demon away).
- 2 locations warded = 2 Ward Activations per wave baseline.

Typical AP spending:
- 2 AP: Craft 2 wards (spending starting resources).
- 2 AP: Fortify both wards at Desert Spear and Lakton.
- 1 AP: Hero action, quest, or extra Gather.

Result: **All 4 locations warded = 4 Ward Activations per wave.** This is the sweet spot.

**Night Phase vs Night 4 Demons (6 cards/wave):**

Wave breakdown (typical Night 4 spread): 2 Wood Demons (str 2), 2 Flame Demons (str 1), 1 Wind Demon group (3x str 1), 1 Water Demon (str 3). Total cards = 6, total individual demons ~8, total base strength ~12.

With 4 activations per wave + hero wave ability + ward passives:
- Fire passive at Hollow: 1 dmg to each demon there = kills Flame Demons, weakens others.
- Wind passive at Miln: redirect 1 demon away.
- 4 activations: Blaze (3 dmg), Bulwark (immunity), Gale (redirect 3), etc.
- Hero ability: 1 free kill/effect.

The math works: you can handle ~12 strength per wave across 4 locations with 4 activations + passives + hero. Some damage gets through (2-4 total per wave), creating tension without guaranteed death. Over 3 waves (~6-12 total damage vs ~18 total Population), you survive with 2-3 locations healthy and 1-2 damaged. Tight, but winnable with good play.

**Why the kill zone doesn't dominate:**
If you stack 2 wards at one location and herd demons there:
- Only 2-3 locations warded = only 2-3 activations per wave (fewer tools).
- Swarm rule: 3+ demons clustered = +1 str each = your passives can't keep up.
- Location-locked demons (Water) can't be redirected = naked locations die.

Spreading wards is strictly better in V3. Kill zone is a valid tactic for ONE location's worth of demons, not a universal strategy.

### Decision Count

**Day Phase (5+ decisions):**
- 5 AP = 5 actions. Each is a meaningful choice: which location, which action, which ward, which resources.
- Resource allocation: where to stockpile, what to craft.
- Presence placement.
- Which 2 ward types to craft (to complement the pre-placed Fire + Wind).

**Night Phase (12+ decisions):**
- 3 waves x 3-4 Ward Activations = 9-12 activation choices.
- 3 waves x 1 hero wave ability = 3 hero decisions.
- Plus: Presence movement (1 free move before waves; Arlen's Mist Walk between waves), consumable usage, warrior deployment, song effects...
- Demon Surge adaptation.

**Total: 17-25 meaningful decisions in ~25-30 minutes.**

### Victory Condition
Survive the night with **at least 3 of 4 locations standing** (Population > 0).

### Defeat Condition
- 2 or more locations Fall, OR
- All resources at all locations depleted AND 2+ locations at Population 1 (doom state).

### Scoring
Score = total remaining Population + (total resources / 2) + quest bonuses completed. Leaderboard per hero.

### Difficulty Settings
- **Dusk** (Easy): Night 3 deck (5 cards/wave). Need only 2 locations standing. No Demon Surge.
- **Midnight** (Normal): Night 4 deck (6 cards/wave). Need 3 locations standing. 1 Demon Surge.
- **New Moon** (Hard): Night 6 deck (8 cards/wave). Need all 4 locations standing. 1 Demon Surge. Mind Demon in wave 3.

---

## 8. CAMPAIGN MODE -- 10 Chapters

### Chapter Structure

Each chapter = 1 Day + 1 Night unless noted. The campaign represents 10 nights of escalating warfare.

| Ch | Title | Special Rules |
|---|---|---|
| 1 | **The First Night** | Tutorial. Only Wood Demons. 2 waves. Start with 1 free Stone ward at Cutter's Hollow + 1 free Fire ward at Miln. |
| 2 | **The Swarm** | Flame Demons join. Wave 3 has double spawns. First Demon Surge. |
| 3 | **The Storm** | Wind + Water Demons join. Lakton gets +2 demon cards targeting it. |
| 4 | **The Desert** | Rock Demons debut. Desert Spear quest unlocks. |
| 5 | **The Ruins** | Anoch Sun quest available. 2 Day phases before the Night. |
| 6 | **The Breach** | Choose 1 location to start Fallen (begins Horde timer). Mind Demon appears but flees after wave 1. |
| 7 | **The Mind** | First full Mind Demon + Consort fight. Kill reward: Ancient Ward. |
| 8 | **The War** | 2 Mind Demons. All locations lose 1 Pop before night. +2 bonus Ward Activations per wave (on top of location-based count). |
| 9 | **The Sacrifice** | You must permanently destroy 1 location (removed from game). 3 locations remain. |
| 10 | **Sharak Ka** | Alagai Ka appears. 3 Day/Night cycles to kill it. All demon types. 4 waves per night. |

### What Carries Over

- Ward layouts at all locations.
- Hero level and abilities.
- Resources (half, rounded down).
- Population (as-is -- damage is permanent unless healed).
- Fallen locations remain Fallen unless reclaimed. **Horde timers carry over.**
- Hero HP carries over (heals 2 HP at dawn if below max).

### Catch-Up Mechanics

1. **Demon Magnet:** Fallen locations draw demons away from living ones (see Section 3). But beware the Horde timer.
2. **Desperation Supplies:** If 2+ locations are at Population 1, you gain +1 AP next day.
3. **Survivor's Will:** After losing a location in campaign, your hero gains +1 to their Wave Ability for the rest of that night (Arlen deals +1 damage, Jardir warriors fight +1, etc.).

### Anti-Death-Spiral Design (V3)

The V3 Fallen location rules create a DECISION, not a death spiral:
- Short-term: Fallen locations absorb demons (Demon Magnet = breathing room).
- Medium-term: Those demons grow stronger (+1 str/night).
- Long-term: After 3 nights, Horde attacks a neighbor.

**The player's choice:** Reclaim the location (expensive: 2 AP + 2 Food) before the Horde forms, OR let the Horde form and deal with the attack using wards/abilities. Neither option is free, but both are survivable. The game never locks you into an unwinnable state -- it just raises the pressure.

Additionally:
- Food is never single-sourced (Hollow and Miln produce Food on alternating turns).
- Desperation Supplies give you extra AP when things are dire.
- Survivor's Will buffs your hero after a loss.
- Hero incapacitation is temporary (recover at dawn).

### Hero Progression

After each chapter, gain 1 **Skill Point**. Spend on:
- +2 max HP.
- +1 AP per day (costs 2 points, can only buy once).
- +1 Ward Activation per wave (costs 2 points, can only buy once; added on top of location-based count).
- Unlock **Advanced Ability** (each hero has 2; available at chapters 5+ and 8+).

**Advanced Abilities:**

| Hero | Ability 1 (Ch 5+) | Ability 2 (Ch 8+) |
|---|---|---|
| Arlen | **Unity:** Ward Charge persists between nights. Starts at previous night's ending charge (still minimum 1). | **Demon Form:** At 5 charge, instead of Mist Walk, kill ALL demons at Presence location. Resets charge to 0. |
| Jardir | **Spear of Kaji:** Warriors deal double damage to boss demons. | **Warlord:** Deploy costs 0 AP (free action, once per day). |
| Rojer | **Waning Song:** New song -- all demons at target location(s) permanently lose 1 strength (minimum 1). | **Crescendo:** Songs affect ALL locations, not just Presence + 1 adjacent. (Dissipation still only Presence.) |
| Leesha | **Hora Craft:** Craft wards using 0 resources (once per day). | **Master Alchemist:** Consumables can target 2 locations instead of 1. |

### Story Beats

Between chapters, brief narrative passages (2-3 screens):
- Ch 1-3: Discovery -- Demons are getting smarter. Wards are failing.
- Ch 4-6: The Old World -- Anoch Sun reveals humanity once fought back.
- Ch 7-9: The War -- Mind Demons coordinate. Cities fall. Choose what to save.
- Ch 10: Sharak Ka -- The final battle for humanity.

---

## 9. RESOURCE ECONOMY

### The 3 Resources

| Resource | Primary Source | Secondary Source | Used For |
|---|---|---|---|
| **Wood** | Cutter's Hollow | -- | Fire wards, Stone wards, Firespit |
| **Ink** | Desert Spear, Miln | -- | Wind wards, Light wards, Forbiddance, Ward Catalyst |
| **Food** | Lakton (every dawn) | Cutter's Hollow (odd turns), Miln (even turns) | Healing Potions, Reclaiming locations, Quests |

### Economy Math (Quick Mode, V3)

- Start: 3 of each (9 total).
- Dawn production: 5 resources (Wood from Hollow, Ink from Desert Spear, Ink from Miln, Food from Lakton, Food from Hollow on turn 1).
- 5 AP. Each Gather gives 2 resources. Each ward costs 2 resources.
- 2 pre-placed wards (Fire at Hollow, Wind at Miln) = head start.
- With 5 AP: Craft 2 wards (4 resources), Fortify 2 wards (0 resources, 2 AP), 1 remaining AP for hero action/quest/gather.
- Starting 9 + dawn 5 = 14 resources. Spend 4 on 2 wards, keep 10 for stockpile/potions/quests.
- Result: 4 wards placed across 4 locations. Well-defended but not impregnable. Night phase decisions still critical.

### Why Resources Matter

Resources are stored at locations. When a location Falls, its stockpile is destroyed. This creates a reason to spread resources across locations -- don't put all your Wood at Cutter's Hollow or you lose everything if it Falls.

The **Reinforce** action (move 1 resource between adjacent locations) exists for this logistics puzzle.

---

## 10. MOBILE UX DESIGN

### Screen Layout

The game is designed for a phone held vertically.

**Day Phase Screen:**
```
+---------------------+
|   THREAT FORECAST    |
|  N:Med W:High E:Low  |
|       S:Med          |
+---------------------+
|                      |
|   [LOCATION CARD]    |
|   Pop: 4  Wards: F+S |
|   Stock: 2W 1I 0F   |
|   <- swipe ->        |
|                      |
+---------------------+
|  AP: *****  Reserves |
|  [Gather] [Craft]    |
|  [Fortify] [Quest]   |
|  [Hero] [Reinforce]  |
+---------------------+
```

Swipe left/right between the 4 location cards. Tap an action, tap a location. Done.

**Night Phase Screen:**
```
+---------------------+
|  WAVE 2 - MIDNIGHT   |
|  SURGE: Blood Moon   |
+---------------------+
|  N: Dx2 (str 2,4)   |
|  W: Dx1 (str 1x3)   |
|  E: Dx1 (str 3) [L] |
|  S: Dx2 (str 1,1)   |
+---------------------+
|  ACTIVATIONS: ****   |
|  Tap a location to   |
|  activate its ward   |
+---------------------+
|  [Hero Ability]      |
|  Presence: NORTH v   |
+---------------------+
```

[L] = location-locked demon (cannot be redirected). All 4 locations visible at once during night. Tap to activate. No scrolling, no complexity. The entire game state fits on one phone screen. Demon Surge banner at top keeps the night's special rule visible.

---

## 11. WHY THIS GAME IS NOW SPECIAL

### Every Action Matters
5 AP, 4 locations, 2 ward slots each. There is no wasted action. Every Gather, every Craft, every Fortify shapes the coming night. The pre-placed wards in Quick Mode give you a foundation, but the 2 wards you ADD define your strategy.

### Night Has REAL Decisions Every Wave
Ward Activations scale with your ward spread (1 per warded location). The Swarm rule punishes mindless clustering. Demon Surges change the rules every night. Location-locked demons force you to defend where they spawn. You are always triaging, always adapting, never on autopilot.

### Kill Zone Is Viable But Not Dominant
You CAN stack 2 wards at one location and herd some demons there -- and it will work for that location. But:
- Fewer warded locations = fewer activations (you lose tools).
- Swarm rule punishes 3+ demons at one spot.
- Location-locked demons ignore your herding.
- Boss demons can't be redirected.
The optimal play uses one strong defensive position AND distributed wards. No single strategy dominates.

### Heroes Are Truly Different AND Viable Solo
- **Arlen** plays an aggressive game: starts at charge 1, gains charge from taking hits, hunts kills, teleports to crises. His temporary wards + combos make him the most flexible.
- **Jardir** plays a deployment game: spreading warriors to auto-kill weak demons (preventing Swarm buildup), protecting them with Presence, sacrificing them in emergencies.
- **Rojer** plays a planning game: composing songs during the day, surgically moving 1-2 demons per location (not board-wiping), using Dissipation as precision removal.
- **Leesha** plays a preparation game: 6 AP builds the ward network fastest (more wards = more activations), consumables as bonus actions every wave, Hora Craft keeps the Ink flowing.

### Campaign Has No Death Spirals
- Food is multi-sourced (Lakton + Hollow + Miln).
- Fallen locations are dangerous, not permanent dumps.
- Catch-up mechanics (Demon Magnet, Desperation Supplies, Survivor's Will) give you tools when behind.
- The Horde timer creates urgency to reclaim, but the timeline (3 nights) gives you space to plan.

### The Ward Network Still Matters
With 2 slots per location and 10 combos, the positional grammar is preserved but simplified. You make 4 combo decisions (one per location) instead of 7. Each matters more because each location is more important. Temporary wards add a 5th combo possibility each night for additional depth.

### The "One More Night" Feeling
You always see a path forward. "If I activate the Magma Ward at Desert Spear to kill the Rock Demon, I can use my other activations on Wind at Lakton to redirect the unlocked demons to Cutter's Hollow where the Fire ward passive will weaken them -- but that Water Demon is locked at Lakton so I need to save an activation for Bulwark there..." That chain of reasoning -- seeing the network work under constraints -- is the heart of the game.

---

## APPENDIX A: TURN STRUCTURE SUMMARY

```
=== DAY PHASE ===
1. Dawn: Each location produces its primary resource.
   Food production: Lakton always. Hollow on odd turns. Miln on even turns.
2. Threat Forecast revealed (Low/Med/High/Extreme per location).
3. Hero gets 5 AP (6 for Leesha). Move Presence for free (optional).
4. Spend AP on actions targeting any location, in any order.

=== NIGHT PHASE ===
1. Draw 1 Demon Surge event. Applies all night.
2. Free Presence move (optional). Must be used BEFORE any wave (not during).
   Arlen's Mist Walk is the exception: it can move Presence BETWEEN waves.
3. WAVE 1 (Early Night):
   a. Draw demon cards. Reveal all. Place at target locations.
   b. Swarm check: locations with 3+ demons = each demon gains +1 str.
   c. Choose Ward Activations (1 per warded location, min 1).
   d. Resolve: passives -> actives -> demon damage -> hero wave ability.
   e. Overflow damage to hero if at Presence location.
   f. Check for Fallen locations.
4. WAVE 2 (Midnight): Repeat steps 3a-3f.
5. WAVE 3 (Pre-Dawn): Repeat steps 3a-3f.
6. Night ends. All surviving demons removed (except at Fallen locations).
7. Fallen location upkeep: demons there gain +1 str. Check Horde timer.
8. Proceed to next Day Phase.
```

## APPENDIX B: QUICK REFERENCE -- WARD COMBOS

```
Each location: 2 permanent slots + 1 temp slot -> 1 combo pair (+ temp combo option)
Activations per wave = number of warded locations (min 1)

FIRE + STONE  = Magma       (passive: +1 fire dmg | active: 4 dmg + 3 def)
FIRE + WIND   = Inferno     (passive: redirect dmg | active: 2 dmg all here + adjacent)
FIRE + LIGHT  = Sunward     (passive: auto-kill str 1 wave 1 | active: kill all str <=2)
FIRE + BONE   = Cauterize   (passive: heal 2 if kill | active: heal 2 + 2 dmg all)
STONE + WIND  = Fortress    (passive: +3 def | active: immune + absorb from neighbors)
STONE + LIGHT = Sentinel    (passive: reveal adjacent | active: 2 locations immune)
STONE + BONE  = Haven       (passive: +1 max pop | active: heal 2 + 2 def)
WIND + LIGHT  = Storm       (passive: preview next wave | active: rearrange 3 demons)
WIND + BONE   = Renewal     (passive: heal on redirect | active: heal 1 all locations)
LIGHT + BONE  = Consecration (passive: hero heals | active: cancel 1 demon card)

Redirection limits: Cannot redirect boss demons or location-locked demons.
Swarm rule: 3+ demons at one location = each gains +1 str.
```

## APPENDIX C: HERO SELECTION GUIDE

```
ARLEN    - "I want to hunt demons and power up from getting hit."
           Starts charge 1. Warded Fist deals damage = charge (scales!).
           Gains charge from kills AND damage taken.
           Temporary wards create combos. Teleports at charge 5.

JARDIR   - "I want to command an army across the map."
           Warrior deployment. Multi-location auto-defense.
           Warriors prevent Swarm buildup. Sacrifice plays for bosses.

ROJER    - "I want to plan the perfect night."
           Day: compose songs. Night: surgically move demons.
           Dissipation removes 2 weak demons. Frenzy for crowd control.

LEESHA   - "I want to be ready for everything."
           6 AP + consumables + Hora Craft. More wards = more activations.
           Consumable items as bonus actions every wave.
```

## APPENDIX D: QUICK MODE DECISION MAP

```
A typical Quick Mode game (Midnight difficulty, V3):

SETUP:
  Pre-placed: Fire at Cutter's Hollow, Wind at Miln.
  Starting resources: 3W + 3I + 3F distributed as you choose.
  Choose hero. Place Presence.

DAY (5 AP, ~10 min):
  Decision 1: Where to place Presence?
  Decision 2: Craft which ward type? (Stone for defense? Light for intel?)
  Decision 3: Fortify which location? (Desert Spear or Lakton?)
  Decision 4: Craft second ward.
  Decision 5: Fortify second location. Or hero action/quest?
  Bonus: Resource distribution, which combos to set up?

NIGHT (3 waves, ~15 min):
  Demon Surge drawn -- adapt plan!

  Wave 1 (6 demons):
    Decision 6-9: Which 4 ward activations? (Individual or combo?)
    Decision 10: Hero wave ability target?
  Wave 2 (6 demons):
    Decision 11-14: Which 4 ward activations?
    Decision 15: Hero wave ability target?
    Decision 16: Move Presence?
  Wave 3 (6 demons):
    Decision 17-20: Which 4 ward activations?
    Decision 21: Hero wave ability target?

Total: 21+ meaningful decisions in ~25 minutes.
Every wave has 4+ choices. No autopilot.
```

## APPENDIX E: SWARM RULE EXAMPLES

```
EXAMPLE 1: Moderate clustering (OK)
  Cutter's Hollow has Fire+Stone (Magma Ward).
  2 demons redirected here + 1 natural spawn = 3 demons.
  Swarm triggers: each gains +1 str.
  2 Wood Demons (str 2+1=3) + 1 Flame Demon (str 1+1=2) = 8 total str.
  Magma passive deals 2 dmg to each = kills Flame, weakens Woods to 1 each.
  Eruption activation: 4 dmg to strongest Wood (kills it) + 3 def.
  Remaining: 1 Wood at str 1 vs 3 defense. 0 damage through. SAFE.

EXAMPLE 2: Over-clustering (PUNISHED)
  Same location, but 5 demons herded here.
  Swarm: each gains +1 str.
  2 Wood (3 each) + 2 Flame (2 each) + 1 Rock (5) = 15 total str.
  Magma passive: 2 dmg each = kills nothing (Flames at 2-2=0, ok kills those).
  Still: 2 Wood (1 each) + Rock (3) = 5 str vs 3 def = 2 damage through.
  AND you used your activation here, leaving 3 other locations undefended.
  Much worse than spreading those demons across warded locations.

EXAMPLE 3: Location-locked demon
  Water Demon (str 3, locked) spawns at Lakton.
  You cannot redirect it. You MUST have defense at Lakton.
  If Lakton is undefended: 3 damage to Population.
  This is why spreading wards matters.
```

## APPENDIX F: DEMON SURGE REFERENCE

```
DEMON SURGE EVENTS (draw 1 per night):

Blood Moon      - All demons +1 str this night.
Rising Tide     - Wave 1 demons spawn at Presence location.
Warding Blight  - Ward passives disabled (actives still work).
Swarming Dark   - +2 demon cards per wave. (Campaign only.)
Demon Frenzy    - Fallen location demons attack adjacent immediately. (Campaign only.)
Coreling Prince - 1 random demon per wave upgraded +2 str. (Campaign only.)
Mist Shroud     - 2 demon cards per wave swap target locations.
Night of Courage- No effect. (Lucky break.)

Quick Mode deck: 6 surges (excludes Swarming Dark and Demon Frenzy).
Campaign deck: All 8 surges.
```

---

*"There is nothing to fear in the night -- if you know which wards to activate, and where the swarm will break."*
