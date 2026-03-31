// ============================================================
// Campaign Data — Chapter 1: Le Garçon de Tibbet's Brook
// Fidèle au roman "The Warded Man" de Peter V. Brett
// ============================================================

import type { ChapterDefinition } from './campaign-types';

export const CHAPTER_1: ChapterDefinition = {
  id: 1,
  title: "Le Garçon de Tibbet's Brook",
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
  preplacedWards: [
    { locationId: 'cutters_hollow', ward: 'fire' },
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
        { speaker: 'narrator', text: "292 AR. Le soleil descend sur Tibbet's Brook, un hameau isolé dans les plaines fertiles de Thesa." },
        { speaker: 'narrator', text: "Ici, comme partout dans le monde, la vie s'organise autour d'une seule certitude : quand la nuit tombe, les corelings montent." },
        { speaker: 'narrator', text: "Des créatures de flamme, de pierre et de vent surgissent du sol dès que l'obscurité est complète. Seuls les wards — d'anciens symboles magiques — les tiennent à distance." },
      ],
      nextNodeId: 'intro_2',
    },
    {
      id: 'intro_2',
      background: 'village_sunset',
      lines: [
        { speaker: 'jeph', text: "Arlen ! Les wards de la clôture nord sont abîmés. Viens m'aider avant le crépuscule.", emotion: 'scared' },
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
        { speaker: 'ragen', text: "Jeph Bales ! Je cherche un abri pour la nuit. Mes wards portatifs ont pris un coup en route.", emotion: 'neutral' },
        { speaker: 'jeph', text: "Entrez, entrez vite. Le soleil est bas.", emotion: 'scared' },
        { speaker: 'arlen_young', text: "Vous... vous voyagez la nuit ? Seul ? Comment c'est possible ?", emotion: 'hopeful' },
        { speaker: 'ragen', text: "Avec de bons wards, du courage, et un peu de chance, gamin.", emotion: 'determined' },
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
            { speaker: 'ragen', text: "Tes wards ne sont pas mauvais pour un gamin, Arlen. Mais ils ne tiendront pas contre un coreling de flamme.", emotion: 'neutral' },
            { speaker: 'arlen_young', text: "Qu'est-ce que je peux faire de mieux ?", emotion: 'determined' },
            { speaker: 'ragen', text: "J'ai du matériel de rechange. Je peux t'aider à renforcer la place du village, ou tu gardes tes forces pour la ferme.", emotion: 'neutral' },
          ],
          choices: [
            {
              id: 'help_ragen',
              label: "Aider Ragen à la place du village",
              hint: "+1 Ward de Vent à la Place, mais -1 AP (fatigue)",
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
            { speaker: 'narrator', text: "La deuxième nuit a été rude. Des traces de griffes marquent la clôture. Les wards ont tenu, mais de justesse." },
            { speaker: 'silvy', text: "Jeph, la voisine Harl dit que ses wards à lui ont failli céder. Il demande de l'aide.", emotion: 'scared' },
            { speaker: 'jeph', text: "C'est pas notre problème. Chacun protège sa maison.", emotion: 'angry' },
            { speaker: 'arlen_young', text: "Si les wards de Harl cèdent, les corelings viendront ensuite chez nous. On devrait l'aider.", emotion: 'determined' },
            { speaker: 'jeph', text: "Tu veux jouer au héros ? Comme ton grand-père ? Regarde où ça l'a mené.", emotion: 'angry' },
          ],
          choices: [
            {
              id: 'help_neighbor',
              label: "Aider le voisin Harl à renforcer ses wards",
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
              hint: "-3 HP (course contre le crépuscule), mais +1 Ward de Feu en réserve (Silvy en avait)",
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
        { speaker: 'narrator', text: "L'aube du quatrième jour. Les corelings se dissolvent dans la lumière, laissant des traînées noirâtres sur le sol." },
        { speaker: 'narrator', text: "Tibbet's Brook a tenu. Trois nuits. Les wards ont craqué, plié, mais n'ont pas rompu." },
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
        { speaker: 'arlen_young', text: "Je refuse de vivre comme ça, mère. Enfermé chaque nuit, à attendre que les wards cèdent. À avoir peur.", emotion: 'determined' },
        { speaker: 'narrator', text: "Silvy pleure. Jeph ne dit rien. Il n'a plus les mots." },
        { speaker: 'narrator', text: "Le lendemain, avant l'aube, Arlen Bales quitte Tibbet's Brook avec Ragen le Messager." },
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
      background: 'village_burning',
      lines: [
        { speaker: 'narrator', text: "Les wards cèdent. Un par un, les symboles s'éteignent comme des bougies dans le vent." },
        { speaker: 'narrator', text: "Les corelings se précipitent dans les brèches. Des démons de flamme embrasent la grange. Un démon de pierre fracasse la clôture." },
        { speaker: 'jeph', text: "Non... non, non, non...", emotion: 'scared' },
        { speaker: 'silvy', text: "ARLEN ! COURS ! COURS, MON FILS !", emotion: 'scared' },
        { speaker: 'narrator', text: "Arlen court dans l'obscurité. Derrière lui, les hurlements. Devant lui, le vide." },
        { speaker: 'narrator', text: "Son père n'a pas bougé. Paralysé par la terreur, comme toujours. Jusqu'à la fin." },
        { speaker: 'arlen_young', text: "Plus jamais...", emotion: 'angry' },
        { speaker: 'narrator', text: "Arlen Bales fuit seul dans la nuit, poursuivi par les corelings et le souvenir de la lâcheté de son père." },
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
  title: "L'Herboriste de Cutter's Hollow",
  subtitle: "Leesha apprend que soigner est aussi un combat.",
  heroId: 'leesha_young',
  nightCount: 3,
  startingNightNumber: 2,
  startingPresence: 'cutters_hollow',
  hiddenLocations: ['desert_spear'] as any,
  locationOverrides: {
    cutters_hollow: { name: "Cutter's Hollow", startPop: 7, terrain: 'forest' as any },
    miln: { name: 'Maison de Bruna', startPop: 4, terrain: 'forest' as any },
    lakton: { name: 'Place du Marché', startPop: 5, terrain: 'forest' as any },
    desert_spear: { name: '', startPop: 0 },
  },
  preplacedWards: [
    { locationId: 'cutters_hollow', ward: 'fire' },
    { locationId: 'cutters_hollow', ward: 'stone' },
    { locationId: 'miln', ward: 'fire' },
  ],

  introDialogue: [
    {
      id: 'intro_1', background: 'forest_village',
      lines: [
        { speaker: 'narrator', text: "Cutter's Hollow. Un village de bûcherons au cœur de la forêt. Ici, on coupe le bois le jour et on prie la nuit." },
        { speaker: 'narrator', text: "Leesha Paper, fille du propriétaire du papetier, est apprentie chez Bruna, la vieille herboriste du village." },
        { speaker: 'narrator', text: "Bruna est la dernière à connaître les secrets des herbes et des onguents de ward. À sa mort, ce savoir disparaîtra." },
      ],
      nextNodeId: 'intro_2',
    },
    {
      id: 'intro_2', background: 'forest_village',
      lines: [
        { speaker: 'leesha_young', text: "Bruna, les wards de la place du marché sont usés. Le bois est pourri par la pluie.", emotion: 'scared' },
        { speaker: 'bruna', text: "Je sais, petite. Mais ces idiots de bûcherons refusent de les refaire. Trop occupés à couper du bois.", emotion: 'angry' },
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
          { speaker: 'bruna', text: "Leesha, viens ici. Il est temps que tu apprennes à préparer l'encre de ward.", emotion: 'neutral' },
          { speaker: 'narrator', text: "Bruna sort des bocaux d'herbes séchées, un mortier, et une fiole d'encre noire épaisse." },
          { speaker: 'bruna', text: "L'encre ordinaire s'efface en quelques semaines. Celle-ci, faite avec les bonnes herbes, tient des mois. La différence entre la vie et la mort.", emotion: 'determined' },
          { speaker: 'leesha_young', text: "Et les cataplasmes ? On en a presque plus.", emotion: 'scared' },
          { speaker: 'bruna', text: "C'est le choix que tu dois faire, petite. On a assez d'herbes pour préparer l'encre ou les cataplasmes. Pas les deux.", emotion: 'neutral' },
        ],
        choices: [
          {
            id: 'make_ink',
            label: "Préparer l'encre de ward renforcée",
            hint: "+3 Encre à la Maison de Bruna (pour crafter des wards)",
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
          { speaker: 'bruna', text: "Alors tu choisis, petite. Soigner les blessés ou renforcer les wards. On ne peut pas tout faire.", emotion: 'sad' },
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
            label: "Renforcer les wards en priorité",
            hint: "+1 Ward de Pierre à la Place du Marché",
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
          { speaker: 'bruna', text: "Tais-toi et écoute ! On a assez d'encre pour renforcer tous les wards du village. Mais je suis trop faible. C'est toi qui devras le faire seule.", emotion: 'determined' },
          { speaker: 'leesha_young', text: "Moi ? Toute seule ? Je n'ai pas votre expérience...", emotion: 'scared' },
          { speaker: 'bruna', text: "Tu sais tracer un ward, oui ou non ? Alors choisis : passer l'après-midi à renforcer les wards, ou rester ici à me soigner.", emotion: 'angry' },
        ],
        choices: [
          {
            id: 'reinforce_all',
            label: "Renforcer tous les wards du village",
            hint: "+1 Ward de Pierre à chaque lieu, mais Bruna sans soin (-2 HP héros de fatigue)",
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
      { speaker: 'narrator', text: "L'aube se lève sur Cutter's Hollow. Le village respire encore." },
      { speaker: 'bruna', text: "Tu as bien fait, petite. Mieux que je ne l'aurais cru.", emotion: 'hopeful' },
      { speaker: 'leesha_young', text: "J'ai tellement à apprendre encore...", emotion: 'determined' },
      { speaker: 'bruna', text: "Tu apprendras. Tu es l'herboriste maintenant. Ce village dépend de toi.", emotion: 'neutral' },
      { speaker: 'narrator', text: "Leesha Paper accepte son destin. Elle sera le bouclier de Cutter's Hollow." },
    ],
  }],

  defeatDialogue: [{
    id: 'l_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Les wards cèdent. Cutter's Hollow est submergé." },
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
  title: 'Le Labyrinthe de Krasia',
  subtitle: "La première nuit de Jardir dans le Maze.",
  heroId: 'jardir_young',
  nightCount: 3,
  startingNightNumber: 2,
  startingPresence: 'desert_spear',
  hiddenLocations: ['lakton'] as any,
  locationOverrides: {
    desert_spear: { name: 'Entrée du Maze', startPop: 6, terrain: 'underground' as any },
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
        { speaker: 'narrator', text: "Chaque nuit, les guerriers Sharum descendent dans le Maze — un labyrinthe de tunnels sous la ville, piégé de wards." },
        { speaker: 'narrator', text: "C'est dans le Maze que les corelings montent. C'est dans le Maze qu'on les tue." },
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
          { speaker: 'narrator', text: "Entre les nuits de combat, les Sharum réparent les wards du Maze et aiguisent leurs lances." },
          { speaker: 'jardir_young', text: "Les wards du couloir sud sont faibles. Si les corelings percent, ils atteindront les nie'Sharum.", emotion: 'determined' },
          { speaker: 'drillmaster', text: "Tu veux dépenser nos guerriers à renforcer les wards, ou garder tes forces pour le combat ?", emotion: 'neutral' },
        ],
        choices: [
          {
            id: 'reinforce_maze',
            label: "Renforcer les wards du Maze",
            hint: "+1 Ward de Vent au Couloir, -1 AP",
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
            hint: "+1 Ward de Pierre à la Salle du Puits",
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
            label: "Défense stratégique derrière les wards",
            hint: "+1 Ward de Feu à chaque lieu",
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
      { speaker: 'narrator', text: "L'aube. Les corelings se retirent dans les profondeurs. Le Maze tient." },
      { speaker: 'drillmaster', text: "Trois nuits. Et le gamin des rues est toujours debout.", emotion: 'neutral' },
      { speaker: 'jardir_young', text: "Je ne suis plus un gamin.", emotion: 'determined' },
      { speaker: 'narrator', text: "Le Drillmaster hoche la tête. Pour la première fois, il regarde Jardir avec respect." },
      { speaker: 'narrator', text: "Ahmann Jardir. Un jour, ils l'appelleront Shar'Dama Ka — Celui Qui Voit dans la Nuit." },
    ],
  }],

  defeatDialogue: [{
    id: 'j_defeat', background: 'maze',
    lines: [
      { speaker: 'narrator', text: "Le Maze cède. Les corelings remontent vers la surface." },
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
  title: 'Le Jongleur de Riverbridge',
  subtitle: "La nuit où Rojer a découvert le pouvoir de la musique.",
  heroId: 'rojer_young',
  nightCount: 3,
  startingNightNumber: 1,
  startingPresence: 'cutters_hollow',
  hiddenLocations: ['desert_spear', 'lakton'] as any,
  locationOverrides: {
    cutters_hollow: { name: 'Auberge de Riverbridge', startPop: 5, terrain: 'plains' as any },
    miln: { name: 'Pont du Village', startPop: 4, terrain: 'plains' as any },
    desert_spear: { name: '', startPop: 0 },
    lakton: { name: '', startPop: 0 },
  },
  preplacedWards: [
    { locationId: 'cutters_hollow', ward: 'fire' },
    { locationId: 'cutters_hollow', ward: 'stone' },
    { locationId: 'miln', ward: 'wind' },
  ],

  introDialogue: [
    {
      id: 'intro_1', background: 'inn',
      lines: [
        { speaker: 'narrator', text: "Riverbridge. Un village de passage entre Fort Miln et les plaines du sud." },
        { speaker: 'narrator', text: "Rojer Inn a trois ans. Il ne comprend pas pourquoi sa mère pleure chaque soir quand le soleil se couche." },
        { speaker: 'narrator', text: "Son père, Jessum, est jongleur. Il joue du violon pour distraire les voyageurs — et pour garder le courage quand la nuit tombe." },
      ],
      nextNodeId: 'intro_2',
    },
    {
      id: 'intro_2', background: 'inn',
      lines: [
        { speaker: 'narrator', text: "Mais cette nuit, les wards de l'auberge ont été endommagés par la pluie. Jessum joue plus fort que d'habitude, comme s'il sentait le danger." },
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
          { speaker: 'narrator', text: "Rojer a grandi. Il a quinze ans maintenant, apprenti jongleur, orphelin depuis cette nuit à Riverbridge." },
          { speaker: 'narrator', text: "Son maître Arrick lui a appris le violon, mais aussi l'art de survivre dans un monde de monstres." },
          { speaker: 'rojer_young', text: "Arrick, les wards du pont sont fissurés.", emotion: 'scared' },
          { speaker: 'arrick', text: "Et alors ? C'est pas notre problème. On joue ce soir, on part demain.", emotion: 'neutral' },
          { speaker: 'rojer_young', text: "On ne peut pas juste... partir ?", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'fix_bridge_wards',
            label: "Réparer les wards du pont",
            hint: "+1 Ward de Pierre au Pont, -1 AP",
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
          { speaker: 'arrick', text: "Tu délires, gamin. La musique n'arrête pas les corelings.", emotion: 'angry' },
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
          { speaker: 'narrator', text: "L'avant-dernière nuit. Arrick est ivre. Les wards craquent." },
          { speaker: 'arrick', text: "On va mourir ici, gamin. Comme tes parents.", emotion: 'scared' },
          { speaker: 'rojer_young', text: "Taisez-vous !", emotion: 'angry' },
          { speaker: 'narrator', text: "Rojer prend le violon de son père. Celui que Jessum jouait la nuit de Riverbridge. Les cordes vibrent sous ses doigts." },
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
            label: "Rester derrière les wards, jouer prudemment",
            hint: "+1 Ward de Feu en réserve",
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
      { speaker: 'narrator', text: "Rojer Inn. Le Jongleur de Fidèle. L'homme dont la musique fait trembler les corelings." },
    ],
  }],

  defeatDialogue: [{
    id: 'r_defeat', background: 'village_burning',

    lines: [
      { speaker: 'narrator', text: "Le violon se brise. Les wards cèdent. Le charme est rompu." },
      { speaker: 'arrick', text: "COURS, ROJER !", emotion: 'scared' },
      { speaker: 'narrator', text: "Rojer fuit dans la nuit, serrant contre lui les morceaux du violon de son père." },
      { speaker: 'rojer_young', text: "Un jour, je jouerai assez fort pour que tous les démons m'entendent.", emotion: 'angry' },
      { speaker: 'narrator', text: "Chapitre 4 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 5: Arlen — La Route vers Fort Miln
// ============================================================

export const CHAPTER_ARLEN_2: ChapterDefinition = {
  id: 5,
  title: 'La Route vers Fort Miln',
  subtitle: "Arlen voyage avec Ragen. Chaque nuit en plein air est un combat pour survivre.",
  heroId: 'arlen_young',
  nightCount: 3,
  startingNightNumber: 2,
  startingPresence: 'cutters_hollow',
  hiddenLocations: ['lakton'] as any,
  locationOverrides: {
    cutters_hollow: { name: 'Campement de Route', startPop: 4, terrain: 'plains' as any },
    miln: { name: 'Relais de Messager', startPop: 3, terrain: 'plains' as any },
    desert_spear: { name: 'Ruines Anciennes', startPop: 2, terrain: 'mountain' as any },
    lakton: { name: '', startPop: 0 },
  },
  preplacedWards: [
    { locationId: 'cutters_hollow', ward: 'fire' },
    { locationId: 'miln', ward: 'fire' },
  ],

  introDialogue: [
    {
      id: 'a2_intro_1', background: 'road',
      lines: [
        { speaker: 'narrator', text: "La route entre Tibbet's Brook et Fort Miln fait cinq jours de marche. Cinq jours. Cinq nuits." },
        { speaker: 'narrator', text: "Ragen connaît le chemin. Il sait où sont les relais de messagers — des cabanes fortifiées avec des wards de base, espacées d'une journée de marche." },
        { speaker: 'ragen', text: "Règle numéro un, gamin : on ne marche JAMAIS après le crépuscule. Jamais.", emotion: 'determined' },
        { speaker: 'arlen_young', text: "Et si les wards d'un relais sont cassés ?", emotion: 'scared' },
        { speaker: 'ragen', text: "Alors on les répare. Ou on meurt.", emotion: 'neutral' },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'a2_day1', background: 'road',
        lines: [
          { speaker: 'narrator', text: "Premier jour de marche. Ragen montre à Arlen comment lire les traces de corelings sur le sol — des marques noires qui s'évaporent au soleil." },
          { speaker: 'ragen', text: "Tu vois ces traces ? Démon de flamme. Ils sont passés ici cette nuit. Beaucoup.", emotion: 'neutral' },
          { speaker: 'arlen_young', text: "On peut explorer ces ruines là-bas ? On dirait qu'il y a des symboles sur les murs.", emotion: 'hopeful' },
          { speaker: 'ragen', text: "Des ruines ? Hmm. Ça pourrait être un ancien poste de garde. On pourrait y trouver de l'encre de ward... ou des ennuis.", emotion: 'neutral' },
        ],
        choices: [
          {
            id: 'explore_ruins',
            label: "Explorer les ruines",
            hint: "+2 Encre aux Ruines + découverte d'un ward ancien, mais -2 HP (piège)",
            effects: [
              { type: 'add_resources', locationId: 'desert_spear', resource: 'ink', amount: 2 },
              { type: 'bonus_reserve_ward', wardType: 'stone' },
              { type: 'hero_hp_change', delta: -2 },
              { type: 'set_flag', flag: 'explored_ruins', value: true },
            ],
          },
          {
            id: 'stay_on_road',
            label: "Rester sur la route — pas le temps",
            hint: "+2 Bois au Campement (collecte en chemin)",
            effects: [
              { type: 'add_resources', locationId: 'cutters_hollow', resource: 'wood', amount: 2 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'a2_day2', background: 'road',
        lines: [
          { speaker: 'narrator', text: "Deuxième nuit survivue. Arlen n'a presque pas dormi. Les grattements des corelings contre les wards résonnent encore dans sa tête." },
          { speaker: 'arlen_young', text: "Ragen... les wards du prochain relais. Ils ont l'air vieux sur votre carte.", emotion: 'scared' },
          { speaker: 'ragen', text: "Personne n'est passé ici depuis des mois. On va peut-être devoir camper en plein air.", emotion: 'determined' },
          { speaker: 'arlen_young', text: "En plein air ?!", emotion: 'scared' },
          { speaker: 'ragen', text: "J'ai des wards portatifs. Mais ils ne couvrent pas une grande surface. On sera serrés.", emotion: 'neutral' },
        ],
        choices: [
          {
            id: 'detour_relay',
            label: "Faire un détour vers un autre relais",
            hint: "+1 Ward de Pierre au Relais, -1 AP (fatigue du détour)",
            effects: [
              { type: 'bonus_ward', wardType: 'stone', locationId: 'miln' },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'camp_open',
            label: "Camper en plein air avec les wards portatifs",
            hint: "Aucun bonus, mais +1 démon par vague (exposition)",
            effects: [
              { type: 'extra_demons', count: 1 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 3,
      dialogueNodes: [{
        id: 'a2_day3', background: 'miln',
        lines: [
          { speaker: 'narrator', text: "Le troisième jour. Au loin, les tours de Fort Miln se dessinent contre le ciel gris. Si proches, et pourtant..." },
          { speaker: 'ragen', text: "Une dernière nuit, gamin. Les murs de Miln sont à portée de vue, mais on n'arrivera pas avant la tombée de la nuit.", emotion: 'determined' },
          { speaker: 'arlen_young', text: "On pourrait courir ?", emotion: 'hopeful' },
          { speaker: 'ragen', text: "Et arriver épuisés, incapables de nous défendre si les wards sont faibles ? Non. On campe ici et on entre demain à l'aube.", emotion: 'neutral' },
          { speaker: 'narrator', text: "Mais Arlen a remarqué quelque chose dans les ruines qu'ils ont croisées. Des symboles qu'il n'a jamais vus. Des wards... offensifs ?" },
        ],
        choices: [
          {
            id: 'study_symbols',
            label: "Recopier les symboles inconnus",
            hint: "+1 Ward de Vent en réserve (ward offensif rudimentaire), -1 AP",
            effects: [
              { type: 'bonus_reserve_ward', wardType: 'wind' },
              { type: 'hero_ap_change', delta: -1 },
              { type: 'set_flag', flag: 'found_combat_wards', value: true },
            ],
          },
          {
            id: 'focus_defense',
            label: "Se concentrer sur les défenses du campement",
            hint: "+3 Bois au Campement",
            effects: [
              { type: 'add_resources', locationId: 'cutters_hollow', resource: 'wood', amount: 3 },
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
        { speaker: 'narrator', text: "L'aube du quatrième jour. Les portes de Fort Miln s'ouvrent devant eux." },
        { speaker: 'narrator', text: "Arlen lève les yeux vers les murs immenses. Des wards gravés dans la pierre par centaines, par milliers. Plus anciens et plus puissants que tout ce qu'il a vu." },
        { speaker: 'arlen_young', text: "C'est... magnifique.", emotion: 'hopeful' },
        { speaker: 'ragen', text: "Bienvenue à Fort Miln, gamin. Ta nouvelle vie commence ici.", emotion: 'neutral' },
        { speaker: 'narrator', text: "Arlen Bales pose le pied dans la plus grande cité qu'il ait jamais vue. Quelque part dans ces murs, il trouvera les réponses qu'il cherche." },
        { speaker: 'narrator', text: "Les wards de combat. Le savoir perdu. La clé pour ne plus jamais avoir peur." },
      ],
    },
  ],

  defeatDialogue: [
    {
      id: 'a2_defeat', background: 'village_burning',
      lines: [
        { speaker: 'narrator', text: "Les wards portatifs cèdent. La nuit envahit le campement." },
        { speaker: 'ragen', text: "COURS VERS MILN ! COURS ET NE T'ARRÊTE PAS !", emotion: 'angry' },
        { speaker: 'narrator', text: "Arlen court dans l'obscurité, les corelings sur ses talons. Les murs de Miln sont si proches..." },
        { speaker: 'narrator', text: "Il n'atteindra jamais les portes." },
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
  title: "L'Attaque de Cutter's Hollow",
  subtitle: "Sans Bruna, Leesha est la seule à pouvoir protéger le village.",
  heroId: 'leesha_young',
  nightCount: 3,
  startingNightNumber: 3,
  startingPresence: 'cutters_hollow',
  hiddenLocations: ['desert_spear'] as any,
  locationOverrides: {
    cutters_hollow: { name: "Cutter's Hollow", startPop: 8, terrain: 'forest' as any },
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
      id: 'l2_intro', background: 'forest_village',
      lines: [
        { speaker: 'narrator', text: "Bruna est morte. La vieille herboriste s'est éteinte dans son sommeil, un sourire aux lèvres." },
        { speaker: 'narrator', text: "Leesha est seule maintenant. La seule à connaître les herbes, les onguents, et les secrets des wards." },
        { speaker: 'leesha_young', text: "Je ne suis pas prête...", emotion: 'scared' },
        { speaker: 'narrator', text: "Mais les corelings ne se soucient pas de sa peur. Et cette nuit, ils seront plus nombreux que jamais." },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'l2_day1', background: 'forest_village',
        lines: [
          { speaker: 'narrator', text: "Les bûcherons de Cutter's Hollow regardent Leesha avec méfiance. Une gamine qui prétend remplacer Bruna ?" },
          { speaker: 'leesha_young', text: "Les wards de la scierie sont fissurés. Si on ne les répare pas, les hommes qui travaillent là-bas seront sans protection.", emotion: 'determined' },
          { speaker: 'narrator', text: "Le contremaître Smitt hésite." },
        ],
        choices: [
          {
            id: 'convince_smitt',
            label: "Convaincre Smitt de fournir du bois pour les wards",
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
          { speaker: 'narrator', text: "La nuit a été violente. Des démons de bois ont arraché des arbres entiers pour les jeter contre les wards." },
          { speaker: 'leesha_young', text: "Il faut explorer la forêt autour du village. Bruna disait qu'il y avait d'anciennes pierres wardées dans les bois.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'explore_forest',
            label: "Explorer la forêt (risqué mais prometteur)",
            hint: "+1 Ward de Pierre en réserve, -2 HP (blessure dans les ronces)",
            effects: [
              { type: 'bonus_reserve_ward', wardType: 'stone' },
              { type: 'hero_hp_change', delta: -2 },
              { type: 'set_flag', flag: 'explored_forest', value: true },
            ],
          },
          {
            id: 'fortify_village',
            label: "Rester au village et renforcer les défenses",
            hint: "+1 Ward de Feu à Cutter's Hollow",
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
          { speaker: 'narrator', text: "Dernière nuit. Les corelings sont de plus en plus agressifs, comme s'ils sentaient la faiblesse du village." },
          { speaker: 'leesha_young', text: "J'ai trouvé quelque chose dans les notes de Bruna. Une recette d'onguent qui renforce temporairement les wards.", emotion: 'hopeful' },
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
      { speaker: 'narrator', text: "L'aube se lève. Cutter's Hollow tient debout." },
      { speaker: 'narrator', text: "Les villageois regardent Leesha différemment maintenant. Plus de méfiance. Du respect." },
      { speaker: 'leesha_young', text: "Bruna... j'espère que vous seriez fière.", emotion: 'sad' },
      { speaker: 'narrator', text: "Leesha Paper. L'herboriste de Cutter's Hollow. La protectrice." },
    ],
  }],

  defeatDialogue: [{
    id: 'l2_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Les wards de Cutter's Hollow cèdent. Les démons de bois envahissent le village dans un fracas d'arbres brisés." },
      { speaker: 'leesha_young', text: "Non... NON !", emotion: 'angry' },
      { speaker: 'narrator', text: "Leesha fuit avec les survivants. Bruna est partie, et maintenant le village aussi." },
      { speaker: 'narrator', text: "Chapitre 6 — Échec" },
    ],
  }],
};

export const CHAPTERS: ChapterDefinition[] = [
  CHAPTER_1, CHAPTER_LEESHA, CHAPTER_JARDIR, CHAPTER_ROJER,
  CHAPTER_ARLEN_2, CHAPTER_LEESHA_2,
];
