// ============================================================
// Campaign Data — Chapter 1: Le Garçon de Tibbet's Brook
// Fidèle au roman "The Warded Man" de Peter V. Brett
// ============================================================

import type { ChapterDefinition } from './campaign-types';
import type { WardType } from './types';

export const CHAPTER_1: ChapterDefinition = {
  id: 1,
  act: 1,
  title: "Le Garçon de Ruisseau de Tibbet",
  subtitle: "La lâcheté d'un père. Le courage d'un fils.",
  heroId: 'arlen_young',
  nightCount: 3,
  startingNightNumber: 1,
  startingPresence: 'cutters_hollow',
  hiddenLocations: ['lakton', 'desert_spear'] as any,
  locationOverrides: {
    cutters_hollow: { name: 'Maison des Bales', startPop: 6, terrain: 'plains' as any },
    miln: { name: 'Place du Village', startPop: 5, terrain: 'plains' as any },
    lakton: { name: 'Forêt', startPop: 0 },
    desert_spear: { name: 'Route du Nord', startPop: 0 },
  },
  availableWards: ['stone', 'wind'] as WardType[],
  fireCanKill: false,
  preplacedWards: [
    { locationId: 'cutters_hollow', ward: 'stone' },
    { locationId: 'miln', ward: 'stone' },
  ],

  // =====================
  // INTRO
  // =====================
  introDialogue: [
    {
      id: 'intro_1',
      background: 'village_sunset',
      lines: [
        { speaker: 'narrator', text: "292 AR. Le soleil descend sur Ruisseau de Tibbet, un hameau isolé dans les plaines fertiles de Thesa." },
        { speaker: 'narrator', text: "Ici, comme partout dans le monde, la vie s'organise autour d'une seule certitude : quand la nuit tombe, les chtoniens montent." },
        { speaker: 'narrator', text: "Des créatures de flamme, de pierre et de vent surgissent du sol dès que l'obscurité est complète. Seuls les runes — d'anciens symboles magiques — les tiennent à distance." },
      ],
      nextNodeId: 'intro_2',
    },
    {
      id: 'intro_2',
      background: 'village_sunset',
      lines: [
        { speaker: 'jeph', text: "Arlen ! Les runes de la clôture nord sont abîmés. Viens m'aider avant le crépuscule.", emotion: 'scared' },
        { speaker: 'arlen_young', text: "J'arrive. Mais père... pourquoi est-ce qu'on ne fait que se cacher ? Toujours se cacher ?", emotion: 'determined' },
        { speaker: 'jeph', text: "Parce que ceux qui ne se cachent pas meurent, Arlen. C'est comme ça depuis toujours.", emotion: 'angry' },
        { speaker: 'silvy', text: "Écoute ton père, mon chéri. Allez, venez manger avant la nuit.", emotion: 'sad' },
      ],
      nextNodeId: 'intro_3',
    },
    {
      id: 'intro_3',
      background: 'messenger',
      lines: [
        { speaker: 'narrator', text: "Le bruit de sabots. Un cavalier solitaire approche de la ferme au galop. C'est Ragen, un Messager — l'un des rares hommes qui osent voyager la nuit entre les cités." },
        { speaker: 'ragen', text: "Jeph Bales ! Je cherche un abri pour la nuit. Mes runes portatifs ont pris un coup en route.", emotion: 'neutral' },
        { speaker: 'jeph', text: "Entrez, entrez vite. Le soleil est bas.", emotion: 'scared' },
        { speaker: 'arlen_young', text: "Vous... vous voyagez la nuit ? Seul ? Comment c'est possible ?", emotion: 'hopeful' },
        { speaker: 'ragen', text: "Avec de bons runes, du courage, et un peu de chance, gamin.", emotion: 'determined' },
        { speaker: 'arlen_young', text: "Apprenez-moi.", emotion: 'determined' },
        { speaker: 'ragen', text: "Ha ! Tu as du cran. On verra si tu l'as encore après cette nuit.", emotion: 'neutral' },
      ],
    },
  ],

  // =====================
  // DAY EVENTS
  // =====================
  dayEvents: [
    // --- JOUR 1 : Le Messager ---
    {
      dayNumber: 1,
      dialogueNodes: [
        {
          id: 'day1_1',
          background: 'messenger',
          lines: [
            { speaker: 'ragen', text: "Tes runes ne sont pas mauvais pour un gamin, Arlen. Mais ils ne tiendront pas contre un chtonien de flamme.", emotion: 'neutral' },
            { speaker: 'arlen_young', text: "Qu'est-ce que je peux faire de mieux ?", emotion: 'determined' },
            { speaker: 'ragen', text: "D'abord, récolte des ressources. Tape sur un lieu pour voir ce qu'il produit — Bois ou Encre. Ensuite, fabrique un rune avec ces ressources.", emotion: 'neutral' },
            { speaker: 'ragen', text: "Ensuite, place ton rune sur un lieu. L'ordre compte ! Deux runes côte à côte peuvent former un combo plus puissant.", emotion: 'determined' },
            { speaker: 'ragen', text: "La nuit, tu devras activer tes défenses en tapant sur les lieux runés. Chaque lieu ne s'active qu'une fois par vague.", emotion: 'neutral' },
            { speaker: 'ragen', text: "J'ai du matériel de rechange. Je peux t'aider à renforcer la place du village, ou tu gardes tes forces pour la ferme.", emotion: 'neutral' },
          ],
          choices: [
            {
              id: 'help_ragen',
              label: "Aider Ragen à la place du village",
              hint: "+1 Rune de Vent à la Place, mais -1 AP (fatigue)",
              effects: [
                { type: 'bonus_ward', wardType: 'wind', locationId: 'miln' },
                { type: 'hero_ap_change', delta: -1 },
              ],
            },
            {
              id: 'stay_home',
              label: "Renforcer la maison des Bales",
              hint: "+3 Bois à la maison",
              effects: [
                { type: 'add_resources', locationId: 'cutters_hollow', resource: 'wood', amount: 3 },
              ],
            },
          ],
        },
      ],
    },

    // --- JOUR 2 : Les tensions montent ---
    {
      dayNumber: 2,
      dialogueNodes: [
        {
          id: 'day2_1',
          background: 'village_sunset',
          lines: [
            { speaker: 'narrator', text: "La deuxième nuit a été rude. Des traces de griffes marquent la clôture. Les runes ont tenu, mais de justesse." },
            { speaker: 'silvy', text: "Jeph, la voisine Harl dit que ses runes à lui ont failli céder. Il demande de l'aide.", emotion: 'scared' },
            { speaker: 'jeph', text: "C'est pas notre problème. Chacun protège sa maison.", emotion: 'angry' },
            { speaker: 'arlen_young', text: "Si les runes de Harl cèdent, les chtoniens viendront ensuite chez nous. On devrait l'aider.", emotion: 'determined' },
            { speaker: 'jeph', text: "Tu veux jouer au héros ? Comme ton grand-père ? Regarde où ça l'a mené.", emotion: 'angry' },
          ],
          choices: [
            {
              id: 'help_neighbor',
              label: "Aider le voisin Harl à renforcer ses runes",
              hint: "+2 Population à la Place du Village, mais -1 AP",
              effects: [
                { type: 'modify_population', locationId: 'miln', delta: 2 },
                { type: 'hero_ap_change', delta: -1 },
                { type: 'set_flag', flag: 'helped_harl', value: true },
              ],
            },
            {
              id: 'obey_father',
              label: "Obéir à son père — chacun pour soi",
              hint: "+2 Bois et +2 Encre à la maison",
              effects: [
                { type: 'add_resources', locationId: 'cutters_hollow', resource: 'wood', amount: 2 },
                { type: 'add_resources', locationId: 'cutters_hollow', resource: 'ink', amount: 2 },
                { type: 'set_flag', flag: 'helped_harl', value: false },
              ],
            },
          ],
        },
      ],
    },

    // --- JOUR 3 : La lâcheté de Jeph ---
    {
      dayNumber: 3,
      dialogueNodes: [
        {
          id: 'day3_1',
          background: 'village_sunset',
          lines: [
            { speaker: 'narrator', text: "L'aube du troisième jour. Silvy est allée chercher des herbes à l'orée du village. Le soleil est encore haut, mais les nuages s'amoncellent." },
            { speaker: 'arlen_young', text: "Mère n'est pas rentrée. Le soleil baisse.", emotion: 'scared' },
            { speaker: 'jeph', text: "Elle... elle va revenir. Elle connaît le chemin.", emotion: 'scared' },
            { speaker: 'arlen_young', text: "Père ! Il faut aller la chercher ! Il reste à peine une heure de jour !", emotion: 'angry' },
            { speaker: 'jeph', text: "...", emotion: 'scared' },
            { speaker: 'narrator', text: "Jeph Bales ne bouge pas. Ses mains tremblent. La peur le paralyse. La même peur qui a toujours gouverné sa vie." },
            { speaker: 'arlen_young', text: "PÈRE !", emotion: 'angry' },
            { speaker: 'jeph', text: "C'est... c'est trop dangereux, fils. Si on sort maintenant...", emotion: 'scared' },
          ],
          choices: [
            {
              id: 'save_silvy',
              label: "Sortir seul chercher sa mère",
              hint: "-3 HP (course contre le crépuscule), mais +1 Rune de Feu en réserve (Silvy en avait)",
              effects: [
                { type: 'hero_hp_change', delta: -3 },
                { type: 'bonus_reserve_ward', wardType: 'fire' },
                { type: 'set_flag', flag: 'saved_silvy', value: true },
              ],
            },
            {
              id: 'wait_inside',
              label: "Rester à l'intérieur avec son père",
              hint: "Aucune perte, mais Silvy est prise au piège dehors (+1 démon par vague)",
              effects: [
                { type: 'extra_demons', count: 1 },
                { type: 'set_flag', flag: 'saved_silvy', value: false },
              ],
            },
          ],
        },
      ],
    },
  ],

  // =====================
  // VICTORY
  // =====================
  victoryDialogue: [
    {
      id: 'victory_1',
      background: 'dawn_victory',
      lines: [
        { speaker: 'narrator', text: "L'aube du quatrième jour. Les chtoniens se dissolvent dans la lumière, laissant des traînées noirâtres sur le sol." },
        { speaker: 'narrator', text: "Ruisseau de Tibbet a tenu. Trois nuits. Les runes ont craqué, plié, mais n'ont pas rompu." },
        { speaker: 'silvy', text: "C'est fini... Arlen, c'est fini.", emotion: 'sad' },
        { speaker: 'arlen_young', text: "Oui, mère.", emotion: 'neutral' },
      ],
      nextNodeId: 'victory_2',
    },
    {
      id: 'victory_2',
      background: 'dawn_victory',
      lines: [
        { speaker: 'narrator', text: "Arlen regarde son père. Jeph est assis près de la porte, le visage vide. Il n'a pas bougé de la nuit." },
        { speaker: 'arlen_young', text: "Tu n'as même pas essayé.", emotion: 'angry' },
        { speaker: 'jeph', text: "Arlen...", emotion: 'sad' },
        { speaker: 'arlen_young', text: "Elle aurait pu mourir. Et tu serais resté assis là.", emotion: 'angry' },
        { speaker: 'jeph', text: "J'ai fait ce qu'il fallait pour nous garder en vie—", emotion: 'scared' },
        { speaker: 'arlen_young', text: "Non. Tu as eu peur. Comme toujours.", emotion: 'determined' },
      ],
      nextNodeId: 'victory_3',
    },
    {
      id: 'victory_3',
      background: 'dawn_victory',
      lines: [
        { speaker: 'narrator', text: "Ragen observe la scène en silence depuis le seuil. Il reconnaît quelque chose dans les yeux du garçon. Quelque chose de rare." },
        { speaker: 'ragen', text: "Gamin. Je repars pour Fort Miln à l'aube. La route est longue et dangereuse.", emotion: 'neutral' },
        { speaker: 'arlen_young', text: "Emmenez-moi.", emotion: 'determined' },
        { speaker: 'silvy', text: "Arlen, non ! Tu n'as que onze ans !", emotion: 'scared' },
        { speaker: 'arlen_young', text: "Je refuse de vivre comme ça, mère. Enfermé chaque nuit, à attendre que les runes cèdent. À avoir peur.", emotion: 'determined' },
        { speaker: 'narrator', text: "Silvy pleure. Jeph ne dit rien. Il n'a plus les mots." },
        { speaker: 'narrator', text: "Le lendemain, avant l'aube, Arlen Bales quitte Ruisseau de Tibbet avec Ragen le Messager." },
        { speaker: 'narrator', text: "Il ne se retournera pas." },
      ],
    },
  ],

  // =====================
  // DEFEAT
  // =====================
  defeatDialogue: [
    {
      id: 'defeat_1',
      background: 'wards_breaking',
      lines: [
        { speaker: 'narrator', text: "Les runes cèdent. Un par un, les symboles s'éteignent comme des bougies dans le vent." },
        { speaker: 'narrator', text: "Les chtoniens se précipitent dans les brèches. Des démons de flamme embrasent la grange. Un démon de pierre fracasse la clôture." },
        { speaker: 'jeph', text: "Non... non, non, non...", emotion: 'scared' },
        { speaker: 'silvy', text: "ARLEN ! COURS ! COURS, MON FILS !", emotion: 'scared' },
        { speaker: 'narrator', text: "Arlen court dans l'obscurité. Derrière lui, les hurlements. Devant lui, le vide." },
        { speaker: 'narrator', text: "Son père n'a pas bougé. Paralysé par la terreur, comme toujours. Jusqu'à la fin." },
        { speaker: 'arlen_young', text: "Plus jamais...", emotion: 'angry' },
        { speaker: 'narrator', text: "Arlen Bales fuit seul dans la nuit, poursuivi par les chtoniens et le souvenir de la lâcheté de son père." },
        { speaker: 'narrator', text: "Chapitre 1 — Échec" },
      ],
    },
  ],
};

// ============================================================
// Chapter 2: Leesha — L'Herboriste de Cutter's Hollow
// ============================================================

export const CHAPTER_LEESHA: ChapterDefinition = {
  id: 2,
  act: 1,
  title: "L'Herboriste de Le Creux du Coupeur",
  subtitle: "Leesha apprend que soigner est aussi un combat.",
  heroId: 'leesha_young',
  nightCount: 3,
  startingNightNumber: 2,
  startingPresence: 'cutters_hollow',
  hiddenLocations: ['desert_spear'] as any,
  locationOverrides: {
    cutters_hollow: { name: "Le Creux du Coupeur", startPop: 7, terrain: 'forest' as any },
    miln: { name: 'Maison de Bruna', startPop: 4, terrain: 'forest' as any },
    lakton: { name: 'Place du Marché', startPop: 5, terrain: 'forest' as any },
    desert_spear: { name: '', startPop: 0 },
  },
  preplacedWards: [
    { locationId: 'cutters_hollow', ward: 'stone' },
    { locationId: 'cutters_hollow', ward: 'wind' },
    { locationId: 'miln', ward: 'stone' },
  ],

  introDialogue: [
    {
      id: 'intro_1', background: 'forest_village',
      lines: [
        { speaker: 'narrator', text: "Le Creux du Coupeur. Un village de bûcherons au cœur de la forêt. Ici, on coupe le bois le jour et on prie la nuit." },
        { speaker: 'narrator', text: "Leesha Paper, fille du propriétaire du papetier, est apprentie chez Bruna, la vieille herboriste du village." },
        { speaker: 'narrator', text: "Bruna est la dernière à connaître les secrets des herbes et des onguents de rune. À sa mort, ce savoir disparaîtra." },
      ],
      nextNodeId: 'intro_2',
    },
    {
      id: 'intro_2', background: 'forest_village',
      lines: [
        { speaker: 'leesha_young', text: "Bruna, les runes de la place du marché sont usés. Le bois est pourri par la pluie.", emotion: 'scared' },
        { speaker: 'bruna', text: "Je sais, petite. Mais ces idiots de bûcherons refusent de les refaire. Trop occupés à couper du bois.", emotion: 'angry' },
        { speaker: 'bruna', text: "On n'a que deux types de runes fiables : la Pierre, qui repousse les démons, et le Vent, qui les dévie. C'est tout ce que le village connaît.", emotion: 'neutral' },
        { speaker: 'leesha_young', text: "Et si je préparais des onguents de renforcement ? Ça pourrait tenir quelques nuits de plus.", emotion: 'determined' },
        { speaker: 'bruna', text: "Ha ! Tu apprends vite. Fais-le. Et prépare aussi des cataplasmes — on en aura besoin.", emotion: 'neutral' },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'l_day1', background: 'bruna_hut',
        lines: [
          { speaker: 'bruna', text: "Leesha, viens ici. Il est temps que tu apprennes à préparer l'encre de rune.", emotion: 'neutral' },
          { speaker: 'narrator', text: "Bruna sort des bocaux d'herbes séchées, un mortier, et une fiole d'encre noire épaisse." },
          { speaker: 'bruna', text: "L'encre ordinaire s'efface en quelques semaines. Celle-ci, faite avec les bonnes herbes, tient des mois. La différence entre la vie et la mort.", emotion: 'determined' },
          { speaker: 'leesha_young', text: "Et les cataplasmes ? On en a presque plus.", emotion: 'scared' },
          { speaker: 'bruna', text: "C'est le choix que tu dois faire, petite. On a assez d'herbes pour préparer l'encre ou les cataplasmes. Pas les deux.", emotion: 'neutral' },
        ],
        choices: [
          {
            id: 'make_ink',
            label: "Préparer l'encre de rune renforcée",
            hint: "+3 Encre à la Maison de Bruna (pour crafter des runes)",
            effects: [
              { type: 'add_resources', locationId: 'miln', resource: 'ink', amount: 3 },
            ],
          },
          {
            id: 'make_poultices',
            label: "Préparer des cataplasmes de soin",
            hint: "+2 Nourriture partout (les cataplasmes soutiennent la population)",
            effects: [
              { type: 'add_resources', locationId: 'cutters_hollow', resource: 'food', amount: 2 },
              { type: 'add_resources', locationId: 'lakton', resource: 'food', amount: 2 },
              { type: 'add_resources', locationId: 'miln', resource: 'food', amount: 2 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'l_day2', background: 'refugees',
        lines: [
          { speaker: 'narrator', text: "Des blessés arrivent de fermes voisines. La nuit dernière a été terrible." },
          { speaker: 'leesha_young', text: "Bruna ! Il y a au moins dix blessés. Je n'ai pas assez de cataplasmes.", emotion: 'scared' },
          { speaker: 'bruna', text: "Alors tu choisis, petite. Soigner les blessés ou renforcer les runes. On ne peut pas tout faire.", emotion: 'sad' },
        ],
        choices: [
          {
            id: 'heal_wounded',
            label: "Soigner les blessés",
            hint: "+3 Population à la Place du Marché, mais -1 AP",
            effects: [
              { type: 'modify_population', locationId: 'lakton', delta: 3 },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'reinforce_wards',
            label: "Renforcer les runes en priorité",
            hint: "+1 Rune de Pierre à la Place du Marché",
            effects: [
              { type: 'bonus_ward', wardType: 'stone', locationId: 'lakton' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 3,
      dialogueNodes: [{
        id: 'l_day3', background: 'bruna_hut',
        lines: [
          { speaker: 'narrator', text: "Bruna est épuisée. Elle tousse, mais refuse de se coucher." },
          { speaker: 'bruna', text: "Leesha... écoute-moi. Cette nuit sera la pire. Je le sens dans mes os.", emotion: 'sad' },
          { speaker: 'leesha_young', text: "Bruna, vous devez vous reposer—", emotion: 'scared' },
          { speaker: 'bruna', text: "Tais-toi et écoute ! On a assez d'encre pour renforcer tous les runes du village. Mais je suis trop faible. C'est toi qui devras le faire seule.", emotion: 'determined' },
          { speaker: 'leesha_young', text: "Moi ? Toute seule ? Je n'ai pas votre expérience...", emotion: 'scared' },
          { speaker: 'bruna', text: "Tu sais tracer un rune, oui ou non ? Alors choisis : passer l'après-midi à renforcer les runes, ou rester ici à me soigner.", emotion: 'angry' },
        ],
        choices: [
          {
            id: 'reinforce_all',
            label: "Renforcer tous les runes du village",
            hint: "+1 Rune de Pierre à chaque lieu, mais Bruna sans soin (-2 HP héros de fatigue)",
            effects: [
              { type: 'bonus_ward', wardType: 'stone', locationId: 'miln' },
              { type: 'bonus_ward', wardType: 'stone', locationId: 'lakton' },
              { type: 'hero_hp_change', delta: -2 },
            ],
          },
          {
            id: 'care_for_bruna',
            label: "Rester soigner Bruna",
            hint: "+4 HP héros, +2 Nourriture partout",
            effects: [
              { type: 'hero_hp_change', delta: 4 },
              { type: 'add_resources', locationId: 'cutters_hollow', resource: 'food', amount: 2 },
              { type: 'add_resources', locationId: 'lakton', resource: 'food', amount: 2 },
            ],
          },
        ],
      }],
    },
  ],

  victoryDialogue: [{
    id: 'l_victory', background: 'dawn_victory',
    lines: [
      { speaker: 'narrator', text: "L'aube se lève sur Le Creux du Coupeur. Le village respire encore." },
      { speaker: 'bruna', text: "Tu as bien fait, petite. Mieux que je ne l'aurais cru.", emotion: 'hopeful' },
      { speaker: 'leesha_young', text: "J'ai tellement à apprendre encore...", emotion: 'determined' },
      { speaker: 'bruna', text: "Tu apprendras. Tu es l'herboriste maintenant. Ce village dépend de toi.", emotion: 'neutral' },
      { speaker: 'narrator', text: "Leesha Paper accepte son destin. Elle sera le bouclier de Le Creux du Coupeur." },
    ],
  }],

  defeatDialogue: [{
    id: 'l_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Les runes cèdent. Le Creux du Coupeur est submergé." },
      { speaker: 'bruna', text: "Fuis, Leesha. Fuis et emporte ce que je t'ai appris.", emotion: 'sad' },
      { speaker: 'leesha_young', text: "Je ne vous abandonnerai pas !", emotion: 'determined' },
      { speaker: 'narrator', text: "Mais Bruna la pousse dehors et referme la porte. Le dernier acte d'une vieille femme courage." },
      { speaker: 'narrator', text: "Chapitre 2 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 3: Jardir — Le Labyrinthe de Krasia
// ============================================================

export const CHAPTER_JARDIR: ChapterDefinition = {
  id: 3,
  act: 1,
  title: 'Le Labyrinthe de Krasia',
  subtitle: "La première nuit de Jardir dans le Labyrinthe.",
  heroId: 'jardir_young',
  nightCount: 3,
  startingNightNumber: 2,
  startingPresence: 'desert_spear',
  hiddenLocations: ['lakton'] as any,
  locationOverrides: {
    desert_spear: { name: 'Entrée du Labyrinthe', startPop: 6, terrain: 'underground' as any },
    cutters_hollow: { name: 'Couloir des Sharum', startPop: 5, terrain: 'underground' as any },
    miln: { name: 'Salle du Puits', startPop: 4, terrain: 'underground' as any },
    lakton: { name: '', startPop: 0 },
  },
  preplacedWards: [
    { locationId: 'desert_spear', ward: 'fire' },
    { locationId: 'desert_spear', ward: 'stone' },
    { locationId: 'cutters_hollow', ward: 'fire' },
  ],

  introDialogue: [
    {
      id: 'intro_1', background: 'krasia',
      lines: [
        { speaker: 'narrator', text: "Fort Krasia. La cité du désert. Ici, les hommes ne se cachent pas des démons. Ils les combattent." },
        { speaker: 'narrator', text: "Chaque nuit, les guerriers Sharum descendent dans le Labyrinthe — un labyrinthe de tunnels sous la ville, piégé de runes." },
        { speaker: 'narrator', text: "C'est dans le Labyrinthe que les chtoniens montent. C'est dans le Labyrinthe qu'on les tue." },
      ],
      nextNodeId: 'intro_2',
    },
    {
      id: 'intro_2', background: 'maze',
      lines: [
        { speaker: 'narrator', text: "Ahmann Jardir, fils de rien, orphelin des rues de Krasia. Aujourd'hui, c'est sa première nuit en tant que Sharum." },
        { speaker: 'jardir_young', text: "Je suis prêt, Drillmaster.", emotion: 'determined' },
        { speaker: 'drillmaster', text: "Prêt ? Ha ! On verra si tu es toujours vivant demain. Prends ta lance et descends.", emotion: 'angry' },
        { speaker: 'jardir_young', text: "Everam me protège.", emotion: 'determined' },
        { speaker: 'drillmaster', text: "Everam aide ceux qui se battent. Les lâches, il les laisse mourir.", emotion: 'neutral' },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'j_day1', background: 'maze',
        lines: [
          { speaker: 'narrator', text: "Entre les nuits de combat, les Sharum réparent les runes du Labyrinthe et aiguisent leurs lances." },
          { speaker: 'jardir_young', text: "Les runes du couloir sud sont faibles. Si les chtoniens percent, ils atteindront les nie'Sharum.", emotion: 'determined' },
          { speaker: 'drillmaster', text: "Tu veux dépenser nos guerriers à renforcer les runes, ou garder tes forces pour le combat ?", emotion: 'neutral' },
        ],
        choices: [
          {
            id: 'reinforce_maze',
            label: "Renforcer les runes du Labyrinthe",
            hint: "+1 Rune de Vent au Couloir, -1 AP",
            effects: [
              { type: 'bonus_ward', wardType: 'wind', locationId: 'cutters_hollow' },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'save_strength',
            label: "Garder ses forces pour le combat",
            hint: "+2 HP, les guerriers se reposent",
            effects: [
              { type: 'hero_hp_change', delta: 2 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'j_day2', background: 'maze',
        lines: [
          { speaker: 'narrator', text: "La deuxième nuit a coûté cher. Trois Sharum sont tombés. Jardir a survécu, de justesse." },
          { speaker: 'jardir_young', text: "Hasik est blessé. Il ne peut plus tenir sa lance.", emotion: 'sad' },
          { speaker: 'drillmaster', text: "Alors il est inutile. Laisse-le.", emotion: 'angry' },
          { speaker: 'jardir_young', text: "C'est mon frère d'armes !", emotion: 'angry' },
        ],
        choices: [
          {
            id: 'carry_hasik',
            label: "Porter Hasik vers la surface",
            hint: "+2 Pop à l'Entrée (Hasik rallie d'autres blessés), mais -2 AP",
            effects: [
              { type: 'modify_population', locationId: 'desert_spear', delta: 2 },
              { type: 'hero_ap_change', delta: -2 },
              { type: 'set_flag', flag: 'saved_hasik', value: true },
            ],
          },
          {
            id: 'leave_hasik',
            label: "Obéir au Drillmaster — le laisser",
            hint: "+1 Rune de Pierre à la Salle du Puits",
            effects: [
              { type: 'bonus_ward', wardType: 'stone', locationId: 'miln' },
              { type: 'set_flag', flag: 'saved_hasik', value: false },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 3,
      dialogueNodes: [{
        id: 'j_day3', background: 'maze',
        lines: [
          { speaker: 'narrator', text: "La troisième nuit approche. Les tunnels grondent. Quelque chose de gros monte des profondeurs." },
          { speaker: 'drillmaster', text: "Un démon de roche. Peut-être un prince. Bande de lâches, qui va descendre le premier ?", emotion: 'angry' },
          { speaker: 'narrator', text: "Les Sharum reculent. Même les vétérans hésitent." },
          { speaker: 'jardir_young', text: "J'irai.", emotion: 'determined' },
          { speaker: 'drillmaster', text: "Toi ? Le gamin des rues ?", emotion: 'neutral' },
          { speaker: 'jardir_young', text: "Everam m'a mis sur cette terre pour combattre les démons. Pas pour fuir.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'lead_charge',
            label: "Mener la charge en premier",
            hint: "-3 HP (blessures), mais force des démons -1 (panique dans leurs rangs)",
            effects: [
              { type: 'hero_hp_change', delta: -3 },
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'set_flag', flag: 'led_charge', value: true },
            ],
          },
          {
            id: 'strategic_defense',
            label: "Défense stratégique derrière les runes",
            hint: "+1 Rune de Feu à chaque lieu",
            effects: [
              { type: 'bonus_ward', wardType: 'fire', locationId: 'desert_spear' },
              { type: 'bonus_ward', wardType: 'fire', locationId: 'cutters_hollow' },
            ],
          },
        ],
      }],
    },
  ],

  victoryDialogue: [{
    id: 'j_victory', background: 'krasia',
    lines: [
      { speaker: 'narrator', text: "L'aube. Les chtoniens se retirent dans les profondeurs. Le Labyrinthe tient." },
      { speaker: 'drillmaster', text: "Trois nuits. Et le gamin des rues est toujours debout.", emotion: 'neutral' },
      { speaker: 'jardir_young', text: "Je ne suis plus un gamin.", emotion: 'determined' },
      { speaker: 'narrator', text: "Le Drillmaster hoche la tête. Pour la première fois, il regarde Jardir avec respect." },
      { speaker: 'narrator', text: "Ahmann Jardir. Un jour, ils l'appelleront Shar'Dama Ka — Celui Qui Voit dans la Nuit." },
    ],
  }],

  defeatDialogue: [{
    id: 'j_defeat', background: 'maze',
    lines: [
      { speaker: 'narrator', text: "Le Labyrinthe cède. Les chtoniens remontent vers la surface." },
      { speaker: 'drillmaster', text: "REPLI ! TOUS EN HAUT !", emotion: 'angry' },
      { speaker: 'narrator', text: "Jardir est le dernier à remonter. Derrière lui, les tunnels résonnent de hurlements." },
      { speaker: 'jardir_young', text: "Un jour, je reviendrai. Et ce jour-là, les démons trembleront.", emotion: 'angry' },
      { speaker: 'narrator', text: "Chapitre 3 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 4: Rojer — Le Jongleur de Riverbridge
// ============================================================

export const CHAPTER_ROJER: ChapterDefinition = {
  id: 4,
  act: 1,
  title: 'Le Jongleur de Pont-de-Rivière',
  subtitle: "La nuit où Rojer a découvert le pouvoir de la musique.",
  heroId: 'rojer_young',
  nightCount: 3,
  startingNightNumber: 1,
  startingPresence: 'cutters_hollow',
  hiddenLocations: ['desert_spear', 'lakton'] as any,
  locationOverrides: {
    cutters_hollow: { name: 'Auberge de Pont-de-Rivière', startPop: 5, terrain: 'plains' as any },
    miln: { name: 'Pont du Village', startPop: 4, terrain: 'plains' as any },
    desert_spear: { name: '', startPop: 0 },
    lakton: { name: '', startPop: 0 },
  },
  availableWards: ['stone', 'wind'] as WardType[],
  preplacedWards: [
    { locationId: 'cutters_hollow', ward: 'stone' },
    { locationId: 'cutters_hollow', ward: 'wind' },
    { locationId: 'miln', ward: 'stone' },
  ],

  introDialogue: [
    {
      id: 'intro_1', background: 'inn',
      lines: [
        { speaker: 'narrator', text: "Pont-de-Rivière. Un village de passage entre Fort Miln et les plaines du sud." },
        { speaker: 'narrator', text: "Rojer Inn a trois ans. Il ne comprend pas pourquoi sa mère pleure chaque soir quand le soleil se couche." },
        { speaker: 'narrator', text: "Son père, Jessum, est jongleur. Il joue du violon pour distraire les voyageurs — et pour garder le courage quand la nuit tombe." },
      ],
      nextNodeId: 'intro_2',
    },
    {
      id: 'intro_2', background: 'inn',
      lines: [
        { speaker: 'narrator', text: "L'auberge est protégée par les seuls runes que connaissent les villageois : Pierre et Vent. Des défenses simples, juste assez pour repousser les chtoniens." },
        { speaker: 'narrator', text: "Mais cette nuit, les runes ont été endommagés par la pluie. Jessum joue plus fort que d'habitude, comme s'il sentait le danger." },
        { speaker: 'rojer_young', text: "Papa, pourquoi tu joues si fort ?", emotion: 'scared' },
        { speaker: 'narrator', text: "Jessum sourit à son fils, mais ses yeux sont terrifiés." },
        { speaker: 'narrator', text: "Et puis la nuit tombe." },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'r_day1', background: 'inn',
        lines: [
          { speaker: 'narrator', text: "Rojer a grandi. Il a quinze ans maintenant, apprenti jongleur, orphelin depuis cette nuit à Pont-de-Rivière." },
          { speaker: 'narrator', text: "Son maître Arrick lui a appris le violon, mais aussi l'art de survivre dans un monde de monstres." },
          { speaker: 'rojer_young', text: "Arrick, les runes du pont sont fissurés.", emotion: 'scared' },
          { speaker: 'arrick', text: "Et alors ? C'est pas notre problème. On joue ce soir, on part demain.", emotion: 'neutral' },
          { speaker: 'rojer_young', text: "On ne peut pas juste... partir ?", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'fix_bridge_wards',
            label: "Réparer les runes du pont",
            hint: "+1 Rune de Pierre au Pont, -1 AP",
            effects: [
              { type: 'bonus_ward', wardType: 'stone', locationId: 'miln' },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'play_music',
            label: "Jouer du violon pour le moral du village",
            hint: "+2 Pop à l'Auberge (les gens restent protégés ensemble)",
            effects: [
              { type: 'modify_population', locationId: 'cutters_hollow', delta: 2 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'r_day2', background: 'inn',
        lines: [
          { speaker: 'narrator', text: "La nuit dernière, Rojer a joué du violon pendant l'attaque. Et quelque chose d'étrange s'est passé." },
          { speaker: 'rojer_young', text: "Arrick... quand je jouais, les démons... ils se sont arrêtés. Juste un instant.", emotion: 'hopeful' },
          { speaker: 'arrick', text: "Tu délires, gamin. La musique n'arrête pas les chtoniens.", emotion: 'angry' },
          { speaker: 'rojer_young', text: "Je sais ce que j'ai vu.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'practice_charm',
            label: "S'entraîner à la mélodie qui calme les démons",
            hint: "Force des démons -1 cette nuit (l'effet du charme)",
            effects: [
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'set_flag', flag: 'discovered_charm', value: true },
            ],
          },
          {
            id: 'help_village',
            label: "Aider le village à renforcer les défenses",
            hint: "+3 Bois et +2 Encre à l'Auberge",
            effects: [
              { type: 'add_resources', locationId: 'cutters_hollow', resource: 'wood', amount: 3 },
              { type: 'add_resources', locationId: 'cutters_hollow', resource: 'ink', amount: 2 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 3,
      dialogueNodes: [{
        id: 'r_day3', background: 'inn',
        lines: [
          { speaker: 'narrator', text: "L'avant-dernière nuit. Arrick est ivre. Les runes craquent." },
          { speaker: 'arrick', text: "On va mourir ici, gamin. Comme tes parents.", emotion: 'scared' },
          { speaker: 'rojer_young', text: "Taisez-vous !", emotion: 'angry' },
          { speaker: 'narrator', text: "Rojer prend le violon de son père. Celui que Jessum jouait la nuit de Pont-de-Rivière. Les cordes vibrent sous ses doigts." },
          { speaker: 'rojer_young', text: "Si la musique peut les ralentir... alors je jouerai toute la nuit s'il le faut.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'play_all_night',
            label: "Jouer toute la nuit (le charme du violon)",
            hint: "-3 HP (épuisement), mais -1 démon par vague",
            effects: [
              { type: 'hero_hp_change', delta: -3 },
              { type: 'extra_demons', count: -1 },
            ],
          },
          {
            id: 'stay_behind_wards',
            label: "Rester derrière les runes, jouer prudemment",
            hint: "+1 Rune de Feu en réserve",
            effects: [
              { type: 'bonus_reserve_ward', wardType: 'fire' },
            ],
          },
        ],
      }],
    },
  ],

  victoryDialogue: [{
    id: 'r_victory', background: 'dawn_victory',
    lines: [
      { speaker: 'narrator', text: "L'aube. Rojer a les doigts en sang, mais le village tient." },
      { speaker: 'narrator', text: "Les villageois le regardent avec un mélange de crainte et d'admiration. Un garçon qui chante aux démons." },
      { speaker: 'arrick', text: "Ce que tu as fait cette nuit... c'est impossible.", emotion: 'scared' },
      { speaker: 'rojer_young', text: "Et pourtant.", emotion: 'determined' },
      { speaker: 'narrator', text: "Rojer Inn. Le Jongleur de Fidèle. L'homme dont la musique fait trembler les chtoniens." },
    ],
  }],

  defeatDialogue: [{
    id: 'r_defeat', background: 'village_burning',

    lines: [
      { speaker: 'narrator', text: "Le violon se brise. Les runes cèdent. Le charme est rompu." },
      { speaker: 'arrick', text: "COURS, ROJER !", emotion: 'scared' },
      { speaker: 'narrator', text: "Rojer fuit dans la nuit, serrant contre lui les morceaux du violon de son père." },
      { speaker: 'rojer_young', text: "Un jour, je jouerai assez fort pour que tous les démons m'entendent.", emotion: 'angry' },
      { speaker: 'narrator', text: "Chapitre 4 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 5: Arlen — La Route vers Fort Miln
// L'histoire diverge selon les choix du chapitre 1
// ============================================================

export const CHAPTER_ARLEN_2: ChapterDefinition = {
  id: 5,
  act: 2,
  title: 'La Route vers Fort Miln',
  subtitle: "Cinq jours de marche. Cinq nuits sans murs.",
  heroId: 'arlen_young',
  nightCount: 3,
  startingNightNumber: 2,
  startingPresence: 'cutters_hollow',
  hiddenLocations: ['lakton', 'desert_spear'] as any,
  locationOverrides: {
    cutters_hollow: { name: 'Campement du Soir', startPop: 4, terrain: 'plains' as any },
    miln: { name: 'Relais de Messager', startPop: 3, terrain: 'plains' as any },
    lakton: { name: '', startPop: 0 },
    desert_spear: { name: '', startPop: 0 },
  },
  preplacedWards: [
    { locationId: 'cutters_hollow', ward: 'fire' },
    { locationId: 'miln', ward: 'stone' },
  ],

  introDialogue: [
    {
      id: 'a2_intro', background: 'road',
      lines: [
        { speaker: 'narrator', text: "Arlen a quitté Ruisseau de Tibbet. Devant lui, cinq jours de route à travers les plaines de Thesa. Cinq nuits en plein air." },
        { speaker: 'narrator', text: "Les seuls abris sont les relais de messagers — de petites cabanes runées, espacées d'une journée de marche. Si les runes tiennent." },
        { speaker: 'narrator', text: "Arlen ne connaît que les runes basiques : feu et pierre. À Ruisseau de Tibbet, c'est tout ce qu'on enseigne. Personne n'en sait plus." },
        { speaker: 'arlen_young', text: "Il doit y avoir d'autres runes. Des runes plus puissants. Je les trouverai.", emotion: 'determined' },
      ],
    },
  ],

  dayEvents: [
    // Jour 1 — Branche : avec Ragen (a sauvé Silvy) ou seul (n'a pas sauvé)
    {
      dayNumber: 1,
      condition: { flag: 'saved_silvy', value: true },
      dialogueNodes: [{
        id: 'a2_day1_ragen', background: 'road',
        lines: [
          { speaker: 'ragen', text: "Premier relais. Les runes sont intacts. On a de la chance.", emotion: 'neutral' },
          { speaker: 'arlen_young', text: "Ragen, ces symboles sur les poteaux... ils sont différents de ceux de Ruisseau de Tibbet.", emotion: 'hopeful' },
          { speaker: 'ragen', text: "C'est du travail de Messager. On utilise des cercles de protection complets, pas juste des lignes. Ça couvre une plus grande surface.", emotion: 'neutral' },
          { speaker: 'arlen_young', text: "Apprenez-moi.", emotion: 'determined' },
          { speaker: 'ragen', text: "D'accord. Mais ça prend du temps. Tu apprends les cercles, ou tu renforces les runes existants.", emotion: 'neutral' },
        ],
        choices: [
          {
            id: 'learn_circles',
            label: "Apprendre les cercles de protection",
            hint: "+1 Rune de Pierre en réserve (nouvelle technique), -1 AP",
            effects: [
              { type: 'bonus_reserve_ward', wardType: 'stone' },
              { type: 'hero_ap_change', delta: -1 },
              { type: 'set_flag', flag: 'learned_circles', value: true },
            ],
          },
          {
            id: 'reinforce_relay',
            label: "Renforcer les runes du relais",
            hint: "+2 Bois + +2 Encre au Relais",
            effects: [
              { type: 'add_resources', locationId: 'miln', resource: 'wood', amount: 2 },
              { type: 'add_resources', locationId: 'miln', resource: 'ink', amount: 2 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 1,
      condition: { flag: 'saved_silvy', value: false },
      dialogueNodes: [{
        id: 'a2_day1_alone', background: 'road',
        lines: [
          { speaker: 'narrator', text: "Arlen est seul. Ragen est parti avant lui, sans savoir qu'un garçon le suivrait sur la route." },
          { speaker: 'narrator', text: "Le premier relais de messager est en mauvais état. Les runes sont fissurés, le toit percé." },
          { speaker: 'arlen_young', text: "C'est tout ce que j'ai. Il faudra que ça suffise.", emotion: 'determined' },
          { speaker: 'narrator', text: "Arlen examine les runes. Ils sont différents de ceux de son village. Plus complexes. Il essaie de comprendre." },
        ],
        choices: [
          {
            id: 'study_wards_alone',
            label: "Étudier les runes inconnus",
            hint: "+1 Rune de Vent en réserve (copié tant bien que mal), -2 HP (fatigue)",
            effects: [
              { type: 'bonus_reserve_ward', wardType: 'wind' },
              { type: 'hero_hp_change', delta: -2 },
            ],
          },
          {
            id: 'patch_wards',
            label: "Réparer les runes avec ce qu'on connaît",
            hint: "+3 Bois au Campement",
            effects: [
              { type: 'add_resources', locationId: 'cutters_hollow', resource: 'wood', amount: 3 },
            ],
          },
        ],
      }],
    },
    // Jour 2 — commun
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'a2_day2', background: 'road',
        lines: [
          { speaker: 'narrator', text: "Deuxième nuit survécue. Arlen n'a presque pas dormi. Les grattements des chtoniens contre les runes résonnent encore dans sa tête." },
          { speaker: 'narrator', text: "Le prochain relais est censé être à une demi-journée de marche. Mais la route est en mauvais état." },
          { speaker: 'arlen_young', text: "Il y a des traces de chtoniens partout. Plus que la nuit dernière.", emotion: 'scared' },
        ],
        choices: [
          {
            id: 'push_forward',
            label: "Accélérer pour atteindre le relais",
            hint: "+1 Rune de Feu au Relais, -1 AP (épuisement)",
            effects: [
              { type: 'bonus_ward', wardType: 'fire', locationId: 'miln' },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'camp_early',
            label: "Camper tôt et bien préparer les défenses",
            hint: "+2 Bois + +2 Encre au Campement",
            effects: [
              { type: 'add_resources', locationId: 'cutters_hollow', resource: 'wood', amount: 2 },
              { type: 'add_resources', locationId: 'cutters_hollow', resource: 'ink', amount: 2 },
            ],
          },
        ],
      }],
    },
    // Jour 3
    {
      dayNumber: 3,
      dialogueNodes: [{
        id: 'a2_day3', background: 'miln',
        lines: [
          { speaker: 'narrator', text: "Dernier jour. Les tours de Fort Miln se dressent à l'horizon, énormes, imposantes. Des murs couverts de runes par milliers." },
          { speaker: 'arlen_young', text: "On y est presque... une dernière nuit.", emotion: 'hopeful' },
          { speaker: 'narrator', text: "Mais cette nuit sera la plus dangereuse. La plaine devant Miln est dégagée — aucun couvert, aucun relais. Les chtoniens de vent y sont particulièrement actifs." },
        ],
        choices: [
          {
            id: 'dig_in',
            label: "Creuser un cercle de protection dans le sol",
            hint: "-2 HP (effort physique), mais force des démons -1",
            effects: [
              { type: 'hero_hp_change', delta: -2 },
              { type: 'demon_strength_bonus', bonus: -1 },
            ],
          },
          {
            id: 'minimal_camp',
            label: "Campement minimal, garder ses forces",
            hint: "+2 HP (repos), mais +1 démon par vague",
            effects: [
              { type: 'hero_hp_change', delta: 2 },
              { type: 'extra_demons', count: 1 },
            ],
          },
        ],
      }],
    },
  ],

  victoryDialogue: [
    {
      id: 'a2_victory', background: 'miln',
      lines: [
        { speaker: 'narrator', text: "L'aube. Fort Miln. Les portes s'ouvrent." },
        { speaker: 'narrator', text: "Arlen lève les yeux. Les murs sont couverts de runes qu'il n'a jamais vus. Des centaines de symboles, gravés dans la pierre depuis des générations." },
        { speaker: 'arlen_young', text: "Tout ce savoir... tout ce qu'on a oublié à Ruisseau de Tibbet...", emotion: 'hopeful' },
        { speaker: 'narrator', text: "Ici, Arlen apprendra. Les runes de protection, les cercles complets, les techniques des Messagers. Et peut-être, un jour, quelque chose de plus." },
        { speaker: 'narrator', text: "Mais pour l'instant, il n'est qu'un garçon affamé aux portes d'une ville immense." },
        { speaker: 'arlen_young', text: "Je suis Arlen Bales. De Ruisseau de Tibbet. Et je refuse d'avoir peur.", emotion: 'determined' },
      ],
    },
  ],

  defeatDialogue: [
    {
      id: 'a2_defeat', background: 'village_burning',
      lines: [
        { speaker: 'narrator', text: "Les runes cèdent dans la plaine. Les chtoniens de vent fondent sur le campement." },
        { speaker: 'narrator', text: "Arlen court vers les lumières de Miln. Les murs sont si proches qu'il peut voir les runes briller." },
        { speaker: 'narrator', text: "Mais la nuit est plus rapide que lui." },
        { speaker: 'narrator', text: "Chapitre 5 — Échec" },
      ],
    },
  ],
};

// ============================================================
// Chapter 6: Leesha — L'Attaque de Cutter's Hollow
// ============================================================

export const CHAPTER_LEESHA_2: ChapterDefinition = {
  id: 6,
  act: 2,
  title: "L'Attaque de Le Creux du Coupeur",
  subtitle: "Sans Bruna, Leesha est la seule à pouvoir protéger le village.",
  heroId: 'leesha_young',
  nightCount: 3,
  startingNightNumber: 3,
  startingPresence: 'cutters_hollow',
  hiddenLocations: ['desert_spear'] as any,
  locationOverrides: {
    cutters_hollow: { name: "Le Creux du Coupeur", startPop: 8, terrain: 'forest' as any },
    miln: { name: 'Cabane de Bruna', startPop: 3, terrain: 'forest' as any },
    lakton: { name: 'Scierie', startPop: 5, terrain: 'forest' as any },
    desert_spear: { name: '', startPop: 0 },
  },
  preplacedWards: [
    { locationId: 'cutters_hollow', ward: 'fire' },
    { locationId: 'cutters_hollow', ward: 'stone' },
    { locationId: 'lakton', ward: 'fire' },
  ],

  introDialogue: [
    {
      id: 'l2_bruna_death', background: 'bruna_hut',
      lines: [
        { speaker: 'narrator', text: "La chandelle s'était éteinte dans la nuit. Quand Leesha entra dans la cabane à l'aube, elle sut tout de suite." },
        { speaker: 'leesha_young', text: "Bruna...?", emotion: 'scared' },
        { speaker: 'narrator', text: "La vieille herboriste gisait dans son lit, immobile. Un sourire paisible sur les lèvres, comme si la mort n'avait été qu'une vieille connaissance venue lui rendre visite." },
        { speaker: 'bruna', text: "...", emotion: 'sad' },
        { speaker: 'narrator', text: "Ses mains ridées serraient encore le livre de runes qu'elle avait légué à Leesha. Cent ans de savoir, transmis en quelques saisons." },
        { speaker: 'leesha_young', text: "Tu m'avais dit que tu serais toujours là. Tu m'avais promis...", emotion: 'sad' },
        { speaker: 'narrator', text: "Mais les promesses des mortels n'engagent que les vivants. Et Leesha était désormais seule." },
      ],
    },
    {
      id: 'l2_intro', background: 'forest_village',
      lines: [
        { speaker: 'narrator', text: "Les jours qui suivirent furent les plus longs de sa vie. Le village entier pleura Bruna, mais le deuil n'arrête pas les chtoniens." },
        { speaker: 'leesha_young', text: "Dans le livre de Bruna, j'ai trouvé des schémas que je n'avais jamais vus. Des runes de Feu — une connaissance oubliée depuis des générations.", emotion: 'hopeful' },
        { speaker: 'leesha_young', text: "Ces runes ne repoussent pas les démons. Ils les brûlent. Si je peux les reproduire...", emotion: 'determined' },
        { speaker: 'narrator', text: "Armée des runes de Pierre, de Vent, et désormais de Feu, Leesha devra prouver qu'elle est digne de l'héritage de Bruna." },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'l2_day1', background: 'forest_village',
        lines: [
          { speaker: 'narrator', text: "Les bûcherons de Le Creux du Coupeur regardent Leesha avec méfiance. Une gamine qui prétend remplacer Bruna ?" },
          { speaker: 'leesha_young', text: "Les runes de la scierie sont fissurés. Si on ne les répare pas, les hommes qui travaillent là-bas seront sans protection.", emotion: 'determined' },
          { speaker: 'narrator', text: "Le contremaître Smitt hésite." },
        ],
        choices: [
          {
            id: 'convince_smitt',
            label: "Convaincre Smitt de fournir du bois pour les runes",
            hint: "+3 Bois à la Scierie, mais -1 AP (négociations épuisantes)",
            effects: [
              { type: 'add_resources', locationId: 'lakton', resource: 'wood', amount: 3 },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'work_alone',
            label: "Travailler seule avec les réserves de Bruna",
            hint: "+2 Encre à la Cabane de Bruna",
            effects: [
              { type: 'add_resources', locationId: 'miln', resource: 'ink', amount: 2 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'l2_day2', background: 'refugees',
        lines: [
          { speaker: 'narrator', text: "La nuit a été violente. Des démons de bois ont arraché des arbres entiers pour les jeter contre les runes." },
          { speaker: 'leesha_young', text: "Il faut explorer la forêt autour du village. Bruna disait qu'il y avait d'anciennes pierres runées dans les bois.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'explore_forest',
            label: "Explorer la forêt (risqué mais prometteur)",
            hint: "+1 Rune de Pierre en réserve, -2 HP (blessure dans les ronces)",
            effects: [
              { type: 'bonus_reserve_ward', wardType: 'stone' },
              { type: 'hero_hp_change', delta: -2 },
              { type: 'set_flag', flag: 'explored_forest', value: true },
            ],
          },
          {
            id: 'fortify_village',
            label: "Rester au village et renforcer les défenses",
            hint: "+1 Rune de Feu à Le Creux du Coupeur",
            effects: [
              { type: 'bonus_ward', wardType: 'fire', locationId: 'cutters_hollow' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 3,
      dialogueNodes: [{
        id: 'l2_day3', background: 'forest_village',
        lines: [
          { speaker: 'narrator', text: "Dernière nuit. Les chtoniens sont de plus en plus agressifs, comme s'ils sentaient la faiblesse du village." },
          { speaker: 'leesha_young', text: "J'ai trouvé quelque chose dans les notes de Bruna. Une recette d'onguent qui renforce temporairement les runes.", emotion: 'hopeful' },
          { speaker: 'leesha_young', text: "Mais il faut toutes mes herbes. Si ça ne marche pas, je n'aurai plus rien pour soigner les blessés.", emotion: 'scared' },
        ],
        choices: [
          {
            id: 'use_ointment',
            label: "Préparer l'onguent de renforcement",
            hint: "Force des démons -1 cette nuit, mais pas de soin possible",
            effects: [
              { type: 'demon_strength_bonus', bonus: -1 },
            ],
          },
          {
            id: 'keep_herbs',
            label: "Garder les herbes pour les soins",
            hint: "+4 HP héros + +2 Pop au village",
            effects: [
              { type: 'hero_hp_change', delta: 4 },
              { type: 'modify_population', locationId: 'cutters_hollow', delta: 2 },
            ],
          },
        ],
      }],
    },
  ],

  victoryDialogue: [{
    id: 'l2_victory', background: 'dawn_victory',
    lines: [
      { speaker: 'narrator', text: "L'aube se lève. Le Creux du Coupeur tient debout." },
      { speaker: 'narrator', text: "Les villageois regardent Leesha différemment maintenant. Plus de méfiance. Du respect." },
      { speaker: 'leesha_young', text: "Bruna... j'espère que vous seriez fière.", emotion: 'sad' },
      { speaker: 'narrator', text: "Leesha Paper. L'herboriste de Le Creux du Coupeur. La protectrice." },
    ],
  }],

  defeatDialogue: [{
    id: 'l2_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Les runes de Le Creux du Coupeur cèdent. Les démons de bois envahissent le village dans un fracas d'arbres brisés." },
      { speaker: 'leesha_young', text: "Non... NON !", emotion: 'angry' },
      { speaker: 'narrator', text: "Leesha fuit avec les survivants. Bruna est partie, et maintenant le village aussi." },
      { speaker: 'narrator', text: "Chapitre 6 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 7: Jardir 2 — Le Sharum Ka
// Jardir conquiert le Maze et s'impose comme chef
// ============================================================

export const CHAPTER_JARDIR_2: ChapterDefinition = {
  id: 7,
  act: 2,
  title: 'Le Sharum Ka',
  subtitle: "Le Labyrinthe ne forge pas des soldats. Il forge des rois.",
  heroId: 'jardir_young',
  nightCount: 3,
  startingNightNumber: 4,
  startingPresence: 'desert_spear',
  hiddenLocations: ['lakton'] as any,
  availableWards: ['stone', 'wind', 'fire'] as WardType[],
  fireCanKill: false,
  locationOverrides: {
    desert_spear: { name: 'Cœur du Labyrinthe', startPop: 8, terrain: 'underground' as any },
    cutters_hollow: { name: 'Aile Ouest', startPop: 5, terrain: 'underground' as any },
    miln: { name: 'Fosse aux Démons', startPop: 4, terrain: 'underground' as any },
    lakton: { name: '', startPop: 0 },
  },
  preplacedWards: [
    { locationId: 'desert_spear', ward: 'fire' },
    { locationId: 'desert_spear', ward: 'stone' },
    { locationId: 'cutters_hollow', ward: 'wind' },
    { locationId: 'miln', ward: 'fire' },
  ],

  introDialogue: [
    {
      id: 'j2_intro_1', background: 'krasia',
      lines: [
        { speaker: 'narrator', text: "Trois ans ont passé depuis la première nuit de Jardir dans le Labyrinthe. Trois ans de sang, de sueur et de prières à Everam." },
        { speaker: 'narrator', text: "Le garçon des rues est devenu un guerrier. Mais dans le Labyrinthe, un guerrier n'est rien. Seul un chef peut changer le cours de la guerre." },
        { speaker: 'narrator', text: "Ce soir, le Sharum Ka — le commandant suprême des guerriers — est tombé au combat. Le Labyrinthe a besoin d'un nouveau meneur." },
      ],
      nextNodeId: 'j2_intro_2',
    },
    {
      id: 'j2_intro_2', background: 'maze',
      lines: [
        { speaker: 'drillmaster', text: "Le Sharum Ka est mort. Les hommes paniquent. Sans commandant, le Labyrinthe tombera cette nuit.", emotion: 'angry' },
        { speaker: 'jardir_young', text: "Alors je prendrai le commandement.", emotion: 'determined' },
        { speaker: 'drillmaster', text: "Toi ? Tu n'es qu'un kai'Sharum. Il y a des hommes plus anciens—", emotion: 'angry' },
        { speaker: 'jardir_young', text: "Des hommes plus anciens qui se terrent dans les couloirs arrière. Le Labyrinthe n'a pas besoin d'ancienneté. Il a besoin de courage.", emotion: 'determined' },
      ],
      nextNodeId: 'j2_intro_3',
    },
    {
      id: 'j2_intro_3', background: 'maze',
      lines: [
        { speaker: 'narrator', text: "Le drillmaster regarde Jardir. Il voit dans ses yeux la même flamme que chez les anciens Sharum Ka — ceux qui mouraient debout." },
        { speaker: 'drillmaster', text: "Alors prouve-le. Tiens le Labyrinthe trois nuits, et les hommes te suivront.", emotion: 'neutral' },
        { speaker: 'jardir_young', text: "Trois nuits ? Je tiendrai le Labyrinthe jusqu'à ce qu'il n'y ait plus un seul démon sous Krasia.", emotion: 'determined' },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'j2_day1', background: 'maze',
        lines: [
          { speaker: 'narrator', text: "La première nuit sous le commandement de Jardir. Les pertes ont été lourdes, mais le Labyrinthe tient." },
          { speaker: 'jardir_young', text: "Les runes de l'Aile Ouest sont faibles. Les chtoniens de pierre les fracturent à chaque assaut.", emotion: 'determined' },
          { speaker: 'drillmaster', text: "On peut envoyer des nie'Sharum renforcer les runes, ou les garder pour porter les blessés.", emotion: 'neutral' },
        ],
        choices: [
          {
            id: 'reinforce_west',
            label: "Envoyer les nie'Sharum renforcer l'Aile Ouest",
            hint: "+1 Rune de Pierre à l'Aile Ouest, -1 AP",
            effects: [
              { type: 'bonus_ward', wardType: 'stone', locationId: 'cutters_hollow' },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'evacuate_wounded',
            label: "Évacuer les blessés vers le Cœur du Labyrinthe",
            hint: "+2 Population au Cœur du Labyrinthe",
            effects: [
              { type: 'modify_population', locationId: 'desert_spear', delta: 2 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'j2_day2', background: 'maze',
        lines: [
          { speaker: 'narrator', text: "Deuxième nuit passée. Jardir n'a pas dormi. Il parcourt les couloirs, lance au poing, encourageant chaque guerrier." },
          { speaker: 'jardir_young', text: "J'ai repéré un passage que les chtoniens utilisent pour contourner nos runes. Si on le piège avec du feu...", emotion: 'determined' },
          { speaker: 'drillmaster', text: "C'est risqué. Tu devras poser les runes toi-même, au plus profond du Labyrinthe.", emotion: 'neutral' },
        ],
        choices: [
          {
            id: 'trap_passage',
            label: "Descendre piéger le passage avec des runes de feu",
            hint: "+1 Rune de Feu à la Fosse, -2 HP (embuscade de chtoniens)",
            effects: [
              { type: 'bonus_ward', wardType: 'fire', locationId: 'miln' },
              { type: 'hero_hp_change', delta: -2 },
            ],
          },
          {
            id: 'hold_position',
            label: "Consolider les positions actuelles",
            hint: "+3 Bois au Cœur du Labyrinthe, +2 Encre",
            effects: [
              { type: 'add_resources', locationId: 'desert_spear', resource: 'wood', amount: 3 },
              { type: 'add_resources', locationId: 'desert_spear', resource: 'ink', amount: 2 },
            ],
          },
        ],
      }],
    },
  ],

  victoryDialogue: [
    {
      id: 'j2_victory_1', background: 'dawn_victory',
      lines: [
        { speaker: 'narrator', text: "Trois nuits. Le Labyrinthe tient. Et les guerriers Sharum regardent Jardir avec un respect nouveau." },
        { speaker: 'drillmaster', text: "J'ai combattu sous trois Sharum Ka. Aucun n'avait ton feu, gamin.", emotion: 'hopeful' },
        { speaker: 'jardir_young', text: "Ce n'est pas du feu. C'est la volonté d'Everam.", emotion: 'determined' },
      ],
      nextNodeId: 'j2_victory_2',
    },
    {
      id: 'j2_victory_2', background: 'krasia',
      lines: [
        { speaker: 'narrator', text: "Le lendemain, devant les guerriers assemblés, le Andrah proclame Ahmann Jardir Sharum Ka de Fort Krasia." },
        { speaker: 'narrator', text: "Le plus jeune commandant de l'histoire de Krasia. L'homme qui tiendra le Labyrinthe contre les forces de Nie." },
        { speaker: 'jardir_young', text: "Un jour, nous ne défendrons plus. Un jour, nous attaquerons.", emotion: 'determined' },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'j2_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Le Labyrinthe s'effondre. Les chtoniens submergent les guerriers, couloir après couloir." },
      { speaker: 'drillmaster', text: "Repli ! REPLI ! Scellez les tunnels !", emotion: 'scared' },
      { speaker: 'jardir_young', text: "Non... Je ne fuirai pas. Everam, donne-moi la force...", emotion: 'angry' },
      { speaker: 'narrator', text: "Mais Everam ne répond pas. Le Labyrinthe est perdu. Et avec lui, le rêve de Jardir." },
      { speaker: 'narrator', text: "Chapitre 7 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 8: Rojer 2 — La Mort d'Arrick
// Rojer perd son maître et doit survivre seul
// ============================================================

export const CHAPTER_ROJER_2: ChapterDefinition = {
  id: 8,
  act: 2,
  title: "La Mort d'Arrick",
  subtitle: "Quand la musique s'arrête, il ne reste que le silence et les démons.",
  heroId: 'rojer_young',
  nightCount: 3,
  startingNightNumber: 4,
  startingPresence: 'cutters_hollow',
  hiddenLocations: ['desert_spear'] as any,
  availableWards: ['stone', 'wind', 'fire'] as WardType[],
  fireCanKill: false,
  locationOverrides: {
    cutters_hollow: { name: "Auberge de Pont-de-Rivière", startPop: 6, terrain: 'plains' as any },
    miln: { name: 'Tente de Jongleur', startPop: 3, terrain: 'plains' as any },
    lakton: { name: 'Place du Marché', startPop: 5, terrain: 'plains' as any },
    desert_spear: { name: '', startPop: 0 },
  },
  preplacedWards: [
    { locationId: 'cutters_hollow', ward: 'stone' },
    { locationId: 'cutters_hollow', ward: 'fire' },
    { locationId: 'lakton', ward: 'wind' },
  ],

  introDialogue: [
    {
      id: 'r2_intro_1', background: 'inn',
      lines: [
        { speaker: 'narrator', text: "Pont-de-Rivière. Un bourg marchand au croisement des routes de Thesa. L'endroit idéal pour un jongleur — si on peut payer sa chambre." },
        { speaker: 'narrator', text: "Rojer et son maître Arrick parcourent les routes depuis des années. Mais Arrick boit plus qu'il ne joue, et les auberges se ferment une à une." },
        { speaker: 'arrick', text: "Encore refusés. Ces paysans ne reconnaissent plus le talent quand ils l'entendent.", emotion: 'angry' },
        { speaker: 'rojer_young', text: "Maître, c'est parce que vous avez vomi sur le maire la dernière fois...", emotion: 'sad' },
      ],
      nextNodeId: 'r2_intro_2',
    },
    {
      id: 'r2_intro_2', background: 'inn',
      lines: [
        { speaker: 'arrick', text: "Tais-toi, gamin. Je t'ai tout appris. Sans moi, tu ne serais rien.", emotion: 'angry' },
        { speaker: 'rojer_young', text: "Je sais, maître.", emotion: 'sad' },
        { speaker: 'narrator', text: "Mais cette nuit, tout va changer. Arrick, ivre, sortira de l'auberge après le coucher du soleil pour chercher une bouteille oubliée." },
        { speaker: 'narrator', text: "Les chtoniens n'attendent que ça." },
      ],
      nextNodeId: 'r2_intro_3',
    },
    {
      id: 'r2_intro_3', background: 'village_sunset',
      lines: [
        { speaker: 'narrator', text: "On retrouve Arrick à l'aube. Vivant, mais brisé. Les griffes d'un démon de vent lui ont ouvert la gorge." },
        { speaker: 'narrator', text: "Il ne chantera plus jamais." },
        { speaker: 'rojer_young', text: "Maître... maître, tenez bon. Je vais trouver un herboriste—", emotion: 'scared' },
        { speaker: 'arrick', text: "...", emotion: 'sad' },
        { speaker: 'narrator', text: "Arrick meurt trois jours plus tard. Et Rojer Halfgrip, seize ans, doigts mutilés, se retrouve seul au monde." },
        { speaker: 'rojer_young', text: "Qu'est-ce que je fais maintenant ?", emotion: 'scared' },
        { speaker: 'narrator', text: "L'aubergiste lui laisse une chambre. En échange, Rojer aide à entretenir les runes — pierre, vent, et les rares runes de feu qu'un Messager de passage a gravées l'an dernier." },
        { speaker: 'rojer_young', text: "Quand je joue près des runes, j'ai l'impression que les symboles vibrent. Comme si la musique et les runes parlaient la même langue.", emotion: 'hopeful' },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'r2_day1', background: 'inn',
        lines: [
          { speaker: 'narrator', text: "L'aubergiste veut que Rojer paie sa chambre ou qu'il déguerpisse. Sans Arrick, un apprenti jongleur n'a aucune valeur." },
          { speaker: 'rojer_young', text: "Je peux jouer ce soir. Je connais toutes les chansons d'Arrick. Laissez-moi une chance.", emotion: 'determined' },
          { speaker: 'narrator', text: "L'aubergiste hésite." },
        ],
        choices: [
          {
            id: 'play_for_room',
            label: "Jouer pour payer sa chambre",
            hint: "+2 Population à l'Auberge (voyageurs attirés), -1 AP (épuisement nerveux)",
            effects: [
              { type: 'modify_population', locationId: 'cutters_hollow', delta: 2 },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'leave_inn',
            label: "Partir sur les routes avec le luth d'Arrick",
            hint: "+1 Rune de Vent en réserve (trouvé dans les affaires d'Arrick)",
            effects: [
              { type: 'bonus_reserve_ward', wardType: 'wind' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'r2_day2', background: 'road',
        lines: [
          { speaker: 'narrator', text: "La nuit dernière, Rojer a découvert quelque chose d'étrange. Quand il joue certaines mélodies, les démons hésitent. Ils s'arrêtent." },
          { speaker: 'rojer_young', text: "C'est dans la musique. Il y a quelque chose dans les harmoniques... Les chtoniens les entendent différemment.", emotion: 'hopeful' },
          { speaker: 'narrator', text: "Si Rojer peut affiner cette technique, il pourrait ralentir les démons. Mais il faut pratiquer — et pratiquer, c'est s'exposer." },
        ],
        choices: [
          {
            id: 'practice_music',
            label: "S'exercer près des limites du rune",
            hint: "Force des démons -1 cette nuit (musique apaisante), mais -2 HP",
            effects: [
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'hero_hp_change', delta: -2 },
            ],
          },
          {
            id: 'stay_safe',
            label: "Rester à l'abri et renforcer les runes",
            hint: "+1 Rune de Feu à l'Auberge",
            effects: [
              { type: 'bonus_ward', wardType: 'fire', locationId: 'cutters_hollow' },
            ],
          },
        ],
      }],
    },
  ],

  victoryDialogue: [
    {
      id: 'r2_victory_1', background: 'dawn_victory',
      lines: [
        { speaker: 'narrator', text: "L'aube se lève sur Pont-de-Rivière. Rojer est vivant. Seul, mais vivant." },
        { speaker: 'narrator', text: "Dans sa main, le luth d'Arrick. Les cordes vibrent encore du dernier accord qu'il a joué pour repousser un démon de vent." },
        { speaker: 'rojer_young', text: "Vous m'avez tout appris, maître. Même si vous ne le saviez pas.", emotion: 'sad' },
      ],
      nextNodeId: 'r2_victory_2',
    },
    {
      id: 'r2_victory_2', background: 'road',
      lines: [
        { speaker: 'narrator', text: "Les voyageurs sur la route parlent d'un jeune jongleur qui joue une musique étrange — une musique qui fait reculer les chtoniens." },
        { speaker: 'narrator', text: "Rojer Halfgrip. Le Jongleur. L'homme qui chante pour les démons." },
        { speaker: 'rojer_young', text: "La route est longue, Arrick. Mais je ne m'arrêterai pas.", emotion: 'determined' },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'r2_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Les runes cèdent. Les chtoniens déferlent sur Pont-de-Rivière." },
      { speaker: 'rojer_young', text: "Non ! Pas encore ! Pas comme quand j'étais enfant !", emotion: 'scared' },
      { speaker: 'narrator', text: "Rojer court dans la nuit, serrant le luth d'Arrick contre sa poitrine. L'histoire se répète : un enfant seul dans le noir." },
      { speaker: 'narrator', text: "Chapitre 8 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 9: Arlen 3 — Le Messager
// Arlen devient Messager, voyage entre les cités
// ============================================================

export const CHAPTER_ARLEN_3: ChapterDefinition = {
  id: 9,
  act: 3,
  title: 'Le Messager',
  subtitle: "La route est la seule liberté. Les runes sont la seule loi.",
  heroId: 'arlen',
  nightCount: 4,
  startingNightNumber: 4,
  startingPresence: 'miln',
  hiddenLocations: [] as any,
  availableWards: ['stone', 'wind', 'fire', 'light'] as WardType[],
  fireCanKill: true,
  locationOverrides: {
    miln: { name: 'Fort Miln', startPop: 8, terrain: 'mountain' as any },
    cutters_hollow: { name: 'Relais de la Plaine', startPop: 4, terrain: 'plains' as any },
    lakton: { name: 'Fort Lakton', startPop: 6, terrain: 'lake' as any },
    desert_spear: { name: 'Avant-Poste du Sud', startPop: 3, terrain: 'desert' as any },
  },
  preplacedWards: [
    { locationId: 'miln', ward: 'stone' },
    { locationId: 'miln', ward: 'light' },
    { locationId: 'cutters_hollow', ward: 'fire' },
    { locationId: 'lakton', ward: 'wind' },
    { locationId: 'desert_spear', ward: 'stone' },
  ],

  introDialogue: [
    {
      id: 'a3_intro_1', background: 'miln',
      lines: [
        { speaker: 'narrator', text: "Fort Miln. La cité libre du Nord. Arlen a grandi entre ces murs, formé par les Wardeurs de la Guilde — les meilleurs de Thesa." },
        { speaker: 'narrator', text: "Il connaît maintenant des runes que personne à Ruisseau de Tibbet n'a jamais vus. Runes de lumière. Runes de feu qui brûlent au lieu de repousser. Des armes, pas juste des boucliers." },
        { speaker: 'narrator', text: "Mais les murs de Miln l'étouffent. Arlen Bales n'est pas fait pour rester enfermé derrière des pierres, aussi runées soient-elles." },
      ],
      nextNodeId: 'a3_intro_2',
    },
    {
      id: 'a3_intro_2', background: 'messenger',
      lines: [
        { speaker: 'arlen', text: "J'ai réussi l'examen de la Guilde. Je suis officiellement Messager.", emotion: 'determined' },
        { speaker: 'ragen', text: "Le plus jeune Messager jamais inscrit. Ton premier contrat solo : un courrier pour Lakton.", emotion: 'neutral' },
        { speaker: 'arlen', text: "Je ne sais pas combien de nuits ça prendra. Mais j'y arriverai.", emotion: 'determined' },
        { speaker: 'ragen', text: "Avec tes runes, tu as de bonnes chances. Mais Arlen — la route ne pardonne pas les erreurs.", emotion: 'neutral' },
      ],
      nextNodeId: 'a3_intro_3',
    },
    {
      id: 'a3_intro_3', background: 'road',
      lines: [
        { speaker: 'narrator', text: "Arlen selle son cheval et quitte Fort Miln au petit matin. Devant lui, les plaines immenses de Thesa." },
        { speaker: 'narrator', text: "Il emporte ses runes, son courage, et une question qui ne le quitte jamais : pourquoi l'humanité se cache-t-elle au lieu de se battre ?" },
        { speaker: 'arlen', text: "Un jour, je trouverai la réponse. Il doit bien exister un endroit où les anciens ont laissé leurs secrets.", emotion: 'determined' },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'a3_day1', background: 'road',
        lines: [
          { speaker: 'narrator', text: "Premier jour de route. Arlen croise un groupe de réfugiés — un village entier, fuyant vers Miln." },
          { speaker: 'refugee', text: "Les runes de notre village ont cédé. Nous n'avons plus rien. Plus de maisons, plus de réserves.", emotion: 'scared' },
          { speaker: 'arlen', text: "Je peux vous aider à tracer des runes de protection pour la nuit. Ou je peux filer vers le relais et préparer un abri sûr pour votre arrivée.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'help_refugees',
            label: "Aider les réfugiés à tracer des runes",
            hint: "+3 Pop au Relais de la Plaine, -1 AP",
            effects: [
              { type: 'modify_population', locationId: 'cutters_hollow', delta: 3 },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'ride_ahead',
            label: "Foncer vers le relais pour le préparer",
            hint: "+1 Rune de Lumière au Relais",
            effects: [
              { type: 'bonus_ward', wardType: 'light', locationId: 'cutters_hollow' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'a3_day2', background: 'road',
        lines: [
          { speaker: 'narrator', text: "La nuit précédente, quelque chose d'étrange s'est produit. Un démon de roche, plus grand que les autres, se dressait sur la colline au-dessus du campement." },
          { speaker: 'narrator', text: "Il manquait un bras. Et il regardait Arlen. Pas comme une proie — comme un ennemi qu'on reconnaît." },
          { speaker: 'arlen', text: "Ce chtonien de roche... Il était déjà là la nuit d'avant, sur la route de Miln avec Ragen. Le même. J'en suis sûr.", emotion: 'determined' },
          { speaker: 'narrator', text: "One Arm. Un démon ancien, marqué par un combat passé. Et il traque Arlen." },
        ],
        choices: [
          {
            id: 'study_one_arm',
            label: "Étudier les traces de One Arm, préparer un piège de lumière et feu",
            hint: "+1 Rune de Feu en réserve, +1 Rune de Lumière en réserve, -1 AP",
            effects: [
              { type: 'bonus_reserve_ward', wardType: 'fire' },
              { type: 'bonus_reserve_ward', wardType: 'light' },
              { type: 'hero_ap_change', delta: -1 },
              { type: 'set_flag', flag: 'prepared_one_arm_trap', value: true },
            ],
          },
          {
            id: 'press_on',
            label: "Continuer la route vers Lakton sans s'attarder",
            hint: "+1 Rune de Pierre à Lakton, +2 Encre à Lakton",
            effects: [
              { type: 'bonus_ward', wardType: 'stone', locationId: 'lakton' },
              { type: 'add_resources', locationId: 'lakton', resource: 'ink', amount: 2 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 3,
      dialogueNodes: [{
        id: 'a3_day3', background: 'messenger',
        lines: [
          { speaker: 'narrator', text: "One Arm est revenu. Cette fois, il a chargé. Arlen l'a repoussé avec lumière et feu — et le démon a fui, brûlé, hurlant dans la nuit." },
          { speaker: 'arlen', text: "Je l'ai blessé. Vraiment blessé. Les runes de lumière ont déchiré sa peau de roche. Il a eu peur.", emotion: 'hopeful' },
          { speaker: 'narrator', text: "Pour la première fois de sa vie, Arlen a vu la peur dans les yeux d'un démon." },
          { speaker: 'arlen', text: "Il reviendra. Ils reviennent toujours. Mais la prochaine fois, je serai prêt.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'retrace_all',
            label: "Renforcer tous les runes pour la dernière nuit",
            hint: "+1 Rune de Vent et +1 Rune de Pierre à l'Avant-Poste, -2 HP",
            effects: [
              { type: 'bonus_ward', wardType: 'wind', locationId: 'desert_spear' },
              { type: 'bonus_ward', wardType: 'stone', locationId: 'desert_spear' },
              { type: 'hero_hp_change', delta: -2 },
            ],
          },
          {
            id: 'minimal_wards',
            label: "Se reposer et garder ses forces",
            hint: "+4 Bois à l'Avant-Poste",
            effects: [
              { type: 'add_resources', locationId: 'desert_spear', resource: 'wood', amount: 4 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 4,
      dialogueNodes: [{
        id: 'a3_day4', background: 'library',
        lines: [
          { speaker: 'narrator', text: "Dans la bibliothèque du dernier relais, Arlen trouve un vieux parchemin oublié entre les pierres du mur." },
          { speaker: 'narrator', text: "Un fragment de carte. Des symboles qu'il ne reconnaît pas. Et un nom, à moitié effacé : Soleil d'Anoch." },
          { speaker: 'arlen', text: "Soleil d'Anoch... Une cité perdue ? Il y a des runes dessinés ici que je n'ai jamais vus nulle part.", emotion: 'hopeful' },
          { speaker: 'narrator', text: "Arlen ne dort plus cette nuit-là. Il recopie chaque symbole, chaque fragment. Quelque chose l'appelle dans ces ruines oubliées." },
        ],
        choices: [
          {
            id: 'study_map',
            label: "Passer la nuit à étudier le fragment de carte",
            hint: "Force des démons -1 (runes anciens copiés sur le cercle), -2 HP (nuit blanche)",
            effects: [
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'hero_hp_change', delta: -2 },
              { type: 'set_flag', flag: 'found_anoch_sun_clue', value: true },
            ],
          },
          {
            id: 'focus_defenses',
            label: "Ranger le parchemin et se concentrer sur les défenses",
            hint: "+1 Rune de Feu à Lakton, +2 Encre à Lakton",
            effects: [
              { type: 'bonus_ward', wardType: 'fire', locationId: 'lakton' },
              { type: 'add_resources', locationId: 'lakton', resource: 'ink', amount: 2 },
            ],
          },
        ],
      }],
    },
  ],

  victoryDialogue: [
    {
      id: 'a3_victory_1', background: 'dawn_victory',
      lines: [
        { speaker: 'narrator', text: "Fort Lakton. Arlen livre son courrier, épuisé mais vivant. Pas une seule fois il n'a eu peur." },
        { speaker: 'narrator', text: "Les Laktoniens le regardent avec étonnement. Un Messager si jeune, qui voyage seul et arrive couvert de poussière et de cicatrices de combat." },
        { speaker: 'arlen', text: "One Arm est toujours là, quelque part. Il me traquera encore. Mais la prochaine fois...", emotion: 'determined' },
      ],
      nextNodeId: 'a3_victory_2',
    },
    {
      id: 'a3_victory_2', background: 'ward_book',
      lines: [
        { speaker: 'arlen', text: "Le feu peut les tuer. La lumière les affaiblit. Les anciens savaient se battre.", emotion: 'determined' },
        { speaker: 'arlen', text: "Et quelque part dans le désert, il y a une cité appelée Soleil d'Anoch. Les réponses sont là-bas. Je le sens.", emotion: 'hopeful' },
        { speaker: 'narrator', text: "Arlen Bales, Messager. L'homme qui cherche les armes perdues de l'humanité — et qui ne dort plus la nuit." },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'a3_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Les runes cèdent dans la nuit. Sans abri, sur la route ouverte, les chtoniens convergent. One Arm mène la charge." },
      { speaker: 'arlen', text: "Non... Il y avait une erreur dans le tracé. UNE erreur...", emotion: 'angry' },
      { speaker: 'narrator', text: "La route ne pardonne pas. Le Messager Arlen Bales ne livrera jamais son courrier." },
      { speaker: 'narrator', text: "Chapitre 9 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 10: Leesha 3 — Le Voyage vers Angiers
// Leesha quitte Cutter's Hollow, rencontre Rojer, découvre la lumière
// ============================================================

export const CHAPTER_LEESHA_3: ChapterDefinition = {
  id: 10,
  act: 3,
  title: 'Le Voyage vers Angiers',
  subtitle: "Partir, c'est choisir de ne plus avoir peur du monde.",
  heroId: 'leesha',
  nightCount: 3,
  startingNightNumber: 5,
  startingPresence: 'cutters_hollow',
  hiddenLocations: ['desert_spear'] as any,
  availableWards: ['stone', 'wind', 'fire', 'light'] as WardType[],
  fireCanKill: true,
  locationOverrides: {
    cutters_hollow: { name: 'Route de l\'Ouest', startPop: 6, terrain: 'plains' as any },
    miln: { name: 'Campement des Réfugiés', startPop: 5, terrain: 'plains' as any },
    lakton: { name: 'Portes d\'Angiers', startPop: 7, terrain: 'forest' as any },
    desert_spear: { name: '', startPop: 0 },
  },
  preplacedWards: [
    { locationId: 'cutters_hollow', ward: 'fire' },
    { locationId: 'cutters_hollow', ward: 'stone' },
    { locationId: 'miln', ward: 'wind' },
    { locationId: 'lakton', ward: 'stone' },
    { locationId: 'lakton', ward: 'fire' },
  ],

  introDialogue: [
    {
      id: 'l3_intro_1', background: 'road',
      lines: [
        { speaker: 'narrator', text: "Le sac est bouclé. Le journal de Bruna est calé sous la ceinture, contre la peau, là où personne ne peut le prendre." },
        { speaker: 'narrator', text: "Leesha Paper quitte Le Creux du Coupeur à l'aube. Derrière elle, le village qu'elle a protégé. Devant elle, Angiers — la cité du Duc, où se trouvent les archives de l'Académie." },
        { speaker: 'leesha', text: "Bruna disait que les réponses n'étaient pas dans ses livres. Que les vrais secrets étaient ailleurs.", emotion: 'determined' },
      ],
      nextNodeId: 'l3_intro_2',
    },
    {
      id: 'l3_intro_2', background: 'refugees',
      lines: [
        { speaker: 'narrator', text: "La route vers Angiers est plus peuplée que prévu. Des familles entières marchent sous le soleil, des ballots sur le dos, les yeux vides." },
        { speaker: 'refugee', text: "Notre village est tombé. Les runes n'ont pas tenu. On marche vers Angiers. Où irions-nous d'autre ?", emotion: 'scared' },
        { speaker: 'leesha', text: "Montrez-moi vos blessés. Je suis herboriste.", emotion: 'determined' },
        { speaker: 'narrator', text: "Leesha soigne, panse, réconforte. Mais elle ne peut pas sauver tout le monde — et la nuit approche." },
      ],
      nextNodeId: 'l3_intro_3',
    },
    {
      id: 'l3_intro_3', background: 'village_sunset',
      lines: [
        { speaker: 'narrator', text: "Au crépuscule, un son étrange flotte dans l'air. Un violon. Quelqu'un joue près du campement des réfugiés." },
        { speaker: 'narrator', text: "Un jeune homme aux cheveux roux, la main gauche mutilée, joue avec une grâce qui semble impossible vu ses blessures." },
        { speaker: 'leesha', text: "Les réfugiés se calment quand il joue. Les enfants arrêtent de pleurer. Même le vent semble retenir son souffle.", emotion: 'hopeful' },
        { speaker: 'narrator', text: "La nuit tombe. Les chtoniens montent. Mais le violon continue." },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'l3_day1', background: 'road',
        lines: [
          { speaker: 'narrator', text: "Première nuit sur la route. Leesha a tenu le campement, mais les runes tracés à la hâte ont failli céder au nord." },
          { speaker: 'leesha', text: "Ce garçon au violon... Quand il jouait, j'ai vu les chtoniens de vent hésiter. S'arrêter. Comme s'ils écoutaient.", emotion: 'hopeful' },
          { speaker: 'rojer', text: "Rojer Halfgrip. Jongleur. Et oui, les démons écoutent. Ils n'aiment pas quand je m'arrête.", emotion: 'neutral' },
          { speaker: 'leesha', text: "Ce n'est pas possible. La musique n'a aucun effet sur les chtoniens. Aucun texte de Bruna ne mentionne—", emotion: 'scared' },
          { speaker: 'rojer', text: "Peut-être que votre Bruna n'avait pas toutes les réponses.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'study_rojer',
            label: "Observer Rojer jouer ce soir et noter les réactions des démons",
            hint: "Force démons -1 (la musique perturbe), -1 AP (nuit d'observation)",
            effects: [
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'hero_ap_change', delta: -1 },
              { type: 'set_flag', flag: 'studied_rojer_music', value: true },
            ],
          },
          {
            id: 'reinforce_camp',
            label: "Renforcer les runes du campement des réfugiés",
            hint: "+1 Rune de Feu au Campement, +2 Pop au Campement",
            effects: [
              { type: 'bonus_ward', wardType: 'fire', locationId: 'miln' },
              { type: 'modify_population', locationId: 'miln', delta: 2 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'l3_day2', background: 'ward_book',
        lines: [
          { speaker: 'narrator', text: "Angiers est en vue. Leesha passe la matinée dans les archives de l'Académie, feuilletant des textes que personne n'a lus depuis des générations." },
          { speaker: 'leesha', text: "Les runes de lumière... Ils ne sont pas dans les livres de Bruna. Ils sont ici, dans les archives d'Angiers. Quelqu'un les a cachés.", emotion: 'hopeful' },
          { speaker: 'narrator', text: "Les runes de lumière. Ils ne repoussent pas — ils éclairent ce que les autres runes ne voient pas. Ils révèlent la faiblesse des chtoniens." },
          { speaker: 'leesha', text: "C'est la pièce manquante. Avec la lumière, le feu et la pierre ne sont plus des murs. Ce sont des armes.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'deep_study',
            label: "Rester aux archives et maîtriser les runes de lumière",
            hint: "+1 Rune de Lumière aux Portes d'Angiers, +1 Rune de Lumière en réserve, -2 HP (épuisement)",
            effects: [
              { type: 'bonus_ward', wardType: 'light', locationId: 'lakton' },
              { type: 'bonus_reserve_ward', wardType: 'light' },
              { type: 'hero_hp_change', delta: -2 },
            ],
          },
          {
            id: 'practical_defense',
            label: "Appliquer les bases et renforcer les défenses d'Angiers",
            hint: "+1 Rune de Pierre aux Portes, +3 Encre aux Portes",
            effects: [
              { type: 'bonus_ward', wardType: 'stone', locationId: 'lakton' },
              { type: 'add_resources', locationId: 'lakton', resource: 'ink', amount: 3 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 3,
      dialogueNodes: [{
        id: 'l3_day3', background: 'village_sunset',
        lines: [
          { speaker: 'narrator', text: "Ce garçon avec son violon... les démons l'écoutent. C'est impossible. Et pourtant, Leesha l'a vu de ses propres yeux." },
          { speaker: 'leesha', text: "Rojer, ta musique n'est pas de la magie. C'est de la physique des runes appliquée au son. Les vibrations interfèrent avec leur essence.", emotion: 'hopeful' },
          { speaker: 'rojer', text: "Appelez ça comme vous voulez. Moi, j'appelle ça survivre.", emotion: 'determined' },
          { speaker: 'leesha', text: "Si on combine ta musique avec mes runes de lumière cette nuit... On pourrait faire bien plus que survivre.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'combine_music_light',
            label: "Combiner la musique de Rojer et les runes de lumière",
            hint: "Force démons -1, +1 Rune de Lumière à la Route, mais -2 HP",
            effects: [
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'bonus_ward', wardType: 'light', locationId: 'cutters_hollow' },
              { type: 'hero_hp_change', delta: -2 },
            ],
          },
          {
            id: 'safe_last_night',
            label: "Chacun de son côté — défenses classiques",
            hint: "+3 HP, +2 Bois aux Portes d'Angiers",
            effects: [
              { type: 'hero_hp_change', delta: 3 },
              { type: 'add_resources', locationId: 'lakton', resource: 'wood', amount: 2 },
            ],
          },
        ],
      }],
    },
  ],

  victoryDialogue: [
    {
      id: 'l3_victory_1', background: 'dawn_victory',
      lines: [
        { speaker: 'narrator', text: "L'aube sur Angiers. Les murs de la cité se dressent, couverts de runes millénaires. Et derrière eux, les archives qui contiennent les secrets de l'ancien monde." },
        { speaker: 'leesha', text: "Les runes de lumière changent tout. Ils ne protègent pas — ils révèlent. Et ce qu'ils révèlent, on peut le détruire.", emotion: 'determined' },
      ],
      nextNodeId: 'l3_victory_2',
    },
    {
      id: 'l3_victory_2', background: 'road',
      lines: [
        { speaker: 'rojer', text: "Alors, herboriste. Où va-t-on maintenant ?", emotion: 'neutral' },
        { speaker: 'leesha', text: "Je retourne à Le Creux du Coupeur. Mon village a besoin de ce que j'ai appris ici. Tu viens ?", emotion: 'determined' },
        { speaker: 'rojer', text: "Pourquoi pas. La route est plus sûre à deux.", emotion: 'hopeful' },
        { speaker: 'narrator', text: "Leesha Paper et Rojer Halfgrip. L'herboriste et le jongleur. Deux chemins qui se croisent — et qui ne se sépareront plus." },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'l3_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Les runes du campement cèdent sur la route d'Angiers. Les réfugiés hurlent dans la nuit." },
      { speaker: 'leesha', text: "Non... J'aurais dû rester à Le Creux du Coupeur. J'aurais dû...", emotion: 'sad' },
      { speaker: 'narrator', text: "La route vers Angiers est jonchée de promesses brisées. Et les runes de lumière resteront dans les archives, oubliés." },
      { speaker: 'narrator', text: "Chapitre 10 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 11: Jardir 3 — La Lance de Kaji
// Jardir découvre la Lance dans le Maze, premiers démons tués
// ============================================================

export const CHAPTER_JARDIR_3: ChapterDefinition = {
  id: 11,
  act: 3,
  title: 'La Lance de Kaji',
  subtitle: "Dans les ténèbres du Labyrinthe, une lumière attend celui qui ose descendre.",
  heroId: 'jardir',
  nightCount: 3,
  startingNightNumber: 5,
  startingPresence: 'desert_spear',
  hiddenLocations: ['lakton'] as any,
  availableWards: ['stone', 'wind', 'fire', 'light'] as WardType[],
  fireCanKill: true,
  locationOverrides: {
    desert_spear: { name: 'Cœur du Labyrinthe', startPop: 7, terrain: 'underground' as any },
    cutters_hollow: { name: 'Brèche Ouest', startPop: 4, terrain: 'underground' as any },
    miln: { name: 'Chambre Secrète', startPop: 3, terrain: 'underground' as any },
    lakton: { name: '', startPop: 0 },
  },
  preplacedWards: [
    { locationId: 'desert_spear', ward: 'fire' },
    { locationId: 'desert_spear', ward: 'stone' },
    { locationId: 'cutters_hollow', ward: 'wind' },
    { locationId: 'cutters_hollow', ward: 'fire' },
    { locationId: 'miln', ward: 'stone' },
  ],

  introDialogue: [
    {
      id: 'j3_intro_1', background: 'maze',
      lines: [
        { speaker: 'narrator', text: "Le Labyrinthe gronde. Depuis des semaines, les chtoniens poussent plus profond, plus fort. Les Sharum reculent, couloir après couloir." },
        { speaker: 'narrator', text: "Le Sharum Ka Jardir tient la ligne. Mais les pertes s'accumulent, et les guerriers murmurent que les démons préparent quelque chose." },
        { speaker: 'jardir', text: "Quelque chose les attire vers la brèche ouest. Ils creusent. Ils cherchent quelque chose sous le Labyrinthe.", emotion: 'determined' },
      ],
      nextNodeId: 'j3_intro_2',
    },
    {
      id: 'j3_intro_2', background: 'maze',
      lines: [
        { speaker: 'narrator', text: "Jardir descend seul dans les tunnels les plus profonds. Là où aucun Sharum n'est allé depuis des générations." },
        { speaker: 'narrator', text: "Et dans l'obscurité, il trouve une chambre scellée. Sur les murs, des runes qui brillent encore après des siècles — des runes de lumière." },
        { speaker: 'jardir', text: "Par Everam... Ce n'est pas un tunnel. C'est un tombeau. Le tombeau d'un guerrier de l'ancien temps.", emotion: 'hopeful' },
        { speaker: 'narrator', text: "Au centre de la chambre, posée sur un autel de pierre noire : une lance. Couverte de runes de lumière qui pulsent doucement dans le noir." },
      ],
      nextNodeId: 'j3_intro_3',
    },
    {
      id: 'j3_intro_3', background: 'krasia',
      lines: [
        { speaker: 'jardir', text: "La Lance de Kaji. L'arme du premier Shar'Dama Ka. Elle existe vraiment.", emotion: 'determined' },
        { speaker: 'narrator', text: "Jardir saisit la lance. Les runes s'illuminent au contact de sa main. Et dans les tunnels au-dessus, les chtoniens hurlent de rage." },
        { speaker: 'narrator', text: "Cette nuit, pour la première fois dans l'histoire vivante de Krasia, un démon mourra dans le Labyrinthe. Définitivement." },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'j3_day1', background: 'maze',
        lines: [
          { speaker: 'narrator', text: "La lance a tué un chtonien de flamme. Pas repoussé — tué. Son corps s'est dissous en fumée noire, et il n'est pas remonté du sol." },
          { speaker: 'jardir', text: "Les guerriers ont vu. Pour la première fois, un démon est mort dans le Labyrinthe. Mort pour de vrai.", emotion: 'determined' },
          { speaker: 'drillmaster', text: "Les hommes sont galvanisés. Mais la brèche ouest s'élargit. Il faut choisir où concentrer nos forces.", emotion: 'neutral' },
        ],
        choices: [
          {
            id: 'seal_breach',
            label: "Sceller la brèche ouest avec des runes de lumière",
            hint: "+1 Rune de Lumière à la Brèche, -1 AP",
            effects: [
              { type: 'bonus_ward', wardType: 'light', locationId: 'cutters_hollow' },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'rally_sharum',
            label: "Rallier les Sharum avec la lance pour tenir le Cœur",
            hint: "+3 Pop au Cœur du Labyrinthe, Force démons -1",
            effects: [
              { type: 'modify_population', locationId: 'desert_spear', delta: 3 },
              { type: 'demon_strength_bonus', bonus: -1 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'j3_day2', background: 'krasia',
        lines: [
          { speaker: 'narrator', text: "Entre les combats, une silhouette voilée attend Jardir à l'entrée du Labyrinthe. Inevera, la dama'ting." },
          { speaker: 'inevera', text: "Ahmann. Montre-moi tes mains.", emotion: 'neutral' },
          { speaker: 'narrator', text: "Elle jette des osselets de démon sur un tissu noir. Les os roulent, s'arrêtent. Inevera les lit en silence." },
          { speaker: 'inevera', text: "Tu es celui que j'attendais. Mais le prix sera terrible, Ahmann. Terrible.", emotion: 'sad' },
          { speaker: 'jardir', text: "Quel prix ? Parle clairement, dama'ting.", emotion: 'angry' },
          { speaker: 'inevera', text: "Shar'Dama Ka.", emotion: 'neutral' },
          { speaker: 'narrator', text: "Le Délivreur. Le titre que les prophéties annoncent depuis mille ans. Jardir ne comprend pas encore ce que cela implique." },
        ],
        choices: [
          {
            id: 'listen_inevera',
            label: "Écouter les prophéties d'Inevera",
            hint: "+1 Rune de Lumière en réserve (secret des dama'ting), -2 HP (rituel douloureux)",
            effects: [
              { type: 'bonus_reserve_ward', wardType: 'light' },
              { type: 'hero_hp_change', delta: -2 },
              { type: 'set_flag', flag: 'listened_inevera', value: true },
            ],
          },
          {
            id: 'reject_prophecy',
            label: "Rejeter les prophéties et retourner au combat",
            hint: "+1 Rune de Feu au Cœur, +2 Encre au Cœur",
            effects: [
              { type: 'bonus_ward', wardType: 'fire', locationId: 'desert_spear' },
              { type: 'add_resources', locationId: 'desert_spear', resource: 'ink', amount: 2 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 3,
      dialogueNodes: [{
        id: 'j3_day3', background: 'maze',
        lines: [
          { speaker: 'narrator', text: "La chambre secrète contient plus que la lance. Il y a des inscriptions sur les murs — des tactiques de combat, des formations runées." },
          { speaker: 'jardir', text: "Les anciens ne se contentaient pas de repousser les démons. Ils les chassaient. Ils descendaient dans les profondeurs pour les tuer.", emotion: 'determined' },
          { speaker: 'narrator', text: "La dernière nuit approche. La horde est massive. Jardir doit choisir : défendre ou attaquer." },
        ],
        choices: [
          {
            id: 'hunt_demons',
            label: "Descendre chasser les démons avec la Lance de Kaji",
            hint: "-3 HP (combat brutal), mais -1 démon par vague",
            effects: [
              { type: 'hero_hp_change', delta: -3 },
              { type: 'extra_demons', count: -1 },
            ],
          },
          {
            id: 'fortify_maze',
            label: "Fortifier le Labyrinthe avec les runes de la chambre secrète",
            hint: "+1 Rune de Lumière à chaque lieu",
            effects: [
              { type: 'bonus_ward', wardType: 'light', locationId: 'desert_spear' },
              { type: 'bonus_ward', wardType: 'light', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'light', locationId: 'miln' },
            ],
          },
        ],
      }],
    },
  ],

  victoryDialogue: [
    {
      id: 'j3_victory_1', background: 'dawn_victory',
      lines: [
        { speaker: 'narrator', text: "Le Labyrinthe tient. Et cette fois, les chtoniens ne se sont pas simplement retirés — certains sont morts. Définitivement." },
        { speaker: 'jardir', text: "Les guerriers ont vu ce que la Lance peut faire. Ils n'ont plus peur. Ils ont faim.", emotion: 'determined' },
        { speaker: 'drillmaster', text: "Sharum Ka... Les hommes parlent de toi comme du Délivreur.", emotion: 'hopeful' },
      ],
      nextNodeId: 'j3_victory_2',
    },
    {
      id: 'j3_victory_2', background: 'krasia',
      lines: [
        { speaker: 'jardir', text: "Le Labyrinthe ne suffit plus. Nous ne pouvons pas rester ici à attendre que les démons viennent à nous.", emotion: 'determined' },
        { speaker: 'narrator', text: "Inevera observe depuis l'ombre. Elle sourit. Le destin qu'elle a lu dans les os se met en marche." },
        { speaker: 'narrator', text: "Ahmann Jardir. Le guerrier qui tient la Lance de Kaji. Bientôt, il voudra plus que le Labyrinthe." },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'j3_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Le Labyrinthe s'effondre sous l'assaut. La Lance de Kaji brille dans le noir, mais un homme seul ne peut pas tenir contre une armée." },
      { speaker: 'jardir', text: "Everam... Pas maintenant. Pas comme ça.", emotion: 'angry' },
      { speaker: 'narrator', text: "Les tunnels s'écroulent. La Lance est ensevelie. Et avec elle, le rêve de Kaji." },
      { speaker: 'narrator', text: "Chapitre 11 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 12: Rojer 3 — Le Chant des Wards
// Rojer perfectionne ses mélodies, rencontre Leesha
// ============================================================

export const CHAPTER_ROJER_3: ChapterDefinition = {
  id: 12,
  act: 3,
  title: 'Le Chant des Runes',
  subtitle: "Quand la musique touche l'invisible, le monde change.",
  heroId: 'rojer',
  nightCount: 3,
  startingNightNumber: 5,
  startingPresence: 'cutters_hollow',
  hiddenLocations: ['desert_spear'] as any,
  availableWards: ['stone', 'wind', 'fire', 'light'] as WardType[],
  fireCanKill: true,
  locationOverrides: {
    cutters_hollow: { name: 'Clairière du Camp', startPop: 5, terrain: 'forest' as any },
    miln: { name: 'Route d\'Angiers', startPop: 4, terrain: 'plains' as any },
    lakton: { name: 'Village de Boisrouge', startPop: 6, terrain: 'forest' as any },
    desert_spear: { name: '', startPop: 0 },
  },
  preplacedWards: [
    { locationId: 'cutters_hollow', ward: 'stone' },
    { locationId: 'cutters_hollow', ward: 'fire' },
    { locationId: 'miln', ward: 'wind' },
    { locationId: 'lakton', ward: 'stone' },
    { locationId: 'lakton', ward: 'fire' },
  ],

  introDialogue: [
    {
      id: 'r3_intro_1', background: 'road',
      lines: [
        { speaker: 'narrator', text: "Rojer Halfgrip marche seul depuis des semaines. De village en village, il joue pour payer son repas et un abri runeé pour la nuit." },
        { speaker: 'narrator', text: "Mais sa musique a changé. Ce n'est plus du divertissement. C'est devenu autre chose — quelque chose que même Rojer ne comprend pas entièrement." },
        { speaker: 'rojer', text: "Chaque type de démon réagit à une mélodie différente. Les chtoniens de vent fuient les aigus. Ceux de flamme ralentissent avec les graves.", emotion: 'hopeful' },
      ],
      nextNodeId: 'r3_intro_2',
    },
    {
      id: 'r3_intro_2', background: 'inn',
      lines: [
        { speaker: 'narrator', text: "À Boisrouge, un petit village forestier, les habitants supplient Rojer de rester. Leur wardeur est mort. Les runes s'effacent." },
        { speaker: 'refugee', text: "Jouez pour nous, Jongleur. Votre musique les tient à distance. Restez, je vous en prie.", emotion: 'scared' },
        { speaker: 'rojer', text: "Je ne peux pas rester éternellement. Mais je peux rester quelques nuits. Le temps de comprendre.", emotion: 'determined' },
      ],
      nextNodeId: 'r3_intro_3',
    },
    {
      id: 'r3_intro_3', background: 'forest_village',
      lines: [
        { speaker: 'narrator', text: "Le soir, une femme arrive au village. Grande, brune, le regard intelligent. Elle porte un sac d'herboriste et un journal usé." },
        { speaker: 'leesha', text: "Je suis Leesha Paper, herboriste de Le Creux du Coupeur. Avez-vous des blessés ?", emotion: 'determined' },
        { speaker: 'rojer', text: "L'herboriste dont tout le monde parle ? Celle qui trace des runes comme personne ?", emotion: 'hopeful' },
        { speaker: 'narrator', text: "Leurs chemins se croisent. La nuit tombe. Et les démons arrivent." },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'r3_day1', background: 'inn',
        lines: [
          { speaker: 'narrator', text: "Première nuit. Rojer a joué jusqu'à l'aube. Ses doigts saignent — deux seulement sur la main gauche, mais ils ont tenu." },
          { speaker: 'rojer', text: "J'ai trouvé une nouvelle mélodie cette nuit. Un rythme syncopé. Les chtoniens de pierre se figent quand je la joue.", emotion: 'hopeful' },
          { speaker: 'leesha', text: "Les fréquences que tu produis interfèrent avec leur structure cristalline. C'est fascinant.", emotion: 'hopeful' },
          { speaker: 'rojer', text: "Tu peux traduire ça en langue humaine ?", emotion: 'neutral' },
          { speaker: 'leesha', text: "Ta musique casse les démons de pierre. Continue.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'practice_stone_melody',
            label: "Perfectionner la mélodie anti-pierre",
            hint: "Force démons -1, -1 AP (entraînement intensif)",
            effects: [
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'help_village_wards',
            label: "Aider Leesha à retracer les runes du village",
            hint: "+1 Rune de Feu à Boisrouge, +2 Encre à Boisrouge",
            effects: [
              { type: 'bonus_ward', wardType: 'fire', locationId: 'lakton' },
              { type: 'add_resources', locationId: 'lakton', resource: 'ink', amount: 2 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'r3_day2', background: 'forest_village',
        lines: [
          { speaker: 'narrator', text: "Leesha observe Rojer depuis deux nuits. Elle prend des notes. Elle mesure. Elle réfléchit." },
          { speaker: 'leesha', text: "Ta musique n'est pas de la magie, Rojer. C'est de la physique des runes appliquée au son. Les vibrations de tes cordes reproduisent les mêmes fréquences que les runes.", emotion: 'hopeful' },
          { speaker: 'rojer', text: "Donc je suis... un rune vivant ?", emotion: 'hopeful' },
          { speaker: 'leesha', text: "En quelque sorte. Et si on combine ta musique avec mes runes de lumière...", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'experiment_music_wards',
            label: "Tester la combinaison musique + runes de lumière",
            hint: "+1 Rune de Lumière à la Clairière, +1 Rune de Lumière en réserve, -2 HP",
            effects: [
              { type: 'bonus_ward', wardType: 'light', locationId: 'cutters_hollow' },
              { type: 'bonus_reserve_ward', wardType: 'light' },
              { type: 'hero_hp_change', delta: -2 },
            ],
          },
          {
            id: 'play_for_morale',
            label: "Jouer pour le moral du village, laisser Leesha gérer les runes",
            hint: "+2 Pop à Boisrouge, +1 Rune de Pierre à la Clairière",
            effects: [
              { type: 'modify_population', locationId: 'lakton', delta: 2 },
              { type: 'bonus_ward', wardType: 'stone', locationId: 'cutters_hollow' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 3,
      dialogueNodes: [{
        id: 'r3_day3', background: 'village_sunset',
        lines: [
          { speaker: 'narrator', text: "Dernière nuit à Boisrouge. Rojer et Leesha ont décidé de voyager ensemble vers Le Creux du Coupeur." },
          { speaker: 'rojer', text: "J'ai une mélodie pour chaque type de démon maintenant. Flamme, vent, pierre. Chacun a sa faiblesse sonore.", emotion: 'determined' },
          { speaker: 'leesha', text: "Et moi, j'ai les runes de lumière pour révéler ceux qui se cachent. Ensemble, on couvre tout.", emotion: 'determined' },
          { speaker: 'narrator', text: "La dernière nuit sera la plus dure. Les chtoniens semblent savoir que Rojer va partir. Ils sont furieux." },
        ],
        choices: [
          {
            id: 'full_symphony',
            label: "Déployer toutes les mélodies en une symphonie coordonnée",
            hint: "-1 démon par vague, -3 HP (effort surhumain sur les doigts)",
            effects: [
              { type: 'extra_demons', count: -1 },
              { type: 'hero_hp_change', delta: -3 },
            ],
          },
          {
            id: 'defensive_duet',
            label: "Défense classique : Rojer joue, Leesha warde",
            hint: "+1 Rune de Lumière à la Route, +1 Rune de Feu à la Clairière",
            effects: [
              { type: 'bonus_ward', wardType: 'light', locationId: 'miln' },
              { type: 'bonus_ward', wardType: 'fire', locationId: 'cutters_hollow' },
            ],
          },
        ],
      }],
    },
  ],

  victoryDialogue: [
    {
      id: 'r3_victory_1', background: 'dawn_victory',
      lines: [
        { speaker: 'narrator', text: "L'aube. Boisrouge tient. Et les villageois applaudissent le Jongleur qui a sauvé leur village trois nuits de suite." },
        { speaker: 'rojer', text: "Les démons ont leur musique. Et moi, j'ai la mienne. On verra qui joue le plus fort.", emotion: 'determined' },
      ],
      nextNodeId: 'r3_victory_2',
    },
    {
      id: 'r3_victory_2', background: 'road',
      lines: [
        { speaker: 'leesha', text: "Tu viens à Le Creux du Coupeur, alors ?", emotion: 'neutral' },
        { speaker: 'rojer', text: "Pourquoi pas. Un village qui a une herboriste géniale et un jongleur dément ? Les chtoniens n'ont aucune chance.", emotion: 'hopeful' },
        { speaker: 'narrator', text: "Rojer Halfgrip. Le Jongleur dont les mélodies font trembler les démons. Il a trouvé sa voie — et une alliée." },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'r3_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Les cordes du violon se brisent une à une. Sans musique, les chtoniens déferlent sur Boisrouge." },
      { speaker: 'rojer', text: "Non... Pas les cordes. Pas maintenant...", emotion: 'scared' },
      { speaker: 'narrator', text: "Le silence revient. Et avec le silence, les démons." },
      { speaker: 'narrator', text: "Chapitre 12 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 13: Arlen 4 — La Carte d'Anoch Sun
// Arlen rassemble les indices, voyage dans le désert
// ============================================================

export const CHAPTER_ARLEN_4: ChapterDefinition = {
  id: 13,
  act: 4,
  title: "La Carte du Soleil d'Anoch",
  subtitle: "Le désert ne rend pas ses secrets aux lâches.",
  heroId: 'arlen',
  nightCount: 3,
  startingNightNumber: 6,
  startingPresence: 'miln',
  hiddenLocations: [] as any,
  availableWards: ['stone', 'wind', 'fire', 'light', 'bone'] as WardType[],
  fireCanKill: true,
  maxComboSize: 3,
  locationOverrides: {
    miln: { name: 'Oasis du Guide', startPop: 3, terrain: 'desert' as any },
    cutters_hollow: { name: 'Ruines Mineures', startPop: 2, terrain: 'desert' as any },
    lakton: { name: 'Dunes du Sud', startPop: 3, terrain: 'desert' as any },
    desert_spear: { name: 'Avant-Poste Krasien', startPop: 4, terrain: 'desert' as any },
  },
  preplacedWards: [
    { locationId: 'miln', ward: 'fire' },
    { locationId: 'miln', ward: 'stone' },
    { locationId: 'cutters_hollow', ward: 'light' },
    { locationId: 'lakton', ward: 'wind' },
    { locationId: 'desert_spear', ward: 'fire' },
    { locationId: 'desert_spear', ward: 'stone' },
  ],

  introDialogue: [
    {
      id: 'a4_intro_1', background: 'road',
      lines: [
        { speaker: 'narrator', text: "Le désert de Krasie. Du sable, du soleil, et la mort qui attend dans chaque ombre." },
        { speaker: 'narrator', text: "Arlen a rassemblé tous les indices : le fragment de Lakton, les notes de la bibliothèque de Miln, les témoignages de marchands krasiens." },
        { speaker: 'narrator', text: "Quelque part dans ce désert, Soleil d'Anoch attend. La cité perdue des anciens wardeurs." },
      ],
      nextNodeId: 'a4_intro_2',
    },
    {
      id: 'a4_intro_2', background: 'ruins',
      lines: [
        { speaker: 'arlen', text: "Le guide dit que personne ne revient du désert profond. Que les chtoniens du sable sont les pires de tous.", emotion: 'determined' },
        { speaker: 'narrator', text: "Un vieux Krasien nommé Abban — marchand, pas guerrier — a accepté de guider Arlen. Pour un prix exorbitant, bien sûr." },
        { speaker: 'arlen', text: "Abban, ces ruines sur la carte... Tu les as déjà vues ?", emotion: 'hopeful' },
        { speaker: 'narrator', text: "Abban secoue la tête. Personne n'est assez fou pour venir ici. Sauf Arlen." },
      ],
      nextNodeId: 'a4_intro_3',
    },
    {
      id: 'a4_intro_3', background: 'village_sunset',
      lines: [
        { speaker: 'narrator', text: "Des colonnes brisées émergent du sable. Des fragments de murs couverts de symboles à moitié effacés. Ce ne sont pas les grandes ruines — juste les avant-postes." },
        { speaker: 'arlen', text: "Il y a des runes ici. Des runes d'os. Je n'en avais vu que dans des livres. Ils drainent la force vitale des démons.", emotion: 'hopeful' },
        { speaker: 'narrator', text: "La nuit tombe sur le désert. Et dans le sable, quelque chose remue. Quelque chose de grand, de vieux, avec un bras en moins." },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'a4_day1', background: 'ruins',
        lines: [
          { speaker: 'narrator', text: "Première nuit. One Arm était là. Il a chargé le campement trois fois. Les runes de feu l'ont repoussé, mais il apprend. Il contourne." },
          { speaker: 'arlen', text: "Ce démon me suit depuis la route de Miln. Des mois. Il me traque comme je traque Soleil d'Anoch.", emotion: 'determined' },
          { speaker: 'narrator', text: "Le guide dit que personne ne revient du désert profond. Arlen sait qu'il n'a pas le choix." },
        ],
        choices: [
          {
            id: 'study_bone_wards',
            label: "Étudier les runes d'os des ruines mineures",
            hint: "+1 Rune d'Os en réserve, +1 Rune d'Os aux Ruines, -1 AP",
            effects: [
              { type: 'bonus_reserve_ward', wardType: 'bone' },
              { type: 'bonus_ward', wardType: 'bone', locationId: 'cutters_hollow' },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'fortify_oasis',
            label: "Renforcer les défenses de l'oasis",
            hint: "+1 Rune de Lumière à l'Oasis, +2 Encre",
            effects: [
              { type: 'bonus_ward', wardType: 'light', locationId: 'miln' },
              { type: 'add_resources', locationId: 'miln', resource: 'ink', amount: 2 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'a4_day2', background: 'road',
        lines: [
          { speaker: 'narrator', text: "Les ruines mineures contiennent des fragments de carte. Arlen les assemble, fébrilement, sous le soleil brûlant." },
          { speaker: 'arlen', text: "Soleil d'Anoch est à deux jours au sud. Sous les dunes. L'entrée est enterrée mais elle est là.", emotion: 'hopeful' },
          { speaker: 'narrator', text: "Mais le guide refuse d'aller plus loin. Il dit que le sable est maudit, que les démons ici sont plus anciens que le monde." },
          { speaker: 'arlen', text: "Alors j'irai seul.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'convince_guide',
            label: "Convaincre le guide de rester une nuit de plus",
            hint: "+2 Pop à l'Avant-Poste Krasien (le guide rallie des porteurs), -1 AP",
            effects: [
              { type: 'modify_population', locationId: 'desert_spear', delta: 2 },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'go_alone',
            label: "Partir seul vers le sud avec les fragments de carte",
            hint: "+1 Rune de Feu en réserve, +1 Rune d'Os en réserve, -2 HP",
            effects: [
              { type: 'bonus_reserve_ward', wardType: 'fire' },
              { type: 'bonus_reserve_ward', wardType: 'bone' },
              { type: 'hero_hp_change', delta: -2 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 3,
      dialogueNodes: [{
        id: 'a4_day3', background: 'ruins',
        lines: [
          { speaker: 'narrator', text: "La dernière nuit dans le désert. One Arm rôde. Arlen l'entend gratter le sable, tournant autour du campement comme un loup." },
          { speaker: 'arlen', text: "Tu me veux, One Arm ? Viens me chercher. J'ai des runes d'os maintenant. Tu sais ce qu'ils font ?", emotion: 'angry' },
          { speaker: 'narrator', text: "Le démon recule. Pour la première fois, c'est One Arm qui a peur." },
          { speaker: 'arlen', text: "C'est ça. Recule. La prochaine fois qu'on se croise, ce sera à Soleil d'Anoch. Et tu ne repartiras pas.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'confront_one_arm',
            label: "Affronter One Arm avec les runes d'os",
            hint: "-3 HP (combat féroce), Force démons -1, -1 démon par vague",
            effects: [
              { type: 'hero_hp_change', delta: -3 },
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'extra_demons', count: -1 },
              { type: 'set_flag', flag: 'fought_one_arm_desert', value: true },
            ],
          },
          {
            id: 'hold_camp',
            label: "Tenir le campement et laisser One Arm tourner",
            hint: "+1 Rune de Pierre aux Dunes, +1 Rune de Feu aux Dunes",
            effects: [
              { type: 'bonus_ward', wardType: 'stone', locationId: 'lakton' },
              { type: 'bonus_ward', wardType: 'fire', locationId: 'lakton' },
            ],
          },
        ],
      }],
    },
  ],

  victoryDialogue: [
    {
      id: 'a4_victory_1', background: 'dawn_victory',
      lines: [
        { speaker: 'narrator', text: "L'aube se lève sur le désert. Arlen a survécu. Et dans sa sacoche, la carte complète du Soleil d'Anoch." },
        { speaker: 'arlen', text: "Je sais où elle est. Sous les dunes, à deux jours au sud. L'entrée est marquée par un obélisque brisé.", emotion: 'determined' },
      ],
      nextNodeId: 'a4_victory_2',
    },
    {
      id: 'a4_victory_2', background: 'road',
      lines: [
        { speaker: 'narrator', text: "Les runes d'os changent tout. Ils ne repoussent pas — ils dévorent. Ils drainent la vie des démons comme une sangsue." },
        { speaker: 'arlen', text: "Soleil d'Anoch m'attend. Les secrets des anciens sont là-bas. Et quand je les aurai... plus personne n'aura à se cacher.", emotion: 'hopeful' },
        { speaker: 'narrator', text: "Arlen Bales. Le Messager qui marche vers les ruines du monde — et vers sa propre transformation." },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'a4_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Le sable engloutit le campement. One Arm mène la charge des chtoniens du désert. Il n'y a nulle part où fuir." },
      { speaker: 'arlen', text: "Le désert ne rend pas ses secrets... et il ne rend pas ses morts non plus.", emotion: 'angry' },
      { speaker: 'narrator', text: "La carte du Soleil d'Anoch est perdue dans les dunes. Personne ne trouvera la cité." },
      { speaker: 'narrator', text: "Chapitre 13 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 14: Leesha 4 — Le Réseau de Wards
// Leesha déploie sa théorie à grande échelle, découvre les wards d'os
// ============================================================

export const CHAPTER_LEESHA_4: ChapterDefinition = {
  id: 14,
  act: 4,
  title: 'Le Réseau de Runes',
  subtitle: "Les runes ne sont pas des murs. Ce sont des veines.",
  heroId: 'leesha',
  nightCount: 3,
  startingNightNumber: 6,
  startingPresence: 'cutters_hollow',
  hiddenLocations: [] as any,
  availableWards: ['stone', 'wind', 'fire', 'light', 'bone'] as WardType[],
  fireCanKill: true,
  maxComboSize: 3,
  locationOverrides: {
    cutters_hollow: { name: "Le Creux du Coupeur", startPop: 10, terrain: 'forest' as any },
    miln: { name: 'Atelier de Leesha', startPop: 4, terrain: 'forest' as any },
    lakton: { name: 'Scierie', startPop: 6, terrain: 'forest' as any },
    desert_spear: { name: 'Lisière Sud', startPop: 5, terrain: 'forest' as any },
  },
  preplacedWards: [
    { locationId: 'cutters_hollow', ward: 'fire' },
    { locationId: 'cutters_hollow', ward: 'stone' },
    { locationId: 'miln', ward: 'light' },
    { locationId: 'miln', ward: 'wind' },
    { locationId: 'lakton', ward: 'fire' },
    { locationId: 'desert_spear', ward: 'stone' },
  ],

  introDialogue: [
    {
      id: 'l4_intro_1', background: 'forest_village',
      lines: [
        { speaker: 'narrator', text: "Le Creux du Coupeur. Leesha est revenue d'Angiers avec les runes de lumière et une théorie qui pourrait tout changer." },
        { speaker: 'narrator', text: "Les runes ne sont pas des murs isolés. Ce sont les nœuds d'un réseau — et si on les connecte, l'énergie circule entre eux." },
        { speaker: 'leesha', text: "Un village assiegé par les démons, et moi avec une théorie non testée. Parfait.", emotion: 'determined' },
      ],
      nextNodeId: 'l4_intro_2',
    },
    {
      id: 'l4_intro_2', background: 'ward_book',
      lines: [
        { speaker: 'narrator', text: "Dans les notes les plus cryptiques de Bruna — celles qu'elle n'avait jamais osé montrer — Leesha trouve des références aux runes d'os." },
        { speaker: 'leesha', text: "Des runes qui drainent la force vitale des démons... Bruna le savait. Mais elle avait trop peur pour les utiliser.", emotion: 'hopeful' },
        { speaker: 'leesha', text: "Les runes ne sont pas des murs. Ce sont des veines. L'énergie circule.", emotion: 'determined' },
        { speaker: 'narrator', text: "La nuit tombe sur Le Creux du Coupeur. Le plus grand test de sa vie commence." },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'l4_day1', background: 'forest_village',
        lines: [
          { speaker: 'narrator', text: "Première nuit avec le réseau. Les runes ont tenu — et plus que tenu. Quand un rune faiblissait, les autres le soutenaient." },
          { speaker: 'leesha', text: "Ça fonctionne. L'énergie se redistribue. Un rune qui cède ne crée plus de brèche — les voisins compensent.", emotion: 'hopeful' },
          { speaker: 'narrator', text: "Mais les chtoniens s'adaptent. Ils attaquent maintenant en plusieurs points simultanément, testant le réseau." },
        ],
        choices: [
          {
            id: 'extend_network',
            label: "Étendre le réseau à la Scierie et la Lisière",
            hint: "+1 Rune de Lumière à la Scierie, +1 Rune de Lumière à la Lisière, -1 AP",
            effects: [
              { type: 'bonus_ward', wardType: 'light', locationId: 'lakton' },
              { type: 'bonus_ward', wardType: 'light', locationId: 'desert_spear' },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'reinforce_core',
            label: "Renforcer le cœur du réseau à l'Atelier",
            hint: "+1 Rune d'Os à l'Atelier, +3 Encre à l'Atelier",
            effects: [
              { type: 'bonus_ward', wardType: 'bone', locationId: 'miln' },
              { type: 'add_resources', locationId: 'miln', resource: 'ink', amount: 3 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'l4_day2', background: 'bruna_hut',
        lines: [
          { speaker: 'narrator', text: "Leesha passe la journée dans l'atelier, les mains tachées d'encre noire, traçant des runes d'os pour la première fois." },
          { speaker: 'leesha', text: "Bruna avait raison d'avoir peur. Les runes d'os ne sont pas comme les autres. Ils sont... vivants. Ils aspirent l'énergie.", emotion: 'scared' },
          { speaker: 'leesha', text: "Mais intégrés au réseau, ils pourraient transformer les défenses du village. Les chtoniens qui touchent le réseau seraient drainés.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'integrate_bone',
            label: "Intégrer les runes d'os au réseau (risqué mais puissant)",
            hint: "+1 Rune d'Os à Le Creux du Coupeur, Force démons -1, -3 HP (drain d'énergie)",
            effects: [
              { type: 'bonus_ward', wardType: 'bone', locationId: 'cutters_hollow' },
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'hero_hp_change', delta: -3 },
            ],
          },
          {
            id: 'safe_wards',
            label: "Utiliser les runes classiques, ne pas risquer le réseau",
            hint: "+1 Rune de Pierre à Le Creux du Coupeur, +1 Rune de Feu à la Scierie, +2 HP",
            effects: [
              { type: 'bonus_ward', wardType: 'stone', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'fire', locationId: 'lakton' },
              { type: 'hero_hp_change', delta: 2 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 3,
      dialogueNodes: [{
        id: 'l4_day3', background: 'village_sunset',
        lines: [
          { speaker: 'narrator', text: "Dernière nuit. Leesha se tient au centre du village, les yeux fermés. Elle sent le réseau pulser autour d'elle." },
          { speaker: 'leesha', text: "Chaque rune est un nœud. Chaque connexion est un vaisseau. L'énergie circule comme le sang dans un corps.", emotion: 'hopeful' },
          { speaker: 'leesha', text: "Si ce village peut tenir avec un réseau, alors tous les villages de Thesa peuvent tenir. Il suffit de leur apprendre.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'overcharge_network',
            label: "Surcharger le réseau pour la dernière nuit",
            hint: "Force démons -1, -1 démon par vague, -4 HP (le réseau draine aussi Leesha)",
            effects: [
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'extra_demons', count: -1 },
              { type: 'hero_hp_change', delta: -4 },
            ],
          },
          {
            id: 'balanced_defense',
            label: "Défense équilibrée sur tous les points",
            hint: "+1 Rune de Vent à chaque lieu",
            effects: [
              { type: 'bonus_ward', wardType: 'wind', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'wind', locationId: 'miln' },
              { type: 'bonus_ward', wardType: 'wind', locationId: 'lakton' },
              { type: 'bonus_ward', wardType: 'wind', locationId: 'desert_spear' },
            ],
          },
        ],
      }],
    },
  ],

  victoryDialogue: [
    {
      id: 'l4_victory_1', background: 'dawn_victory',
      lines: [
        { speaker: 'narrator', text: "L'aube. Le réseau a tenu. Le Creux du Coupeur est intact — et pour la première fois, les chtoniens ont été repoussés sans qu'un seul rune ne cède." },
        { speaker: 'leesha', text: "Le réseau fonctionne. Les runes ne sont plus des barrières isolées. Ils sont un organisme vivant.", emotion: 'determined' },
      ],
      nextNodeId: 'l4_victory_2',
    },
    {
      id: 'l4_victory_2', background: 'ward_book',
      lines: [
        { speaker: 'narrator', text: "Leesha dessine les plans du réseau dans son cahier. Pierre, vent, feu, lumière, os — cinq éléments, connectés en un tout." },
        { speaker: 'leesha', text: "Bruna, je comprends maintenant pourquoi vous aviez peur des runes d'os. Mais la peur ne protège personne.", emotion: 'hopeful' },
        { speaker: 'narrator', text: "Leesha Paper. L'herboriste qui a transformé les runes en science. Le village n'est plus une proie — c'est une forteresse." },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'l4_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Le réseau s'effondre. Chaque rune qui cède en entraîne un autre, comme des dominos. La cascade est implacable." },
      { speaker: 'leesha', text: "Non... Le réseau amplifie la défaillance autant que la force. J'aurais dû le prévoir.", emotion: 'sad' },
      { speaker: 'narrator', text: "Le Creux du Coupeur brûle. La science des runes est une arme à double tranchant." },
      { speaker: 'narrator', text: "Chapitre 14 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 15: Jardir 4 — L'Unification de Krasia
// Jardir unifie les tribus, déclare Sharak Ka
// ============================================================

export const CHAPTER_JARDIR_4: ChapterDefinition = {
  id: 15,
  act: 4,
  title: "L'Unification de Krasia",
  subtitle: "Le désert ne suffit plus. L'ennemi est partout.",
  heroId: 'jardir',
  nightCount: 4,
  startingNightNumber: 6,
  startingPresence: 'desert_spear',
  hiddenLocations: [] as any,
  availableWards: ['stone', 'wind', 'fire', 'light', 'bone'] as WardType[],
  fireCanKill: true,
  maxComboSize: 3,
  locationOverrides: {
    desert_spear: { name: 'Trône de Krasia', startPop: 8, terrain: 'desert' as any },
    cutters_hollow: { name: 'Camp de la Tribu Majah', startPop: 5, terrain: 'desert' as any },
    miln: { name: 'Arène du Défi', startPop: 4, terrain: 'desert' as any },
    lakton: { name: 'Portes du Désert', startPop: 6, terrain: 'desert' as any },
  },
  preplacedWards: [
    { locationId: 'desert_spear', ward: 'fire' },
    { locationId: 'desert_spear', ward: 'stone' },
    { locationId: 'desert_spear', ward: 'light' },
    { locationId: 'cutters_hollow', ward: 'fire' },
    { locationId: 'cutters_hollow', ward: 'wind' },
    { locationId: 'miln', ward: 'stone' },
    { locationId: 'lakton', ward: 'fire' },
  ],

  introDialogue: [
    {
      id: 'j4_intro_1', background: 'krasia',
      lines: [
        { speaker: 'narrator', text: "Fort Krasia. Les tribus se déchirent. Majah contre Kaji, Mehnding contre Sharach. Chaque nuit, le Labyrinthe perd des guerriers — pas face aux démons, mais face aux rivalités." },
        { speaker: 'narrator', text: "Jardir a la Lance de Kaji. Il a la foi d'Inevera. Et il a une vision : unir toutes les tribus sous une seule bannière." },
        { speaker: 'jardir', text: "Krasia se meurt. Pas à cause des démons — à cause de notre propre stupidité. Les tribus se battent entre elles pendant que les chtoniens rient dans le noir.", emotion: 'angry' },
      ],
      nextNodeId: 'j4_intro_2',
    },
    {
      id: 'j4_intro_2', background: 'maze',
      lines: [
        { speaker: 'inevera', text: "Les os disent que tu dois défier chaque chef de tribu. La Lance légitimera ta victoire.", emotion: 'neutral' },
        { speaker: 'jardir', text: "Et si je perds ?", emotion: 'determined' },
        { speaker: 'inevera', text: "Tu ne perdras pas. Mais tu saigneras.", emotion: 'sad' },
        { speaker: 'narrator', text: "Jardir regarde la Lance de Kaji. Les runes de lumière pulsent doucement, comme un cœur qui bat." },
        { speaker: 'jardir', text: "Alors que le sang coule. Sharak Ka ne peut pas attendre.", emotion: 'determined' },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'j4_day1', background: 'krasia',
        lines: [
          { speaker: 'narrator', text: "Premier défi. Le chef de la tribu Majah refuse de reconnaître Jardir. Il faut le vaincre — ou le convaincre." },
          { speaker: 'jardir', text: "Je ne te demande pas de t'agenouiller, Majah. Je te demande de te battre à mes côtés.", emotion: 'determined' },
          { speaker: 'narrator', text: "Le chef Majah crache par terre. Il veut le sang, pas les mots." },
        ],
        choices: [
          {
            id: 'duel_majah',
            label: "Accepter le duel rituel",
            hint: "-3 HP (combat brutal), mais +3 Pop au Camp Majah (la tribu se rallie)",
            effects: [
              { type: 'hero_hp_change', delta: -3 },
              { type: 'modify_population', locationId: 'cutters_hollow', delta: 3 },
              { type: 'set_flag', flag: 'defeated_majah', value: true },
            ],
          },
          {
            id: 'diplomatic_approach',
            label: "Proposer une alliance contre les démons cette nuit",
            hint: "+1 Rune de Feu au Camp Majah, +1 Rune de Pierre au Camp Majah",
            effects: [
              { type: 'bonus_ward', wardType: 'fire', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'stone', locationId: 'cutters_hollow' },
              { type: 'set_flag', flag: 'defeated_majah', value: false },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'j4_day2', background: 'maze',
        lines: [
          { speaker: 'narrator', text: "La nuit a été terrible. Les chtoniens ont attaqué en masse, comme s'ils sentaient la division des tribus." },
          { speaker: 'jardir', text: "Vous voyez ? Divisés, nous mourrons un par un. Unis, nous tiendrons.", emotion: 'angry' },
          { speaker: 'narrator', text: "Les guerriers Majah ont combattu aux côtés des Kaji cette nuit. Pour la première fois, deux tribus dans le même Labyrinthe." },
          { speaker: 'jardir', text: "Le désert ne me suffit plus. Les démons ne sont pas seulement ici. Ils sont partout. Au nord, les gens se cachent derrière leurs murs.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'train_combined',
            label: "Entraîner les tribus à combattre ensemble",
            hint: "Force démons -1 (coordination), -1 AP",
            effects: [
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'ward_arena',
            label: "Warder l'Arène du Défi pour les prochains combats",
            hint: "+1 Rune de Lumière à l'Arène, +1 Rune d'Os à l'Arène",
            effects: [
              { type: 'bonus_ward', wardType: 'light', locationId: 'miln' },
              { type: 'bonus_ward', wardType: 'bone', locationId: 'miln' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 3,
      dialogueNodes: [{
        id: 'j4_day3', background: 'krasia',
        lines: [
          { speaker: 'narrator', text: "Les derniers chefs de tribu ont été vaincus ou ralliés. Jardir se tient devant le Trône de Krasia." },
          { speaker: 'jardir', text: "Je déclare Sharak Ka. La Première Guerre. Nous ne défendrons plus le Labyrinthe. Nous marcherons vers le nord.", emotion: 'determined' },
          { speaker: 'inevera', text: "Le chemin du nord mène à la victoire — ou à la ruine. Les os ne disent jamais lequel.", emotion: 'neutral' },
          { speaker: 'jardir', text: "Alors nous verrons bien. Everam guidera nos lances.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'march_north',
            label: "Préparer la marche vers le nord immédiatement",
            hint: "+2 Pop aux Portes du Désert (l'armée se rassemble), -1 démon par vague",
            effects: [
              { type: 'modify_population', locationId: 'lakton', delta: 2 },
              { type: 'extra_demons', count: -1 },
            ],
          },
          {
            id: 'fortify_first',
            label: "Fortifier Krasia avant de partir",
            hint: "+1 Rune d'Os au Trône, +1 Rune de Lumière aux Portes",
            effects: [
              { type: 'bonus_ward', wardType: 'bone', locationId: 'desert_spear' },
              { type: 'bonus_ward', wardType: 'light', locationId: 'lakton' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 4,
      dialogueNodes: [{
        id: 'j4_day4', background: 'village_sunset',
        lines: [
          { speaker: 'narrator', text: "Dernière nuit à Fort Krasia. Demain, l'armée krasienne marchera vers le nord. Vers l'inconnu." },
          { speaker: 'jardir', text: "Nous marcherons vers le nord. Nous trouverons les peuples qui se cachent derrière leurs murs. Et nous les forcerons à se battre.", emotion: 'determined' },
          { speaker: 'inevera', text: "Ou nous les libérerons. Selon comment ils le voient.", emotion: 'neutral' },
          { speaker: 'narrator', text: "La horde de chtoniens attaque une dernière fois, comme pour empêcher Jardir de partir." },
        ],
        choices: [
          {
            id: 'lead_final_charge',
            label: "Mener une dernière charge dans le Labyrinthe avec la Lance",
            hint: "-3 HP, Force démons -1, -1 démon par vague",
            effects: [
              { type: 'hero_hp_change', delta: -3 },
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'extra_demons', count: -1 },
            ],
          },
          {
            id: 'defend_gates',
            label: "Défendre les Portes du Désert pour protéger l'armée",
            hint: "+1 Rune de Feu et +1 Rune d'Os aux Portes",
            effects: [
              { type: 'bonus_ward', wardType: 'fire', locationId: 'lakton' },
              { type: 'bonus_ward', wardType: 'bone', locationId: 'lakton' },
            ],
          },
        ],
      }],
    },
  ],

  victoryDialogue: [
    {
      id: 'j4_victory_1', background: 'dawn_victory',
      lines: [
        { speaker: 'narrator', text: "L'aube sur le désert. Krasia est unie. Pour la première fois depuis des siècles, toutes les tribus marchent ensemble." },
        { speaker: 'jardir', text: "Le Labyrinthe est derrière nous. Devant nous, le nord. Devant nous, la guerre.", emotion: 'determined' },
      ],
      nextNodeId: 'j4_victory_2',
    },
    {
      id: 'j4_victory_2', background: 'krasia',
      lines: [
        { speaker: 'narrator', text: "Des milliers de guerriers Sharum lèvent leurs lances vers le ciel. Le cri de guerre résonne dans le désert : Sharak Ka !" },
        { speaker: 'narrator', text: "Ahmann Jardir. Shar'Dama Ka. Le Délivreur. L'homme qui a uni Krasia et qui marche maintenant vers un monde qui ne le connaît pas encore." },
        { speaker: 'jardir', text: "Ces gens du nord sont faibles. Mais leur science des runes... Everam avait raison de m'envoyer vers eux.", emotion: 'determined' },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'j4_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "La dernière nuit à Krasia tourne au désastre. Les tribus se retournent les unes contre les autres dans la confusion." },
      { speaker: 'jardir', text: "Non ! Nous sommes une seule armée ! UNE SEULE !", emotion: 'angry' },
      { speaker: 'narrator', text: "Mais le chaos est plus fort que la foi. Sharak Ka meurt avant même d'avoir commencé." },
      { speaker: 'narrator', text: "Chapitre 15 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 16: Rojer 4 — La Flûte d'Os
// Rojer découvre l'instrument en os de démon, arrive à Cutter's Hollow
// ============================================================

export const CHAPTER_ROJER_4: ChapterDefinition = {
  id: 16,
  act: 4,
  title: "La Flûte d'Os",
  subtitle: "Il joue et les runes vibrent. Ce n'est plus de la musique. C'est une arme.",
  heroId: 'rojer',
  nightCount: 3,
  startingNightNumber: 6,
  startingPresence: 'cutters_hollow',
  hiddenLocations: ['desert_spear'] as any,
  availableWards: ['stone', 'wind', 'fire', 'light', 'bone'] as WardType[],
  fireCanKill: true,
  maxComboSize: 3,
  locationOverrides: {
    cutters_hollow: { name: 'Route du Creux du Coupeur', startPop: 5, terrain: 'forest' as any },
    miln: { name: 'Atelier du Luthier', startPop: 3, terrain: 'forest' as any },
    lakton: { name: 'Entrée du Village', startPop: 7, terrain: 'forest' as any },
    desert_spear: { name: '', startPop: 0 },
  },
  preplacedWards: [
    { locationId: 'cutters_hollow', ward: 'stone' },
    { locationId: 'cutters_hollow', ward: 'fire' },
    { locationId: 'miln', ward: 'wind' },
    { locationId: 'miln', ward: 'light' },
    { locationId: 'lakton', ward: 'stone' },
    { locationId: 'lakton', ward: 'fire' },
  ],

  introDialogue: [
    {
      id: 'r4_intro_1', background: 'road',
      lines: [
        { speaker: 'narrator', text: "Sur la route de Le Creux du Coupeur, Rojer et Leesha croisent un luthier ambulant. Un vieil homme avec un chariot rempli d'instruments." },
        { speaker: 'narrator', text: "Parmi les violons et les luths, un objet attire l'œil de Rojer. Une flûte. Blanche comme de l'ivoire, mais plus dure. Faite d'un matériau qu'il n'a jamais vu." },
        { speaker: 'rojer', text: "Cette flûte... Elle est faite en quoi ?", emotion: 'hopeful' },
      ],
      nextNodeId: 'r4_intro_2',
    },
    {
      id: 'r4_intro_2', background: 'inn',
      lines: [
        { speaker: 'narrator', text: "Le luthier hésite. Il baisse la voix." },
        { speaker: 'narrator', text: "De l'os de chtonien, murmure-t-il. Trouvé dans le désert. Personne n'en veut — les gens disent que c'est maudit." },
        { speaker: 'rojer', text: "Maudit ? Ou runeé ?", emotion: 'determined' },
        { speaker: 'narrator', text: "Rojer porte la flûte à ses lèvres. La première note qui en sort fait trembler l'air. Les runes du chariot vibrent en résonance." },
        { speaker: 'leesha', text: "Rojer... Les runes réagissent à ta musique. L'os de démon amplifie les fréquences.", emotion: 'hopeful' },
      ],
      nextNodeId: 'r4_intro_3',
    },
    {
      id: 'r4_intro_3', background: 'village_sunset',
      lines: [
        { speaker: 'narrator', text: "Rojer achète la flûte. Ce soir-là, il joue pour la première fois avec un instrument en os de démon." },
        { speaker: 'narrator', text: "Le son est différent. Plus profond. Plus vrai. Comme si la musique touchait directement l'essence des chtoniens." },
        { speaker: 'rojer', text: "Avec le violon, je les calmais. Avec la flûte, je les commande.", emotion: 'determined' },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'r4_day1', background: 'forest_village',
        lines: [
          { speaker: 'narrator', text: "Première nuit avec la flûte d'os. Les chtoniens n'ont pas simplement hésité — certains ont reculé. Reculé et fui." },
          { speaker: 'rojer', text: "Le violon les calme. La flûte les terrifie. C'est l'os de démon — il résonne avec leur propre essence.", emotion: 'hopeful' },
          { speaker: 'leesha', text: "Si tu combines violon et flûte, tu pourrais couvrir toute la gamme. Calmer certains, repousser d'autres.", emotion: 'determined' },
          { speaker: 'rojer', text: "La triple technique. Violon de la main droite, flûte de la gauche, et la voix. Trois armes.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'practice_triple',
            label: "S'entraîner à la triple technique (violon + flûte + voix)",
            hint: "Force démons -1, -2 HP (effort surhumain sur les mains mutilées)",
            effects: [
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'hero_hp_change', delta: -2 },
              { type: 'set_flag', flag: 'learned_triple', value: true },
            ],
          },
          {
            id: 'safe_practice',
            label: "Pratiquer la flûte seule, perfectionner les bases",
            hint: "+1 Rune de Lumière en réserve (la flûte active les runes de lumière), +1 Rune d'Os en réserve",
            effects: [
              { type: 'bonus_reserve_ward', wardType: 'light' },
              { type: 'bonus_reserve_ward', wardType: 'bone' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'r4_day2', background: 'inn',
        lines: [
          { speaker: 'narrator', text: "Rojer joue et les runes vibrent. Le son de la flûte d'os résonne dans les runes tracées sur les murs du village." },
          { speaker: 'narrator', text: "Ce n'est plus de la musique. C'est une arme." },
          { speaker: 'leesha', text: "Tu actives les runes à distance, Rojer. Sans les toucher. Juste avec le son.", emotion: 'hopeful' },
          { speaker: 'rojer', text: "Ses doigts saignent. Deux seulement sur la main gauche, mais ils suffisent.", emotion: 'sad' },
        ],
        choices: [
          {
            id: 'activate_ward_net',
            label: "Jouer pour activer le réseau de runes de Leesha",
            hint: "+1 Rune de Lumière à chaque lieu, -3 HP (les doigts en sang)",
            effects: [
              { type: 'bonus_ward', wardType: 'light', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'light', locationId: 'miln' },
              { type: 'bonus_ward', wardType: 'light', locationId: 'lakton' },
              { type: 'hero_hp_change', delta: -3 },
            ],
          },
          {
            id: 'rest_hands',
            label: "Reposer ses mains, renforcer les défenses classiques",
            hint: "+3 HP, +1 Rune de Feu à la Route",
            effects: [
              { type: 'hero_hp_change', delta: 3 },
              { type: 'bonus_ward', wardType: 'fire', locationId: 'cutters_hollow' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 3,
      dialogueNodes: [{
        id: 'r4_day3', background: 'village_sunset',
        lines: [
          { speaker: 'narrator', text: "Le Creux du Coupeur est en vue. Les lumières du village brillent à travers les arbres. Mais la dernière nuit sera la pire." },
          { speaker: 'rojer', text: "On y est presque, Leesha. Une dernière nuit.", emotion: 'determined' },
          { speaker: 'leesha', text: "Les chtoniens de cette forêt sont furieux. Ils sentent la flûte d'os. Elle les met en rage.", emotion: 'scared' },
          { speaker: 'rojer', text: "Tant mieux. Les démons en rage font des erreurs.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'full_concert',
            label: "Donner un concert de guerre : violon, flûte et voix toute la nuit",
            hint: "-1 démon par vague, Force démons -1, -4 HP (au bord de l'évanouissement)",
            effects: [
              { type: 'extra_demons', count: -1 },
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'hero_hp_change', delta: -4 },
            ],
          },
          {
            id: 'safe_approach',
            label: "Jouer par intermittence, laisser les runes faire le travail",
            hint: "+1 Rune d'Os à l'Entrée, +1 Rune de Pierre à l'Entrée",
            effects: [
              { type: 'bonus_ward', wardType: 'bone', locationId: 'lakton' },
              { type: 'bonus_ward', wardType: 'stone', locationId: 'lakton' },
            ],
          },
        ],
      }],
    },
  ],

  victoryDialogue: [
    {
      id: 'r4_victory_1', background: 'dawn_victory',
      lines: [
        { speaker: 'narrator', text: "L'aube. Le Creux du Coupeur. Rojer et Leesha franchissent les portes du village, épuisés mais vivants." },
        { speaker: 'narrator', text: "Les villageois les accueillent. Leesha est leur herboriste revenue. Et Rojer... Rojer est quelque chose qu'ils n'ont jamais vu." },
      ],
      nextNodeId: 'r4_victory_2',
    },
    {
      id: 'r4_victory_2', background: 'forest_village',
      lines: [
        { speaker: 'rojer', text: "Quand je joue, les runes vibrent. Ce n'est plus de la musique. C'est un pont entre les humains et la magie des anciens.", emotion: 'hopeful' },
        { speaker: 'leesha', text: "Tu es le chaînon manquant, Rojer. Mes réseaux de runes ont besoin de quelqu'un pour les activer en harmonie. C'est toi.", emotion: 'determined' },
        { speaker: 'narrator', text: "Rojer Halfgrip. Le Maestro. L'homme aux deux doigts qui fait chanter les runes et pleurer les démons." },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'r4_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "La flûte d'os se brise dans la mêlée. Le son meurt. Et sans musique, les chtoniens n'ont plus peur de rien." },
      { speaker: 'rojer', text: "La flûte... Non... C'était la seule...", emotion: 'scared' },
      { speaker: 'narrator', text: "Les portes de Le Creux du Coupeur étaient si proches. Mais la nuit est implacable." },
      { speaker: 'narrator', text: "Chapitre 16 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 17: Arlen 5 — Anoch Sun
// Arlen découvre la cité perdue et les wards de combat
// ============================================================

export const CHAPTER_ARLEN_5: ChapterDefinition = {
  id: 17,
  act: 5,
  title: "Soleil d'Anoch",
  subtitle: "La cité perdue. Les runes oubliés. Le pouvoir de se battre.",
  heroId: 'arlen_young',
  nightCount: 4,
  startingNightNumber: 7,
  startingPresence: 'miln',
  hiddenLocations: [] as any,
  availableWards: ['stone', 'wind', 'fire', 'light', 'bone'] as WardType[],
  fireCanKill: true,
  maxComboSize: 3,
  locationOverrides: {
    miln: { name: 'Portes du Soleil d\'Anoch', startPop: 3, terrain: 'desert' as any },
    cutters_hollow: { name: 'Salle des Fresques', startPop: 4, terrain: 'underground' as any },
    lakton: { name: 'Bibliothèque Ensevelie', startPop: 2, terrain: 'underground' as any },
    desert_spear: { name: 'Tombeau du Conquérant', startPop: 3, terrain: 'underground' as any },
  },
  preplacedWards: [
    { locationId: 'miln', ward: 'stone' },
    { locationId: 'miln', ward: 'fire' },
    { locationId: 'cutters_hollow', ward: 'light' },
    { locationId: 'cutters_hollow', ward: 'bone' },
    { locationId: 'lakton', ward: 'wind' },
    { locationId: 'desert_spear', ward: 'fire' },
  ],

  introDialogue: [
    {
      id: 'a4_intro_1', background: 'desert',
      lines: [
        { speaker: 'narrator', text: "Le désert de Krasie. Personne ne vient ici. Les sables avalent tout — hommes, bêtes, et les cités d'un monde oublié." },
        { speaker: 'narrator', text: "Arlen a passé des mois à chercher. Des cartes anciennes, des fragments de textes, des indices dispersés dans les bibliothèques de Miln et Lakton." },
        { speaker: 'narrator', text: "Et maintenant, devant lui, émergeant des dunes comme un squelette de pierre : Soleil d'Anoch. La cité perdue." },
      ],
      nextNodeId: 'a4_intro_2',
    },
    {
      id: 'a4_intro_2', background: 'anoch_sun',
      lines: [
        { speaker: 'arlen_young', text: "C'est réel. Soleil d'Anoch. La plus grande cité de l'ancien monde.", emotion: 'hopeful' },
        { speaker: 'narrator', text: "Les murs sont couverts de runes — mais pas les runes défensifs que connaît Arlen. Ce sont des runes de combat. Des runes qui tuent." },
        { speaker: 'arlen_young', text: "Des runes d'os... Je n'ai jamais vu ça. Ils drainent la force vitale des démons.", emotion: 'hopeful' },
        { speaker: 'narrator', text: "Mais la nuit tombe sur le désert. Et dans les ruines du Soleil d'Anoch, les chtoniens sont anciens. Puissants. Furieux qu'on viole leur domaine." },
      ],
      nextNodeId: 'a4_intro_3',
    },
    {
      id: 'a4_intro_3', background: 'ruins',
      lines: [
        { speaker: 'arlen_young', text: "Quatre nuits. Il me faut quatre nuits pour tout étudier, tout recopier.", emotion: 'determined' },
        { speaker: 'narrator', text: "Quatre nuits seul dans une cité morte, entouré de démons millénaires. La folie — ou le courage — d'un homme qui refuse d'avoir peur." },
        { speaker: 'arlen_young', text: "Vous ne me chasserez pas. Ces runes appartiennent à l'humanité. Et je vais les lui rendre.", emotion: 'determined' },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'a4_day1', background: 'ruins',
        lines: [
          { speaker: 'narrator', text: "Première nuit à Soleil d'Anoch. Les démons ici sont différents — plus gros, plus intelligents. Comme s'ils gardaient la cité." },
          { speaker: 'arlen_young', text: "La Salle des Fresques est intacte. Les murs sont couverts de runes de combat. Si je peux les recopier...", emotion: 'hopeful' },
          { speaker: 'narrator', text: "Mais les sables ont envahi les couloirs. Il faudra creuser pour atteindre la Bibliothèque Ensevelie." },
        ],
        choices: [
          {
            id: 'copy_frescoes',
            label: "Recopier les runes des fresques",
            hint: "+1 Rune d'Os en réserve, -1 AP (travail minutieux)",
            effects: [
              { type: 'bonus_reserve_ward', wardType: 'bone' },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'dig_library',
            label: "Creuser vers la Bibliothèque Ensevelie",
            hint: "+1 Rune de Lumière à la Bibliothèque, +2 Encre, -2 HP",
            effects: [
              { type: 'bonus_ward', wardType: 'light', locationId: 'lakton' },
              { type: 'add_resources', locationId: 'lakton', resource: 'ink', amount: 2 },
              { type: 'hero_hp_change', delta: -2 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'a4_day2', background: 'ruins',
        lines: [
          { speaker: 'narrator', text: "Arlen a découvert le Tombeau du Conquérant — un sarcophage couvert de runes d'os. Le guerrier enterré là combattait les démons corps à corps." },
          { speaker: 'arlen_young', text: "Ces runes... Ils ne sont pas gravés dans la pierre. Ils sont gravés dans la peau.", emotion: 'hopeful' },
          { speaker: 'arlen_young', text: "Des tatouages de runes. L'ancien guerrier portait les runes sur son propre corps.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'study_tattoos',
            label: "Étudier les tatouages de runes en détail",
            hint: "+1 Rune d'Os au Tombeau, +1 Rune de Feu au Tombeau, -1 AP",
            effects: [
              { type: 'bonus_ward', wardType: 'bone', locationId: 'desert_spear' },
              { type: 'bonus_ward', wardType: 'fire', locationId: 'desert_spear' },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'fortify_entrance',
            label: "Sécuriser les Portes du Soleil d'Anoch",
            hint: "+1 Rune de Pierre et +1 Rune de Vent aux Portes",
            effects: [
              { type: 'bonus_ward', wardType: 'stone', locationId: 'miln' },
              { type: 'bonus_ward', wardType: 'wind', locationId: 'miln' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 3,
      dialogueNodes: [{
        id: 'a4_day3', background: 'ruins',
        lines: [
          { speaker: 'narrator', text: "Troisième nuit. Les chtoniens sont de plus en plus nombreux, comme si toute la horde du désert convergeait vers Soleil d'Anoch." },
          { speaker: 'arlen_young', text: "Ils sentent que je suis là. Ils sentent les runes. Ça les met en rage.", emotion: 'determined' },
          { speaker: 'narrator', text: "Arlen regarde les runes gravés dans le sarcophage. Une idée folle germe dans son esprit." },
          { speaker: 'arlen_young', text: "Si je grave les runes dans ma propre peau... Je deviendrais une arme vivante.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'tattoo_wards',
            label: "Commencer à se tatouer les runes de combat",
            hint: "Force démons -1 (aura de rune), mais -4 HP (douleur intense)",
            effects: [
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'hero_hp_change', delta: -4 },
              { type: 'set_flag', flag: 'tattooed_wards', value: true },
            ],
          },
          {
            id: 'just_copy',
            label: "Se contenter de recopier les runes sur parchemin",
            hint: "+1 Rune d'Os en réserve, +1 Rune de Lumière en réserve",
            effects: [
              { type: 'bonus_reserve_ward', wardType: 'bone' },
              { type: 'bonus_reserve_ward', wardType: 'light' },
              { type: 'set_flag', flag: 'tattooed_wards', value: false },
            ],
          },
        ],
      }],
    },
  ],

  victoryDialogue: [
    {
      id: 'a4_victory_1', background: 'dawn_victory',
      lines: [
        { speaker: 'narrator', text: "L'aube se lève sur Soleil d'Anoch. Les dunes se teintent d'or. Les chtoniens s'enfoncent dans le sable, vaincus une fois de plus." },
        { speaker: 'narrator', text: "Arlen est couvert de blessures. Ses bras portent des runes fraîchement gravés dans sa peau, encore rouges de sang." },
        { speaker: 'arlen_young', text: "Je les ai. Tous les runes. Pierre, vent, feu, lumière, os. Les runes de combat des anciens.", emotion: 'determined' },
      ],
      nextNodeId: 'a4_victory_2',
    },
    {
      id: 'a4_victory_2', background: 'ruins',
      lines: [
        { speaker: 'narrator', text: "Arlen quitte Soleil d'Anoch avec un savoir que personne ne possède depuis trois cents ans. Le savoir de se battre." },
        { speaker: 'narrator', text: "Il n'est plus Arlen le Messager. Il n'est plus Arlen de Ruisseau de Tibbet." },
        { speaker: 'narrator', text: "Les gens l'appelleront le Homme-Rune. L'Homme Runeé. Le premier guerrier de l'humanité depuis la chute." },
        { speaker: 'arlen_young', text: "Rentrons. Il est temps de montrer au monde qu'on peut se battre.", emotion: 'determined' },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'a4_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Les runes du Soleil d'Anoch sont trop anciens, trop fragiles. Un par un, ils s'effondrent sous l'assaut des chtoniens du désert." },
      { speaker: 'arlen_young', text: "Non ! J'étais si près... Les runes de combat... Tout ce savoir, perdu à nouveau...", emotion: 'angry' },
      { speaker: 'narrator', text: "Le sable engloutit Soleil d'Anoch. Et avec elle, le dernier espoir de l'humanité de se relever." },
      { speaker: 'narrator', text: "Chapitre 17 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 18: Leesha 5 — La Guérisseuse de Cutter's Hollow
// Leesha revient à Cutter's Hollow, construit le réseau de wards
// ============================================================

export const CHAPTER_LEESHA_5: ChapterDefinition = {
  id: 18,
  act: 5,
  title: "La Guérisseuse de Le Creux du Coupeur",
  subtitle: "Ce village m'a vue partir comme une gamine. Je reviens comme leur seul espoir.",
  heroId: 'leesha_young',
  nightCount: 3,
  startingNightNumber: 7,
  startingPresence: 'cutters_hollow',
  hiddenLocations: ['desert_spear'] as any,
  availableWards: ['stone', 'wind', 'fire', 'light', 'bone'] as WardType[],
  fireCanKill: true,
  maxComboSize: 3,
  locationOverrides: {
    cutters_hollow: { name: "Place du Village", startPop: 8, terrain: 'forest' as any },
    miln: { name: 'Atelier de Leesha', startPop: 4, terrain: 'forest' as any },
    lakton: { name: 'Lisière de la Forêt', startPop: 5, terrain: 'forest' as any },
    desert_spear: { name: '', startPop: 0 },
  },
  preplacedWards: [
    { locationId: 'cutters_hollow', ward: 'stone' },
    { locationId: 'cutters_hollow', ward: 'fire' },
    { locationId: 'cutters_hollow', ward: 'light' },
    { locationId: 'miln', ward: 'wind' },
    { locationId: 'miln', ward: 'bone' },
    { locationId: 'lakton', ward: 'stone' },
    { locationId: 'lakton', ward: 'fire' },
  ],

  introDialogue: [
    {
      id: 'l5_intro_1', background: 'road',
      lines: [
        { speaker: 'narrator', text: "La route de Le Creux du Coupeur serpente entre les arbres. Leesha reconnaît chaque virage, chaque racine, chaque ombre. Elle est partie d'ici adolescente, avec les herbes de Bruna pour seul bagage." },
        { speaker: 'narrator', text: "Le village apparaît entre les chênes. Plus petit que dans ses souvenirs. Plus fragile." },
        { speaker: 'leesha_young', text: "Les runes du périmètre sont en ruine. Des années sans entretien. Comment ont-ils survécu ?", emotion: 'scared' },
      ],
      nextNodeId: 'l5_intro_2',
    },
    {
      id: 'l5_intro_2', background: 'forest_village',
      lines: [
        { speaker: 'narrator', text: "Le Gardien Smitt l'accueille à la porte. Il a vieilli. Ses mains tremblent." },
        { speaker: 'narrator', text: "Leesha, murmure-t-il. Bruna serait fière." },
        { speaker: 'leesha_young', text: "Bruna serait furieuse. Regardez ces runes — mal tracés, mal orientés. Un enfant ferait mieux.", emotion: 'angry' },
        { speaker: 'narrator', text: "Elle pose son sac au milieu de la place. Sort ses encres, ses pinceaux, ses carnets. Ce village m'a vue partir comme une gamine. Je reviens comme leur seul espoir." },
      ],
      nextNodeId: 'l5_intro_3',
    },
    {
      id: 'l5_intro_3', background: 'village_sunset',
      lines: [
        { speaker: 'leesha_young', text: "Je vais reconstruire chaque rune de ce village. Pas des lignes isolées — un réseau. Chaque rune connectée aux autres.", emotion: 'determined' },
        { speaker: 'narrator', text: "Les villageois la regardent. Certains se souviennent de la fille de Bruna. D'autres ne voient qu'une étrangère qui donne des ordres." },
        { speaker: 'leesha_young', text: "Vous n'avez pas besoin de me faire confiance. Vous avez besoin de survivre.", emotion: 'determined' },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'l5_day1', background: 'forest_village',
        lines: [
          { speaker: 'narrator', text: "La première nuit a révélé les failles. Les runes du périmètre est ont failli céder. Trois familles ont frôlé la mort." },
          { speaker: 'leesha_young', text: "Le réseau doit être continu. Un seul rune brisé et toute la chaîne s'effondre.", emotion: 'determined' },
          { speaker: 'narrator', text: "Le forgeron Yon Gray propose son aide. Ses mains sont assez précises pour graver dans le métal." },
        ],
        choices: [
          {
            id: 'train_yon',
            label: "Former Yon à graver les runes dans le métal des portes",
            hint: "+1 Rune de Pierre et +1 Rune de Vent à la Place, -1 AP (temps de formation)",
            effects: [
              { type: 'bonus_ward', wardType: 'stone', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'wind', locationId: 'cutters_hollow' },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'solo_network',
            label: "Tracer le réseau seule — plus rapide, plus précis",
            hint: "+1 Rune de Lumière à chaque lieu, -3 HP (épuisement)",
            effects: [
              { type: 'bonus_ward', wardType: 'light', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'light', locationId: 'miln' },
              { type: 'bonus_ward', wardType: 'light', locationId: 'lakton' },
              { type: 'hero_hp_change', delta: -3 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'l5_day2', background: 'bruna_hut',
        lines: [
          { speaker: 'narrator', text: "Leesha retrouve la cabane de Bruna. Intacte. Les herbes séchées pendent encore du plafond, poussiéreuses." },
          { speaker: 'leesha_young', text: "Son dernier journal. Celui qu'elle m'avait interdit de lire.", emotion: 'sad' },
          { speaker: 'narrator', text: "Entre les pages jaunies, des schémas de runes que Leesha n'a jamais vus. Des runes triples. Des combinaisons qui amplifient la puissance du réseau." },
        ],
        choices: [
          {
            id: 'study_bruna',
            label: "Étudier les schémas de Bruna toute la nuit",
            hint: "+1 Rune d'Os en réserve, +1 Rune de Feu en réserve, -2 HP (nuit blanche)",
            effects: [
              { type: 'bonus_reserve_ward', wardType: 'bone' },
              { type: 'bonus_reserve_ward', wardType: 'fire' },
              { type: 'hero_hp_change', delta: -2 },
            ],
          },
          {
            id: 'reinforce_perimeter',
            label: "Renforcer le périmètre avec les connaissances existantes",
            hint: "+1 Rune de Pierre à la Lisière, +1 Rune de Feu à la Lisière",
            effects: [
              { type: 'bonus_ward', wardType: 'stone', locationId: 'lakton' },
              { type: 'bonus_ward', wardType: 'fire', locationId: 'lakton' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 3,
      dialogueNodes: [{
        id: 'l5_day3', background: 'village_sunset',
        lines: [
          { speaker: 'narrator', text: "Le réseau de runes prend forme. Des lignes d'énergie relient chaque bâtiment, chaque porte, chaque mur." },
          { speaker: 'leesha_young', text: "Les runes ne sont pas des murs. Ce sont des veines. L'énergie doit circuler.", emotion: 'hopeful' },
          { speaker: 'narrator', text: "Mais la dernière section manque d'encre. Les réserves sont épuisées. Il faut improviser." },
        ],
        choices: [
          {
            id: 'blood_ink',
            label: "Utiliser son propre sang mélangé aux herbes comme encre",
            hint: "+1 Rune d'Os à chaque lieu, -4 HP (sacrifice physique)",
            effects: [
              { type: 'bonus_ward', wardType: 'bone', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'bone', locationId: 'miln' },
              { type: 'bonus_ward', wardType: 'bone', locationId: 'lakton' },
              { type: 'hero_hp_change', delta: -4 },
            ],
          },
          {
            id: 'partial_network',
            label: "Compléter le réseau partiellement, concentrer sur le centre",
            hint: "+1 Rune d'Os au Centre, +1 Rune de Lumière au Centre, +2 HP (repos)",
            effects: [
              { type: 'bonus_ward', wardType: 'bone', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'light', locationId: 'cutters_hollow' },
              { type: 'hero_hp_change', delta: 2 },
            ],
          },
        ],
      }],
    },
  ],

  victoryDialogue: [
    {
      id: 'l5_victory_1', background: 'dawn_victory',
      lines: [
        { speaker: 'narrator', text: "L'aube illumine Le Creux du Coupeur. Les runes tracés sur les murs luisent encore, réseau de veines lumineuses qui parcourt tout le village." },
        { speaker: 'narrator', text: "Les villageois sortent un par un. Ils regardent les murs, les portes, le sol. Partout, des runes. Un cocon de protection qu'ils n'avaient jamais connu." },
      ],
      nextNodeId: 'l5_victory_2',
    },
    {
      id: 'l5_victory_2', background: 'forest_village',
      lines: [
        { speaker: 'leesha_young', text: "Le réseau tient. Chaque rune alimente les autres. Bruna avait compris, mais elle n'avait jamais eu les moyens de le construire.", emotion: 'hopeful' },
        { speaker: 'narrator', text: "Le Creux du Coupeur n'est plus un village qui subit la nuit. C'est une forteresse vivante, qui respire au rythme des runes." },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'l5_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Le réseau se fissure. Un rune cède, puis un autre, puis toute la chaîne s'effondre comme un château de cartes." },
      { speaker: 'leesha_young', text: "Non... Le réseau... Tout était connecté. C'est ça le problème — quand un maillon cède, tout cède.", emotion: 'scared' },
      { speaker: 'narrator', text: "Le Creux du Coupeur brûle. Et avec lui, l'œuvre de Bruna, de Leesha, de générations d'herboristes." },
      { speaker: 'narrator', text: "Chapitre 18 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 19: Jardir 5 — La Marche vers le Nord
// L'armée krasienne traverse le désert vers le nord
// ============================================================

export const CHAPTER_JARDIR_5: ChapterDefinition = {
  id: 19,
  act: 5,
  title: 'La Marche vers le Nord',
  subtitle: "Inevera dit que le chemin du nord mène à la victoire — ou à la ruine.",
  heroId: 'jardir_young',
  nightCount: 4,
  startingNightNumber: 7,
  startingPresence: 'desert_spear',
  hiddenLocations: [] as any,
  availableWards: ['stone', 'wind', 'fire', 'light', 'bone'] as WardType[],
  fireCanKill: true,
  maxComboSize: 3,
  locationOverrides: {
    desert_spear: { name: 'Colonne de Marche', startPop: 6, terrain: 'desert' as any },
    cutters_hollow: { name: 'Camp de Nuit', startPop: 5, terrain: 'plains' as any },
    miln: { name: 'Village des Plaines', startPop: 4, terrain: 'plains' as any },
    lakton: { name: 'Gué de la Rivière', startPop: 3, terrain: 'plains' as any },
  },
  preplacedWards: [
    { locationId: 'desert_spear', ward: 'stone' },
    { locationId: 'desert_spear', ward: 'fire' },
    { locationId: 'desert_spear', ward: 'bone' },
    { locationId: 'cutters_hollow', ward: 'wind' },
    { locationId: 'cutters_hollow', ward: 'light' },
    { locationId: 'miln', ward: 'stone' },
    { locationId: 'lakton', ward: 'fire' },
  ],

  introDialogue: [
    {
      id: 'j5_intro_1', background: 'krasia',
      lines: [
        { speaker: 'narrator', text: "L'armée de Krasia s'ébranle. Dix mille guerriers Sharum en colonnes serrées, lances au poing, traversent le désert vers le nord." },
        { speaker: 'narrator', text: "Derrière eux, la cité de Fort Krasia. Devant eux, des terres que les Krasiens n'ont pas foulées depuis des générations." },
        { speaker: 'jardir_young', text: "Sharak Ka ne se gagnera pas dans le désert. L'ennemi est partout. Nous devons être partout.", emotion: 'determined' },
      ],
      nextNodeId: 'j5_intro_2',
    },
    {
      id: 'j5_intro_2', background: 'road',
      lines: [
        { speaker: 'narrator', text: "Inevera marche à ses côtés, voilée, silencieuse. Les os de démon cliquettent dans sa sacoche." },
        { speaker: 'jardir_young', text: "Que disent les os, Inevera ?", emotion: 'neutral' },
        { speaker: 'narrator', text: "Le chemin du nord mène à la victoire — ou à la ruine. Elle ne dit jamais lequel." },
        { speaker: 'jardir_young', text: "Alors nous marcherons. Et nous verrons lequel Everam a choisi pour nous.", emotion: 'determined' },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'j5_day1', background: 'road',
        lines: [
          { speaker: 'narrator', text: "Première nuit hors du désert. Les chtoniens des plaines sont différents — plus rapides, plus sournois. Les Sharum ne sont pas habitués." },
          { speaker: 'jardir_young', text: "Ces démons frappent et disparaissent. Comme des lâches.", emotion: 'angry' },
          { speaker: 'narrator', text: "Des éclaireurs rapportent un village fortifié au nord. Les habitants ont barricadé les portes à la vue de l'armée krasienne." },
        ],
        choices: [
          {
            id: 'force_village',
            label: "Forcer l'entrée du village — les ressources sont nécessaires",
            hint: "+3 Pop au Village, Force démons -1, -2 HP (combats avec les villageois)",
            effects: [
              { type: 'modify_population', locationId: 'miln', delta: 3 },
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'hero_hp_change', delta: -2 },
            ],
          },
          {
            id: 'negotiate',
            label: "Envoyer Abban négocier — offrir protection contre les chtoniens",
            hint: "+1 Rune de Lumière et +1 Rune d'Os au Village des Plaines",
            effects: [
              { type: 'bonus_ward', wardType: 'light', locationId: 'miln' },
              { type: 'bonus_ward', wardType: 'bone', locationId: 'miln' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'j5_day2', background: 'refugees',
        lines: [
          { speaker: 'narrator', text: "La marche continue. Des réfugiés fuyant les chtoniens croisent la colonne. Ils regardent les Sharum avec terreur." },
          { speaker: 'jardir_young', text: "Ils nous craignent plus que les démons. Quelle ironie.", emotion: 'sad' },
          { speaker: 'narrator', text: "Un chef de tribu des plaines s'avance. Il propose une alliance — ou un ultimatum. Jardir ne saisit pas bien les nuances du dialecte du nord." },
        ],
        choices: [
          {
            id: 'accept_alliance',
            label: "Accepter l'alliance — partager les runes krasiens",
            hint: "+2 Pop au Gué, +1 Rune de Feu au Gué, -1 AP (temps de négociation)",
            effects: [
              { type: 'modify_population', locationId: 'lakton', delta: 2 },
              { type: 'bonus_ward', wardType: 'fire', locationId: 'lakton' },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'show_strength',
            label: "Montrer la force de Krasia — ils suivront par respect ou par peur",
            hint: "Force démons -1, +1 Rune de Pierre à la Colonne",
            effects: [
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'bonus_ward', wardType: 'stone', locationId: 'desert_spear' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 3,
      dialogueNodes: [{
        id: 'j5_day3', background: 'village_sunset',
        lines: [
          { speaker: 'narrator', text: "Le Gué de la Rivière. La frontière entre les plaines et les terres forestières. Au-delà, Le Creux du Coupeur." },
          { speaker: 'jardir_young', text: "Inevera. Le nord est plus vaste que je ne le pensais. Ces gens vivent dispersés, sans murs, sans discipline.", emotion: 'neutral' },
          { speaker: 'narrator', text: "Et pourtant, ils survivent. Leurs runes sont différents — moins puissants, mais plus ingénieux. Jardir observe en silence." },
        ],
        choices: [
          {
            id: 'study_northern_wards',
            label: "Étudier les runes du nord — adapter les techniques krasiennes",
            hint: "+1 Rune de Lumière en réserve, +1 Rune de Vent en réserve",
            effects: [
              { type: 'bonus_reserve_ward', wardType: 'light' },
              { type: 'bonus_reserve_ward', wardType: 'wind' },
            ],
          },
          {
            id: 'fortify_crossing',
            label: "Fortifier le passage de la rivière pour la dernière nuit",
            hint: "+1 Rune d'Os au Gué, +1 Rune de Pierre au Gué, +1 Rune de Feu au Camp",
            effects: [
              { type: 'bonus_ward', wardType: 'bone', locationId: 'lakton' },
              { type: 'bonus_ward', wardType: 'stone', locationId: 'lakton' },
              { type: 'bonus_ward', wardType: 'fire', locationId: 'cutters_hollow' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 4,
      dialogueNodes: [{
        id: 'j5_day4', background: 'krasia',
        lines: [
          { speaker: 'narrator', text: "Les forêts se rapprochent. L'armée krasienne entre dans un monde qu'elle ne comprend pas — des arbres partout, des ombres, des sons étranges." },
          { speaker: 'jardir_young', text: "Dans le désert, on voit l'ennemi de loin. Ici, il est partout et nulle part.", emotion: 'scared' },
          { speaker: 'narrator', text: "Les Sharum murmurent. Certains veulent rentrer. Jardir sent le doute s'insinuer dans les rangs." },
        ],
        choices: [
          {
            id: 'inspire_troops',
            label: "Discours devant l'armée — rallumer la flamme de Sharak Ka",
            hint: "Force démons -1, +2 Pop à la Colonne",
            effects: [
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'modify_population', locationId: 'desert_spear', delta: 2 },
            ],
          },
          {
            id: 'defensive_camp',
            label: "Établir un camp fortifié — pas de discours, des actes",
            hint: "+1 Rune de chaque type au Camp de Nuit",
            effects: [
              { type: 'bonus_ward', wardType: 'stone', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'bone', locationId: 'cutters_hollow' },
            ],
          },
        ],
      }],
    },
  ],

  victoryDialogue: [
    {
      id: 'j5_victory_1', background: 'dawn_victory',
      lines: [
        { speaker: 'narrator', text: "L'aube se lève sur la forêt. L'armée de Krasia a traversé le désert, les plaines, et la rivière. Ils sont dans les terres du nord." },
        { speaker: 'jardir_young', text: "Ces gens du nord sont faibles. Mais leur science des runes... Everam avait raison de m'envoyer ici.", emotion: 'determined' },
      ],
      nextNodeId: 'j5_victory_2',
    },
    {
      id: 'j5_victory_2', background: 'road',
      lines: [
        { speaker: 'narrator', text: "Au loin, à travers les arbres, des lumières. Un village. Le Creux du Coupeur." },
        { speaker: 'jardir_young', text: "Sharak Ka commence. Et cette fois, l'humanité tout entière se battra.", emotion: 'determined' },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'j5_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Les chtoniens des plaines sont trop nombreux, trop rapides. La colonne de marche se disloque dans la nuit." },
      { speaker: 'jardir_young', text: "Reformez les rangs ! REFORMEZ LES RANGS !", emotion: 'angry' },
      { speaker: 'narrator', text: "Le désert avale ses enfants. L'armée de Krasia ne verra jamais le nord." },
      { speaker: 'narrator', text: "Chapitre 19 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 20: Rojer 5 — La Symphonie de la Nuit
// Rojer au centre de la défense de Cutter's Hollow
// ============================================================

export const CHAPTER_ROJER_5: ChapterDefinition = {
  id: 20,
  act: 5,
  title: 'La Symphonie de la Nuit',
  subtitle: "Ses doigts saignent. Deux seulement sur la main gauche, mais ils suffisent.",
  heroId: 'rojer_young',
  nightCount: 3,
  startingNightNumber: 7,
  startingPresence: 'cutters_hollow',
  hiddenLocations: ['desert_spear'] as any,
  availableWards: ['stone', 'wind', 'fire', 'light', 'bone'] as WardType[],
  fireCanKill: true,
  maxComboSize: 3,
  locationOverrides: {
    cutters_hollow: { name: "Le Creux du Coupeur — Scène Centrale", startPop: 8, terrain: 'forest' as any },
    miln: { name: 'Tour de Guet Nord', startPop: 5, terrain: 'forest' as any },
    lakton: { name: 'Palissade Est', startPop: 6, terrain: 'forest' as any },
    desert_spear: { name: '', startPop: 0 },
  },
  preplacedWards: [
    { locationId: 'cutters_hollow', ward: 'stone' },
    { locationId: 'cutters_hollow', ward: 'wind' },
    { locationId: 'cutters_hollow', ward: 'light' },
    { locationId: 'miln', ward: 'fire' },
    { locationId: 'miln', ward: 'bone' },
    { locationId: 'lakton', ward: 'stone' },
    { locationId: 'lakton', ward: 'fire' },
  ],

  introDialogue: [
    {
      id: 'r5_intro_1', background: 'forest_village',
      lines: [
        { speaker: 'narrator', text: "Le Creux du Coupeur se prépare. Les bûcherons taillent des pieux. Les femmes tracent des runes sur les murs. Et au centre du village, Rojer accorde ses instruments." },
        { speaker: 'narrator', text: "Un violon dans la main droite. La flûte d'os dans la gauche — coincée entre les deux doigts qui lui restent. Et sa voix." },
        { speaker: 'rojer_young', text: "Leesha a tracé les runes. Il faut quelqu'un pour les réveiller.", emotion: 'determined' },
      ],
      nextNodeId: 'r5_intro_2',
    },
    {
      id: 'r5_intro_2', background: 'village_sunset',
      lines: [
        { speaker: 'narrator', text: "Le soleil descend. Les ombres s'allongent entre les maisons. Les villageois se rassemblent autour de Rojer, comme des enfants autour d'un feu." },
        { speaker: 'rojer_young', text: "Ce soir, je ne joue pas pour divertir. Je ne joue pas pour calmer. Je joue pour que les murs tiennent.", emotion: 'determined' },
        { speaker: 'leesha_young', text: "Les runes sont prêts. Quand tu joueras, le réseau s'activera. Chaque note correspond à un type de rune.", emotion: 'hopeful' },
        { speaker: 'rojer_young', text: "Alors je serai le chef d'orchestre. Et les murs seront mon instrument.", emotion: 'determined' },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'r5_day1', background: 'forest_village',
        lines: [
          { speaker: 'narrator', text: "La première nuit a été un test. Rojer a joué pendant des heures. Ses doigts — les deux qui restent — sont à vif." },
          { speaker: 'rojer_young', text: "Les graves activent la pierre et l'os. Les aigus activent la lumière et le vent. Le feu... le feu, c'est la voix.", emotion: 'hopeful' },
          { speaker: 'narrator', text: "Leesha examine ses mains. Le regard qu'elle pose sur les moignons dit ce que ses mots ne disent pas." },
        ],
        choices: [
          {
            id: 'push_limits',
            label: "Jouer plus fort, plus longtemps — repousser les limites",
            hint: "Force démons -1, -3 HP (les mains en sang)",
            effects: [
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'hero_hp_change', delta: -3 },
            ],
          },
          {
            id: 'teach_others',
            label: "Apprendre les mélodies de base aux villageois",
            hint: "+2 Pop à la Scène, +1 Pop à chaque autre lieu",
            effects: [
              { type: 'modify_population', locationId: 'cutters_hollow', delta: 2 },
              { type: 'modify_population', locationId: 'miln', delta: 1 },
              { type: 'modify_population', locationId: 'lakton', delta: 1 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'r5_day2', background: 'inn',
        lines: [
          { speaker: 'narrator', text: "Rojer ne dort pas. Il compose. Des mélodies que personne n'a jamais entendues — des harmonies qui font vibrer les runes à travers les murs." },
          { speaker: 'rojer_young', text: "Ses doigts saignent. Deux seulement sur la main gauche, mais ils suffisent.", emotion: 'sad' },
          { speaker: 'narrator', text: "Leesha lui apporte un onguent. Il refuse. La douleur le garde éveillé. La douleur le garde vivant." },
        ],
        choices: [
          {
            id: 'war_symphony',
            label: "Composer la Symphonie de Guerre — activer tous les runes simultanément",
            hint: "+1 Rune de Lumière et +1 Rune d'Os à chaque lieu, -4 HP",
            effects: [
              { type: 'bonus_ward', wardType: 'light', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'bone', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'light', locationId: 'miln' },
              { type: 'bonus_ward', wardType: 'bone', locationId: 'miln' },
              { type: 'hero_hp_change', delta: -4 },
            ],
          },
          {
            id: 'accept_healing',
            label: "Accepter les soins de Leesha, jouer avec mesure",
            hint: "+3 HP, +1 Rune de Vent en réserve",
            effects: [
              { type: 'hero_hp_change', delta: 3 },
              { type: 'bonus_reserve_ward', wardType: 'wind' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 3,
      dialogueNodes: [{
        id: 'r5_day3', background: 'village_sunset',
        lines: [
          { speaker: 'narrator', text: "Le crépuscule. Rojer monte sur l'estrade au centre du village. Les villageois se taisent. Même les enfants sentent que ce soir est différent." },
          { speaker: 'rojer_young', text: "Quand la nuit tombera, je jouerai. Et tant que je jouerai, les murs tiendront.", emotion: 'determined' },
          { speaker: 'narrator', text: "Il lève le violon. La flûte d'os brille dans sa main gauche. Deux doigts. C'est assez pour changer le monde." },
        ],
        choices: [
          {
            id: 'full_symphony',
            label: "La Symphonie complète — violon, flûte, voix, toute la nuit",
            hint: "Force démons -2, -1 démon par vague, -5 HP (au bord de la rupture)",
            effects: [
              { type: 'demon_strength_bonus', bonus: -2 },
              { type: 'extra_demons', count: -1 },
              { type: 'hero_hp_change', delta: -5 },
            ],
          },
          {
            id: 'steady_rhythm',
            label: "Jouer en alternance — maintenir le rythme sans se détruire",
            hint: "+1 Rune de Feu à chaque lieu, +1 HP",
            effects: [
              { type: 'bonus_ward', wardType: 'fire', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'fire', locationId: 'miln' },
              { type: 'bonus_ward', wardType: 'fire', locationId: 'lakton' },
              { type: 'hero_hp_change', delta: 1 },
            ],
          },
        ],
      }],
    },
  ],

  victoryDialogue: [
    {
      id: 'r5_victory_1', background: 'dawn_victory',
      lines: [
        { speaker: 'narrator', text: "Le silence. Après des heures de musique, de cris, de runes qui chantent — le silence de l'aube." },
        { speaker: 'narrator', text: "Rojer est à genoux sur l'estrade. Le violon à côté de lui. La flûte serrée dans sa main gauche ensanglantée." },
      ],
      nextNodeId: 'r5_victory_2',
    },
    {
      id: 'r5_victory_2', background: 'forest_village',
      lines: [
        { speaker: 'leesha_young', text: "Rojer ! Tes mains !", emotion: 'scared' },
        { speaker: 'rojer_young', text: "Mes mains vont bien. Elles font toujours mal. Mais le village tient. C'est tout ce qui compte.", emotion: 'hopeful' },
        { speaker: 'narrator', text: "Quand Rojer joue, les murs chantent. Les démons reculent. Et pendant un instant, l'espoir n'est plus un mensonge." },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'r5_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "La corde du violon casse. La flûte glisse des doigts ensanglantés. Le silence tombe — et dans le silence, les chtoniens hurlent." },
      { speaker: 'rojer_young', text: "Non... pas maintenant... pas comme ça...", emotion: 'scared' },
      { speaker: 'narrator', text: "Sans musique, les runes s'éteignent un par un. Et Le Creux du Coupeur sombre dans la nuit." },
      { speaker: 'narrator', text: "Chapitre 20 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 21: Arlen 6 — Le Retour de l'Homme-Rune
// Arlen revient à Cutter's Hollow couvert de tatouages de wards
// ============================================================

export const CHAPTER_ARLEN_6: ChapterDefinition = {
  id: 21,
  act: 6,
  title: "Le Retour de l'Homme-Rune",
  subtitle: "Les villageois le regardent avec un mélange de terreur et d'espoir.",
  heroId: 'arlen_young',
  nightCount: 4,
  startingNightNumber: 8,
  startingPresence: 'cutters_hollow',
  hiddenLocations: [] as any,
  availableWards: ['stone', 'wind', 'fire', 'light', 'bone'] as WardType[],
  fireCanKill: true,
  maxComboSize: 3,
  locationOverrides: {
    cutters_hollow: { name: "Le Creux du Coupeur — Centre", startPop: 10, terrain: 'forest' as any },
    miln: { name: 'Barricade Nord', startPop: 5, terrain: 'forest' as any },
    lakton: { name: 'Scierie Fortifiée', startPop: 6, terrain: 'forest' as any },
    desert_spear: { name: 'Lisière Sud', startPop: 4, terrain: 'forest' as any },
  },
  preplacedWards: [
    { locationId: 'cutters_hollow', ward: 'stone' },
    { locationId: 'cutters_hollow', ward: 'fire' },
    { locationId: 'cutters_hollow', ward: 'bone' },
    { locationId: 'miln', ward: 'wind' },
    { locationId: 'miln', ward: 'light' },
    { locationId: 'lakton', ward: 'fire' },
    { locationId: 'lakton', ward: 'stone' },
    { locationId: 'desert_spear', ward: 'bone' },
  ],

  introDialogue: [
    {
      id: 'a6_intro_1', background: 'road',
      lines: [
        { speaker: 'narrator', text: "Un homme marche sur la route de Le Creux du Coupeur. Pieds nus dans la poussière. Le crâne rasé. La peau couverte de symboles qui luisent faiblement dans le crépuscule." },
        { speaker: 'narrator', text: "Les sentinelles le voient de loin. Elles ne reconnaissent pas un homme. Elles voient un monstre — ou un miracle." },
      ],
      nextNodeId: 'a6_intro_2',
    },
    {
      id: 'a6_intro_2', background: 'forest_village',
      lines: [
        { speaker: 'leesha_young', text: "Par le Créateur... Ces runes sur votre peau. Ce sont des runes offensifs. Ils n'existent plus depuis—", emotion: 'hopeful' },
        { speaker: 'arlen_young', text: "Depuis la chute du Soleil d'Anoch. Je les ai retrouvés. Et je les ai gravés dans ma chair.", emotion: 'determined' },
        { speaker: 'rojer_young', text: "Charmant. Et moi qui pensais que mes deux doigts en moins étaient impressionnants.", emotion: 'neutral' },
        { speaker: 'narrator', text: "Les villageois le regardent avec un mélange de terreur et d'espoir. Il n'est plus l'un d'eux. Il est quelque chose de nouveau." },
      ],
      nextNodeId: 'a6_intro_3',
    },
    {
      id: 'a6_intro_3', background: 'village_sunset',
      lines: [
        { speaker: 'arlen_young', text: "Je ne suis pas venu pour qu'on me regarde. Je suis venu pour vous apprendre à vous battre.", emotion: 'determined' },
        { speaker: 'narrator', text: "Il trace un rune de combat sur un poteau de bois. Le bois se met à luire. Les chtoniens qui rôdent à la lisière reculent." },
        { speaker: 'arlen_young', text: "Trois cents ans de peur. Ça se termine ici.", emotion: 'angry' },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'a6_day1', background: 'forest_village',
        lines: [
          { speaker: 'narrator', text: "La première nuit avec l'Homme-Rune. Les chtoniens ont attaqué — et pour la première fois, un homme les a repoussés à mains nues." },
          { speaker: 'arlen_young', text: "Les runes de combat absorbent l'énergie des démons. Plus ils frappent fort, plus je deviens puissant.", emotion: 'determined' },
          { speaker: 'leesha_young', text: "C'est fascinant. Et terrifiant. Arlen, tu ne peux pas combattre seul chaque nuit. Ton corps a des limites.", emotion: 'scared' },
        ],
        choices: [
          {
            id: 'teach_combat_wards',
            label: "Enseigner les runes de combat aux bûcherons",
            hint: "+2 Pop à chaque lieu (combattants formés), -1 AP",
            effects: [
              { type: 'modify_population', locationId: 'cutters_hollow', delta: 2 },
              { type: 'modify_population', locationId: 'miln', delta: 2 },
              { type: 'modify_population', locationId: 'lakton', delta: 2 },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'solo_hunt',
            label: "Chasser les chtoniens seul à la lisière — réduire leur nombre",
            hint: "-2 démons par vague, -3 HP (combat direct)",
            effects: [
              { type: 'extra_demons', count: -2 },
              { type: 'hero_hp_change', delta: -3 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'a6_day2', background: 'ward_book',
        lines: [
          { speaker: 'narrator', text: "Leesha étudie les runes d'Arlen. Elle prend des notes, dessine des schémas, compare avec les écrits de Bruna." },
          { speaker: 'leesha_young', text: "Tes runes offensifs et mon réseau défensif. Si on les combine, le village deviendrait une arme géante.", emotion: 'hopeful' },
          { speaker: 'arlen_young', text: "Je me bats à l'instinct. Je ne comprends pas la moitié de ce que font ces runes.", emotion: 'neutral' },
          { speaker: 'leesha_young', text: "Moi si. Laisse-moi les étudier.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'let_leesha_study',
            label: "Laisser Leesha étudier les runes — science + instinct",
            hint: "+1 Rune d'Os en réserve, +1 Rune de Lumière en réserve, +1 Rune de Feu en réserve",
            effects: [
              { type: 'bonus_reserve_ward', wardType: 'bone' },
              { type: 'bonus_reserve_ward', wardType: 'light' },
              { type: 'bonus_reserve_ward', wardType: 'fire' },
            ],
          },
          {
            id: 'ward_weapons',
            label: "Graver des runes de combat sur les armes des bûcherons",
            hint: "Force démons -1, +1 Rune d'Os à chaque lieu",
            effects: [
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'bonus_ward', wardType: 'bone', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'bone', locationId: 'miln' },
              { type: 'bonus_ward', wardType: 'bone', locationId: 'lakton' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 3,
      dialogueNodes: [{
        id: 'a6_day3', background: 'refugees',
        lines: [
          { speaker: 'narrator', text: "Des réfugiés arrivent de l'ouest. Leur village a brûlé. Parmi eux, des blessés qui murmurent un nom : l'Homme-Rune." },
          { speaker: 'refugee', text: "On a entendu dire... qu'un homme se bat contre les démons. À mains nues. Que c'est vrai ?", emotion: 'scared' },
          { speaker: 'arlen_young', text: "C'est vrai. Et bientôt, vous aussi vous pourrez vous battre.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'welcome_refugees',
            label: "Accueillir les réfugiés et les former",
            hint: "+3 Pop au Centre, +1 Pop à la Barricade",
            effects: [
              { type: 'modify_population', locationId: 'cutters_hollow', delta: 3 },
              { type: 'modify_population', locationId: 'miln', delta: 1 },
            ],
          },
          {
            id: 'send_scouts',
            label: "Envoyer des éclaireurs runés — préparer les défenses extérieures",
            hint: "+1 Rune de Vent à la Lisière, +1 Rune de Feu à la Scierie, +1 Rune de Pierre à la Barricade",
            effects: [
              { type: 'bonus_ward', wardType: 'wind', locationId: 'desert_spear' },
              { type: 'bonus_ward', wardType: 'fire', locationId: 'lakton' },
              { type: 'bonus_ward', wardType: 'stone', locationId: 'miln' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 4,
      dialogueNodes: [{
        id: 'a6_day4', background: 'village_sunset',
        lines: [
          { speaker: 'narrator', text: "Le crépuscule. Arlen se tient sur la barricade nord. Les runes sur sa peau pulsent doucement, en rythme avec ceux des murs." },
          { speaker: 'arlen_young', text: "Je les sens. Les chtoniens. Ils rassemblent leurs forces. Ce soir, ils viendront en masse.", emotion: 'determined' },
          { speaker: 'narrator', text: "Il ferme les yeux. Les runes brillent plus fort. Quand il les rouvre, ses pupilles luisent d'une lumière surnaturelle." },
        ],
        choices: [
          {
            id: 'become_beacon',
            label: "Devenir un phare de runes — attirer les démons sur soi",
            hint: "Force démons -2 (les démons se concentrent sur Arlen), -4 HP",
            effects: [
              { type: 'demon_strength_bonus', bonus: -2 },
              { type: 'hero_hp_change', delta: -4 },
            ],
          },
          {
            id: 'coordinate_defense',
            label: "Coordonner la défense avec Leesha et Rojer",
            hint: "+1 Rune de Lumière et +1 Rune d'Os à chaque lieu",
            effects: [
              { type: 'bonus_ward', wardType: 'light', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'bone', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'light', locationId: 'miln' },
              { type: 'bonus_ward', wardType: 'bone', locationId: 'miln' },
            ],
          },
        ],
      }],
    },
  ],

  victoryDialogue: [
    {
      id: 'a6_victory_1', background: 'dawn_victory',
      lines: [
        { speaker: 'narrator', text: "L'aube. Les runes sur la peau d'Arlen s'éteignent lentement. Son corps fume, couvert de sang de démon et du sien." },
        { speaker: 'narrator', text: "Autour de lui, les bûcherons de Le Creux du Coupeur tiennent des haches runées. Ils ont combattu. Ils ont tenu." },
      ],
      nextNodeId: 'a6_victory_2',
    },
    {
      id: 'a6_victory_2', background: 'forest_village',
      lines: [
        { speaker: 'arlen_young', text: "Vous voyez ? On peut se battre. On peut gagner. Ce n'est que le début.", emotion: 'determined' },
        { speaker: 'narrator', text: "L'Homme-Rune. Le Homme-Rune. L'homme qui a montré à l'humanité qu'elle pouvait relever la tête." },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'a6_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Les runes s'éteignent. La peau d'Arlen se craquelle — les tatouages se fissurent comme du verre brisé." },
      { speaker: 'arlen_young', text: "Mon corps... les runes ne tiennent plus... J'ai trop poussé...", emotion: 'angry' },
      { speaker: 'narrator', text: "L'Homme-Rune tombe. Et avec lui, l'espoir de Le Creux du Coupeur." },
      { speaker: 'narrator', text: "Chapitre 21 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 22: Leesha 6 — Le Réseau Vivant
// Leesha tisse le réseau de wards à l'échelle du village entier
// ============================================================

export const CHAPTER_LEESHA_6: ChapterDefinition = {
  id: 22,
  act: 6,
  title: 'Le Réseau Vivant',
  subtitle: "Arlen se bat comme un animal. Il ne comprend pas ce qu'il fait. Moi si.",
  heroId: 'leesha_young',
  nightCount: 3,
  startingNightNumber: 8,
  startingPresence: 'cutters_hollow',
  hiddenLocations: [] as any,
  availableWards: ['stone', 'wind', 'fire', 'light', 'bone'] as WardType[],
  fireCanKill: true,
  maxComboSize: 3,
  locationOverrides: {
    cutters_hollow: { name: "Le Creux du Coupeur — Centre", startPop: 10, terrain: 'forest' as any },
    miln: { name: 'Barricade Nord', startPop: 6, terrain: 'forest' as any },
    lakton: { name: 'Scierie Fortifiée', startPop: 7, terrain: 'forest' as any },
    desert_spear: { name: 'Lisière Sud', startPop: 5, terrain: 'forest' as any },
  },
  preplacedWards: [
    { locationId: 'cutters_hollow', ward: 'stone' },
    { locationId: 'cutters_hollow', ward: 'fire' },
    { locationId: 'cutters_hollow', ward: 'light' },
    { locationId: 'miln', ward: 'wind' },
    { locationId: 'miln', ward: 'bone' },
    { locationId: 'lakton', ward: 'fire' },
    { locationId: 'lakton', ward: 'stone' },
    { locationId: 'desert_spear', ward: 'bone' },
    { locationId: 'desert_spear', ward: 'wind' },
  ],

  introDialogue: [
    {
      id: 'l6_intro_1', background: 'forest_village',
      lines: [
        { speaker: 'narrator', text: "Leesha observe Arlen se battre. Chaque nuit, il sort seul dans l'obscurité. Chaque matin, il revient couvert de sang." },
        { speaker: 'narrator', text: "C'est magnifique. Et c'est insoutenable." },
        { speaker: 'leesha_young', text: "Il se bat comme un animal. Il ne comprend pas ce qu'il fait. Moi si.", emotion: 'determined' },
      ],
      nextNodeId: 'l6_intro_2',
    },
    {
      id: 'l6_intro_2', background: 'ward_book',
      lines: [
        { speaker: 'narrator', text: "Les carnets de Leesha sont couverts de schémas. Les runes d'Arlen, disséqués, analysés, cartographiés." },
        { speaker: 'leesha_young', text: "Ses runes offensifs créent un flux d'énergie. Mon réseau défensif canalise ce flux. Si je relie les deux...", emotion: 'hopeful' },
        { speaker: 'leesha_young', text: "Le village entier deviendrait un organisme vivant. Un réseau qui se défend, qui attaque, qui guérit.", emotion: 'determined' },
        { speaker: 'narrator', text: "Il ne reste plus qu'à le construire. En pleine guerre. Sous les assauts des chtoniens." },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'l6_day1', background: 'forest_village',
        lines: [
          { speaker: 'narrator', text: "Première nuit du réseau vivant. Les runes de Leesha ont connecté le centre au périmètre. L'énergie circule." },
          { speaker: 'leesha_young', text: "Les runes offensifs d'Arlen alimentent les défenses. Plus il se bat, plus les murs tiennent.", emotion: 'hopeful' },
          { speaker: 'arlen_young', text: "Je le sens. Les runes sur ma peau résonnent avec ceux des murs. C'est... étrange.", emotion: 'neutral' },
          { speaker: 'leesha_young', text: "C'est de la science, Arlen. Pas de la magie.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'expand_network',
            label: "Étendre le réseau aux positions extérieures",
            hint: "+1 Rune de Lumière à chaque lieu, -2 HP (nuit de travail intense)",
            effects: [
              { type: 'bonus_ward', wardType: 'light', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'light', locationId: 'miln' },
              { type: 'bonus_ward', wardType: 'light', locationId: 'lakton' },
              { type: 'bonus_ward', wardType: 'light', locationId: 'desert_spear' },
              { type: 'hero_hp_change', delta: -2 },
            ],
          },
          {
            id: 'strengthen_core',
            label: "Renforcer le cœur du réseau — priorité au centre",
            hint: "+1 Rune d'Os et +1 Rune de Feu au Centre, +1 Rune de Pierre à la Barricade",
            effects: [
              { type: 'bonus_ward', wardType: 'bone', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'fire', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'stone', locationId: 'miln' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'l6_day2', background: 'bruna_hut',
        lines: [
          { speaker: 'narrator', text: "La cabane de Bruna. Leesha y travaille jour et nuit. Les murs sont couverts de schémas, de calculs, de formules." },
          { speaker: 'leesha_young', text: "Le réseau a un défaut. Les runes d'os drainent l'énergie trop vite. Il faut un régulateur.", emotion: 'scared' },
          { speaker: 'narrator', text: "Rojer entre, violon à la main. Il joue trois notes. Les runes du mur vibrent en harmonie." },
          { speaker: 'rojer_young', text: "Un régulateur ? Tu veux dire un chef d'orchestre ?", emotion: 'hopeful' },
        ],
        choices: [
          {
            id: 'music_regulator',
            label: "Intégrer la musique de Rojer comme régulateur du réseau",
            hint: "Force démons -1, +1 Rune de Vent en réserve, +1 Rune d'Os en réserve",
            effects: [
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'bonus_reserve_ward', wardType: 'wind' },
              { type: 'bonus_reserve_ward', wardType: 'bone' },
            ],
          },
          {
            id: 'manual_calibration',
            label: "Calibrer manuellement — Leesha contrôle tout",
            hint: "+1 Rune de Feu et +1 Rune de Pierre à la Scierie et à la Lisière",
            effects: [
              { type: 'bonus_ward', wardType: 'fire', locationId: 'lakton' },
              { type: 'bonus_ward', wardType: 'stone', locationId: 'lakton' },
              { type: 'bonus_ward', wardType: 'fire', locationId: 'desert_spear' },
              { type: 'bonus_ward', wardType: 'stone', locationId: 'desert_spear' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 3,
      dialogueNodes: [{
        id: 'l6_day3', background: 'village_sunset',
        lines: [
          { speaker: 'narrator', text: "Le réseau est complet. Leesha se tient au centre, les yeux cernés, les mains tachées d'encre. Autour d'elle, le village pulse." },
          { speaker: 'leesha_young', text: "Chaque rune est connecté. Chaque mur parle aux autres. Le village est vivant.", emotion: 'hopeful' },
          { speaker: 'narrator', text: "Arlen pose sa main sur un mur. Les runes de sa peau s'illuminent en réponse. Le réseau le reconnaît." },
          { speaker: 'arlen_young', text: "C'est... beau, Leesha. Je ne comprends pas la moitié de ce que tu as fait, mais c'est beau.", emotion: 'hopeful' },
        ],
        choices: [
          {
            id: 'full_activation',
            label: "Activer le réseau complet — toute l'énergie en une seule nuit",
            hint: "+1 Rune de chaque type au Centre, mais -4 HP (surcharge)",
            effects: [
              { type: 'bonus_ward', wardType: 'stone', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'wind', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'fire', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'light', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'bone', locationId: 'cutters_hollow' },
              { type: 'hero_hp_change', delta: -4 },
            ],
          },
          {
            id: 'balanced_activation',
            label: "Activer par sections — stable et contrôlé",
            hint: "+1 Rune de Lumière et +1 Rune d'Os à la Barricade et à la Scierie",
            effects: [
              { type: 'bonus_ward', wardType: 'light', locationId: 'miln' },
              { type: 'bonus_ward', wardType: 'bone', locationId: 'miln' },
              { type: 'bonus_ward', wardType: 'light', locationId: 'lakton' },
              { type: 'bonus_ward', wardType: 'bone', locationId: 'lakton' },
            ],
          },
        ],
      }],
    },
  ],

  victoryDialogue: [
    {
      id: 'l6_victory_1', background: 'dawn_victory',
      lines: [
        { speaker: 'narrator', text: "Le réseau tient. Toute la nuit, l'énergie a circulé — des runes aux murs, des murs aux armes, des armes aux combattants." },
        { speaker: 'narrator', text: "Le Creux du Coupeur n'est plus un village. C'est un organisme. Un être vivant fait de bois, de pierre et de runes." },
      ],
      nextNodeId: 'l6_victory_2',
    },
    {
      id: 'l6_victory_2', background: 'forest_village',
      lines: [
        { speaker: 'leesha_young', text: "Bruna... Tu avais raison. Les runes ne sont pas des murs. Ce sont des veines. Et le village a un cœur.", emotion: 'hopeful' },
        { speaker: 'narrator', text: "Leesha Paper. L'herboriste de Le Creux du Coupeur. La femme qui a donné un cœur à un village." },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'l6_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Le réseau surcharge. Les runes explosent en chaîne — trop d'énergie, trop de connexions. Ce qui devait protéger détruit." },
      { speaker: 'leesha_young', text: "Non ! Le réseau... J'ai mal calculé les flux... C'est ma faute...", emotion: 'scared' },
      { speaker: 'narrator', text: "Le cœur du village s'arrête. Et dans le silence, les chtoniens se déversent." },
      { speaker: 'narrator', text: "Chapitre 22 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 23: Jardir 6 — Sharak Ka
// L'armée de Jardir arrive, tension avec les Thésiens
// ============================================================

export const CHAPTER_JARDIR_6: ChapterDefinition = {
  id: 23,
  act: 6,
  title: 'Sharak Ka',
  subtitle: "Ces gens du nord sont faibles. Mais leur science des runes...",
  heroId: 'jardir_young',
  nightCount: 4,
  startingNightNumber: 8,
  startingPresence: 'desert_spear',
  hiddenLocations: [] as any,
  availableWards: ['stone', 'wind', 'fire', 'light', 'bone'] as WardType[],
  fireCanKill: true,
  maxComboSize: 3,
  locationOverrides: {
    cutters_hollow: { name: "Le Creux du Coupeur — Centre", startPop: 10, terrain: 'forest' as any },
    miln: { name: 'Barricade Nord', startPop: 6, terrain: 'forest' as any },
    lakton: { name: 'Scierie Fortifiée', startPop: 7, terrain: 'forest' as any },
    desert_spear: { name: 'Camp Krasien — Lisière Sud', startPop: 8, terrain: 'forest' as any },
  },
  preplacedWards: [
    { locationId: 'cutters_hollow', ward: 'stone' },
    { locationId: 'cutters_hollow', ward: 'fire' },
    { locationId: 'cutters_hollow', ward: 'bone' },
    { locationId: 'miln', ward: 'wind' },
    { locationId: 'miln', ward: 'light' },
    { locationId: 'lakton', ward: 'fire' },
    { locationId: 'lakton', ward: 'stone' },
    { locationId: 'desert_spear', ward: 'bone' },
    { locationId: 'desert_spear', ward: 'fire' },
  ],

  introDialogue: [
    {
      id: 'j6_intro_1', background: 'krasia',
      lines: [
        { speaker: 'narrator', text: "Un cor de guerre retentit dans la forêt. Les villageois de Le Creux du Coupeur se figent. Des guerriers en robes blanches émergent des arbres, par centaines." },
        { speaker: 'narrator', text: "L'armée de Krasia. Dix mille Sharum. Lances runées au poing. Ils n'ont jamais vu de forêt avant ce mois." },
        { speaker: 'jardir_young', text: "Nous sommes venus de l'autre bout du monde. Et nous n'avons pas traversé le désert pour conquérir des bûcherons.", emotion: 'determined' },
      ],
      nextNodeId: 'j6_intro_2',
    },
    {
      id: 'j6_intro_2', background: 'forest_village',
      lines: [
        { speaker: 'narrator', text: "La tension est palpable. Les bûcherons serrent leurs haches. Les Sharum serrent leurs lances. Un mot de travers et le sang coule." },
        { speaker: 'leesha_young', text: "Des Krasiens. Ici. Les histoires qu'on raconte sur eux...", emotion: 'scared' },
        { speaker: 'jardir_young', text: "Ces gens du nord sont faibles. Mais leur science des runes... Everam avait raison de m'envoyer ici.", emotion: 'neutral' },
        { speaker: 'narrator', text: "Jardir regarde Arlen. L'Homme-Rune. Couvert de runes. Les mêmes runes que dans les ruines du désert." },
        { speaker: 'jardir_young', text: "Arlen. Par Everam. Tu portes les runes des anciens sur ta peau.", emotion: 'hopeful' },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'j6_day1', background: 'forest_village',
        lines: [
          { speaker: 'narrator', text: "La première nuit ensemble. Les Sharum à la lisière sud, les bûcherons au nord et à l'est. Deux peuples, un seul ennemi." },
          { speaker: 'jardir_young', text: "Vos bûcherons se battent avec des haches. Mes Sharum se battent avec des lances. Ensemble, rien ne passe.", emotion: 'determined' },
          { speaker: 'narrator', text: "Mais la méfiance persiste. Les Thésiens murmurent. Les Krasiens ricanent. L'alliance est fragile." },
        ],
        choices: [
          {
            id: 'joint_training',
            label: "Organiser un entraînement commun — Sharum et bûcherons",
            hint: "+2 Pop à la Lisière, +1 Pop à la Barricade, -1 AP",
            effects: [
              { type: 'modify_population', locationId: 'desert_spear', delta: 2 },
              { type: 'modify_population', locationId: 'miln', delta: 1 },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'separate_fronts',
            label: "Garder les armées séparées — chacun sa zone",
            hint: "+1 Rune d'Os et +1 Rune de Feu au Camp Krasien",
            effects: [
              { type: 'bonus_ward', wardType: 'bone', locationId: 'desert_spear' },
              { type: 'bonus_ward', wardType: 'fire', locationId: 'desert_spear' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'j6_day2', background: 'krasia',
        lines: [
          { speaker: 'narrator', text: "Inevera jette les os de démon. Les symboles qu'ils forment la font pâlir sous son voile." },
          { speaker: 'jardir_young', text: "Que vois-tu ?", emotion: 'neutral' },
          { speaker: 'narrator', text: "Un silence. Puis : Un démon ancien. Il vient. Pas un chtonien ordinaire — un esprit. Un maître." },
          { speaker: 'jardir_young', text: "Sharak Ka. La vraie guerre commence.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'share_intelligence',
            label: "Partager l'information avec Arlen et Leesha",
            hint: "+1 Rune de Lumière en réserve, +1 Rune d'Os en réserve, Force démons -1",
            effects: [
              { type: 'bonus_reserve_ward', wardType: 'light' },
              { type: 'bonus_reserve_ward', wardType: 'bone' },
              { type: 'demon_strength_bonus', bonus: -1 },
            ],
          },
          {
            id: 'prepare_sharum',
            label: "Préparer les Sharum en secret — l'élément de surprise",
            hint: "+1 Rune de Feu et +1 Rune de Pierre à la Lisière et au Camp",
            effects: [
              { type: 'bonus_ward', wardType: 'fire', locationId: 'desert_spear' },
              { type: 'bonus_ward', wardType: 'stone', locationId: 'desert_spear' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 3,
      dialogueNodes: [{
        id: 'j6_day3', background: 'forest_village',
        lines: [
          { speaker: 'narrator', text: "Un incident. Un Sharum a frappé un bûcheron. Le bûcheron a répondu avec sa hache. Du sang a coulé." },
          { speaker: 'jardir_young', text: "La discipline de mes hommes n'excuse pas leur mépris. Mais vos bûcherons doivent apprendre le respect.", emotion: 'angry' },
          { speaker: 'arlen_young', text: "Jardir. On n'a pas le temps pour ça. Les chtoniens ne font pas de différence entre un Krasien et un Thésien.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'public_justice',
            label: "Justice publique — punir les deux coupables devant les deux peuples",
            hint: "+2 Pop au Centre (confiance restaurée), +1 Pop à la Lisière",
            effects: [
              { type: 'modify_population', locationId: 'cutters_hollow', delta: 2 },
              { type: 'modify_population', locationId: 'desert_spear', delta: 1 },
            ],
          },
          {
            id: 'ignore_conflict',
            label: "Ignorer l'incident — concentrer toute l'énergie sur les défenses",
            hint: "+1 Rune de chaque type au Centre",
            effects: [
              { type: 'bonus_ward', wardType: 'stone', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'light', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'bone', locationId: 'cutters_hollow' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 4,
      dialogueNodes: [{
        id: 'j6_day4', background: 'village_sunset',
        lines: [
          { speaker: 'narrator', text: "Le crépuscule de la dernière nuit. Jardir se tient entre ses Sharum et les bûcherons de Le Creux du Coupeur." },
          { speaker: 'jardir_young', text: "Cette nuit, il n'y a pas de Krasiens ni de Thésiens. Il n'y a que des humains. Et des démons.", emotion: 'determined' },
          { speaker: 'narrator', text: "Les deux peuples lèvent leurs armes. Ensemble. Pour la première fois depuis des siècles." },
        ],
        choices: [
          {
            id: 'unified_charge',
            label: "Charge unifiée — Sharum et bûcherons ensemble en première ligne",
            hint: "Force démons -2, -3 HP (combat en première ligne)",
            effects: [
              { type: 'demon_strength_bonus', bonus: -2 },
              { type: 'hero_hp_change', delta: -3 },
            ],
          },
          {
            id: 'strategic_positions',
            label: "Positions stratégiques — chaque peuple à son poste",
            hint: "+1 Rune d'Os à chaque lieu",
            effects: [
              { type: 'bonus_ward', wardType: 'bone', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'bone', locationId: 'miln' },
              { type: 'bonus_ward', wardType: 'bone', locationId: 'lakton' },
              { type: 'bonus_ward', wardType: 'bone', locationId: 'desert_spear' },
            ],
          },
        ],
      }],
    },
  ],

  victoryDialogue: [
    {
      id: 'j6_victory_1', background: 'dawn_victory',
      lines: [
        { speaker: 'narrator', text: "L'aube. Les Sharum et les bûcherons se tiennent côte à côte parmi les cendres des chtoniens. Le sang se mêle — krasien et thésien, indistinct." },
        { speaker: 'jardir_young', text: "Everam soit loué. Sharak Ka a forgé ce que la diplomatie n'aurait jamais pu créer.", emotion: 'hopeful' },
      ],
      nextNodeId: 'j6_victory_2',
    },
    {
      id: 'j6_victory_2', background: 'forest_village',
      lines: [
        { speaker: 'narrator', text: "Jardir regarde les deux peuples. Ensemble. Pas par choix — par nécessité. Mais c'est un début." },
        { speaker: 'jardir_young', text: "L'alliance tient. Fragile. Mais elle tient. C'est assez pour vaincre.", emotion: 'determined' },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'j6_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "L'alliance se brise dans le chaos. Les Sharum fuient vers le sud. Les bûcherons vers le nord. Chacun pour soi." },
      { speaker: 'jardir_young', text: "NON ! Restez en formation ! RESTEZ—", emotion: 'angry' },
      { speaker: 'narrator', text: "Sharak Ka échoue. Pas à cause des démons — à cause des hommes." },
      { speaker: 'narrator', text: "Chapitre 23 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 24: Rojer 6 — Le Maestro
// Rojer orchestre la défense sonore du village
// ============================================================

export const CHAPTER_ROJER_6: ChapterDefinition = {
  id: 24,
  act: 6,
  title: 'Le Maestro',
  subtitle: "Quand Rojer joue, les murs chantent. Les démons reculent.",
  heroId: 'rojer_young',
  nightCount: 3,
  startingNightNumber: 8,
  startingPresence: 'cutters_hollow',
  hiddenLocations: [] as any,
  availableWards: ['stone', 'wind', 'fire', 'light', 'bone'] as WardType[],
  fireCanKill: true,
  maxComboSize: 3,
  locationOverrides: {
    cutters_hollow: { name: "Le Creux du Coupeur — Centre", startPop: 10, terrain: 'forest' as any },
    miln: { name: 'Barricade Nord', startPop: 6, terrain: 'forest' as any },
    lakton: { name: 'Scierie Fortifiée', startPop: 7, terrain: 'forest' as any },
    desert_spear: { name: 'Lisière Sud', startPop: 5, terrain: 'forest' as any },
  },
  preplacedWards: [
    { locationId: 'cutters_hollow', ward: 'stone' },
    { locationId: 'cutters_hollow', ward: 'fire' },
    { locationId: 'cutters_hollow', ward: 'bone' },
    { locationId: 'cutters_hollow', ward: 'light' },
    { locationId: 'miln', ward: 'wind' },
    { locationId: 'miln', ward: 'stone' },
    { locationId: 'lakton', ward: 'fire' },
    { locationId: 'lakton', ward: 'bone' },
    { locationId: 'desert_spear', ward: 'wind' },
  ],

  introDialogue: [
    {
      id: 'r6_intro_1', background: 'forest_village',
      lines: [
        { speaker: 'narrator', text: "Le Creux du Coupeur est un orchestre. Les runes de Leesha sont les instruments. Les guerriers sont les musiciens. Et Rojer est le chef." },
        { speaker: 'narrator', text: "Il monte sur l'estrade centrale. Le violon dans la main droite. La flûte d'os dans la gauche. Les bandages sur ses doigts mutilés sont déjà rouges." },
        { speaker: 'rojer_young', text: "Chaque mélodie active un type de rune. La pierre résonne dans les graves. La lumière vibre dans les aigus. Le feu... le feu brûle dans la voix.", emotion: 'determined' },
      ],
      nextNodeId: 'r6_intro_2',
    },
    {
      id: 'r6_intro_2', background: 'village_sunset',
      lines: [
        { speaker: 'narrator', text: "Arlen pose la main sur l'épaule de Rojer. Les runes de sa peau pulsent doucement." },
        { speaker: 'arlen_young', text: "Sans ta musique, mes runes ne sont que des dessins. C'est toi qui les fais vivre.", emotion: 'hopeful' },
        { speaker: 'rojer_young', text: "Alors je jouerai jusqu'à l'aube. Ou jusqu'à ce que mes doigts lâchent. On verra ce qui arrive en premier.", emotion: 'determined' },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'r6_day1', background: 'forest_village',
        lines: [
          { speaker: 'narrator', text: "La première nuit. Rojer a joué sans relâche. Chaque fois qu'un mur faiblissait, il changeait de mélodie, activait un autre rune." },
          { speaker: 'rojer_young', text: "Les graves pour la pierre. Les aigus pour la lumière. Un trille pour le vent. Un accord mineur pour l'os. Et ma voix... pour le feu.", emotion: 'hopeful' },
          { speaker: 'narrator', text: "Mais son corps paie le prix. Les bandages sont trempés de sang. Ses bras tremblent." },
        ],
        choices: [
          {
            id: 'melody_rotation',
            label: "Créer un système de rotation — alterner les mélodies pour économiser ses forces",
            hint: "+1 Rune de Vent en réserve, +1 Rune de Pierre en réserve, +1 HP",
            effects: [
              { type: 'bonus_reserve_ward', wardType: 'wind' },
              { type: 'bonus_reserve_ward', wardType: 'stone' },
              { type: 'hero_hp_change', delta: 1 },
            ],
          },
          {
            id: 'max_volume',
            label: "Jouer à pleine puissance — chaque note compte",
            hint: "Force démons -1, +1 Rune de Lumière à chaque lieu, -3 HP",
            effects: [
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'bonus_ward', wardType: 'light', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'light', locationId: 'miln' },
              { type: 'bonus_ward', wardType: 'light', locationId: 'lakton' },
              { type: 'hero_hp_change', delta: -3 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'r6_day2', background: 'inn',
        lines: [
          { speaker: 'narrator', text: "Leesha examine les mains de Rojer. Deux doigts sur la gauche. Cinq sur la droite. Tous à vif." },
          { speaker: 'leesha_young', text: "Rojer, si tu continues comme ça, tu perdras tes derniers doigts.", emotion: 'scared' },
          { speaker: 'rojer_young', text: "Et si j'arrête de jouer, tout le monde ici perd tout.", emotion: 'sad' },
          { speaker: 'narrator', text: "Quand Rojer joue, les murs chantent. Les démons reculent. Et pendant un instant, l'espoir n'est plus un mensonge." },
        ],
        choices: [
          {
            id: 'bone_splints',
            label: "Leesha fabrique des attelles runées pour ses doigts",
            hint: "+2 HP, +1 Rune d'Os en réserve (les attelles en os amplifient le son)",
            effects: [
              { type: 'hero_hp_change', delta: 2 },
              { type: 'bonus_reserve_ward', wardType: 'bone' },
            ],
          },
          {
            id: 'raw_performance',
            label: "Jouer à mains nues — la douleur rend la musique plus vraie",
            hint: "Force démons -1, +1 Rune de Feu en réserve, -4 HP",
            effects: [
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'bonus_reserve_ward', wardType: 'fire' },
              { type: 'hero_hp_change', delta: -4 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 3,
      dialogueNodes: [{
        id: 'r6_day3', background: 'village_sunset',
        lines: [
          { speaker: 'narrator', text: "Dernière nuit. Rojer se lève. Ses jambes tremblent. Ses mains saignent. Mais il monte sur l'estrade." },
          { speaker: 'rojer_young', text: "Ce soir, je joue le morceau final. Celui que je compose depuis que j'ai deux doigts et un rêve.", emotion: 'determined' },
          { speaker: 'narrator', text: "Les villageois se taisent. Les Sharum s'arrêtent. Même le vent retient son souffle." },
          { speaker: 'rojer_young', text: "La Symphonie de Le Creux du Coupeur. Pour les morts. Pour les vivants. Pour ceux qui se battent.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'masterpiece',
            label: "Le Chef-d'œuvre — tout donner, corps et âme",
            hint: "Force démons -2, -1 démon par vague, -6 HP (sacrifice total)",
            effects: [
              { type: 'demon_strength_bonus', bonus: -2 },
              { type: 'extra_demons', count: -1 },
              { type: 'hero_hp_change', delta: -6 },
              { type: 'set_flag', flag: 'masterpiece_played', value: true },
            ],
          },
          {
            id: 'ensemble',
            label: "Diriger l'ensemble — les villageois chantent avec lui",
            hint: "+2 Pop à chaque lieu, +1 Rune d'Os au Centre",
            effects: [
              { type: 'modify_population', locationId: 'cutters_hollow', delta: 2 },
              { type: 'modify_population', locationId: 'miln', delta: 2 },
              { type: 'modify_population', locationId: 'lakton', delta: 2 },
              { type: 'modify_population', locationId: 'desert_spear', delta: 2 },
              { type: 'bonus_ward', wardType: 'bone', locationId: 'cutters_hollow' },
            ],
          },
        ],
      }],
    },
  ],

  victoryDialogue: [
    {
      id: 'r6_victory_1', background: 'dawn_victory',
      lines: [
        { speaker: 'narrator', text: "La dernière note résonne dans l'aube naissante. Un son pur, cristallin, qui semble faire vibrer l'air lui-même." },
        { speaker: 'narrator', text: "Rojer s'effondre sur l'estrade. Le violon roule à côté de lui. La flûte d'os, serrée dans sa main gauche, brille encore." },
      ],
      nextNodeId: 'r6_victory_2',
    },
    {
      id: 'r6_victory_2', background: 'forest_village',
      lines: [
        { speaker: 'leesha_young', text: "Rojer !", emotion: 'scared' },
        { speaker: 'rojer_young', text: "Je suis là. Je suis là. J'ai juste... besoin d'une minute.", emotion: 'hopeful' },
        { speaker: 'narrator', text: "Rojer Halfgrip. Le Maestro. L'homme aux deux doigts qui fait chanter les runes et pleurer les démons. Le chef d'orchestre de la bataille de Le Creux du Coupeur." },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'r6_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Le violon se brise. La flûte tombe. Et le silence qui suit est le son le plus terrible que Le Creux du Coupeur ait jamais entendu." },
      { speaker: 'rojer_young', text: "Mes mains... Je ne sens plus mes mains...", emotion: 'scared' },
      { speaker: 'narrator', text: "Sans musique, les runes meurent. Et sans runes, Le Creux du Coupeur meurt." },
      { speaker: 'narrator', text: "Chapitre 24 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 25: FINAL — La Bataille de Cutter's Hollow
// Les héros convergent pour la bataille finale
// ============================================================

export const CHAPTER_FINAL: ChapterDefinition = {
  id: 25,
  act: 0,
  title: "La Bataille de Le Creux du Coupeur",
  subtitle: "L'humanité ne se cache plus. L'humanité se bat.",
  heroId: 'arlen_young',
  nightCount: 5,
  startingNightNumber: 8,
  startingPresence: 'cutters_hollow',
  hiddenLocations: [] as any,
  availableWards: ['stone', 'wind', 'fire', 'light', 'bone'] as WardType[],
  fireCanKill: true,
  maxComboSize: 3,
  locationOverrides: {
    cutters_hollow: { name: "Le Creux du Coupeur — Centre", startPop: 12, terrain: 'forest' as any },
    miln: { name: 'Barricade Nord', startPop: 6, terrain: 'forest' as any },
    lakton: { name: 'Scierie Fortifiée', startPop: 7, terrain: 'forest' as any },
    desert_spear: { name: 'Lisière Sud', startPop: 5, terrain: 'forest' as any },
  },
  preplacedWards: [
    { locationId: 'cutters_hollow', ward: 'fire' },
    { locationId: 'cutters_hollow', ward: 'stone' },
    { locationId: 'cutters_hollow', ward: 'bone' },
    { locationId: 'miln', ward: 'wind' },
    { locationId: 'miln', ward: 'light' },
    { locationId: 'lakton', ward: 'fire' },
    { locationId: 'lakton', ward: 'stone' },
    { locationId: 'desert_spear', ward: 'bone' },
    { locationId: 'desert_spear', ward: 'wind' },
  ],

  introDialogue: [
    {
      id: 'f_intro_1', background: 'forest_village',
      lines: [
        { speaker: 'narrator', text: "Le Creux du Coupeur. Le village de bûcherons au cœur de la forêt. C'est ici que tout a commencé — et c'est ici que tout va se décider." },
        { speaker: 'narrator', text: "Des réfugiés affluent de toute la région. Les chtoniens sont plus agressifs que jamais, comme s'ils sentaient quelque chose changer." },
        { speaker: 'narrator', text: "Et au milieu du chaos, un homme arrive. Couvert de runes tatoués sur chaque centimètre de peau. Les yeux brûlants de détermination." },
      ],
      nextNodeId: 'f_intro_2',
    },
    {
      id: 'f_intro_2', background: 'forest_village',
      lines: [
        { speaker: 'arlen_young', text: "Je suis Arlen Bales. De Ruisseau de Tibbet. Je suis revenu.", emotion: 'determined' },
        { speaker: 'leesha_young', text: "Ces runes sur votre peau... C'est impossible. Ce sont des runes offensifs — ils n'existent plus depuis—", emotion: 'hopeful' },
        { speaker: 'arlen_young', text: "Depuis la chute. Oui. Je les ai retrouvés. À Soleil d'Anoch.", emotion: 'determined' },
        { speaker: 'rojer_young', text: "Et moi qui croyais être spécial avec mon luth... Enchanté. Rojer Halfgrip, Jongleur.", emotion: 'neutral' },
      ],
      nextNodeId: 'f_intro_jardir',
    },
    {
      id: 'f_intro_jardir', background: 'krasia',
      lines: [
        { speaker: 'narrator', text: "Un cor de guerre retentit à la lisière sud. Des guerriers en robes blanches émergent de la forêt, lances au poing." },
        { speaker: 'jardir_young', text: "Arlen! Par Everam, tu es vivant. J'ai mené mes Sharum à travers le désert en suivant les chtoniens.", emotion: 'determined' },
        { speaker: 'arlen_young', text: "Jardir... Tu es venu.", emotion: 'hopeful' },
        { speaker: 'jardir_young', text: "Sharak Ka — la Première Guerre — ne se gagne pas seul. Mes guerriers tiendront la lisière sud.", emotion: 'determined' },
        { speaker: 'leesha_young', text: "Des Krasiens ? Ici ? Je ne sais pas si les villageois—", emotion: 'scared' },
        { speaker: 'jardir_young', text: "Cette nuit, il n'y a pas de Krasiens ni de Thésiens. Il n'y a que des humains. Et des démons.", emotion: 'angry' },
      ],
      nextNodeId: 'f_intro_3',
    },
    {
      id: 'f_intro_3', background: 'village_sunset',
      lines: [
        { speaker: 'leesha_young', text: "Les chtoniens convergent vers le village. Plus que jamais. Comme une armée.", emotion: 'scared' },
        { speaker: 'arlen_young', text: "Alors on va se battre. Plus de runes passifs. Plus de peur. Cette nuit, c'est nous qui attaquons.", emotion: 'determined' },
        { speaker: 'rojer_young', text: "Ma musique peut les ralentir. Les troubler. Si je joue pendant que vous combattez...", emotion: 'determined' },
        { speaker: 'jardir_young', text: "Mes Sharum protégeront les flancs. Everam est avec nous.", emotion: 'determined' },
        { speaker: 'leesha_young', text: "Et mes réseaux de runes peuvent canaliser l'énergie. Ensemble, nous pouvons tenir.", emotion: 'determined' },
        { speaker: 'narrator', text: "Quatre héros. Quatre chemins. Réunis pour la première fois dans la nuit la plus sombre d'Ala." },
        { speaker: 'narrator', text: "Cinq nuits. Cinq nuits pour prouver que l'humanité peut se relever. Que la peur n'est pas une fatalité." },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'f_day1', background: 'forest_village',
        lines: [
          { speaker: 'narrator', text: "Première nuit passée. Les chtoniens ont été repoussés — pour la première fois, par la force, pas par la peur." },
          { speaker: 'arlen_young', text: "Les runes de combat fonctionnent. Mais les villageois ne savent pas se battre. Si les runes cèdent, ils paniquent.", emotion: 'determined' },
          { speaker: 'leesha_young', text: "Je peux former les femmes à tracer des runes de secours. Ou je continue mes recherches sur les combinaisons triples.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'train_villagers',
            label: "Former les villageois au tracé des runes",
            hint: "+2 Pop à chaque position, -1 AP",
            effects: [
              { type: 'modify_population', locationId: 'cutters_hollow', delta: 2 },
              { type: 'modify_population', locationId: 'miln', delta: 2 },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'research_combos',
            label: "Rechercher les combinaisons de runes triples",
            hint: "+1 Rune d'Os en réserve, +1 Rune de Lumière en réserve",
            effects: [
              { type: 'bonus_reserve_ward', wardType: 'bone' },
              { type: 'bonus_reserve_ward', wardType: 'light' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'f_day2', background: 'refugees',
        lines: [
          { speaker: 'narrator', text: "Un convoi de réfugiés arrive de l'ouest. Parmi eux, des blessés et des enfants." },
          { speaker: 'refugee', text: "Notre village a été rasé. Les chtoniens... ils étaient organisés. Comme s'ils avaient un chef.", emotion: 'scared' },
          { speaker: 'arlen_young', text: "Un chef chtonien. Un démon ancien. C'est lui qui dirige l'assaut contre Le Creux du Coupeur.", emotion: 'angry' },
          { speaker: 'rojer_young', text: "Je peux aller à la lisière sud jouer pour les ralentir. Ma musique les perturbe. Mais je serai exposé.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'send_rojer',
            label: "Envoyer Rojer jouer à la Lisière Sud",
            hint: "Force démons -1, +1 Rune de Vent à la Lisière, mais -2 HP",
            effects: [
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'bonus_ward', wardType: 'wind', locationId: 'desert_spear' },
              { type: 'hero_hp_change', delta: -2 },
            ],
          },
          {
            id: 'shelter_refugees',
            label: "Accueillir les réfugiés et renforcer le centre",
            hint: "+3 Pop au Centre, +1 Rune de Feu au Centre",
            effects: [
              { type: 'modify_population', locationId: 'cutters_hollow', delta: 3 },
              { type: 'bonus_ward', wardType: 'fire', locationId: 'cutters_hollow' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 3,
      dialogueNodes: [{
        id: 'f_day3', background: 'ward_book',
        lines: [
          { speaker: 'leesha_young', text: "J'ai percé le secret du réseau triple. Pierre, feu, os — combinés, ils créent un mur que même un démon ancien ne peut franchir.", emotion: 'hopeful' },
          { speaker: 'arlen_young', text: "On n'a pas assez de matériaux pour protéger tout le village. Il faut choisir.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'fortify_center',
            label: "Concentrer les défenses au Centre",
            hint: "+1 Rune d'Os et +1 Rune de Lumière au Centre",
            effects: [
              { type: 'bonus_ward', wardType: 'bone', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'light', locationId: 'cutters_hollow' },
            ],
          },
          {
            id: 'spread_defense',
            label: "Répartir les runes sur toutes les positions",
            hint: "+1 Rune de Feu à la Barricade, +1 Rune de Pierre à la Scierie, +1 Rune d'Os à la Lisière",
            effects: [
              { type: 'bonus_ward', wardType: 'fire', locationId: 'miln' },
              { type: 'bonus_ward', wardType: 'stone', locationId: 'lakton' },
              { type: 'bonus_ward', wardType: 'bone', locationId: 'desert_spear' },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 4,
      dialogueNodes: [{
        id: 'f_day4', background: 'village_sunset',
        lines: [
          { speaker: 'narrator', text: "Dernière nuit. Le ciel est rouge sang. Les chtoniens grondent dans la forêt, plus nombreux que jamais." },
          { speaker: 'arlen_young', text: "Cette nuit, ils enverront tout. Le démon ancien viendra en personne. Je le sens.", emotion: 'determined' },
          { speaker: 'leesha_young', text: "J'ai préparé un onguent de rune concentré. On peut l'appliquer sur les défenses... ou sur toi, Arlen.", emotion: 'neutral' },
          { speaker: 'rojer_young', text: "Si on renforce Arlen, il pourra affronter le démon ancien. Mais le village sera plus vulnérable.", emotion: 'scared' },
        ],
        choices: [
          {
            id: 'empower_arlen',
            label: "Appliquer l'onguent sur Arlen — affronter le démon ancien",
            hint: "Force démons -2 (aura), mais -3 HP (douleur des runes activés)",
            effects: [
              { type: 'demon_strength_bonus', bonus: -2 },
              { type: 'hero_hp_change', delta: -3 },
              { type: 'set_flag', flag: 'faced_ancient', value: true },
            ],
          },
          {
            id: 'protect_village',
            label: "Renforcer les défenses du village",
            hint: "+1 Rune de chaque type au Centre",
            effects: [
              { type: 'bonus_ward', wardType: 'stone', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'fire', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'light', locationId: 'cutters_hollow' },
              { type: 'set_flag', flag: 'faced_ancient', value: false },
            ],
          },
        ],
      }],
    },
  ],

  victoryDialogue: [
    {
      id: 'f_victory_1', background: 'dawn_victory',
      lines: [
        { speaker: 'narrator', text: "L'aube. La cinquième aube. Et Le Creux du Coupeur tient debout." },
        { speaker: 'narrator', text: "La forêt est silencieuse. Pour la première fois depuis des générations, les chtoniens n'ont pas gagné. Ils ont été battus." },
        { speaker: 'narrator', text: "Au centre du village, Arlen Bales se tient debout. Couvert de sang — le sien et celui des démons. Les runes sur sa peau brillent encore." },
      ],
      nextNodeId: 'f_victory_2',
    },
    {
      id: 'f_victory_2', background: 'dawn_victory',
      lines: [
        { speaker: 'leesha_young', text: "On a réussi. Arlen... on a réussi.", emotion: 'hopeful' },
        { speaker: 'rojer_young', text: "Les gens chantent. Vous entendez ? Ils chantent.", emotion: 'hopeful' },
        { speaker: 'arlen_young', text: "Ce n'est que le début. Si un village peut se battre, tous les villages peuvent se battre.", emotion: 'determined' },
      ],
      nextNodeId: 'f_victory_3',
    },
    {
      id: 'f_victory_3', background: 'dawn_victory',
      lines: [
        { speaker: 'narrator', text: "Autour d'eux, les villageois de Le Creux du Coupeur ramassent des armes runées. Des bûcherons hier. Des guerriers aujourd'hui." },
        { speaker: 'narrator', text: "La nouvelle va se répandre. De village en village, de cité en cité. L'Homme Runeé a prouvé que les démons peuvent être vaincus." },
        { speaker: 'narrator', text: "L'humanité ne se cache plus derrière ses runes." },
        { speaker: 'narrator', text: "L'humanité se bat." },
        { speaker: 'narrator', text: "— Fin du Livre 1 : The Homme-Rune —" },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'f_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Les runes cèdent. Le Creux du Coupeur s'embrase. Le démon ancien rugit de triomphe dans la nuit." },
      { speaker: 'arlen_young', text: "Non... C'est pas possible. Les runes... les runes devaient tenir !", emotion: 'angry' },
      { speaker: 'narrator', text: "L'espoir meurt avec le village. L'Homme Runeé a échoué. Et l'humanité reste prisonnière de sa peur, pour toujours." },
      { speaker: 'narrator', text: "Chapitre 25 — Échec" },
    ],
  }],
};

export const CHAPTERS: ChapterDefinition[] = [
  // Act 1 — Origines (1-4)
  CHAPTER_1, CHAPTER_LEESHA, CHAPTER_JARDIR, CHAPTER_ROJER,
  // Act 2 — Croissance (5-8)
  CHAPTER_ARLEN_2, CHAPTER_LEESHA_2, CHAPTER_JARDIR_2, CHAPTER_ROJER_2,
  // Act 3 — Tournants (9-12)
  CHAPTER_ARLEN_3, CHAPTER_LEESHA_3, CHAPTER_JARDIR_3, CHAPTER_ROJER_3,
  // Act 4 — La Quête (13-16)
  CHAPTER_ARLEN_4, CHAPTER_LEESHA_4, CHAPTER_JARDIR_4, CHAPTER_ROJER_4,
  // Act 5 — Transformation (17-20)
  CHAPTER_ARLEN_5, CHAPTER_LEESHA_5, CHAPTER_JARDIR_5, CHAPTER_ROJER_5,
  // Act 6 — Convergence (21-24)
  CHAPTER_ARLEN_6, CHAPTER_LEESHA_6, CHAPTER_JARDIR_6, CHAPTER_ROJER_6,
  // Final (25)
  CHAPTER_FINAL,
];
