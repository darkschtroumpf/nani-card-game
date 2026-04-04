# UX Review Iteration 2: The Warded Man -- Mobile Game UI

**Reviewer:** UX Ergonomist -- Mobile Games Specialist
**Date:** 2026-03-29
**Scope:** Issues 6-10 from UX_REVIEW.md + new issues discovered in updated code
**Files reviewed:** warded.tsx, WorldMap.tsx, LocationDetail.tsx, theme-warded.ts

---

## Context: What was fixed in iteration 1

1. Phase transition (night overlay + background color change) -- DONE
2. Map readability at night (inline demons, bigger ward dots, node expansion) -- DONE
3. Threat forecast integrated into map node borders -- DONE
4. Ward effect descriptions + cost labels on craft buttons -- DONE
5. Night phase step indicator (Position / Vague / Activation / Degats) -- DONE

---

## TOP 5 FIXES FOR ITERATION 2 (ordered by impact)

---

### FIX 1. CLOSE BUTTON TOO SMALL + NO DISMISS-BY-BACKDROP (original #7)

**Problem:** The `closeBtn` style in `LocationDetail.tsx` (line 190-193) is `fontSize: wardedFonts.xl` (22px) with `padding: 4`. Total touch target is approximately 30x30px. Apple HIG minimum is 44x44px, Android Material minimum is 48x48dp. Worse: there is NO way to close the detail panel by tapping outside it -- the only way is to hit this tiny X.

**Why it matters now:** With the night nodes expanded to 100px and demon info inline, the player taps locations MORE often. Every open-then-close cycle hits this undersized target. It is the single most-repeated interaction in the game.

**Fix -- LocationDetail.tsx:**

Change `closeBtn` style (line 190-193):
```tsx
closeBtn: {
  color: warded.textDim,
  fontSize: 18,
  fontWeight: 'bold',
  backgroundColor: warded.bgLight,
  borderRadius: 20,
  width: 40,
  height: 40,
  textAlign: 'center',
  lineHeight: 40,
  overflow: 'hidden',
},
```

This creates a visible circular button with a 40px touch target. The `backgroundColor` makes it look tappable instead of floating text.

**Fix -- warded.tsx (dismiss-by-backdrop):**

Wrap the `detailScroll` block (lines 163-184) with a backdrop press handler. Replace:
```tsx
{selectedLoc && (
  <ScrollView style={styles.detailScroll}>
    <LocationDetail ... />
  </ScrollView>
)}
```

With:
```tsx
{selectedLoc && (
  <View style={styles.detailOverlay}>
    <TouchableOpacity
      style={styles.detailBackdrop}
      activeOpacity={1}
      onPress={() => setSelectedLocation(null)}
    />
    <ScrollView style={styles.detailScroll}>
      <LocationDetail ... />
    </ScrollView>
  </View>
)}
```

Add styles:
```tsx
detailOverlay: {
  flex: 1,
},
detailBackdrop: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
},
```

This allows closing the panel by tapping anywhere outside it -- standard mobile pattern.

---

### FIX 2. DISABLED BUTTONS GIVE NO EXPLANATION (original #8)

**Problem:** In `warded.tsx` lines 227-229, disabled ward craft buttons use `!canAfford && styles.btnDisabled` which applies `opacity: 0.3`. The player sees a dimmed button but gets zero information about WHY it is disabled. The same issue exists in LocationDetail.tsx: when `canGather` is false (0 AP), the entire Gather button simply disappears instead of being disabled with an explanation. When `canFortify` is false, the fortify buttons disappear. The player has no idea what conditions they need to meet.

**Why it matters now:** With ward effects and costs now visible on craft buttons (iteration 1 fix), the player CAN see "2 Bois 1 Encre" -- but when the button is at 0.3 opacity, the cost text is nearly invisible (0.3 * already-dim-text = unreadable). The player who needs guidance the most gets the least information.

**Fix -- warded.tsx, ward craft buttons (around line 221-243):**

Replace the `canAfford` boolean with per-resource checks. Change the button rendering:
```tsx
{WARD_TYPES.map(w => {
  const cost = WARD_COSTS[w];
  const bestLoc = state.locations.find(l => !l.fallen &&
    l.stockpile.wood >= cost.wood && l.stockpile.ink >= cost.ink);
  const canAfford = !!bestLoc;

  // Compute which specific resource is lacking (across all locations)
  const maxWood = Math.max(...state.locations.filter(l => !l.fallen).map(l => l.stockpile.wood));
  const maxInk = Math.max(...state.locations.filter(l => !l.fallen).map(l => l.stockpile.ink));
  const needsWood = cost.wood > 0 && maxWood < cost.wood;
  const needsInk = cost.ink > 0 && maxInk < cost.ink;

  return (
    <TouchableOpacity
      key={w}
      style={[styles.wardCraftBtn, !canAfford && styles.btnDisabledExplained, { borderColor: wardColor(w) }]}
      disabled={!canAfford}
      onPress={() => { if (bestLoc) ctrl.doCraft(w, bestLoc.id); }}
    >
      <Text style={[styles.wardCraftIcon, { color: wardColor(w) }]}>{WARD_SYMBOLS[w]}</Text>
      <Text style={styles.wardCraftName}>{w}</Text>
      <Text style={styles.wardCraftEffect}>{WARD_EFFECTS[w]}</Text>
      <Text style={styles.wardCraftCost}>
        <Text style={{ color: needsWood ? warded.danger : warded.warning }}>
          {cost.wood > 0 ? `${cost.wood} Bois ` : ''}
        </Text>
        <Text style={{ color: needsInk ? warded.danger : warded.warning }}>
          {cost.ink > 0 ? `${cost.ink} Encre` : ''}
        </Text>
      </Text>
      {!canAfford && (
        <Text style={styles.disabledReason}>
          {needsWood && needsInk ? 'Manque Bois + Encre' : needsWood ? 'Manque Bois' : needsInk ? 'Manque Encre' : 'Aucun lieu'}
        </Text>
      )}
    </TouchableOpacity>
  );
})}
```

New styles:
```tsx
btnDisabledExplained: {
  opacity: 0.55,  // was 0.3 -- raised so cost text remains readable
},
disabledReason: {
  color: warded.danger,
  fontSize: 7,
  fontWeight: '600',
  textAlign: 'center',
  marginTop: 2,
},
```

**Fix -- warded.tsx, 0 AP state (around line 217):**

Currently, when `state.hero.ap === 0`, the craft section vanishes entirely (condition: `isDay && state.hero.ap > 0`). The player is left with only the "Tomber de la nuit" button and no explanation. Replace the condition:

Change line 217 from:
```tsx
{isDay && state.hero.ap > 0 && (
```
To:
```tsx
{isDay && (
```

And wrap the content to handle 0 AP:
```tsx
{isDay && (
  <View style={styles.actionSection}>
    {state.hero.ap > 0 ? (
      <>
        <Text style={styles.actionLabel}>Crafter un Ward (1 AP)</Text>
        {/* ... existing ward craft row ... */}
      </>
    ) : (
      <View style={styles.noApBanner}>
        <Text style={styles.noApText}>0 AP restant -- Lance la nuit</Text>
        <Text style={styles.noApHint}>Tu as utilise tes 5 actions. Appuie sur "Tomber de la nuit" pour combattre.</Text>
      </View>
    )}
  </View>
)}
```

New styles:
```tsx
noApBanner: {
  backgroundColor: warded.nightBg,
  borderRadius: 10,
  padding: 12,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: warded.wardLight + '40',
  gap: 4,
},
noApText: {
  color: warded.wardLight,
  fontSize: wardedFonts.md,
  fontWeight: 'bold',
},
noApHint: {
  color: warded.textDim,
  fontSize: wardedFonts.xs,
  textAlign: 'center',
},
```

This transforms the empty void at 0 AP into a clear instruction.

---

### FIX 3. EVENT LOG IS PASSIVE AND EPHEMERAL -- COMBAT RESULTS ARE INVISIBLE (original #9)

**Problem:** The event log (lines 335-343 in warded.tsx) shows the last 3 events in `wardedFonts.xs` (9px) dim text at the very bottom of the screen. During night, the `setTimeout` on line 318 auto-advances after 2 seconds, generating multiple events that flash past faster than anyone can read. Critical information like "Ward de feu inflige 2 degats au demon flamme" appears for ~0.8 seconds in 9px text below the fold.

Additionally, the `setTimeout` on line 318-328 chains `doResolveDamage` into `doStartWave`/`doEndWave` automatically. This removes player agency: the player presses "Resolve damage" and 2 seconds later the next wave starts without their input. In a strategy game, the player should control the pace.

**Fix -- Replace event log with combat toast + remove auto-advance:**

Step 1: Add state for combat toasts in `WardedGameScreen` (near line 46):
```tsx
const [combatToast, setCombatToast] = useState<string | null>(null);
```

Step 2: Add a `useEffect` that watches `events` and shows the latest as a toast:
```tsx
useEffect(() => {
  if (events.length > 0) {
    const latest = events[events.length - 1];
    setCombatToast(latest);
    const timer = setTimeout(() => setCombatToast(null), 2500);
    return () => clearTimeout(timer);
  }
}, [events.length]);
```

Step 3: Render the toast centered on screen, ABOVE the action bar (insert before the `{!selectedLoc && ...}` action bar block):
```tsx
{combatToast && (
  <View style={styles.combatToast}>
    <Text style={styles.combatToastText}>{combatToast}</Text>
  </View>
)}
```

Styles:
```tsx
combatToast: {
  position: 'absolute',
  alignSelf: 'center',
  top: '40%',
  backgroundColor: warded.bgCard + 'ee',
  borderRadius: 12,
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderWidth: 1,
  borderColor: warded.accent + '60',
  maxWidth: '80%',
  zIndex: 50,
},
combatToastText: {
  color: warded.text,
  fontSize: wardedFonts.md,
  fontWeight: '600',
  textAlign: 'center',
},
```

Step 4: Remove the auto-advance `setTimeout` (lines 317-328). Replace the resolve damage button with:
```tsx
{isNight && state.waveNumber > 0 && state.activationsRemaining === 0 && (
  <View style={styles.nightActions}>
    <TouchableOpacity
      style={[styles.phaseBtn, { backgroundColor: warded.danger + '20', borderColor: warded.danger }]}
      onPress={() => ctrl.doResolveDamage()}
    >
      <Text style={styles.phaseBtnText}>Resoudre les degats (Vague {state.waveNumber}/3)</Text>
    </TouchableOpacity>
  </View>
)}
```

Then add a SEPARATE "Vague suivante" / "Fin de la nuit" button that appears AFTER damage is resolved (when the engine transitions to the next wave state). This lets the player read the damage results, inspect the map, and proceed when ready.

Step 5: Keep the old event log as a scrollable history accessible via a small "Historique" toggle button, but remove it from the default view. It clutters the bottom of the screen with redundant information once the toast system is in place.

---

### FIX 4. WARD RESERVES HAVE NO VISUAL CONTAINER (original #10)

**Problem:** Ward reserves are displayed as a single line of italic text (line 249-251 in warded.tsx): `"Reserves: fire, stone -- Selectionne un lieu pour placer"` in `wardedFonts.xs` (9px). This text is sandwiched between the craft row and the "Tomber de la nuit" button. It has no background, no border, no visual weight. On a dark background with dim text, it is nearly invisible.

**Why it matters:** The craft-then-place flow is a 2-step action. After crafting, the player MUST tap a location to place the ward. If they miss the reserves text, they will think crafting is broken (nothing happened) or that the ward was auto-placed somewhere. This is the #1 confusion point for new players based on the game design.

**Fix -- Replace the text line with a visual reserves tray:**

Replace lines 248-251 in warded.tsx:
```tsx
{isDay && state.wardReserves.length > 0 && (
  <Text style={styles.reserveText}>
    Reserves: {state.wardReserves.map(w => `${WARD_SYMBOLS[w]} ${w}`).join(', ')} — Selectionne un lieu pour placer
  </Text>
)}
```

With:
```tsx
{isDay && state.wardReserves.length > 0 && (
  <View style={styles.reserveTray}>
    <View style={styles.reserveHeader}>
      <Text style={styles.reserveLabel}>RESERVES</Text>
      <Text style={styles.reserveCount}>{state.wardReserves.length}</Text>
    </View>
    <View style={styles.reserveChips}>
      {state.wardReserves.map((w, i) => (
        <View key={i} style={[styles.reserveChip, { borderColor: wardColor(w) }]}>
          <Text style={{ color: wardColor(w), fontSize: 18 }}>{WARD_SYMBOLS[w]}</Text>
          <Text style={{ color: wardColor(w), fontSize: 9, fontWeight: '600' }}>{w}</Text>
        </View>
      ))}
    </View>
    <Text style={styles.reserveHint}>Tape un lieu sur la carte pour placer</Text>
  </View>
)}
```

New styles:
```tsx
reserveTray: {
  backgroundColor: warded.bgCard,
  borderRadius: 10,
  padding: 10,
  borderWidth: 1,
  borderColor: warded.accent,
  gap: 6,
  alignItems: 'center',
},
reserveHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
},
reserveLabel: {
  color: warded.accent,
  fontSize: wardedFonts.xs,
  fontWeight: 'bold',
  letterSpacing: 2,
},
reserveCount: {
  color: warded.bg,
  backgroundColor: warded.accent,
  fontSize: wardedFonts.xs,
  fontWeight: 'bold',
  width: 18,
  height: 18,
  borderRadius: 9,
  textAlign: 'center',
  lineHeight: 18,
  overflow: 'hidden',
},
reserveChips: {
  flexDirection: 'row',
  gap: 8,
  justifyContent: 'center',
},
reserveChip: {
  backgroundColor: warded.bgLight,
  borderRadius: 8,
  paddingVertical: 6,
  paddingHorizontal: 12,
  alignItems: 'center',
  borderWidth: 2,
  gap: 2,
},
reserveHint: {
  color: warded.textDim,
  fontSize: wardedFonts.xs,
  fontStyle: 'italic',
},
```

The gold border (`warded.accent`) around the tray creates strong visual prominence. The count badge makes it scannable. The hint text uses an imperative verb ("Tape") instead of the passive "Selectionne" to prompt action.

---

### FIX 5. PRESENCE MOVEMENT DURING NIGHT IS INVISIBLE + ALL-ACTIVATIONS-USED STATE IS AMBIGUOUS (new issue)

**Problem A -- Presence movement:** During night phase wave 0, the text says "Positionne ta Presence, puis lance la vague" (line 288). But there is NO UI for moving the Presence. The player sees the Presence badge on the map (a gold circle with a sword icon at the bottom of the location node) but cannot tell: (a) how to move it, (b) that tapping a location moves it, or (c) whether Presence location even matters. The badge itself (20x20px, positioned at `bottom: -10`) is small and partially clipped by node edges.

**Problem B -- All activations used:** When `activationsRemaining === 0` during a wave, the step indicator shows "Degats" as active. But the action bar shows TWO buttons stacked: the optional "Warded Fist" ability (if Arlen with charge > 0) AND the "Resoudre les degats" button. The player does not know if they MUST use Warded Fist before resolving, or if it is optional. There is no label distinguishing "optional bonus action" from "required next step."

**Fix A -- Presence movement UI:**

1. In `WorldMap.tsx`, when `isNight` is true and `waveNumber === 0` (pass this as a new prop `isPositioning`), add a pulsing ring around the Presence location and show arrows to adjacent locations:

Add prop to WorldMap: `isPositioning?: boolean`

When `isPositioning` is true, modify the Presence badge to be more prominent:
```tsx
presenceBadge: {
  position: 'absolute',
  bottom: -12,
  backgroundColor: warded.accent,
  borderRadius: 14,
  width: 28,        // was 20
  height: 28,       // was 20
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 2,
  borderColor: warded.wardLight,
},
presenceIcon: {
  fontSize: 14,     // was 11
  color: warded.bg,
},
```

2. In `warded.tsx`, replace the positioning text (line 288) with a more explicit instruction:
```tsx
{isNight && state.waveNumber === 0 && (
  <View style={styles.nightActions}>
    <View style={styles.positioningBanner}>
      <Text style={styles.positioningTitle}>POSITIONNEMENT</Text>
      <Text style={styles.positioningHint}>
        Tape un lieu pour y deplacer ta Presence ({state.hero.name}).
        {'\n'}Ta Presence renforce les wards actives ici.
      </Text>
    </View>
    <TouchableOpacity style={styles.phaseBtn} onPress={ctrl.doStartWave}>
      <Text style={styles.phaseBtnText}>Lancer Vague 1</Text>
    </TouchableOpacity>
  </View>
)}
```

New styles:
```tsx
positioningBanner: {
  backgroundColor: warded.accent + '15',
  borderRadius: 10,
  padding: 12,
  borderWidth: 1,
  borderColor: warded.accent + '40',
  alignItems: 'center',
  gap: 4,
},
positioningTitle: {
  color: warded.accent,
  fontSize: wardedFonts.md,
  fontWeight: 'bold',
  letterSpacing: 2,
},
positioningHint: {
  color: warded.textDim,
  fontSize: wardedFonts.sm,
  textAlign: 'center',
  lineHeight: 16,
},
```

**Fix B -- Separate optional from required actions:**

When activations hit 0 and the hero has an optional ability, visually separate them. Replace the stacked buttons (lines 306-329) with:

```tsx
{isNight && state.waveNumber > 0 && state.activationsRemaining === 0 && (
  <View style={styles.nightActions}>
    {/* Optional ability -- visually distinct */}
    {!state.heroWaveAbilityUsed && state.hero.id === 'arlen' && (state.hero.arlenCharge ?? 0) > 0 && (
      <View style={styles.optionalAction}>
        <Text style={styles.optionalLabel}>ACTION BONUS (optionnel)</Text>
        <TouchableOpacity
          style={[styles.phaseBtn, { borderColor: warded.accent, backgroundColor: warded.accent + '15' }]}
          onPress={ctrl.doWardedFist}
        >
          <Text style={[styles.phaseBtnText, { color: warded.accent }]}>
            Warded Fist ({state.hero.arlenCharge} dmg)
          </Text>
        </TouchableOpacity>
      </View>
    )}
    {/* Required next step -- prominent */}
    <TouchableOpacity
      style={[styles.phaseBtn, { backgroundColor: warded.danger + '20', borderColor: warded.danger }]}
      onPress={() => ctrl.doResolveDamage()}
    >
      <Text style={styles.phaseBtnText}>Resoudre les degats (Vague {state.waveNumber}/3)</Text>
    </TouchableOpacity>
  </View>
)}
```

New style:
```tsx
optionalAction: {
  gap: 4,
  paddingBottom: 4,
  borderBottomWidth: 1,
  borderBottomColor: warded.border,
  marginBottom: 4,
},
optionalLabel: {
  color: warded.textDim,
  fontSize: 8,
  fontWeight: '600',
  letterSpacing: 1,
  textAlign: 'center',
},
```

The "ACTION BONUS (optionnel)" label and visual separator (border-bottom) make it instantly clear that Warded Fist is a choice, not a required step. The resolve button remains always visible below it.

---

## SUMMARY OF ITERATION 2

| # | Fix | Severity | Effort |
|---|-----|----------|--------|
| 1 | Close button 40px circle + backdrop dismiss | HIGH | Small |
| 2 | Disabled buttons show WHY + 0 AP banner | HIGH | Medium |
| 3 | Combat toast replaces event log + remove auto-advance | HIGH | Medium |
| 4 | Ward reserves visual tray with gold border | HIGH | Small |
| 5 | Presence positioning UI + optional vs required action labels | MEDIUM | Medium |

**Remaining for iteration 3:** Onboarding tutorial (original #1 -- deferred because it requires all other UX to be stable first; building a tutorial on top of broken flows creates double rework).
