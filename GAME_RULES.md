# NANI?! — Règles Définitives v1.1

## Concept
Jeu de bluff/déduction dans un multivers anime parodique.
3 à 6 joueurs, ~15-20 minutes. Multijoueur local, en ligne, ou avec IA.

---

## Composants

- **50 cartes Pouvoir** (5 univers × 10 cartes : les valeurs 3, 4, 5 en double, les 1, 2, 6, 7 en exemplaire unique)
- **6 cartes Identité Secrète**
- **Jetons Plot Armor** — 4 par joueur au départ
- **Jetons Bouclier** — absorbent 1 dégât chacun (max 2 par joueur)
- **Deck d'Arcs Narratifs** — événements périodiques

---

## Les 5 Univers

| Univers         | Parodie              | Bonus de victoire en duel                                    |
| --------------- | -------------------- | ------------------------------------------------------------ |
| Shonen Force    | Dragon Ball, Naruto  | Pioche 1 carte (momentum)                                   |
| Magical Sparkle | Sailor Moon, Madoka  | +1 Plot Armor (soin)                                        |
| Mecha Titanium  | Evangelion, Gundam   | Gagne 1 jeton Bouclier (max 2)                              |
| Isekai Cheat    | SAO, Re:Zero         | Vole la carte défaussée par l'adversaire                    |
| Seinen Shadow   | Death Note, AoT      | Regarde l'identité secrète OU 2 cartes de la main adverse   |

---

## Cycle de dominance (+3 au combat)

Chaque univers bat 2 autres et perd contre 2 :

```
         SHONEN
        ↙      ↘
    MECHA       SEINEN
      ↑    ✦      ↓
    ISEKAI  ←  MAGICAL
```

| Univers | Bat              | Perd contre        |
| ------- | ---------------- | ------------------ |
| Shonen  | Seinen, Magical  | Isekai, Mecha      |
| Seinen  | Magical, Isekai  | Shonen, Mecha      |
| Magical | Isekai, Mecha    | Shonen, Seinen     |
| Isekai  | Mecha, Shonen    | Seinen, Magical    |
| Mecha   | Shonen, Seinen   | Magical, Isekai    |

---

## Cartes spéciales

| Numéro | Nom         | Règle                                                                 |
| ------ | ----------- | --------------------------------------------------------------------- |
| 1      | L'Outsider  | Perd contre tout SAUF le 7 qu'il bat. Si le 1 gagne : adversaire révèle son identité. |
| 7      | L'Ultra     | Plus forte carte. Bonus d'univers doublé (voir détail ci-dessous). Vulnérable au 1. |
| 2, 6   | Vanilles    | Force + bonus univers. Exemplaire unique.                            |
| 3, 4, 5 | Vanilles   | Force + bonus univers. Existent en 2 exemplaires chacun.             |

### Bonus doublé du 7 par univers

| Univers         | Bonus normal       | Bonus doublé (avec un 7)                          |
| --------------- | ------------------ | ------------------------------------------------- |
| Shonen Force    | Pioche 1 carte     | Pioche 2 cartes                                   |
| Magical Sparkle | +1 Plot Armor      | +2 Plot Armor                                     |
| Mecha Titanium  | +1 Bouclier        | +2 Boucliers (dans la limite du max de 2)         |
| Isekai Cheat    | Vole la carte adverse | Vole la carte adverse + regarde toute la main   |
| Seinen Shadow   | Identité OU 2 cartes | Identité ET 2 cartes                            |

---

## Les 6 Identités Secrètes (objectif uniquement, pas de passif)

| Identité        | Objectif secret                                                                |
| --------------- | ------------------------------------------------------------------------------ |
| Le Protagoniste | Être le dernier survivant                                                      |
| Le Rival        | Éliminer le joueur qui te précède dans l'ordre de jeu                          |
| Le Mentor       | Le joueur choisi secrètement au début doit survivre OU le Mentor doit venger son élimination (éliminer celui qui l'a éliminé) |
| Le Traître      | Éliminer 2+ joueurs ET survivre                                               |
| Le Comic Relief | Gagner sans avoir bluffé une seule fois                                        |
| L'Antagoniste   | Infliger des dégâts à tous les autres joueurs (au moins 1 fois chacun)         |

---

## Mise en place

1. Mélanger les 50 cartes Pouvoir
2. Distribuer 5 cartes par joueur (garantir au moins 3 univers différents)
3. Le reste forme la pioche commune
4. Distribuer 1 identité secrète par joueur (face cachée)
5. Chaque joueur reçoit 4 jetons Plot Armor
6. Déterminer aléatoirement le premier joueur

---

## Tour de jeu

### Phase 1 — Opening
Le joueur actif pioche 1 carte (si la pioche n'est pas vide).

### Phase 2 — Choix d'action

**a) Attaquer un joueur**

1. L'attaquant choisit une cible et pose une carte face cachée
2. L'attaquant déclare un univers (peut mentir)
3. Le défenseur choisit et pose une carte face cachée en réaction
4. Phase de bluff libre (trash-talk, intimidation, négociation)
5. Révélation simultanée → résolution du duel

**b) S'entraîner**

Défausser 1 carte, piocher 2 cartes.

**c) Espionner**

Regarder 1 carte au choix dans la main d'un adversaire.

### Phase 3 — Résolution du duel (si attaque)

1. Identifier les vrais univers des deux cartes
2. Vérifier la dominance → l'univers dominant donne +3
3. Comparer les totaux → le plus élevé gagne
4. Exception : le 1 bat toujours le 7, quelle que soit la dominance
5. Égalité : chaque joueur reprend sa carte en main, pas de dégâts

**Résultat :**

- Gagnant : garde sa carte + bonus de son univers (doublé si c'est un 7)
- Perdant : -1 Plot Armor (absorbé par un Bouclier s'il en a) + défausse sa carte
- Si le 1 gagne : en plus, l'adversaire révèle son identité secrète

### Phase 4 — Ending

- Vérifier si un joueur remplit son objectif secret → victoire immédiate (déclarer et prouver)
- Vérifier les éliminations (0 PA ou 0 carte en main)
- Passer au joueur suivant

---

## Arcs Narratifs (toutes les 3 tours)

| Arc            | Effet                                                       |
| -------------- | ----------------------------------------------------------- |
| Tournament Arc | Chaque joueur DOIT attaquer ce tour                         |
| Beach Episode  | Aucune attaque, tout le monde pioche 2 cartes               |
| Trahison !     | Deux joueurs aléatoires échangent leurs identités secrètes  |
| Final Boss     | Boss 5 PV apparaît, coopération ou chaos                    |
| Flashback      | Un joueur éliminé revient avec 1 PA et 2 cartes             |
| Filler Episode | Rien ne se passe                                            |
| Power Up       | Défausser 2 cartes pour gagner 1 PA                         |
| Plot Twist     | Toutes les mains mélangées et redistribuées                 |

---

## Anti-stagnation

Si aucun joueur n'attaque pendant un tour complet → tous perdent 1 PA.

---

## Conditions de victoire

1. **Dernier survivant** — dernier joueur avec du Plot Armor et des cartes
2. **Objectif secret** — remplir sa condition d'identité → victoire immédiate (déclarer et prouver)

---

## Aide-mémoire affichée à l'écran

- Cycle de dominance (diagramme visuel)
- Les 5 bonus de victoire (1 ligne par univers)
- Rappel : 1 bat 7, le 7 double le bonus
- Identité du joueur et son objectif
- Défausse : cartes jouées + compteur par univers
- Boucliers : max 2 par joueur
