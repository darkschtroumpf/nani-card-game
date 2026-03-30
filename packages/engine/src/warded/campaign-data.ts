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
    cutters_hollow: { name: 'Maison des Bales', startPop: 6 },
    miln: { name: 'Place du Village', startPop: 5 },
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
          background: 'village_burning',
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

export const CHAPTERS: ChapterDefinition[] = [CHAPTER_1];
