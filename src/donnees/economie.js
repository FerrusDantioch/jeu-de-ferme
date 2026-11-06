/**
 * economie.js — les prix, l'expérience et les niveaux.
 *
 * Tout est réglable ici : prix d'achat des graines, prix de vente des récoltes,
 * expérience gagnée, niveau nécessaire pour débloquer une graine ou un animal.
 */

// Pièces au début du jeu.
export const PIECES_DE_DEPART = 30

// Graines à acheter chez Lila : prix (en pièces) et niveau nécessaire.
export const GRAINES_EN_VENTE = {
  salade: { prix: 2, niveau: 1 },
  carotte: { prix: 3, niveau: 1 },
  fraise: { prix: 5, niveau: 2 },
  tomate: { prix: 6, niveau: 2 },
  mais: { prix: 8, niveau: 3 },
  citrouille: { prix: 12, niveau: 4 },
}

// Animaux à adopter chez Lila : prix, niveau nécessaire, nombre maximum à la ferme.
// (Les poules et moutons vont dans l'enclos, les vaches dans l'étable : 3 stalles.)
export const ANIMAUX_EN_VENTE = {
  poule: { prix: 40, niveau: 2, maximum: 6 },
  mouton: { prix: 90, niveau: 3, maximum: 4 },
  vache: { prix: 150, niveau: 4, maximum: 3 },
}

// Noms donnés aux nouveaux animaux adoptés (on prend le premier qui n'est pas déjà pris).
export const NOMS_ANIMAUX = {
  poule: ['Plume', 'Biscotte', 'Praline', 'Coquelicot', 'Mirabelle', 'Brioche'],
  mouton: ['Doudou', 'Coton', 'Guimauve', 'Pompon'],
  vache: ['Violette', 'Noisette', 'Clochette'],
}

// Prix de vente chez Lila (en pièces, pour une unité).
export const PRIX_DE_VENTE = {
  salade: 3,
  carotte: 3,
  fraise: 4,
  tomate: 7,
  mais: 15,
  citrouille: 40,
  oeuf: 5,
  lait: 9,
  laine: 14,
}

// Expérience (⭐) gagnée.
export const EXPERIENCE = {
  // Pour une récolte, selon la culture.
  recolte: { salade: 2, carotte: 3, fraise: 4, tomate: 6, mais: 8, citrouille: 12 },
  ramasser: 2, // ramasser un œuf, du lait, de la laine
  nourrir: 1, // donner à manger à un animal qui a faim
}

/**
 * Expérience totale nécessaire pour atteindre un niveau.
 * Niveau 2 : 40 ⭐, niveau 3 : 120 ⭐, niveau 4 : 240 ⭐, niveau 5 : 400 ⭐…
 */
export function experiencePourNiveau(niveau) {
  return 20 * niveau * (niveau - 1)
}
export const NIVEAU_MAXIMUM = 30
