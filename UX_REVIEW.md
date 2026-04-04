# UX Review: The Warded Man -- Mobile Game UI

**Reviewer:** UX Ergonomist -- Mobile Games Specialist
**Date:** 2026-03-29
**Files reviewed:** warded.tsx, WorldMap.tsx, LocationDetail.tsx, theme-warded.ts, useWardedGame.ts
**Reference:** WARDED_MAN_V3.md (game rules)

---

## TOP 10 RECOMMENDATIONS (ordered by impact)

---

### 1. NO ONBOARDING -- The player is dropped into a game with zero guidance

**Problem:** The game starts immediately (`ctrl.startGame('arlen', 'midnight')`) with no tutorial, no explanation of what AP means, what wards do, what the threat forecast colors mean, or what the player should do first. The rules document is ~900 lines. Nothing from it is surfaced in the UI.

**Why it hurts:** A solo strategy game lives or dies by whether the player understands the system within the first 60 seconds. Right now, the first screen shows a diamond map, some colored chips, a ward crafting row with alchemical symbols (`🜂`, `⬡`, `🜁`, `✦`, `☽`), and a label "Crafter un Ward (1 AP)." A new player has no idea what any of this means. They will tap randomly, waste their 5 AP, and lose on the first night.

**Fix:** Add a contextual coach overlay for the first game. Not a wall of text -- three sequential steps:

- **Step 1 (on first render):** Dim everything except the threat forecast row at the bottom. Show a tooltip: "These colors show where demons will attack tonight. RED = heavy attack. Tap a location to prepare its defenses."
- **Step 2 (on first location tap):** Highlight the ward slots in the LocationDetail. Show: "Each location has 2 ward slots. Place wards here during the day to fight demons at night. Start by tapping Gather to collect resources."
- **Step 3 (after first Gather):** Highlight the craft row. Show: "Now craft a ward from your resources and place it before nightfall."

Implementation: Add a `tutorialStep: number` state to `WardedGameScreen`. Render a `<TutorialOverlay step={tutorialStep} />` component that uses `position: 'absolute'` with a semi-transparent black background and a cutout (using `pointerEvents: 'box-none'`) over the target area. Advance the step on the relevant action callback.

---

### 2. THE MAP IS UNREADABLE AT NIGHT -- No demon info visible without tapping each location

**Problem:** During night phase, the most critical information is: where are the demons, how strong are they, and which wards will fight them. The map shows a tiny red badge with `{demonCount}x{totalStr}` in **8px font** on a 20px badge. The ward dots are 18px circles with 10px symbols. On a phone screen, you cannot tell which ward type is placed where, and the demon badge is nearly invisible.

**Why it hurts:** Night phase is the core tension of the game -- you need to make quick decisions about which location to activate wards at. But you have to tap each location individually to see what is happening, losing the strategic overview. The rules explicitly state "you see all 4 at once" as a design goal.

**Fix:** During night phase, expand each location node from 80px width to ~100px. Replace the tiny demon badge with an inline demon row below the ward row, showing colored demon icons (`🔥🌿💨`) at 14px. Increase the ward dot size from 18px to 24px. Show the total demon strength as a prominent number.

Concrete style changes in `WorldMap.tsx`:
```tsx
locationNode: {
  width: isNight ? 100 : 80,  // pass isNight to node styles
  ...
},
wardDot: {
  width: isNight ? 24 : 18,
  height: isNight ? 24 : 18,
  ...
},
// Add inline demon display (not just a badge):
demonRow: {
  flexDirection: 'row',
  gap: 2,
  justifyContent: 'center',
  marginTop: 2,
},
demonInlineIcon: {
  fontSize: 12,
},
```

Replace the `demonBadge` (positioned absolute at top-right, easy to miss) with a row of demon type icons rendered inline within the location node, directly below the ward row. This lets the player see at a glance: "North has fire+wind demons, my stone ward won't help there."

---

### 3. NO PHASE TRANSITION FEEDBACK -- Day becomes night without ceremony

**Problem:** Pressing "Tomber de la nuit" instantly changes the phase text from "JOUR" to "NUIT" and swaps the action bar. There is no visual transition, no sound cue, no moment of tension. The background color does not even change (both phases use the same `warded.bg: '#0a0a0f'`).

**Why it hurts:** The day-to-night transition is THE dramatic moment of the game. The rules describe it as the core loop: "Day = build. Night = fight." If the transition feels the same as clicking any other button, the emotional arc of the game is flat.

**Fix:**

1. **Change the background color by phase.** The theme already defines `dayBg: '#1a1812'` and `nightBg: '#080810'` but they are NEVER USED. Apply them:
```tsx
container: { flex: 1, backgroundColor: isDay ? warded.dayBg : warded.nightBg }
```
This alone makes the phase immediately visually distinct.

2. **Add a transition interstitial.** When `endDay()` is called, before showing the night UI, render a full-screen overlay for 1.5 seconds:
```tsx
{showTransition && (
  <View style={styles.transitionOverlay}>
    <Text style={styles.transitionEmoji}>🌙</Text>
    <Text style={styles.transitionText}>LA NUIT TOMBE</Text>
    <Text style={styles.transitionSub}>Les demons surgissent de la terre...</Text>
  </View>
)}
```
Use `Animated.Value` to fade the background from `dayBg` to `nightBg` over 800ms. This gives the player a moment to brace for the night phase.

---

### 4. WARD CRAFT BUTTONS SHOW SYMBOLS WITH NO EXPLANATION

**Problem:** The ward craft row shows 5 buttons: `🜂`, `⬡`, `🜁`, `✦`, `☽` with labels "fire", "stone", "wind", "light", "bone" in 8px uppercase text. There is zero indication of what each ward DOES. The alchemical symbols `🜂` and `🜁` are not widely recognized and will not render on all Android devices.

**Why it hurts:** Ward selection is the most important strategic decision in the game. The player needs to know: "fire ward deals 2 damage to one demon, stone ward reduces damage by 1 for the night, wind ward redirects a demon." Without this, ward choice is random.

**Fix:** Replace the compact icon-only buttons with a taller card layout that includes one line of effect text. Change `wardCraftBtn` from `padding: 8` to `paddingVertical: 12, paddingHorizontal: 6`:

```tsx
<TouchableOpacity key={w} style={[styles.wardCraftBtn, ...]}>
  <Text style={styles.wardCraftIcon}>{WARD_SYMBOLS[w]}</Text>
  <Text style={styles.wardCraftName}>{w}</Text>
  <Text style={styles.wardCraftEffect}>{WARD_EFFECTS[w]}</Text>
  <Text style={styles.wardCraftCost}>{cost.wood}W {cost.ink}I</Text>
</TouchableOpacity>
```

Add a `WARD_EFFECTS` constant:
```ts
const WARD_EFFECTS: Record<string, string> = {
  fire: '2 dmg',
  stone: '-1 dmg',
  wind: 'redirect',
  light: '+1 pop',
  bone: 'block 1',
};
```

Also add the resource cost directly on each button (currently the player has no idea what a ward costs without reading the rules). The `wardCraftEffect` style should be `fontSize: 7, color: warded.textDim`.

---

### 5. THREAT FORECAST IS BURIED AT THE BOTTOM OF THE SCREEN

**Problem:** The threat forecast (the most important planning information during the day) is rendered BELOW the event log, at the very bottom of the screen, in 8px text (`forecastLoc`) with the threat level in `wardedFonts.xs` (9px). On a phone, this is below the fold if the action bar has ward crafting options visible.

**Why it hurts:** The rules say "At the start of each day, you see a Threat Forecast." The player should see it FIRST, not last. It should drive their entire day strategy. Burying it at the bottom means most players will never notice it exists.

**Fix:** Move the forecast row to render directly below the map, ABOVE the location detail / action bar. Integrate it visually with the map by placing threat indicators near or inside each location node.

Even better: render the threat level as a colored glow or border on each map location node directly. In `WorldMap.tsx`, pass the forecast as a prop and apply it:

```tsx
// In the location node style:
{
  borderColor: forecast?.[loc.id] === 'high' ? warded.danger
    : forecast?.[loc.id] === 'medium' ? warded.warning
    : warded.border,
  // Add a pulsing animation for 'extreme':
  ...(forecast?.[loc.id] === 'extreme' && {
    shadowColor: '#ff0000', shadowOpacity: 0.6, shadowRadius: 12
  }),
}
```

This eliminates the need for a separate forecast row entirely -- the information is on the map where the player is already looking.

---

### 6. NIGHT PHASE FLOW IS A CONFUSING STATE MACHINE

**Problem:** During night, the action bar changes based on a complex combination of `waveNumber`, `activationsRemaining`, `heroWaveAbilityUsed`, and `hero.id`. The player sees different buttons appear and disappear without understanding the sequence. Lines 208-253 of `warded.tsx` have 5 different conditional blocks for night actions, each with different visibility rules.

**Why it hurts:** The night phase has a clear sequence (Position Presence -> Start Wave -> Activate Wards -> Resolve Damage -> repeat). But the UI does not communicate this sequence. The player does not know how many steps are left, what comes next, or why a button appeared/disappeared.

**Fix:** Add a night phase progress indicator -- a simple step tracker at the top of the action bar:

```tsx
{isNight && (
  <View style={styles.nightSteps}>
    <StepDot label="Position" active={state.waveNumber === 0} done={state.waveNumber > 0} />
    <StepDot label={`Vague ${Math.max(state.waveNumber, 1)}`} active={state.waveNumber > 0 && state.activationsRemaining > 0} done={state.activationsRemaining === 0 && state.waveNumber > 0} />
    <StepDot label="Degats" active={state.activationsRemaining === 0 && state.waveNumber > 0} done={false} />
  </View>
)}
```

Where `StepDot` is a small component: a circle with a label below, filled gold when active, dimmed when done/pending. This gives the player a mental model of "where am I in the night sequence."

---

### 7. CLOSE BUTTON ON LOCATION DETAIL IS A TINY "X" -- EASY TO MISS, HARD TO TAP

**Problem:** The LocationDetail close button is a `✕` character in `wardedFonts.xl` (22px) with only `padding: 4`. The total touch target is roughly 30x30px. Apple HIG recommends 44x44px minimum. The button is in the top-right corner -- the hardest place to reach with a right thumb on a large phone.

**Why it hurts:** Players will constantly open location details (it is the primary interaction). If closing is frustrating, the entire flow feels sticky. Players may also not realize they CAN close it, since the "X" is subtle dim text.

**Fix:**

1. Make the close button a proper touch target:
```tsx
closeBtn: {
  color: warded.textDim,
  fontSize: wardedFonts.xl,
  padding: 12,         // was 4
  marginRight: -12,    // compensate padding for visual alignment
  marginTop: -12,
},
```

2. Allow closing the detail by tapping outside it (on the map or empty space). Add to `warded.tsx`:
```tsx
{selectedLoc && (
  <TouchableOpacity
    style={StyleSheet.absoluteFill}
    activeOpacity={1}
    onPress={() => setSelectedLocation(null)}
  >
    <View style={{flex: 1}} />
  </TouchableOpacity>
)}
```

3. Consider replacing the X with a visible "Fermer" pill button or a downward swipe gesture.

---

### 8. ACTION BUTTONS LACK CLEAR AFFORDANCE -- "CAN I DO THIS?" IS UNCLEAR

**Problem:** Disabled buttons use `opacity: 0.3` (`btnDisabled` style) but there is no explanation of WHY a button is disabled. If the player cannot craft a fire ward, they see a dim button but do not know if it is because they lack wood, lack ink, lack AP, or something else. The `canGather` / `canFortify` / `canActivate` booleans are computed silently.

**Why it hurts:** In a strategy game, understanding your constraints is as important as understanding your options. A player who does not know WHY they cannot craft will not know what to do to ENABLE that craft. This creates learned helplessness.

**Fix:** Add a cost label to each craft button showing the resource requirement, and change the disabled state to show which resource is missing in red:

```tsx
<TouchableOpacity key={w} style={[styles.wardCraftBtn, !canAfford && styles.btnDisabled, ...]}>
  <Text style={styles.wardCraftIcon}>{WARD_SYMBOLS[w]}</Text>
  <Text style={styles.wardCraftName}>{w}</Text>
  <View style={styles.costRow}>
    <Text style={{color: hasEnoughWood ? warded.wood : warded.danger, fontSize: 8}}>
      {cost.wood}W
    </Text>
    <Text style={{color: hasEnoughInk ? warded.ink : warded.danger, fontSize: 8}}>
      {cost.ink}I
    </Text>
  </View>
</TouchableOpacity>
```

Where `hasEnoughWood` and `hasEnoughInk` are computed per-location. The red color on the missing resource immediately tells the player: "I need 2 more ink. I should Gather at Desert Spear."

---

### 9. EVENT LOG IS PASSIVE AND EPHEMERAL -- CRITICAL COMBAT RESULTS ARE EASILY MISSED

**Problem:** The event log shows the last 3 events in small dim text (`wardedFonts.xs` = 9px) at the bottom of the screen. During night phase, ward activations and damage resolution produce multiple events rapidly (especially with the `setTimeout(() => { ... }, 2000)` auto-advance on line 243). The player cannot read "Stone ward blocks 1 damage at Desert Spear" before it scrolls away.

**Why it hurts:** The player invests strategic thought into ward placement during the day. At night, they need to SEE their wards working. If the results flash by in 9px text, the feedback loop is broken. The player cannot learn from their decisions.

**Fix:**

1. Replace the bottom event log with a centered "combat toast" for important events. When a ward activates or damage is dealt, show a 2-second overlay:
```tsx
{activeToast && (
  <View style={styles.combatToast}>
    <Text style={styles.toastIcon}>{activeToast.icon}</Text>
    <Text style={styles.toastText}>{activeToast.message}</Text>
  </View>
)}
```
Style: centered horizontally, positioned at ~40% from top, `backgroundColor: warded.bgCard + 'ee'`, `borderRadius: 12`, `padding: 16`, `fontSize: wardedFonts.md`. Animate with a quick fade-in, hold, fade-out.

2. Remove the `setTimeout` auto-advance on line 243. Let the player read the results and tap "Next Wave" or "End Night" manually. Automatic progression in a strategy game removes player agency and causes confusion.

---

### 10. THE "RESERVES" SYSTEM HAS NO VISUAL REPRESENTATION

**Problem:** When the player crafts a ward, it goes into "reserves" -- an abstract inventory. The only indication is an italic text line: "Reserves: 🜂 fire, ⬡ stone -- Selectionne un lieu pour placer" in `wardedFonts.xs` (9px). There is no visual container, no count indicator in the header, and no clear call-to-action for what to do next.

**Why it hurts:** The craft-then-place two-step flow is central to the day phase strategy. But the reserves text is easy to miss, and a new player who crafts a ward may think the action is complete (ward is crafted, done). They will not realize they need to ALSO tap a location and place it, burning another AP. This is a 2-AP investment that looks like a 1-AP investment.

**Fix:** Add a persistent reserves tray between the map and the action bar. Show each reserved ward as a draggable/tappable chip with a colored border:

```tsx
{state.wardReserves.length > 0 && (
  <View style={styles.reserveTray}>
    <Text style={styles.reserveLabel}>RESERVES ({state.wardReserves.length}/3)</Text>
    <View style={styles.reserveChips}>
      {state.wardReserves.map((w, i) => (
        <View key={i} style={[styles.reserveChip, {borderColor: wardColor(w)}]}>
          <Text style={{color: wardColor(w), fontSize: 16}}>{WARD_SYMBOLS[w]}</Text>
          <Text style={{color: wardColor(w), fontSize: 9}}>{w}</Text>
        </View>
      ))}
    </View>
    <Text style={styles.reserveHint}>Tap a location to place</Text>
  </View>
)}
```

Style the tray with `backgroundColor: warded.bgCard`, `borderWidth: 1`, `borderColor: warded.accent`, `borderRadius: 10`, `padding: 8`, placed directly below the map. The gold border and persistent visibility make it impossible to miss. Add a pulsing animation on the reserve chips when AP > 0 to draw the eye.

---

## SUMMARY

The game engine and rules design are solid. The core problems are all on the presentation layer:

| Category | Severity | Issues |
|---|---|---|
| First-time experience | CRITICAL | No onboarding, no ward explanations, no cost visibility |
| Information hierarchy | HIGH | Forecast buried, map too small at night, reserves invisible |
| Flow clarity | HIGH | Night phase state machine is opaque, no step indicator |
| Feedback | HIGH | Events in 9px text, auto-advance removes agency, no phase transition |
| Touch targets | MEDIUM | Close button too small, ward craft buttons tight |

The single highest-impact change would be **integrating the threat forecast into the map nodes** (recommendation 5) combined with **adding ward effect descriptions to craft buttons** (recommendation 4). Together, these two changes would let a new player understand the core loop -- "see threat, pick ward that counters it, place it" -- without reading any documentation.
