// ============================================================
// Campaign Data — Chapter 1: Le Garçon de Tibbet's Brook
// Fidèle au roman "The Warded Man" de Peter V. Brett
// ============================================================

import type { ChapterDefinition } from './campaign-types';
import type { WardType } from './types';

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
            { speaker: 'ragen', text: "D'abord, récolte des ressources. Tape sur un lieu pour voir ce qu'il produit — Bois ou Encre. Ensuite, fabrique un ward avec ces ressources.", emotion: 'neutral' },
            { speaker: 'ragen', text: "Ensuite, place ton ward sur un lieu. L'ordre compte ! Deux runes côte à côte peuvent former un combo plus puissant.", emotion: 'determined' },
            { speaker: 'ragen', text: "La nuit, tu devras activer tes défenses en tapant sur les lieux wardés. Chaque lieu ne s'active qu'une fois par vague.", emotion: 'neutral' },
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
    { locationId: 'cutters_hollow', ward: 'stone' },
    { locationId: 'cutters_hollow', ward: 'wind' },
    { locationId: 'miln', ward: 'stone' },
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
        { speaker: 'narrator', text: "Riverbridge. Un village de passage entre Fort Miln et les plaines du sud." },
        { speaker: 'narrator', text: "Rojer Inn a trois ans. Il ne comprend pas pourquoi sa mère pleure chaque soir quand le soleil se couche." },
        { speaker: 'narrator', text: "Son père, Jessum, est jongleur. Il joue du violon pour distraire les voyageurs — et pour garder le courage quand la nuit tombe." },
      ],
      nextNodeId: 'intro_2',
    },
    {
      id: 'intro_2', background: 'inn',
      lines: [
        { speaker: 'narrator', text: "L'auberge est protégée par les seuls wards que connaissent les villageois : Pierre et Vent. Des défenses simples, juste assez pour repousser les corelings." },
        { speaker: 'narrator', text: "Mais cette nuit, les wards ont été endommagés par la pluie. Jessum joue plus fort que d'habitude, comme s'il sentait le danger." },
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
// L'histoire diverge selon les choix du chapitre 1
// ============================================================

export const CHAPTER_ARLEN_2: ChapterDefinition = {
  id: 5,
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
        { speaker: 'narrator', text: "Arlen a quitté Tibbet's Brook. Devant lui, cinq jours de route à travers les plaines de Thesa. Cinq nuits en plein air." },
        { speaker: 'narrator', text: "Les seuls abris sont les relais de messagers — de petites cabanes wardées, espacées d'une journée de marche. Si les wards tiennent." },
        { speaker: 'narrator', text: "Arlen ne connaît que les wards basiques : feu et pierre. À Tibbet's Brook, c'est tout ce qu'on enseigne. Personne n'en sait plus." },
        { speaker: 'arlen_young', text: "Il doit y avoir d'autres wards. Des wards plus puissants. Je les trouverai.", emotion: 'determined' },
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
          { speaker: 'ragen', text: "Premier relais. Les wards sont intacts. On a de la chance.", emotion: 'neutral' },
          { speaker: 'arlen_young', text: "Ragen, ces symboles sur les poteaux... ils sont différents de ceux de Tibbet's Brook.", emotion: 'hopeful' },
          { speaker: 'ragen', text: "C'est du travail de Messager. On utilise des cercles de protection complets, pas juste des lignes. Ça couvre une plus grande surface.", emotion: 'neutral' },
          { speaker: 'arlen_young', text: "Apprenez-moi.", emotion: 'determined' },
          { speaker: 'ragen', text: "D'accord. Mais ça prend du temps. Tu apprends les cercles, ou tu renforces les wards existants.", emotion: 'neutral' },
        ],
        choices: [
          {
            id: 'learn_circles',
            label: "Apprendre les cercles de protection",
            hint: "+1 Ward de Pierre en réserve (nouvelle technique), -1 AP",
            effects: [
              { type: 'bonus_reserve_ward', wardType: 'stone' },
              { type: 'hero_ap_change', delta: -1 },
              { type: 'set_flag', flag: 'learned_circles', value: true },
            ],
          },
          {
            id: 'reinforce_relay',
            label: "Renforcer les wards du relais",
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
          { speaker: 'narrator', text: "Le premier relais de messager est en mauvais état. Les wards sont fissurés, le toit percé." },
          { speaker: 'arlen_young', text: "C'est tout ce que j'ai. Il faudra que ça suffise.", emotion: 'determined' },
          { speaker: 'narrator', text: "Arlen examine les wards. Ils sont différents de ceux de son village. Plus complexes. Il essaie de comprendre." },
        ],
        choices: [
          {
            id: 'study_wards_alone',
            label: "Étudier les wards inconnus",
            hint: "+1 Ward de Vent en réserve (copié tant bien que mal), -2 HP (fatigue)",
            effects: [
              { type: 'bonus_reserve_ward', wardType: 'wind' },
              { type: 'hero_hp_change', delta: -2 },
            ],
          },
          {
            id: 'patch_wards',
            label: "Réparer les wards avec ce qu'on connaît",
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
          { speaker: 'narrator', text: "Deuxième nuit survivue. Arlen n'a presque pas dormi. Les grattements des corelings contre les wards résonnent encore dans sa tête." },
          { speaker: 'narrator', text: "Le prochain relais est censé être à une demi-journée de marche. Mais la route est en mauvais état." },
          { speaker: 'arlen_young', text: "Il y a des traces de corelings partout. Plus que la nuit dernière.", emotion: 'scared' },
        ],
        choices: [
          {
            id: 'push_forward',
            label: "Accélérer pour atteindre le relais",
            hint: "+1 Ward de Feu au Relais, -1 AP (épuisement)",
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
          { speaker: 'narrator', text: "Dernier jour. Les tours de Fort Miln se dressent à l'horizon, énormes, imposantes. Des murs couverts de wards par milliers." },
          { speaker: 'arlen_young', text: "On y est presque... une dernière nuit.", emotion: 'hopeful' },
          { speaker: 'narrator', text: "Mais cette nuit sera la plus dangereuse. La plaine devant Miln est dégagée — aucun couvert, aucun relais. Les corelings de vent y sont particulièrement actifs." },
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
        { speaker: 'narrator', text: "Arlen lève les yeux. Les murs sont couverts de wards qu'il n'a jamais vus. Des centaines de symboles, gravés dans la pierre depuis des générations." },
        { speaker: 'arlen_young', text: "Tout ce savoir... tout ce qu'on a oublié à Tibbet's Brook...", emotion: 'hopeful' },
        { speaker: 'narrator', text: "Ici, Arlen apprendra. Les wards de protection, les cercles complets, les techniques des Messagers. Et peut-être, un jour, quelque chose de plus." },
        { speaker: 'narrator', text: "Mais pour l'instant, il n'est qu'un garçon affamé aux portes d'une ville immense." },
        { speaker: 'arlen_young', text: "Je suis Arlen Bales. De Tibbet's Brook. Et je refuse d'avoir peur.", emotion: 'determined' },
      ],
    },
  ],

  defeatDialogue: [
    {
      id: 'a2_defeat', background: 'village_burning',
      lines: [
        { speaker: 'narrator', text: "Les wards cèdent dans la plaine. Les corelings de vent fondent sur le campement." },
        { speaker: 'narrator', text: "Arlen court vers les lumières de Miln. Les murs sont si proches qu'il peut voir les wards briller." },
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
      id: 'l2_bruna_death', background: 'bruna_hut',
      lines: [
        { speaker: 'narrator', text: "La chandelle s'était éteinte dans la nuit. Quand Leesha entra dans la cabane à l'aube, elle sut tout de suite." },
        { speaker: 'leesha_young', text: "Bruna...?", emotion: 'scared' },
        { speaker: 'narrator', text: "La vieille herboriste gisait dans son lit, immobile. Un sourire paisible sur les lèvres, comme si la mort n'avait été qu'une vieille connaissance venue lui rendre visite." },
        { speaker: 'bruna', text: "...", emotion: 'sad' },
        { speaker: 'narrator', text: "Ses mains ridées serraient encore le livre de wards qu'elle avait légué à Leesha. Cent ans de savoir, transmis en quelques saisons." },
        { speaker: 'leesha_young', text: "Tu m'avais dit que tu serais toujours là. Tu m'avais promis...", emotion: 'sad' },
        { speaker: 'narrator', text: "Mais les promesses des mortels n'engagent que les vivants. Et Leesha était désormais seule." },
      ],
    },
    {
      id: 'l2_intro', background: 'forest_village',
      lines: [
        { speaker: 'narrator', text: "Les jours qui suivirent furent les plus longs de sa vie. Le village entier pleura Bruna, mais le deuil n'arrête pas les corelings." },
        { speaker: 'leesha_young', text: "Dans le livre de Bruna, j'ai trouvé des schémas que je n'avais jamais vus. Des runes de Feu — une connaissance oubliée depuis des générations.", emotion: 'hopeful' },
        { speaker: 'leesha_young', text: "Ces wards ne repoussent pas les démons. Ils les brûlent. Si je peux les reproduire...", emotion: 'determined' },
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

// ============================================================
// Chapter 7: Jardir 2 — Le Sharum Ka
// Jardir conquiert le Maze et s'impose comme chef
// ============================================================

export const CHAPTER_JARDIR_2: ChapterDefinition = {
  id: 7,
  title: 'Le Sharum Ka',
  subtitle: "Le Maze ne forge pas des soldats. Il forge des rois.",
  heroId: 'jardir_young',
  nightCount: 3,
  startingNightNumber: 4,
  startingPresence: 'desert_spear',
  hiddenLocations: ['lakton'] as any,
  availableWards: ['stone', 'wind', 'fire'] as WardType[],
  fireCanKill: false,
  locationOverrides: {
    desert_spear: { name: 'Cœur du Maze', startPop: 8, terrain: 'underground' as any },
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
        { speaker: 'narrator', text: "Trois ans ont passé depuis la première nuit de Jardir dans le Maze. Trois ans de sang, de sueur et de prières à Everam." },
        { speaker: 'narrator', text: "Le garçon des rues est devenu un guerrier. Mais dans le Maze, un guerrier n'est rien. Seul un chef peut changer le cours de la guerre." },
        { speaker: 'narrator', text: "Ce soir, le Sharum Ka — le commandant suprême des guerriers — est tombé au combat. Le Maze a besoin d'un nouveau meneur." },
      ],
      nextNodeId: 'j2_intro_2',
    },
    {
      id: 'j2_intro_2', background: 'maze',
      lines: [
        { speaker: 'drillmaster', text: "Le Sharum Ka est mort. Les hommes paniquent. Sans commandant, le Maze tombera cette nuit.", emotion: 'angry' },
        { speaker: 'jardir_young', text: "Alors je prendrai le commandement.", emotion: 'determined' },
        { speaker: 'drillmaster', text: "Toi ? Tu n'es qu'un kai'Sharum. Il y a des hommes plus anciens—", emotion: 'angry' },
        { speaker: 'jardir_young', text: "Des hommes plus anciens qui se terrent dans les couloirs arrière. Le Maze n'a pas besoin d'ancienneté. Il a besoin de courage.", emotion: 'determined' },
      ],
      nextNodeId: 'j2_intro_3',
    },
    {
      id: 'j2_intro_3', background: 'maze',
      lines: [
        { speaker: 'narrator', text: "Le drillmaster regarde Jardir. Il voit dans ses yeux la même flamme que chez les anciens Sharum Ka — ceux qui mouraient debout." },
        { speaker: 'drillmaster', text: "Alors prouve-le. Tiens le Maze trois nuits, et les hommes te suivront.", emotion: 'neutral' },
        { speaker: 'jardir_young', text: "Trois nuits ? Je tiendrai le Maze jusqu'à ce qu'il n'y ait plus un seul démon sous Krasia.", emotion: 'determined' },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'j2_day1', background: 'maze',
        lines: [
          { speaker: 'narrator', text: "La première nuit sous le commandement de Jardir. Les pertes ont été lourdes, mais le Maze tient." },
          { speaker: 'jardir_young', text: "Les wards de l'Aile Ouest sont faibles. Les corelings de pierre les fracturent à chaque assaut.", emotion: 'determined' },
          { speaker: 'drillmaster', text: "On peut envoyer des nie'Sharum renforcer les wards, ou les garder pour porter les blessés.", emotion: 'neutral' },
        ],
        choices: [
          {
            id: 'reinforce_west',
            label: "Envoyer les nie'Sharum renforcer l'Aile Ouest",
            hint: "+1 Ward de Pierre à l'Aile Ouest, -1 AP",
            effects: [
              { type: 'bonus_ward', wardType: 'stone', locationId: 'cutters_hollow' },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'evacuate_wounded',
            label: "Évacuer les blessés vers le Cœur du Maze",
            hint: "+2 Population au Cœur du Maze",
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
          { speaker: 'jardir_young', text: "J'ai repéré un passage que les corelings utilisent pour contourner nos wards. Si on le piège avec du feu...", emotion: 'determined' },
          { speaker: 'drillmaster', text: "C'est risqué. Tu devras poser les wards toi-même, au plus profond du Maze.", emotion: 'neutral' },
        ],
        choices: [
          {
            id: 'trap_passage',
            label: "Descendre piéger le passage avec des wards de feu",
            hint: "+1 Ward de Feu à la Fosse, -2 HP (embuscade de corelings)",
            effects: [
              { type: 'bonus_ward', wardType: 'fire', locationId: 'miln' },
              { type: 'hero_hp_change', delta: -2 },
            ],
          },
          {
            id: 'hold_position',
            label: "Consolider les positions actuelles",
            hint: "+3 Bois au Cœur du Maze, +2 Encre",
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
        { speaker: 'narrator', text: "Trois nuits. Le Maze tient. Et les guerriers Sharum regardent Jardir avec un respect nouveau." },
        { speaker: 'drillmaster', text: "J'ai combattu sous trois Sharum Ka. Aucun n'avait ton feu, gamin.", emotion: 'hopeful' },
        { speaker: 'jardir_young', text: "Ce n'est pas du feu. C'est la volonté d'Everam.", emotion: 'determined' },
      ],
      nextNodeId: 'j2_victory_2',
    },
    {
      id: 'j2_victory_2', background: 'krasia',
      lines: [
        { speaker: 'narrator', text: "Le lendemain, devant les guerriers assemblés, le Andrah proclame Ahmann Jardir Sharum Ka de Fort Krasia." },
        { speaker: 'narrator', text: "Le plus jeune commandant de l'histoire de Krasia. L'homme qui tiendra le Maze contre les forces de Nie." },
        { speaker: 'jardir_young', text: "Un jour, nous ne défendrons plus. Un jour, nous attaquerons.", emotion: 'determined' },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'j2_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Le Maze s'effondre. Les corelings submergent les guerriers, couloir après couloir." },
      { speaker: 'drillmaster', text: "Repli ! REPLI ! Scellez les tunnels !", emotion: 'scared' },
      { speaker: 'jardir_young', text: "Non... Je ne fuirai pas. Everam, donne-moi la force...", emotion: 'angry' },
      { speaker: 'narrator', text: "Mais Everam ne répond pas. Le Maze est perdu. Et avec lui, le rêve de Jardir." },
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
    cutters_hollow: { name: "Auberge de Riverbridge", startPop: 6, terrain: 'plains' as any },
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
        { speaker: 'narrator', text: "Riverbridge. Un bourg marchand au croisement des routes de Thesa. L'endroit idéal pour un jongleur — si on peut payer sa chambre." },
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
        { speaker: 'narrator', text: "Les corelings n'attendent que ça." },
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
        { speaker: 'narrator', text: "L'aubergiste lui laisse une chambre. En échange, Rojer aide à entretenir les wards — pierre, vent, et les rares runes de feu qu'un Messager de passage a gravées l'an dernier." },
        { speaker: 'rojer_young', text: "Quand je joue près des wards, j'ai l'impression que les symboles vibrent. Comme si la musique et les runes parlaient la même langue.", emotion: 'hopeful' },
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
            hint: "+1 Ward de Vent en réserve (trouvé dans les affaires d'Arrick)",
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
          { speaker: 'rojer_young', text: "C'est dans la musique. Il y a quelque chose dans les harmoniques... Les corelings les entendent différemment.", emotion: 'hopeful' },
          { speaker: 'narrator', text: "Si Rojer peut affiner cette technique, il pourrait ralentir les démons. Mais il faut pratiquer — et pratiquer, c'est s'exposer." },
        ],
        choices: [
          {
            id: 'practice_music',
            label: "S'exercer près des limites du ward",
            hint: "Force des démons -1 cette nuit (musique apaisante), mais -2 HP",
            effects: [
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'hero_hp_change', delta: -2 },
            ],
          },
          {
            id: 'stay_safe',
            label: "Rester à l'abri et renforcer les wards",
            hint: "+1 Ward de Feu à l'Auberge",
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
        { speaker: 'narrator', text: "L'aube se lève sur Riverbridge. Rojer est vivant. Seul, mais vivant." },
        { speaker: 'narrator', text: "Dans sa main, le luth d'Arrick. Les cordes vibrent encore du dernier accord qu'il a joué pour repousser un démon de vent." },
        { speaker: 'rojer_young', text: "Vous m'avez tout appris, maître. Même si vous ne le saviez pas.", emotion: 'sad' },
      ],
      nextNodeId: 'r2_victory_2',
    },
    {
      id: 'r2_victory_2', background: 'road',
      lines: [
        { speaker: 'narrator', text: "Les voyageurs sur la route parlent d'un jeune jongleur qui joue une musique étrange — une musique qui fait reculer les corelings." },
        { speaker: 'narrator', text: "Rojer Halfgrip. Le Jongleur. L'homme qui chante pour les démons." },
        { speaker: 'rojer_young', text: "La route est longue, Arrick. Mais je ne m'arrêterai pas.", emotion: 'determined' },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'r2_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Les wards cèdent. Les corelings déferlent sur Riverbridge." },
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
  title: 'Le Messager',
  subtitle: "La route est la seule liberté. Les wards sont la seule loi.",
  heroId: 'arlen_young',
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
        { speaker: 'narrator', text: "Fort Miln. La cité libre du Nord. Ici, Arlen a appris l'art des wards auprès des Wardeurs de la Guilde — les meilleurs de Thesa." },
        { speaker: 'narrator', text: "Il connaît maintenant des wards que personne à Tibbet's Brook n'a jamais vus. Wards de lumière. Wards de feu offensifs. Des armes, pas juste des boucliers." },
        { speaker: 'narrator', text: "Mais les murs de Miln l'étouffent. Arlen Bales n'est pas fait pour rester enfermé." },
      ],
      nextNodeId: 'a3_intro_2',
    },
    {
      id: 'a3_intro_2', background: 'messenger',
      lines: [
        { speaker: 'arlen_young', text: "J'ai réussi l'examen de la Guilde. Je suis officiellement Messager.", emotion: 'determined' },
        { speaker: 'ragen', text: "Le plus jeune Messager jamais inscrit. Ton premier contrat est un courrier pour Lakton.", emotion: 'neutral' },
        { speaker: 'arlen_young', text: "Quatre nuits en plein air. Quatre nuits face aux corelings.", emotion: 'determined' },
        { speaker: 'ragen', text: "Avec tes wards, tu as de bonnes chances. Mais Arlen — la route ne pardonne pas les erreurs.", emotion: 'neutral' },
      ],
      nextNodeId: 'a3_intro_3',
    },
    {
      id: 'a3_intro_3', background: 'road',
      lines: [
        { speaker: 'narrator', text: "Arlen selle son cheval et quitte Fort Miln au petit matin. Devant lui, les plaines immenses de Thesa." },
        { speaker: 'narrator', text: "Il emporte ses wards, son courage, et une question qui ne le quitte jamais : pourquoi l'humanité se cache-t-elle au lieu de se battre ?" },
        { speaker: 'arlen_young', text: "Un jour, je trouverai la réponse.", emotion: 'determined' },
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
          { speaker: 'refugee', text: "Les wards de notre village ont cédé. Nous n'avons plus rien. Plus de maisons, plus de réserves.", emotion: 'scared' },
          { speaker: 'arlen_young', text: "Je peux vous aider à tracer des wards de protection pour la nuit. Ou je peux filer vers le relais et préparer un abri sûr pour votre arrivée.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'help_refugees',
            label: "Aider les réfugiés à tracer des wards",
            hint: "+3 Pop au Relais de la Plaine, -1 AP",
            effects: [
              { type: 'modify_population', locationId: 'cutters_hollow', delta: 3 },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'ride_ahead',
            label: "Foncer vers le relais pour le préparer",
            hint: "+1 Ward de Lumière au Relais",
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
          { speaker: 'narrator', text: "La deuxième nuit, Arlen a vu quelque chose d'impossible. Un coreling de flamme a reculé devant un ward de feu — non pas repoussé, mais blessé." },
          { speaker: 'arlen_young', text: "Le feu peut les tuer. Les anciens wards ne faisaient pas que repousser — ils détruisaient.", emotion: 'hopeful' },
          { speaker: 'narrator', text: "Les wards offensifs. Une connaissance perdue depuis des siècles. Arlen sent qu'il touche à quelque chose d'immense." },
        ],
        choices: [
          {
            id: 'study_wards',
            label: "Passer la journée à étudier les wards offensifs",
            hint: "+1 Ward de Feu en réserve, -1 AP (étude intensive)",
            effects: [
              { type: 'bonus_reserve_ward', wardType: 'fire' },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'press_on',
            label: "Continuer la route vers Lakton",
            hint: "+1 Ward de Pierre à Lakton, +2 Encre à Lakton",
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
          { speaker: 'narrator', text: "Troisième nuit. Arlen approche de Lakton, mais un orage a détruit les wards du dernier relais." },
          { speaker: 'arlen_young', text: "Il faut tout retracer avant la tombée de la nuit. C'est ça ou dormir en plein air sans protection.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'retrace_all',
            label: "Retracer tous les wards du relais",
            hint: "+1 Ward de Vent et +1 Ward de Pierre à l'Avant-Poste, -2 HP (contre la montre)",
            effects: [
              { type: 'bonus_ward', wardType: 'wind', locationId: 'desert_spear' },
              { type: 'bonus_ward', wardType: 'stone', locationId: 'desert_spear' },
              { type: 'hero_hp_change', delta: -2 },
            ],
          },
          {
            id: 'minimal_wards',
            label: "Tracer un cercle minimal et dormir avec une arme",
            hint: "+4 Bois à l'Avant-Poste (récupération du relais détruit)",
            effects: [
              { type: 'add_resources', locationId: 'desert_spear', resource: 'wood', amount: 4 },
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
        { speaker: 'narrator', text: "Fort Lakton. Arlen livre son courrier, épuisé mais vivant. Quatre nuits sur la route, et pas une seule fois il n'a eu peur." },
        { speaker: 'narrator', text: "Les Laktoniens le regardent avec étonnement. Un Messager si jeune, qui voyage seul et arrive sans une égratignure." },
      ],
      nextNodeId: 'a3_victory_2',
    },
    {
      id: 'a3_victory_2', background: 'ward_book',
      lines: [
        { speaker: 'arlen_young', text: "Le feu peut les tuer. La lumière les affaiblit. Les anciens savaient se battre contre les démons.", emotion: 'determined' },
        { speaker: 'arlen_young', text: "Il doit exister d'autres wards. Des wards de combat. Quelque part dans les ruines du monde d'avant.", emotion: 'hopeful' },
        { speaker: 'narrator', text: "Arlen Bales, Messager. L'homme qui cherche les armes perdues de l'humanité." },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'a3_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Les wards cèdent dans la nuit. Sans abri, sur la route ouverte, les corelings convergent." },
      { speaker: 'arlen_young', text: "Non... Il y avait une erreur dans le tracé. UNE erreur...", emotion: 'angry' },
      { speaker: 'narrator', text: "La route ne pardonne pas. Le Messager Arlen Bales ne livrera jamais son courrier." },
      { speaker: 'narrator', text: "Chapitre 9 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 10: Leesha 3 — La Science des Wards
// Leesha étudie les wards avec les livres de Bruna
// ============================================================

export const CHAPTER_LEESHA_3: ChapterDefinition = {
  id: 10,
  title: 'La Science des Wards',
  subtitle: "Les wards ne sont pas de la magie. Ce sont des mathématiques.",
  heroId: 'leesha_young',
  nightCount: 3,
  startingNightNumber: 5,
  startingPresence: 'cutters_hollow',
  hiddenLocations: ['desert_spear'] as any,
  availableWards: ['stone', 'wind', 'fire', 'light'] as WardType[],
  fireCanKill: true,
  locationOverrides: {
    cutters_hollow: { name: "Cutter's Hollow", startPop: 10, terrain: 'forest' as any },
    miln: { name: 'Atelier de Leesha', startPop: 4, terrain: 'forest' as any },
    lakton: { name: 'Lisière de la Forêt', startPop: 5, terrain: 'forest' as any },
    desert_spear: { name: '', startPop: 0 },
  },
  preplacedWards: [
    { locationId: 'cutters_hollow', ward: 'fire' },
    { locationId: 'cutters_hollow', ward: 'stone' },
    { locationId: 'miln', ward: 'light' },
    { locationId: 'lakton', ward: 'wind' },
    { locationId: 'lakton', ward: 'fire' },
  ],

  introDialogue: [
    {
      id: 'l3_intro_1', background: 'bruna_hut',
      lines: [
        { speaker: 'narrator', text: "Cutter's Hollow, deux ans plus tard. Leesha est l'herboriste du village. Les gens viennent de loin pour ses soins et ses wards." },
        { speaker: 'narrator', text: "Mais Leesha veut plus que soigner. Dans les vieux livres de Bruna, elle a trouvé des notes sur les wards — des formules, des combinaisons oubliées." },
        { speaker: 'narrator', text: "Les wards ne sont pas de la magie, réalise-t-elle. Ce sont des lois. Des lois qu'on peut étudier, comprendre, améliorer." },
      ],
      nextNodeId: 'l3_intro_2',
    },
    {
      id: 'l3_intro_2', background: 'ward_book',
      lines: [
        { speaker: 'leesha_young', text: "Bruna, vos notes... Ce ward de lumière, là — il ne repousse pas juste les démons. Il les affaiblit. Il déchire leur essence.", emotion: 'hopeful' },
        { speaker: 'narrator', text: "Mais Bruna n'est plus là pour répondre. Et les corelings, eux, deviennent plus agressifs chaque nuit." },
        { speaker: 'leesha_young', text: "Il y a une logique dans tout ça. Si je comprends comment les wards interagissent entre eux, je pourrai créer des défenses bien plus puissantes.", emotion: 'determined' },
      ],
      nextNodeId: 'l3_intro_3',
    },
    {
      id: 'l3_intro_3', background: 'forest_village',
      lines: [
        { speaker: 'narrator', text: "Ce soir, les démons sont nerveux. Les bûcherons l'ont senti : les arbres craquent, le vent souffle du mauvais côté." },
        { speaker: 'leesha_young', text: "Quelque chose les excite. Il y aura plus de corelings que d'habitude cette nuit.", emotion: 'scared' },
        { speaker: 'narrator', text: "Leesha serre le journal de Bruna contre elle. Si ses théories sont justes, elle pourra sauver le village. Si elle se trompe..." },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'l3_day1', background: 'ward_book',
        lines: [
          { speaker: 'narrator', text: "Première nuit passée. Les wards de lumière ont fonctionné — les corelings de vent se sont dispersés quand Leesha a activé le cercle." },
          { speaker: 'leesha_young', text: "C'est confirmé. La lumière interfère avec leur capacité de vol. Si je combine lumière et feu...", emotion: 'hopeful' },
          { speaker: 'narrator', text: "Leesha hésite. Tester ses théories signifie modifier les wards existants. Si elle se trompe, le village sera exposé." },
        ],
        choices: [
          {
            id: 'experiment_wards',
            label: "Expérimenter une combinaison feu-lumière",
            hint: "+1 Ward de Lumière et +1 Ward de Feu à l'Atelier, -1 AP",
            effects: [
              { type: 'bonus_ward', wardType: 'light', locationId: 'miln' },
              { type: 'bonus_ward', wardType: 'fire', locationId: 'miln' },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'safe_approach',
            label: "Renforcer les wards classiques du village",
            hint: "+1 Ward de Pierre à Cutter's Hollow, +3 Encre",
            effects: [
              { type: 'bonus_ward', wardType: 'stone', locationId: 'cutters_hollow' },
              { type: 'add_resources', locationId: 'cutters_hollow', resource: 'ink', amount: 3 },
            ],
          },
        ],
      }],
    },
    {
      dayNumber: 2,
      dialogueNodes: [{
        id: 'l3_day2', background: 'bruna_hut',
        lines: [
          { speaker: 'narrator', text: "Leesha a passé la nuit à observer les démons depuis la fenêtre de son atelier, notant chaque réaction aux différents wards." },
          { speaker: 'leesha_young', text: "J'ai trouvé quelque chose dans les dernières pages du journal de Bruna. Elle parlait d'un « ward net » — un réseau de wards interconnectés.", emotion: 'hopeful' },
          { speaker: 'leesha_young', text: "Si les wards se renforcent mutuellement au lieu de fonctionner isolément, la protection serait exponentielle.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'build_ward_net',
            label: "Construire un réseau de wards entre les positions",
            hint: "+1 Ward de Vent à la Lisière, Force démons -1, mais -3 HP (nuit blanche)",
            effects: [
              { type: 'bonus_ward', wardType: 'wind', locationId: 'lakton' },
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'hero_hp_change', delta: -3 },
            ],
          },
          {
            id: 'rest_and_heal',
            label: "Se reposer et soigner les blessés",
            hint: "+3 HP héros, +2 Population à Cutter's Hollow",
            effects: [
              { type: 'hero_hp_change', delta: 3 },
              { type: 'modify_population', locationId: 'cutters_hollow', delta: 2 },
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
        { speaker: 'narrator', text: "L'aube se lève. Le village est intact. Et Leesha Paper tient dans ses mains quelque chose d'inestimable : la compréhension." },
        { speaker: 'leesha_young', text: "Les wards ne sont pas des symboles magiques. Ce sont des formules. Et les formules, on peut les améliorer.", emotion: 'determined' },
      ],
      nextNodeId: 'l3_victory_2',
    },
    {
      id: 'l3_victory_2', background: 'ward_book',
      lines: [
        { speaker: 'narrator', text: "Dans son atelier, Leesha ouvre un cahier neuf. Elle commence à écrire — ses propres formules, ses propres découvertes." },
        { speaker: 'narrator', text: "Bruna serait fière. L'élève a dépassé le maître." },
        { speaker: 'leesha_young', text: "Ce n'est que le début. Si je peux comprendre comment les wards tuent, je peux armer chaque village de Thesa.", emotion: 'hopeful' },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'l3_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Les wards expérimentaux de Leesha s'effondrent. Le réseau qu'elle a construit crée une réaction en chaîne — chaque ward qui cède en entraîne un autre." },
      { speaker: 'leesha_young', text: "Non... J'ai fait une erreur dans la séquence... Bruna, pardonnez-moi.", emotion: 'sad' },
      { speaker: 'narrator', text: "Cutter's Hollow brûle. La science des wards n'est pas un jeu, et l'erreur se paie en vies." },
      { speaker: 'narrator', text: "Chapitre 10 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 11: Arlen 4 — Anoch Sun
// Arlen découvre la cité perdue et les wards de combat
// ============================================================

export const CHAPTER_ARLEN_4: ChapterDefinition = {
  id: 11,
  title: 'Anoch Sun',
  subtitle: "La cité perdue. Les wards oubliés. Le pouvoir de se battre.",
  heroId: 'arlen_young',
  nightCount: 4,
  startingNightNumber: 7,
  startingPresence: 'miln',
  hiddenLocations: [] as any,
  availableWards: ['stone', 'wind', 'fire', 'light', 'bone'] as WardType[],
  fireCanKill: true,
  maxComboSize: 3,
  locationOverrides: {
    miln: { name: 'Portes d\'Anoch Sun', startPop: 3, terrain: 'desert' as any },
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
      id: 'a4_intro_1', background: 'ruins',
      lines: [
        { speaker: 'narrator', text: "Le désert de Krasie. Personne ne vient ici. Les sables avalent tout — hommes, bêtes, et les cités d'un monde oublié." },
        { speaker: 'narrator', text: "Arlen a passé des mois à chercher. Des cartes anciennes, des fragments de textes, des indices dispersés dans les bibliothèques de Miln et Lakton." },
        { speaker: 'narrator', text: "Et maintenant, devant lui, émergeant des dunes comme un squelette de pierre : Anoch Sun. La cité perdue." },
      ],
      nextNodeId: 'a4_intro_2',
    },
    {
      id: 'a4_intro_2', background: 'ruins',
      lines: [
        { speaker: 'arlen_young', text: "C'est réel. Anoch Sun. La plus grande cité de l'ancien monde.", emotion: 'hopeful' },
        { speaker: 'narrator', text: "Les murs sont couverts de wards — mais pas les wards défensifs que connaît Arlen. Ce sont des wards de combat. Des wards qui tuent." },
        { speaker: 'arlen_young', text: "Des wards d'os... Je n'ai jamais vu ça. Ils drainent la force vitale des démons.", emotion: 'hopeful' },
        { speaker: 'narrator', text: "Mais la nuit tombe sur le désert. Et dans les ruines d'Anoch Sun, les corelings sont anciens. Puissants. Furieux qu'on viole leur domaine." },
      ],
      nextNodeId: 'a4_intro_3',
    },
    {
      id: 'a4_intro_3', background: 'ruins',
      lines: [
        { speaker: 'arlen_young', text: "Quatre nuits. Il me faut quatre nuits pour tout étudier, tout recopier.", emotion: 'determined' },
        { speaker: 'narrator', text: "Quatre nuits seul dans une cité morte, entouré de démons millénaires. La folie — ou le courage — d'un homme qui refuse d'avoir peur." },
        { speaker: 'arlen_young', text: "Vous ne me chasserez pas. Ces wards appartiennent à l'humanité. Et je vais les lui rendre.", emotion: 'determined' },
      ],
    },
  ],

  dayEvents: [
    {
      dayNumber: 1,
      dialogueNodes: [{
        id: 'a4_day1', background: 'ruins',
        lines: [
          { speaker: 'narrator', text: "Première nuit à Anoch Sun. Les démons ici sont différents — plus gros, plus intelligents. Comme s'ils gardaient la cité." },
          { speaker: 'arlen_young', text: "La Salle des Fresques est intacte. Les murs sont couverts de wards de combat. Si je peux les recopier...", emotion: 'hopeful' },
          { speaker: 'narrator', text: "Mais les sables ont envahi les couloirs. Il faudra creuser pour atteindre la Bibliothèque Ensevelie." },
        ],
        choices: [
          {
            id: 'copy_frescoes',
            label: "Recopier les wards des fresques",
            hint: "+1 Ward d'Os en réserve, -1 AP (travail minutieux)",
            effects: [
              { type: 'bonus_reserve_ward', wardType: 'bone' },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'dig_library',
            label: "Creuser vers la Bibliothèque Ensevelie",
            hint: "+1 Ward de Lumière à la Bibliothèque, +2 Encre, -2 HP",
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
          { speaker: 'narrator', text: "Arlen a découvert le Tombeau du Conquérant — un sarcophage couvert de wards d'os. Le guerrier enterré là combattait les démons corps à corps." },
          { speaker: 'arlen_young', text: "Ces wards... Ils ne sont pas gravés dans la pierre. Ils sont gravés dans la peau.", emotion: 'hopeful' },
          { speaker: 'arlen_young', text: "Des tatouages de wards. L'ancien guerrier portait les wards sur son propre corps.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'study_tattoos',
            label: "Étudier les tatouages de wards en détail",
            hint: "+1 Ward d'Os au Tombeau, +1 Ward de Feu au Tombeau, -1 AP",
            effects: [
              { type: 'bonus_ward', wardType: 'bone', locationId: 'desert_spear' },
              { type: 'bonus_ward', wardType: 'fire', locationId: 'desert_spear' },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'fortify_entrance',
            label: "Sécuriser les Portes d'Anoch Sun",
            hint: "+1 Ward de Pierre et +1 Ward de Vent aux Portes",
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
          { speaker: 'narrator', text: "Troisième nuit. Les corelings sont de plus en plus nombreux, comme si toute la horde du désert convergeait vers Anoch Sun." },
          { speaker: 'arlen_young', text: "Ils sentent que je suis là. Ils sentent les wards. Ça les met en rage.", emotion: 'determined' },
          { speaker: 'narrator', text: "Arlen regarde les wards gravés dans le sarcophage. Une idée folle germe dans son esprit." },
          { speaker: 'arlen_young', text: "Si je grave les wards dans ma propre peau... Je deviendrais une arme vivante.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'tattoo_wards',
            label: "Commencer à se tatouer les wards de combat",
            hint: "Force démons -1 (aura de ward), mais -4 HP (douleur intense)",
            effects: [
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'hero_hp_change', delta: -4 },
              { type: 'set_flag', flag: 'tattooed_wards', value: true },
            ],
          },
          {
            id: 'just_copy',
            label: "Se contenter de recopier les wards sur parchemin",
            hint: "+1 Ward d'Os en réserve, +1 Ward de Lumière en réserve",
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
        { speaker: 'narrator', text: "L'aube se lève sur Anoch Sun. Les dunes se teintent d'or. Les corelings s'enfoncent dans le sable, vaincus une fois de plus." },
        { speaker: 'narrator', text: "Arlen est couvert de blessures. Ses bras portent des wards fraîchement gravés dans sa peau, encore rouges de sang." },
        { speaker: 'arlen_young', text: "Je les ai. Tous les wards. Pierre, vent, feu, lumière, os. Les wards de combat des anciens.", emotion: 'determined' },
      ],
      nextNodeId: 'a4_victory_2',
    },
    {
      id: 'a4_victory_2', background: 'ruins',
      lines: [
        { speaker: 'narrator', text: "Arlen quitte Anoch Sun avec un savoir que personne ne possède depuis trois cents ans. Le savoir de se battre." },
        { speaker: 'narrator', text: "Il n'est plus Arlen le Messager. Il n'est plus Arlen de Tibbet's Brook." },
        { speaker: 'narrator', text: "Les gens l'appelleront le Warded Man. L'Homme Wardé. Le premier guerrier de l'humanité depuis la chute." },
        { speaker: 'arlen_young', text: "Rentrons. Il est temps de montrer au monde qu'on peut se battre.", emotion: 'determined' },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'a4_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Les wards d'Anoch Sun sont trop anciens, trop fragiles. Un par un, ils s'effondrent sous l'assaut des corelings du désert." },
      { speaker: 'arlen_young', text: "Non ! J'étais si près... Les wards de combat... Tout ce savoir, perdu à nouveau...", emotion: 'angry' },
      { speaker: 'narrator', text: "Le sable engloutit Anoch Sun. Et avec elle, le dernier espoir de l'humanité de se relever." },
      { speaker: 'narrator', text: "Chapitre 11 — Échec" },
    ],
  }],
};

// ============================================================
// Chapter 12: FINAL — La Bataille de Cutter's Hollow
// Les héros convergent pour la bataille finale
// ============================================================

export const CHAPTER_FINAL: ChapterDefinition = {
  id: 12,
  title: "La Bataille de Cutter's Hollow",
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
    cutters_hollow: { name: "Cutter's Hollow — Centre", startPop: 12, terrain: 'forest' as any },
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
        { speaker: 'narrator', text: "Cutter's Hollow. Le village de bûcherons au cœur de la forêt. C'est ici que tout a commencé — et c'est ici que tout va se décider." },
        { speaker: 'narrator', text: "Des réfugiés affluent de toute la région. Les corelings sont plus agressifs que jamais, comme s'ils sentaient quelque chose changer." },
        { speaker: 'narrator', text: "Et au milieu du chaos, un homme arrive. Couvert de wards tatoués sur chaque centimètre de peau. Les yeux brûlants de détermination." },
      ],
      nextNodeId: 'f_intro_2',
    },
    {
      id: 'f_intro_2', background: 'forest_village',
      lines: [
        { speaker: 'arlen_young', text: "Je suis Arlen Bales. De Tibbet's Brook. Je suis revenu.", emotion: 'determined' },
        { speaker: 'leesha_young', text: "Ces wards sur votre peau... C'est impossible. Ce sont des wards offensifs — ils n'existent plus depuis—", emotion: 'hopeful' },
        { speaker: 'arlen_young', text: "Depuis la chute. Oui. Je les ai retrouvés. À Anoch Sun.", emotion: 'determined' },
        { speaker: 'rojer_young', text: "Et moi qui croyais être spécial avec mon luth... Enchanté. Rojer Halfgrip, Jongleur.", emotion: 'neutral' },
      ],
      nextNodeId: 'f_intro_jardir',
    },
    {
      id: 'f_intro_jardir', background: 'krasia',
      lines: [
        { speaker: 'narrator', text: "Un cor de guerre retentit à la lisière sud. Des guerriers en robes blanches émergent de la forêt, lances au poing." },
        { speaker: 'jardir_young', text: "Arlen! Par Everam, tu es vivant. J'ai mené mes Sharum à travers le désert en suivant les corelings.", emotion: 'determined' },
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
        { speaker: 'leesha_young', text: "Les corelings convergent vers le village. Plus que jamais. Comme une armée.", emotion: 'scared' },
        { speaker: 'arlen_young', text: "Alors on va se battre. Plus de wards passifs. Plus de peur. Cette nuit, c'est nous qui attaquons.", emotion: 'determined' },
        { speaker: 'rojer_young', text: "Ma musique peut les ralentir. Les troubler. Si je joue pendant que vous combattez...", emotion: 'determined' },
        { speaker: 'jardir_young', text: "Mes Sharum protégeront les flancs. Everam est avec nous.", emotion: 'determined' },
        { speaker: 'leesha_young', text: "Et mes réseaux de wards peuvent canaliser l'énergie. Ensemble, nous pouvons tenir.", emotion: 'determined' },
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
          { speaker: 'narrator', text: "Première nuit passée. Les corelings ont été repoussés — pour la première fois, par la force, pas par la peur." },
          { speaker: 'arlen_young', text: "Les wards de combat fonctionnent. Mais les villageois ne savent pas se battre. Si les wards cèdent, ils paniquent.", emotion: 'determined' },
          { speaker: 'leesha_young', text: "Je peux former les femmes à tracer des wards de secours. Ou je continue mes recherches sur les combinaisons triples.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'train_villagers',
            label: "Former les villageois au tracé des wards",
            hint: "+2 Pop à chaque position, -1 AP",
            effects: [
              { type: 'modify_population', locationId: 'cutters_hollow', delta: 2 },
              { type: 'modify_population', locationId: 'miln', delta: 2 },
              { type: 'hero_ap_change', delta: -1 },
            ],
          },
          {
            id: 'research_combos',
            label: "Rechercher les combinaisons de wards triples",
            hint: "+1 Ward d'Os en réserve, +1 Ward de Lumière en réserve",
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
          { speaker: 'refugee', text: "Notre village a été rasé. Les corelings... ils étaient organisés. Comme s'ils avaient un chef.", emotion: 'scared' },
          { speaker: 'arlen_young', text: "Un chef coreling. Un démon ancien. C'est lui qui dirige l'assaut contre Cutter's Hollow.", emotion: 'angry' },
          { speaker: 'rojer_young', text: "Je peux aller à la lisière sud jouer pour les ralentir. Ma musique les perturbe. Mais je serai exposé.", emotion: 'determined' },
        ],
        choices: [
          {
            id: 'send_rojer',
            label: "Envoyer Rojer jouer à la Lisière Sud",
            hint: "Force démons -1, +1 Ward de Vent à la Lisière, mais -2 HP",
            effects: [
              { type: 'demon_strength_bonus', bonus: -1 },
              { type: 'bonus_ward', wardType: 'wind', locationId: 'desert_spear' },
              { type: 'hero_hp_change', delta: -2 },
            ],
          },
          {
            id: 'shelter_refugees',
            label: "Accueillir les réfugiés et renforcer le centre",
            hint: "+3 Pop au Centre, +1 Ward de Feu au Centre",
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
            hint: "+1 Ward d'Os et +1 Ward de Lumière au Centre",
            effects: [
              { type: 'bonus_ward', wardType: 'bone', locationId: 'cutters_hollow' },
              { type: 'bonus_ward', wardType: 'light', locationId: 'cutters_hollow' },
            ],
          },
          {
            id: 'spread_defense',
            label: "Répartir les wards sur toutes les positions",
            hint: "+1 Ward de Feu à la Barricade, +1 Ward de Pierre à la Scierie, +1 Ward d'Os à la Lisière",
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
          { speaker: 'narrator', text: "Dernière nuit. Le ciel est rouge sang. Les corelings grondent dans la forêt, plus nombreux que jamais." },
          { speaker: 'arlen_young', text: "Cette nuit, ils enverront tout. Le démon ancien viendra en personne. Je le sens.", emotion: 'determined' },
          { speaker: 'leesha_young', text: "J'ai préparé un onguent de ward concentré. On peut l'appliquer sur les défenses... ou sur toi, Arlen.", emotion: 'neutral' },
          { speaker: 'rojer_young', text: "Si on renforce Arlen, il pourra affronter le démon ancien. Mais le village sera plus vulnérable.", emotion: 'scared' },
        ],
        choices: [
          {
            id: 'empower_arlen',
            label: "Appliquer l'onguent sur Arlen — affronter le démon ancien",
            hint: "Force démons -2 (aura), mais -3 HP (douleur des wards activés)",
            effects: [
              { type: 'demon_strength_bonus', bonus: -2 },
              { type: 'hero_hp_change', delta: -3 },
              { type: 'set_flag', flag: 'faced_ancient', value: true },
            ],
          },
          {
            id: 'protect_village',
            label: "Renforcer les défenses du village",
            hint: "+1 Ward de chaque type au Centre",
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
        { speaker: 'narrator', text: "L'aube. La cinquième aube. Et Cutter's Hollow tient debout." },
        { speaker: 'narrator', text: "La forêt est silencieuse. Pour la première fois depuis des générations, les corelings n'ont pas gagné. Ils ont été battus." },
        { speaker: 'narrator', text: "Au centre du village, Arlen Bales se tient debout. Couvert de sang — le sien et celui des démons. Les wards sur sa peau brillent encore." },
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
        { speaker: 'narrator', text: "Autour d'eux, les villageois de Cutter's Hollow ramassent des armes wardées. Des bûcherons hier. Des guerriers aujourd'hui." },
        { speaker: 'narrator', text: "La nouvelle va se répandre. De village en village, de cité en cité. L'Homme Wardé a prouvé que les démons peuvent être vaincus." },
        { speaker: 'narrator', text: "L'humanité ne se cache plus derrière ses wards." },
        { speaker: 'narrator', text: "L'humanité se bat." },
        { speaker: 'narrator', text: "— Fin du Livre 1 : The Warded Man —" },
      ],
    },
  ],

  defeatDialogue: [{
    id: 'f_defeat', background: 'village_burning',
    lines: [
      { speaker: 'narrator', text: "Les wards cèdent. Cutter's Hollow s'embrase. Le démon ancien rugit de triomphe dans la nuit." },
      { speaker: 'arlen_young', text: "Non... C'est pas possible. Les wards... les wards devaient tenir !", emotion: 'angry' },
      { speaker: 'narrator', text: "L'espoir meurt avec le village. L'Homme Wardé a échoué. Et l'humanité reste prisonnière de sa peur, pour toujours." },
      { speaker: 'narrator', text: "Chapitre 12 — Échec" },
    ],
  }],
};

export const CHAPTERS: ChapterDefinition[] = [
  CHAPTER_1, CHAPTER_LEESHA, CHAPTER_JARDIR, CHAPTER_ROJER,
  CHAPTER_ARLEN_2, CHAPTER_LEESHA_2,
  CHAPTER_JARDIR_2, CHAPTER_ROJER_2, CHAPTER_ARLEN_3,
  CHAPTER_LEESHA_3, CHAPTER_ARLEN_4, CHAPTER_FINAL,
];
