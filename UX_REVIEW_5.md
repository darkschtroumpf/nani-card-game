# UX Review #5 -- Top 5 Improvements for Player Experience

## Audit Summary

| Question | Finding |
|---|---|
| Demon images used in LocationDetail? | NO -- emoji only (line 106: `DEMON_SYMBOLS[d.demon.type]`) |
| Demon images used in WorldMap? | NO -- emoji only (line 137: `DEMON_SYMBOLS[d.demon.type]`) |
| Ward images used in craft buttons? | NO -- emoji only (line 547: `WARD_SYMBOLS[w]`) |
| Ward images used in LocationDetail ward slots? | NO -- emoji only (line 81: `WARD_SYMBOLS[ws.ward]`) |
| Ward images used on WorldMap nodes? | YES -- `WARD_IMAGES` dict + `<Image>` (lines 5-11, 125-128) |
| Visual feedback on craft/activate/damage? | MINIMAL -- toast only (combatToast, 2.5s), no animation on buttons |
| Game-over stats? | NONE -- only shows emoji + title + defeat reason |
| Rejouer button? | YES -- exists (line 273-285) |
| Night phase dramatic? | WEAK -- 1.5s static overlay with emoji, no sound, no animation |
| Damage resolution understandable? | NO -- single button press, results only visible in event log |

---

## TOP 5 IMPROVEMENTS (ranked by player impact)

---

### 1. Use AI-generated demon images everywhere (HIGH IMPACT)

**Problem:** 6 demon PNG files exist (`assets/images/demon_flame.png`, `demon_wood.png`, `demon_wind.png`, `demon_water.png`, `demon_rock.png`, `demon_mind.png`) but are NEVER imported or used. Both `LocationDetail.tsx` and `WorldMap.tsx` display demons as emoji text via `DEMON_SYMBOLS`.

**Files to change:**

**A) `packages/app/components/warded/WorldMap.tsx`**

Add image imports (after line 11):
```ts
const DEMON_IMAGES: Record<string, any> = {
  flame: require('../../assets/images/demon_flame.png'),
  wood: require('../../assets/images/demon_wood.png'),
  wind: require('../../assets/images/demon_wind.png'),
  water: require('../../assets/images/demon_water.png'),
  rock: require('../../assets/images/demon_rock.png'),
  mind: require('../../assets/images/demon_mind.png'),
};
```

Replace line 137:
```tsx
// OLD
<Text key={i} style={styles.demonInlineIcon}>{DEMON_SYMBOLS[d.demon.type] ?? '👹'}</Text>
// NEW
<Image key={i} source={DEMON_IMAGES[d.demon.type]} style={styles.demonInlineImage} />
```

Add style:
```ts
demonInlineImage: {
  width: 18,
  height: 18,
  borderRadius: 9,
},
```

**B) `packages/app/components/warded/LocationDetail.tsx`**

Add import at top (after line 1):
```ts
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
```

Add image dict (after line 4):
```ts
const DEMON_IMAGES: Record<string, any> = {
  flame: require('../../assets/images/demon_flame.png'),
  wood: require('../../assets/images/demon_wood.png'),
  wind: require('../../assets/images/demon_wind.png'),
  water: require('../../assets/images/demon_water.png'),
  rock: require('../../assets/images/demon_rock.png'),
  mind: require('../../assets/images/demon_mind.png'),
};
```

Replace line 106:
```tsx
// OLD
<Text style={styles.demonIcon}>{DEMON_SYMBOLS[d.demon.type]}</Text>
// NEW
<Image source={DEMON_IMAGES[d.demon.type]} style={styles.demonImage} />
```

Add style:
```ts
demonImage: {
  width: 24,
  height: 24,
  borderRadius: 12,
},
```

---

### 2. Use ward images in craft buttons and LocationDetail slots (HIGH IMPACT)

**Problem:** Ward images are loaded and displayed on the WorldMap nodes, but the craft buttons in `warded.tsx` (line 547) and the ward slots in `LocationDetail.tsx` (line 81) still use `WARD_SYMBOLS` emoji.

**Files to change:**

**A) `packages/app/app/warded.tsx`**

Add ward image imports (after line 10):
```ts
const WARD_IMAGES: Record<string, any> = {
  fire: require('../assets/images/ward_fire.png'),
  stone: require('../assets/images/ward_stone.png'),
  wind: require('../assets/images/ward_wind.png'),
  light: require('../assets/images/ward_light.png'),
  bone: require('../assets/images/ward_bone.png'),
};
```

Replace line 547 (craft button icon):
```tsx
// OLD
<Text style={[styles.wardCraftIcon, { color: wardColor(w) }]}>{WARD_SYMBOLS[w]}</Text>
// NEW
<Image source={WARD_IMAGES[w]} style={styles.wardCraftImage} />
```

Add style:
```ts
wardCraftImage: {
  width: 28,
  height: 28,
  borderRadius: 14,
},
```

Similarly replace in reserve chips (line 587):
```tsx
// OLD
<Text style={{ color: wardColor(w), fontSize: 18 }}>{WARD_SYMBOLS[w]}</Text>
// NEW
<Image source={WARD_IMAGES[w]} style={{ width: 22, height: 22, borderRadius: 11 }} />
```

**B) `packages/app/components/warded/LocationDetail.tsx`**

Add ward image imports (after DEMON_IMAGES):
```ts
const WARD_IMAGES: Record<string, any> = {
  fire: require('../../assets/images/ward_fire.png'),
  stone: require('../../assets/images/ward_stone.png'),
  wind: require('../../assets/images/ward_wind.png'),
  light: require('../../assets/images/ward_light.png'),
  bone: require('../../assets/images/ward_bone.png'),
};
```

Replace line 81 (ward slot display):
```tsx
// OLD
<Text style={[styles.wardIcon, { color: wardColor(ws.ward) }]}>{WARD_SYMBOLS[ws.ward]}</Text>
// NEW
<Image source={WARD_IMAGES[ws.ward]} style={styles.wardSlotImage} />
```

Add style:
```ts
wardSlotImage: {
  width: 30,
  height: 30,
  borderRadius: 15,
},
```

---

### 3. Add game-over stats screen (MEDIUM-HIGH IMPACT)

**Problem:** The game-over screen (lines 261-293 of `warded.tsx`) shows only an emoji, title, subtitle, and two buttons. No stats. The player has no sense of how well they did or what happened during the game.

**Files to change:**

**A) `packages/engine/src/warded/types.ts`** -- Add stats tracking to GameState

Add to the GameState interface:
```ts
stats: {
  wardsCrafted: number;
  wardsActivated: number;
  demonsKilled: number;
  populationLost: number;
  nightsSurvived: number;
  damageTaken: number;
};
```

**B) `packages/engine/src/warded/game.ts`** -- Initialize stats in createGame and increment them in relevant functions (craftWard, activateWard, resolveDamage, etc.)

**C) `packages/app/app/warded.tsx`** -- Display stats in the game-over screen

Insert between the subtitle (line 271) and the buttons (line 272):
```tsx
<View style={styles.statsGrid}>
  <StatItem label="Nuits survecues" value={state.stats.nightsSurvived} />
  <StatItem label="Wards fabriquees" value={state.stats.wardsCrafted} />
  <StatItem label="Demons tues" value={state.stats.demonsKilled} />
  <StatItem label="Population perdue" value={state.stats.populationLost} />
  <StatItem label="Degats subis" value={state.stats.damageTaken} />
</View>
```

---

### 4. Animate action feedback (craft success, ward activation, damage) (MEDIUM IMPACT)

**Problem:** When the player crafts a ward, activates a ward, or resolves damage, there is no visual confirmation besides a small toast (combatToast, line 513). The toast is easy to miss and shows raw event log text.

**Files to change:**

**A) `packages/app/app/warded.tsx`**

Add a flash animation on craft. After `handleCraft` (line 318), add a brief green flash on the ward craft button area:
```ts
const [craftFlash, setCraftFlash] = useState<string | null>(null);

const handleCraft = (w: WardType, locId: LocationId) => {
  ctrl.doCraft(w, locId);
  setCraftFlash(w);
  setTimeout(() => setCraftFlash(null), 600);
  if (tutorialStep === 2) setTutorialStep(3);
};
```

Then wrap each ward craft button with a conditional green border glow when `craftFlash === w`.

**B) `packages/app/components/warded/LocationDetail.tsx`**

When `isActivated` flips to true, the existing banner (line 154) is static. Wrap it in an `Animated.View` with a fade-in + scale pulse:
```tsx
// Replace static View with Animated.View + useEffect entrance animation
<Animated.View style={[styles.activatedBanner, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
  <Text style={styles.activatedText}>✓ Wards activees ce tour</Text>
</Animated.View>
```

**C) Damage resolution:** When the player presses "Resoudre les degats", show a brief screen-shake or red flash overlay (add a 300ms red tinted Animated.View at the root of the SafeAreaView).

---

### 5. Make damage resolution visible and understandable (MEDIUM IMPACT)

**Problem:** The player presses "Resoudre les degats" (line 670-677) and... nothing visible happens. The results are buried in the event log (hidden by default, line 701). The player has no idea which locations were hit, how much damage was dealt, or which wards helped.

**Files to change:**

**A) `packages/app/app/warded.tsx`**

Replace the instant damage resolution with a damage report overlay:
```ts
const [damageReport, setDamageReport] = useState<string[] | null>(null);

const handleResolveDamage = () => {
  const beforeEvents = events.length;
  ctrl.doResolveDamage();
  setDamageResolved(true);
  // Capture the new events that were added by doResolveDamage
  const newEvents = events.slice(beforeEvents);
  setDamageReport(newEvents.length > 0 ? newEvents : ['Aucun degat cette vague!']);
  if (tutorialStep === 6) setTutorialStep(-1);
};
```

Then render a damage report overlay (insert after the combatToast, around line 517):
```tsx
{damageReport && (
  <View style={styles.damageReportOverlay}>
    <Text style={styles.damageReportTitle}>RESOLUTION -- Vague {state.waveNumber}</Text>
    {damageReport.map((line, i) => (
      <Text key={i} style={styles.damageReportLine}>{line}</Text>
    ))}
    <TouchableOpacity onPress={() => setDamageReport(null)} style={styles.damageReportClose}>
      <Text style={styles.damageReportCloseText}>Compris</Text>
    </TouchableOpacity>
  </View>
)}
```

Add styles:
```ts
damageReportOverlay: {
  position: 'absolute',
  top: '20%',
  left: 20,
  right: 20,
  backgroundColor: 'rgba(20,10,10,0.95)',
  borderRadius: 14,
  padding: 16,
  borderWidth: 2,
  borderColor: warded.danger,
  gap: 8,
  zIndex: 60,
},
damageReportTitle: {
  color: warded.danger,
  fontSize: wardedFonts.lg,
  fontWeight: 'bold',
  textAlign: 'center',
  letterSpacing: 2,
},
damageReportLine: {
  color: warded.text,
  fontSize: wardedFonts.sm,
},
damageReportClose: {
  backgroundColor: warded.danger + '30',
  borderRadius: 8,
  padding: 10,
  borderWidth: 1,
  borderColor: warded.danger,
  alignItems: 'center',
  marginTop: 4,
},
damageReportCloseText: {
  color: warded.danger,
  fontWeight: 'bold',
  fontSize: wardedFonts.md,
},
```

---

## Priority Order for Implementation

| # | Improvement | Effort | Impact |
|---|---|---|---|
| 1 | Demon images everywhere | Small (add imports + swap 2 lines) | High -- art is wasted otherwise |
| 2 | Ward images in craft + detail | Small (add imports + swap 3 lines) | High -- visual consistency |
| 5 | Damage report overlay | Medium (new state + overlay component) | High -- core gameplay clarity |
| 3 | Game-over stats | Medium (engine + UI changes) | Medium-High -- replayability |
| 4 | Action feedback animations | Medium (Animated API) | Medium -- polish and juice |
