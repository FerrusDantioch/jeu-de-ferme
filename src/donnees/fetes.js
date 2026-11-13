/**
 * fetes.js — le calendrier des fêtes.
 *
 * Pour chaque fête :
 *  - nom, icone, message : ce qui s'affiche ;
 *  - quand : la période de la fête. Deux façons de l'écrire :
 *      { type: 'fixe', debut: [mois, jour], fin: [mois, jour] }   (ex. : Noël)
 *      { type: 'paques', debut: décalage, fin: décalage }          (en jours autour du dimanche de Pâques,
 *                                                                    calculé automatiquement chaque année)
 *    Une période peut passer d'une année à l'autre (ex. : du 31 décembre au 1er janvier).
 *  - decor : les décorations de la ferme ('oeufs', 'sapin', 'citrouilles', 'coeurs', 'guirlandes') ;
 *  - couleurs : couleurs des guirlandes (si decor = 'guirlandes') ;
 *  - phrases : ce que disent les villageois pendant la fête ;
 *  - quete : (facultatif) une quête spéciale du jour pendant la fête.
 *
 * Pour ajouter une fête : copier un bloc { … }, le coller et changer les valeurs.
 */

export const FETES = [
  {
    id: 'nouvel-an',
    nom: 'Nouvel An',
    icone: '🎆',
    message: 'Bonne année ! Que cette année soit douce et pleine de belles récoltes.',
    quand: { type: 'fixe', debut: [12, 31], fin: [1, 2] },
    decor: 'guirlandes',
    couleurs: [0xffd166, 0xf49ac1, 0x8fb8e0, 0xb79ce0],
    phrases: ['Bonne année ! 🎆', 'Je te souhaite plein de bonheur cette année !'],
  },
  {
    id: 'chandeleur',
    nom: 'Chandeleur',
    icone: '🥞',
    message: 'C’est la Chandeleur : jour des crêpes !',
    quand: { type: 'fixe', debut: [2, 2], fin: [2, 2] },
    decor: 'guirlandes',
    couleurs: [0xffd166, 0xf29b45, 0xfdf8ee],
    phrases: ['Tu as fait des crêpes ? 🥞', 'Il me faut des œufs et du lait pour mes crêpes !'],
  },
  {
    id: 'saint-valentin',
    nom: 'Saint-Valentin',
    icone: '💕',
    message: 'Joyeuse Saint-Valentin ! Un petit câlin aux animaux ?',
    quand: { type: 'fixe', debut: [2, 14], fin: [2, 14] },
    decor: 'coeurs',
    phrases: ['Joyeuse Saint-Valentin ! 💕', 'Les poules ont l’air amoureuses aujourd’hui.'],
    quete: { type: 'caresser', objectif: 8, pieces: 25, experience: 15 },
  },
  {
    id: 'paques',
    nom: 'Pâques',
    icone: '🐣',
    message: 'Joyeuses Pâques ! Des œufs colorés sont cachés dans la ferme… À toi de les trouver !',
    // Du samedi au lundi de Pâques.
    quand: { type: 'paques', debut: -1, fin: 1 },
    decor: 'oeufs',
    phrases: ['Joyeuses Pâques ! 🐣', 'J’ai vu un œuf tout rose derrière un arbre…', 'Tu as trouvé tous les œufs ?'],
    quete: { type: 'oeufs', objectif: 8, pieces: 30, experience: 20 },
  },
  {
    id: 'fete-musique',
    nom: 'Fête de la musique',
    icone: '🎶',
    message: 'C’est la Fête de la musique ! Les oiseaux chantent plus fort que d’habitude.',
    quand: { type: 'fixe', debut: [6, 21], fin: [6, 21] },
    decor: 'guirlandes',
    couleurs: [0xf49ac1, 0xffd166, 0x9fcf9a, 0x8fb8e0],
    phrases: ['Tu entends la musique ? 🎶', 'Ce soir, je chante au village !'],
  },
  {
    id: 'quatorze-juillet',
    nom: 'Fête nationale',
    icone: '🎉',
    message: 'Bonne fête nationale ! Des guirlandes décorent la ferme.',
    quand: { type: 'fixe', debut: [7, 14], fin: [7, 14] },
    decor: 'guirlandes',
    couleurs: [0x4a6fd1, 0xffffff, 0xe0505a],
    phrases: ['Tu viens voir le feu d’artifice ce soir ?', 'Quelle belle fête ! 🎉'],
  },
  {
    id: 'halloween',
    nom: 'Halloween',
    icone: '🎃',
    message: 'Joyeux Halloween ! Des citrouilles souriantes sont apparues dans la ferme.',
    quand: { type: 'fixe', debut: [10, 25], fin: [10, 31] },
    decor: 'citrouilles',
    phrases: ['Des bonbons ou un sort ? 🍬', 'J’ai sculpté une citrouille qui sourit !', 'Bouh ! Hi hi, je t’ai fait peur ?'],
    quete: { type: 'recolter', objectif: 4, pieces: 25, experience: 15 },
  },
  {
    id: 'noel',
    nom: 'Noël',
    icone: '🎄',
    message: 'Joyeux Noël ! Un beau sapin brille devant la maison.',
    quand: { type: 'fixe', debut: [12, 15], fin: [12, 26] },
    decor: 'sapin',
    phrases: ['Joyeux Noël ! 🎄', 'J’ai hâte d’ouvrir mes cadeaux !', 'Il fait froid, mais le sapin est si beau !'],
    quete: { type: 'livrer', objectif: 2, pieces: 30, experience: 20 },
  },
]

// Chasse aux œufs de Pâques : récompense pour chaque œuf trouvé (une fois par jour).
export const RECOMPENSE_OEUF = { pieces: 5, experience: 2 }
