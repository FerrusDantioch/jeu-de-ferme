/**
 * vergers.js — les arbres fruitiers.
 *
 * Chaque arbre fait pousser ses fruits tout seul, en vraies minutes (même jeu fermé),
 * jusqu'à un maximum. On les cueille en secouant l'arbre. Un arbre ne s'abîme jamais :
 * s'il est plein, il attend simplement qu'on passe.
 */

// Les fruits : nom, icône, couleur des fruits sur l'arbre, minutes pour un nouveau fruit.
export const FRUITS = {
  pomme: { nom: 'Pomme', nomPluriel: 'pommes', icone: '🍎', couleur: 0xe8554e, minutes: 6, arbre: 'Pommier' },
  poire: { nom: 'Poire', nomPluriel: 'poires', icone: '🍐', couleur: 0xc9d65a, minutes: 8, arbre: 'Poirier' },
  cerise: { nom: 'Cerise', nomPluriel: 'cerises', icone: '🍒', couleur: 0xc0283a, minutes: 10, arbre: 'Cerisier' },
  peche: { nom: 'Pêche', nomPluriel: 'pêches', icone: '🍑', couleur: 0xf5a46b, minutes: 12, arbre: 'Pêcher' },
}

// Nombre maximum de fruits qui attendent sur un arbre.
export const FRUITS_MAXIMUM = 4

// Le verger : où se trouve chaque arbre (à droite de l'étable).
export const ARBRES_FRUITIERS = [
  { id: 'pommier', fruit: 'pomme', x: 13.2, z: -7.4 },
  { id: 'poirier', fruit: 'poire', x: 16.4, z: -7.4 },
  { id: 'cerisier', fruit: 'cerise', x: 13.2, z: -10.6 },
  { id: 'pecher', fruit: 'peche', x: 16.4, z: -10.6 },
]
