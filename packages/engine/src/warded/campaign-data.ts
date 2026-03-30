// ============================================================
// Campaign Data — Chapter 1: Le Garçon de Tibbet's Brook
// ============================================================

import type { ChapterDefinition } from './campaign-types';

export const CHAPTER_1: ChapterDefinition = {
  id: 1,
  title: "Le Garçon de Tibbet's Brook",
  subtitle: "Arlen découvre les wards et affronte sa première nuit.",
  heroId: 'arlen',
  nightCount: 3,
  startingNightNumber: 1,
  startingPresence: 'cutters_hollow',
  locationOverrides: {
    cutters_hollow: { name: "Tibbet's Brook", startPop: 6 },
    desert_spear: { name: 'Ferme des Bales', startPop: 4 },
    lakton: { name: "Cabane de l'Herboriste", startPop: 3 },
    miln: { name: 'Place du Village', startPop: 5 },
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
      lines: [
        { speaker: 'narrator', text: "292 AR. Le soleil descend sur Tibbet's Brook, un petit village perdu dans les plaines du nord." },
        { speaker: 'narrator', text: "Depuis des générations, les hommes vivent dans la terreur de la nuit. Car quand l'obscurité tombe, les démons surgissent de la terre." },
        { speaker: 'narrator', text: "Seuls les wards — d'anciens symboles magiques gravés dans la pierre et le bois — tiennent les corelings à distance." },
      ],
      nextNodeId: 'intro_2',
    },
    {
      id: 'intro_2',
      lines: [
        { speaker: 'jeph', text: "Arlen ! Viens m'aider avec les wards. Le soleil se couche dans deux heures.", emotion: 'scared' },
        { speaker: 'arlen', text: "J'arrive, père. Mais pourquoi est-ce qu'on ne les combat pas, au lieu de se cacher ?", emotion: 'determined' },
        { speaker: 'jeph', text: "Ne dis pas de bêtises, garçon. Les wards nous protègent. C'est tout ce qu'on a.", emotion: 'angry' },
        { speaker: 'arlen', text: "...", emotion: 'angry' },
      ],
      nextNodeId: 'intro_3',
    },
    {
      id: 'intro_3',
      lines: [
        { speaker: 'narrator', text: "Un cavalier approche du village. C'est Ragen, un Messager — l'un des rares hommes assez courageux pour voyager entre les villes." },
        { speaker: 'ragen', text: "Bonnes gens de Tibbet's Brook ! J'apporte des nouvelles de Fort Miln.", emotion: 'neutral' },
        { speaker: 'ragen', text: "Les corelings sont plus agités que d'habitude. Cette nuit sera dangereuse. Préparez-vous.", emotion: 'determined' },
        { speaker: 'silvy', text: "Créateur tout-puissant... Arlen, rentre à la maison.", emotion: 'scared' },
        { speaker: 'arlen', text: "Non. Je veux aider.", emotion: 'determined' },
      ],
    },
  ],

  // =====================
  // DAY EVENTS
  // =====================
  dayEvents: [
    // --- JOUR 1 : L'avertissement du Messager ---
    {
      dayNumber: 1,
      dialogueNodes: [
        {
          id: 'day1_1',
          lines: [
            { speaker: 'ragen', text: "Petit, tu sais tracer des wards ?", emotion: 'neutral' },
            { speaker: 'arlen', text: "Mon père m'a appris les bases. Feu et pierre.", emotion: 'determined' },
            { speaker: 'ragen', text: "Bien. J'ai besoin d'aide. Soit tu m'aides à renforcer les wards de la place du village, soit tu restes à la ferme pour stocker du bois.", emotion: 'neutral' },
          ],
          choices: [
            {
              id: 'help_ragen',
              label: "Aider Ragen à la place du village",
              hint: "+1 Ward de Vent à la Place, mais -1 AP aujourd'hui",
              effects: [
                { type: 'bonus_ward', wardType: 'wind', locationId: 'miln' },
                { type: 'hero_ap_change', delta: -1 },
              ],
            },
            {
              id: 'stay_farm',
              label: "Rester à la ferme des Bales",
              hint: "+3 Bois à la Ferme des Bales",
              effects: [
                { type: 'add_resources', locationId: 'desert_spear', resource: 'wood', amount: 3 },
              ],
            },
          ],
        },
      ],
    },

    // --- JOUR 2 : Les réfugiés ---
    {
      dayNumber: 2,
      dialogueNodes: [
        {
          id: 'day2_1',
          lines: [
            { speaker: 'narrator', text: "À l'aube du deuxième jour, une famille hagarde arrive à Tibbet's Brook. Leurs vêtements sont déchirés, leurs yeux hantés." },
            { speaker: 'refugee', text: "Par pitié... Notre ferme a été détruite cette nuit. Les wards ont cédé. Il ne reste rien.", emotion: 'scared' },
            { speaker: 'silvy', text: "Pauvres gens... Mais on a à peine assez de nourriture pour nous.", emotion: 'sad' },
            { speaker: 'arlen', text: "On ne peut pas les laisser dehors. Pas la nuit.", emotion: 'determined' },
            { speaker: 'jeph', text: "C'est ta décision maintenant, fils ? Tu te prends pour un homme ?", emotion: 'angry' },
          ],
          choices: [
            {
              id: 'accept_refugees',
              label: "Accueillir les réfugiés",
              hint: "+2 Population à Tibbet's Brook, mais +1 démon par vague cette nuit",
              effects: [
                { type: 'modify_population', locationId: 'cutters_hollow', delta: 2 },
                { type: 'extra_demons', count: 1 },
                { type: 'set_flag', flag: 'refugees_accepted', value: true },
              ],
            },
            {
              id: 'refuse_refugees',
              label: "Les refuser — on ne peut pas se le permettre",
              hint: "+1 Nourriture partout, pas de démons supplémentaires",
              effects: [
                { type: 'add_resources', locationId: 'cutters_hollow', resource: 'food', amount: 1 },
                { type: 'add_resources', locationId: 'desert_spear', resource: 'food', amount: 1 },
                { type: 'add_resources', locationId: 'lakton', resource: 'food', amount: 1 },
                { type: 'add_resources', locationId: 'miln', resource: 'food', amount: 1 },
                { type: 'set_flag', flag: 'refugees_accepted', value: false },
              ],
            },
          ],
        },
      ],
    },

    // --- JOUR 3 : La découverte ---
    {
      dayNumber: 3,
      dialogueNodes: [
        {
          id: 'day3_1',
          lines: [
            { speaker: 'narrator', text: "Arlen fouille les affaires de sa mère et trouve un vieux carnet poussiéreux. Les pages sont couvertes de symboles de wards qu'il n'a jamais vus." },
            { speaker: 'arlen', text: "Ce sont... des wards de combat ? Je croyais qu'on ne pouvait que se défendre !", emotion: 'hopeful' },
            { speaker: 'silvy', text: "Arlen ! Repose ça ! Ces wards sont maudits. Ton grand-père est mort en essayant de les utiliser.", emotion: 'scared' },
            { speaker: 'arlen', text: "Ou peut-être qu'il est mort parce que personne ne l'a aidé.", emotion: 'determined' },
          ],
          choices: [
            {
              id: 'try_combat_wards',
              label: "Tenter les wards de combat",
              hint: "+1 Ward de Lumière en réserve, mais -2 HP (blessure en s'entraînant)",
              effects: [
                { type: 'bonus_reserve_ward', wardType: 'light' },
                { type: 'hero_hp_change', delta: -2 },
                { type: 'set_flag', flag: 'combat_wards_learned', value: true },
              ],
            },
            {
              id: 'play_safe',
              label: "Écouter sa mère — rester prudent",
              hint: "+1 Ward de Feu en réserve (fiable)",
              effects: [
                { type: 'bonus_reserve_ward', wardType: 'fire' },
                { type: 'set_flag', flag: 'combat_wards_learned', value: false },
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
      lines: [
        { speaker: 'narrator', text: "L'aube se lève sur Tibbet's Brook. Les corelings se dissolvent dans la lumière du matin, laissant derrière eux des traces noirâtres sur le sol." },
        { speaker: 'narrator', text: "Le village a tenu. Trois nuits. Trois nuits de terreur, de feu et de wards qui craquent sous la pression." },
        { speaker: 'arlen', text: "On a survécu...", emotion: 'hopeful' },
        { speaker: 'jeph', text: "Oui. Et on survivra la prochaine nuit. Et celle d'après. C'est tout ce qu'on peut faire.", emotion: 'sad' },
        { speaker: 'arlen', text: "Non. Ce n'est pas tout.", emotion: 'determined' },
      ],
      nextNodeId: 'victory_2',
    },
    {
      id: 'victory_2',
      lines: [
        { speaker: 'ragen', text: "Tu as du courage, petit. Plus que la plupart des hommes que je connais.", emotion: 'neutral' },
        { speaker: 'arlen', text: "Emmenez-moi à Fort Miln. Je veux apprendre. Les vrais wards. Les wards de combat.", emotion: 'determined' },
        { speaker: 'ragen', text: "La route est dangereuse. Tu pourrais mourir.", emotion: 'neutral' },
        { speaker: 'arlen', text: "Rester ici est pire que mourir.", emotion: 'determined' },
        { speaker: 'narrator', text: "Le lendemain matin, Arlen Bales quitte Tibbet's Brook. Il ne se retournera pas." },
        { speaker: 'narrator', text: "Chapitre 1 — Terminé" },
      ],
    },
  ],

  // =====================
  // DEFEAT
  // =====================
  defeatDialogue: [
    {
      id: 'defeat_1',
      lines: [
        { speaker: 'narrator', text: "Les wards cèdent. Les corelings envahissent Tibbet's Brook dans un torrent de griffes et de flammes." },
        { speaker: 'silvy', text: "ARLEN ! COURS !", emotion: 'scared' },
        { speaker: 'narrator', text: "Arlen court. Il court sans se retourner, les hurlements derrière lui se mêlant au rugissement des démons de flamme." },
        { speaker: 'narrator', text: "Il ne pleure pas. Pas encore. Les larmes viendront plus tard, sur la route, seul dans l'obscurité." },
        { speaker: 'arlen', text: "Plus jamais. Plus jamais je ne serai aussi faible.", emotion: 'angry' },
        { speaker: 'narrator', text: "Chapitre 1 — Échec. Recommencer pour changer le destin d'Arlen." },
      ],
    },
  ],
};

export const CHAPTERS: ChapterDefinition[] = [CHAPTER_1];
