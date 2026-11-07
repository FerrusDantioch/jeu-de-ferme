/**
 * pnj.js — les villageois (PNJ = « personnages non joueurs »).
 *
 * Pour chaque villageois :
 *  - lieu : où il vit ('exterieur' = dehors, ou l'intérieur d'un bâtiment) ;
 *  - apparence : couleurs et vêtements (voir src/modeles/personnage.js) ;
 *  - maison : la chaumière où il rentre de temps en temps (voir src/donnees/ferme.js) ;
 *  - promenade : les endroits où il aime aller se promener [x, z] ;
 *  - fixe : true = il reste à sa place (ex. : la marchande derrière son comptoir) ;
 *  - salutations : ce qu'il dit quand on passe près de lui
 *    ({nom} est remplacé par le prénom du joueur, s'il en a choisi un) ;
 *  - phrases : ce qu'il dit quand on le touche, ou de temps en temps tout seul ;
 *  - demandes : ce qu'il dit quand il a une commande pour nous (voir src/donnees/commandes.js) ;
 *  - marchande : true = toucher ce personnage ouvre la boutique.
 *
 * Vous pouvez changer les phrases librement (garder les guillemets ' ' autour).
 */

export const PNJ = [
  {
    id: 'rose',
    nom: 'Mamie Rose',
    lieu: 'exterieur',
    apparence: {
      cheveux: 0xe8e4dc, haut: 0xc7a6e0, bas: 0xb08fd0, salopette: false,
      tablier: 0xffffff, coiffure: 'chignon', chapeau: 'aucun',
    },
    vitesse: 1.6,
    maison: 'chaumiere-rose',
    depart: [8, 9],
    promenade: [[4, 5.6], [-11.4, -2.2], [-4.5, 0.5], [-4, 9.2], [13, 7], [2, 2]],
    salutations: ['Bonjour {nom} ! 🌷', 'Coucou {nom}, quel plaisir de te voir !'],
    phrases: [
      'Quelle belle journée !',
      'Mes rosiers sont magnifiques cette année 🌹',
      'Prends ton temps, rien ne presse.',
      'J’ai fait une tarte aux pommes ce matin 🥧',
      'J’aime bien m’asseoir près de l’étang.',
      'Il fait bon, aujourd’hui.',
    ],
    demandes: [
      'J’aimerais préparer un bon repas… Tu pourrais m’apporter ceci ?',
      'Mes petits-enfants viennent dimanche ! Tu m’aiderais ?',
    ],
  },
  {
    id: 'leon',
    nom: 'Léon',
    lieu: 'exterieur',
    apparence: {
      peau: 0xe0b48e, cheveux: 0x4a3426, haut: 0x7fbf7f, bas: 0x8a6a4a, salopette: false,
      chapeau: 'casquette', couleurChapeau: 0x3f7f5f,
    },
    vitesse: 2.0,
    maison: 'chaumiere-leon',
    depart: [-3, 3],
    promenade: [[7.5, -1], [7, -5.8], [0.5, 12], [-8, 8], [11.5, -6], [-3, 3]],
    salutations: ['Salut {nom} ! 👋', 'Bien le bonjour !'],
    phrases: [
      'Ton étable est vraiment jolie.',
      'Il paraît qu’il fera beau demain ☀️',
      'Bientôt des poules dans ton enclos ?',
      'Une bonne récolte, ça se fête !',
      'Je vais faire un tour jusqu’au puits.',
    ],
    demandes: [
      'Dis, j’aurais besoin de quelques bricoles de ta ferme.',
      'Je prépare une surprise pour Théo… Tu peux m’aider ?',
    ],
  },
  {
    id: 'theo',
    nom: 'Théo',
    lieu: 'exterieur',
    apparence: {
      peau: 0xe0b48e, cheveux: 0x4a3426, haut: 0xffd166, bas: 0x6fa8dc,
      chapeau: 'casquette', couleurChapeau: 0xe06666, taille: 0.8,
    },
    vitesse: 2.6,
    maison: 'chaumiere-leon',
    depart: [2, 9],
    promenade: [[2, 9], [-1.5, 14], [6, 2], [-9, 9], [12, 8.5], [3, -3]],
    salutations: ['Coucou {nom} ! 😄', 'Hé, salut !'],
    phrases: [
      'On joue à chat ?',
      'J’ai vu un papillon ! 🦋',
      'Papa dit que je cours trop vite.',
      'Tu auras des moutons ? J’adore les moutons ! 🐑',
      'Le puits fait un drôle d’écho !',
    ],
    demandes: [
      'J’ai une liste ! C’est pour un goûter géant !',
      'Tu peux m’apporter ça ? S’il te plaîîît ?',
    ],
  },
  {
    id: 'lila',
    nom: 'Lila',
    lieu: 'boutique',
    apparence: {
      peau: 0xf2c9a0, cheveux: 0xc0603a, haut: 0xffffff, bas: 0x6d8fc9, salopette: false,
      tablier: 0x7cc47a, coiffure: 'chignon', chapeau: 'aucun',
    },
    fixe: true,
    marchande: true,
    depart: [0, -2.6],
    salutations: ['Bonjour {nom}, bienvenue ! 🧺'],
    phrases: [
      'Bienvenue dans ma boutique !',
      'J’ai de belles graines toutes fraîches 🌱',
      'Prends ton temps pour regarder.',
      'Il fait bon ici, n’est-ce pas ?',
    ],
  },
]
