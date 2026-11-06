/**
 * ferme.js — le PLAN de la ferme (données seulement, pas de code compliqué).
 *
 * Repères : le terrain va de -20 à +20 mètres dans les deux sens.
 *  - x : de gauche (-20) à droite (+20) ;
 *  - z : du fond de l'écran (-20) vers le bas de l'écran, côté caméra (+20).
 *
 * Pour déplacer un bâtiment, il suffit de changer ses nombres x et z ici.
 */

// Où apparaît le personnage au tout premier lancement.
export const POINT_DE_DEPART = { x: -3, z: -5 }

/**
 * Les bâtiments. La porte est toujours au milieu de la façade avant (côté caméra).
 *  - modele : quelle forme dessiner (voir src/modeles/batiments.js) ;
 *  - interieur : le lieu où l'on arrive en entrant (null = on ne peut pas entrer) ;
 *  - texte : ce que dit le personnage si on touche un bâtiment fermé.
 */
export const BATIMENTS = [
  {
    id: 'maison',
    titre: '🏠 La maison',
    modele: 'maison',
    x: -6, z: -11, largeur: 6, profondeur: 5,
    interieur: 'maison',
  },
  {
    id: 'etable',
    titre: '🐄 L’étable',
    modele: 'etable',
    x: 7, z: -11, largeur: 7, profondeur: 6,
    interieur: 'etable',
  },
  {
    id: 'boutique',
    titre: '🧺 La boutique',
    modele: 'boutique',
    x: -11, z: 3, largeur: 5, profondeur: 4.5,
    interieur: 'boutique',
  },
  {
    id: 'chaumiere-rose',
    modele: 'chaumiere',
    couleurToit: 'toitBleu',
    x: 10, z: 12, largeur: 4, profondeur: 4,
    interieur: null,
    texte: 'C’est la maison de Mamie Rose 🌷',
  },
  {
    id: 'chaumiere-leon',
    modele: 'chaumiere',
    couleurToit: 'paille',
    x: -9, z: 13, largeur: 4, profondeur: 4,
    interieur: null,
    texte: 'C’est la maison de Léon et Théo 🏡',
  },
]

// Les chemins de terre (rectangles : centre x, centre z, largeur, profondeur).
export const CHEMINS = [
  [0, 6.25, 2.2, 26.5], // la grande allée, du bas jusqu'aux bâtiments
  [0.5, -6.6, 15, 2], // entre la maison et l'étable
  [-6, 6.6, 12, 2], // vers la boutique
  [4.25, -1, 8.5, 1.8], // vers l'enclos
  [0.5, 16.2, 21, 2], // la petite route du village
  [10, 14.8, 1.2, 1.2], // devant chez Mamie Rose
]

// L'enclos des animaux (vide pour l'instant : les animaux arrivent au jalon 3).
export const ENCLOS = { x: 12, z: -1, largeur: 7, profondeur: 6, ouverture: 1.8 }

// Le carré de potager (vide pour l'instant : les cultures arrivent au jalon 3).
export const POTAGER = { x: -4.5, z: -2, largeur: 5, profondeur: 3.5 }

// Autres décors.
export const ETANG = { x: -15, z: -3, rayon: 2.2 }
export const PUITS = { x: 4, z: 4 }
export const BANCS = [{ x: -4, z: 8, angle: 0 }]
export const PANNEAUX = [
  { x: -1.8, z: -0.6, texte: 'Potager', largeur: 1.3 },
  { x: 2.2, z: 18.2, texte: 'Bienvenue !', largeur: 1.6 },
]

// Arbres : [x, z].
export const ARBRES = [
  [-17, -16.5], [-12.5, -17.5], [-1.5, -15.5], [2.5, -17], [13, -17], [17.5, -12.5],
  [-17.5, -10], [-17, 8], [-16, 17], [17, 7], [17.5, 17], [4, 10], [-5, 12.5],
  [17.5, -4.5], [-0.5, -12.5], [14.5, 5.5], [6.5, 12.5], [-13.5, 9], [-16.5, -7],
]

// Rochers : [x, z, taille].
export const ROCHERS = [
  [-16, 3, 0.6], [16, 11, 0.7], [-7, 10, 0.5], [6, -15, 0.7], [3, 13, 0.4], [-13, -13, 0.6],
]

// Nombre de fleurs semées au hasard dans l'herbe (pur décor).
export const NOMBRE_DE_FLEURS = 110
