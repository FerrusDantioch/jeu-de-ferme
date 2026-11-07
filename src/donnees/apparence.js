/**
 * apparence.js — les choix proposés pour personnaliser son personnage
 * (fenêtre 👤 « Mon personnage »).
 *
 * Vous pouvez ajouter des couleurs ou changer leurs noms librement :
 * une couleur s'écrit 0x suivi de 6 chiffres/lettres (comme sur un nuancier web).
 */

// Teintes de peau.
export const PEAUX = [
  { id: 'p1', nom: 'Très claire', couleur: 0xfbe1c8 },
  { id: 'p2', nom: 'Claire', couleur: 0xf5cfa8 },
  { id: 'p3', nom: 'Dorée', couleur: 0xe8b98a },
  { id: 'p4', nom: 'Mate', couleur: 0xcf9a6b },
  { id: 'p5', nom: 'Brune', couleur: 0xa8714a },
  { id: 'p6', nom: 'Foncée', couleur: 0x7a4f33 },
]

// Couleurs des cheveux.
export const CHEVEUX = [
  { id: 'chatain', nom: 'Châtain', couleur: 0x7a4b2a },
  { id: 'brun', nom: 'Brun', couleur: 0x4a3426 },
  { id: 'noir', nom: 'Noir', couleur: 0x2b2522 },
  { id: 'blond', nom: 'Blond', couleur: 0xe6c36a },
  { id: 'roux', nom: 'Roux', couleur: 0xc8642e },
  { id: 'gris', nom: 'Gris argenté', couleur: 0xd8d4cc },
  { id: 'rose', nom: 'Rose', couleur: 0xf0a3c4 },
  { id: 'bleu', nom: 'Bleu', couleur: 0x7fa7d6 },
]

// Coiffures (le dessin de chacune est dans src/modeles/personnage.js).
export const COIFFURES = [
  { id: 'court', nom: 'Courte' },
  { id: 'long', nom: 'Longue' },
  { id: 'queue', nom: 'Queue-de-cheval' },
  { id: 'couettes', nom: 'Couettes' },
  { id: 'chignon', nom: 'Chignon' },
  { id: 'boucles', nom: 'Bouclée' },
]

// Tenues.
export const TENUES = [
  { id: 'salopette', nom: 'Salopette' },
  { id: 'robe', nom: 'Robe' },
  { id: 'pantalon', nom: 'Chemise et pantalon' },
  { id: 'jardinier', nom: 'Tablier de jardin' },
]

// Couleurs des vêtements (et des chapeaux).
export const COULEURS_TENUE = [
  { id: 'corail', nom: 'Corail', couleur: 0xf28b82 },
  { id: 'rose', nom: 'Rose', couleur: 0xf4a7c8 },
  { id: 'lilas', nom: 'Lilas', couleur: 0xc7a6e0 },
  { id: 'bleu', nom: 'Bleu ciel', couleur: 0x6fa8dc },
  { id: 'marine', nom: 'Bleu nuit', couleur: 0x4a5f8a },
  { id: 'vert', nom: 'Vert tendre', couleur: 0x8cc98a },
  { id: 'sapin', nom: 'Vert sapin', couleur: 0x3f7f5f },
  { id: 'jaune', nom: 'Jaune', couleur: 0xf5d76e },
  { id: 'orange', nom: 'Orange', couleur: 0xf0a35e },
  { id: 'brun', nom: 'Brun', couleur: 0x8a6a4a },
  { id: 'creme', nom: 'Crème', couleur: 0xfbefd5 },
  { id: 'gris', nom: 'Gris', couleur: 0x9aa3a8 },
]

// Chapeaux et accessoires de tête.
export const CHAPEAUX = [
  { id: 'paille', nom: 'Chapeau de paille' },
  { id: 'casquette', nom: 'Casquette' },
  { id: 'foulard', nom: 'Foulard' },
  { id: 'fleur', nom: 'Fleur' },
  { id: 'aucun', nom: 'Rien' },
]

// L'apparence au tout début du jeu (on peut la changer à tout moment).
export const APPARENCE_DE_DEPART = {
  peau: 'p2',
  cheveux: 'chatain',
  coiffure: 'court',
  tenue: 'salopette',
  haut: 'corail',
  bas: 'bleu',
  chapeau: 'paille',
  couleurChapeau: 'corail',
}

// Longueur maximale du prénom.
export const LONGUEUR_PRENOM = 14
