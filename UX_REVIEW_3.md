# UX Review 3 -- Onboarding Tutorial Contextuel

**Date:** 2026-03-29
**Focus:** Zero guidance pour un nouveau joueur. Les 10 fixes UX precedentes ameliorent l'experience d'un joueur DEJA initie, mais ne resolvent pas le probleme fondamental: un nouveau joueur ne sait pas quoi faire.

**Principe:** Apprendre en FAISANT, pas en lisant. Chaque etape montre 1 phrase, surligne 1 zone, et avance quand le joueur agit.

---

## IMPLEMENTATION: Etat `tutorialStep`

Ajouter un state dans `WardedGameScreen`:

```ts
const [tutorialStep, setTutorialStep] = useState<number | null>(0);
// null = tutoriel termine ou desactive
// 0-4 = etapes jour (day phase)
// 5-6 = etapes nuit (night phase, declenche a la 1ere nuit)
```

Composant generique `TutorialOverlay`:
- Fond semi-transparent noir (rgba 0,0,0,0.6) couvrant tout l'ecran
- "Trou" transparent autour de l'element surligne (via masque ou clip)
- Bulle de texte (tooltip) positionnee au-dessus ou en-dessous
- Bouton "Passer le tutoriel" discret en bas a droite

Persister `tutorialCompleted` dans AsyncStorage pour ne pas relancer.

---

## ETAPE 1 -- Previsions de menace

| Champ | Valeur |
|---|---|
| **Texte FR** | "Ces bordures colorees indiquent la menace de demons cette nuit. ROUGE = danger imminent." |
| **Element surligne** | Composant `WorldMap` complet (le conteneur `styles.mapContainer`). Specifiquement, les 4 noeuds `styles.locationNode` avec leurs bordures colorees par `forecastBorderColor()`. |
| **Position tooltip** | EN-DESSOUS de la carte (le tooltip apparait entre la carte et la barre d'actions) |
| **Declencheur d'avancement** | Le joueur tape n'importe ou sur l'overlay OU attend 4 secondes (auto-avance) |
| **Condition d'apparition** | `tutorialStep === 0`, phase `day`, `state` charge |

**Note technique:** Le "trou" dans l'overlay doit englober tout le `mapContainer` (carre de MAP_SIZE x MAP_SIZE). Pendant cette etape, bloquer les interactions avec les boutons sous l'overlay.

---

## ETAPE 2 -- Inspecter un lieu

| Champ | Valeur |
|---|---|
| **Texte FR** | "Tape sur un lieu pour voir ses defenses et ses ressources." |
| **Element surligne** | Le noeud de Cutter's Hollow (position `west`, le lieu le plus central visuellement). Surligner uniquement ce `TouchableOpacity` dans `WorldMap` via `styles.locationNode` a la position `POSITIONS.west`. |
| **Position tooltip** | A DROITE du noeud (ou en-dessous si pas de place) |
| **Declencheur d'avancement** | Le joueur tape sur N'IMPORTE QUEL noeud de lieu (`onLocationPress` est appele) |
| **Condition d'apparition** | `tutorialStep === 1`, phase `day` |

**Note technique:** Autoriser uniquement les taps sur les noeuds de la carte pendant cette etape. Le callback `onLocationPress` doit appeler `setTutorialStep(2)` en plus de `setSelectedLocation`.

---

## ETAPE 3 -- Crafter un ward

| Champ | Valeur |
|---|---|
| **Texte FR** | "Fabrique un ward pour proteger tes cites. Chaque type a un effet unique." |
| **Element surligne** | La rangee `styles.wardCraftRow` contenant les 5 boutons de craft (fire, stone, wind, light, bone). Surligner tout le bloc `styles.actionSection` qui contient le label "Crafter un Ward (1 AP)" et la rangee de boutons. |
| **Position tooltip** | AU-DESSUS de la rangee de craft (entre la carte et les boutons) |
| **Declencheur d'avancement** | Le joueur tape sur un bouton de craft actif (`ctrl.doCraft` est appele avec succes) |
| **Condition d'apparition** | `tutorialStep === 2`, phase `day`, `selectedLocation === null` (le joueur a ferme le detail du lieu) |

**Note technique:** Si le joueur a encore le panneau de detail ouvert, attendre qu'il le ferme. Le tutoriel ne doit pas bloquer la fermeture du detail. Quand `doCraft` reussit, appeler `setTutorialStep(3)`.

**Cas limite:** Si aucun ward n'est craftable (pas assez de ressources), afficher un texte alternatif: "Pas assez de ressources. Tape un lieu et utilise Recolter d'abord." et surligner la carte a la place. Avancer quand le joueur fait un Gather puis revient.

---

## ETAPE 4 -- Placer un ward

| Champ | Valeur |
|---|---|
| **Texte FR** | "Ton ward est en reserve. Tape un lieu sur la carte pour le placer avant la nuit." |
| **Element surligne** | Le bloc `styles.reserveTray` (la barre RESERVES avec les chips de wards). |
| **Position tooltip** | AU-DESSUS du tray de reserves |
| **Declencheur d'avancement** | Le joueur place un ward via `ctrl.doFortify` (ouvre un lieu, choisit Fortifier) |
| **Condition d'apparition** | `tutorialStep === 3`, phase `day`, `state.wardReserves.length > 0` |

**Note technique:** Le joueur doit: (1) taper un lieu sur la carte, (2) choisir Fortifier dans le panneau de detail. Le tutoriel surligne le tray mais n'empeche pas la navigation. Quand `doFortify` reussit, appeler `setTutorialStep(4)`.

**Fallback:** Si `wardReserves` est vide (le joueur n'a pas encore craft), revenir a l'etape 3.

---

## ETAPE 5 -- Lancer la nuit

| Champ | Valeur |
|---|---|
| **Texte FR** | "Pret? Appuie sur ce bouton pour affronter les demons." |
| **Element surligne** | Le bouton `styles.phaseBtn` "Tomber de la nuit" (le `TouchableOpacity` avec `handleEndDay`). |
| **Position tooltip** | AU-DESSUS du bouton |
| **Declencheur d'avancement** | Le joueur tape le bouton "Tomber de la nuit" (`handleEndDay` est appele) |
| **Condition d'apparition** | `tutorialStep === 4`, phase `day` |

**Note technique:** Le tutoriel jour est termine. Sauvegarder `tutorialDayCompleted = true`. Mettre `tutorialStep` a `5` (en attente du debut de la nuit). L'overlay de transition "LA NUIT TOMBE" joue normalement par-dessus.

---

## ETAPE 6 -- Activer les wards (1ere nuit)

| Champ | Valeur |
|---|---|
| **Texte FR** | "Tape un lieu pour activer ses wards contre les demons. Chaque lieu warde = 1 activation." |
| **Element surligne** | La carte `WorldMap` complete, avec une pulsation sur les noeuds qui ont des wards (ceux ou `loc.wards[0].ward || loc.wards[1].ward`). |
| **Position tooltip** | EN-DESSOUS de la carte |
| **Declencheur d'avancement** | Le joueur tape un lieu et active un ward (`ctrl.doActivateWard` est appele) |
| **Condition d'apparition** | `tutorialStep === 5`, phase `night`, `state.waveNumber > 0`, `state.activationsRemaining > 0` |

**Note technique:** Cette etape se declenche APRES le positionnement (vague 0) et APRES le lancement de la vague 1. Si le joueur est encore en positionnement (waveNumber === 0), ne pas afficher le tutoriel -- laisser le `positioningBanner` existant guider le joueur. L'etape 6 apparait quand `activationsRemaining > 0` sur la vague 1.

---

## ETAPE 7 -- Resoudre les degats

| Champ | Valeur |
|---|---|
| **Texte FR** | "Bien joue! Maintenant, resous les degats pour voir ce qui a survecu." |
| **Element surligne** | Le bouton "Resoudre les degats" (`styles.phaseBtn` avec `ctrl.doResolveDamage`). |
| **Position tooltip** | AU-DESSUS du bouton |
| **Declencheur d'avancement** | Le joueur tape "Resoudre les degats" (`ctrl.doResolveDamage` est appele) |
| **Condition d'apparition** | `tutorialStep === 6`, phase `night`, `state.activationsRemaining === 0` |

**Note technique:** Apres cette etape, mettre `tutorialStep = null` et sauvegarder `tutorialCompleted = true` dans AsyncStorage. Le joueur est autonome pour la suite de la nuit et les tours suivants.

---

## RECAPITULATIF SEQUENTIEL

```
JOUR (1er tour)
  Step 0: Carte + previsions de menace    → tap/4s auto
  Step 1: Taper un lieu                   → onLocationPress
  Step 2: Crafter un ward                 → doCraft
  Step 3: Placer le ward (reserves)       → doFortify
  Step 4: Lancer la nuit                  → handleEndDay

NUIT (1ere nuit, apres vague 1 lancee)
  Step 5: Activer les wards               → doActivateWard
  Step 6: Resoudre les degats             → doResolveDamage
  → tutorialStep = null, tutoriel termine
```

---

## SPECIFICATIONS VISUELLES DU COMPOSANT TutorialOverlay

### Structure

```tsx
// Nouveau composant: components/warded/TutorialOverlay.tsx

interface TutorialOverlayProps {
  step: number;
  highlightRect: { x: number; y: number; width: number; height: number };
  text: string;
  tooltipPosition: 'above' | 'below' | 'right';
  onSkip: () => void;
}
```

### Style de la bulle

| Propriete | Valeur |
|---|---|
| Fond | `warded.bgCard` avec opacite 0.95 |
| Bordure | 1px `warded.accent` |
| Border radius | 10 |
| Padding | 12px horizontal, 10px vertical |
| Texte | `warded.text`, taille `wardedFonts.sm` (pas xs -- doit etre lisible) |
| Largeur max | 260px |
| Fleche | Triangle CSS de 8px pointant vers l'element surligne |

### Style du fond assombri

| Propriete | Valeur |
|---|---|
| Couleur | `rgba(0, 0, 0, 0.6)` |
| Z-index | 90 (sous le combat toast a 50, mais le toast ne devrait pas apparaitre pendant le tuto jour) |
| Le "trou" | Marge de 6px autour du `highlightRect`, border-radius 12, bordure pulsante `warded.accent` |

### Bouton "Passer"

| Propriete | Valeur |
|---|---|
| Texte | "Passer >" |
| Position | Coin bas-droit, padding 14px |
| Style | `warded.textDim`, `wardedFonts.xs`, underline |
| Action | `setTutorialStep(null)` + sauvegarder `tutorialCompleted` |

---

## INTEGRATION DANS warded.tsx

### Modifications requises

1. **State:** Ajouter `tutorialStep` et un check AsyncStorage au mount.

2. **Refs pour les positions:** Utiliser `onLayout` ou `measure()` sur les elements cles pour obtenir les `highlightRect` dynamiques:
   - `mapRef` sur le conteneur WorldMap
   - `craftRowRef` sur `wardCraftRow`
   - `reserveTrayRef` sur `reserveTray`
   - `endDayBtnRef` sur le bouton "Tomber de la nuit"
   - `resolveBtnRef` sur le bouton "Resoudre les degats"

3. **Callbacks enrichis:** Chaque action du jeu (`doCraft`, `doFortify`, `doActivateWard`, `doResolveDamage`, `handleEndDay`) doit verifier `tutorialStep` et avancer si l'etape correspond.

4. **Rendu:** Ajouter `{tutorialStep !== null && <TutorialOverlay ... />}` juste avant la fermeture du `SafeAreaView`, a z-index 90.

---

## RISQUES ET GARDE-FOUS

| Risque | Mitigation |
|---|---|
| Le joueur craft avant d'inspecter un lieu (saute l'etape 2) | Le tutoriel bloque les interactions hors de l'element surligne aux etapes 1-2. A partir de l'etape 3, laisser libre. |
| Pas assez de ressources pour crafter a l'etape 3 | Texte alternatif + redirection vers Gather (voir etape 3). En Quick Mode, les ressources de depart suffisent pour au moins 1 ward fire (2 Bois). |
| Le joueur quitte l'app en cours de tutoriel | Sauvegarder `lastTutorialStep` dans AsyncStorage. Au retour, reprendre a cette etape. |
| Ecran trop petit pour tooltip + surlignage | Le tooltip passe en position `below` si pas de place au-dessus. Max-width 260px garanti compatible 320px de large. |
| Mode campagne vs Quick Mode | Le tutoriel se declenche dans les DEUX modes au premier lancement. Les etapes sont identiques (la boucle jour/nuit est la meme). |
