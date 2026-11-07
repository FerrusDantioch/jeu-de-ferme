/**
 * decorations.js — les décorations à acheter chez Lila, puis à poser où l'on veut dehors.
 *
 * Pour chaque décoration :
 *  - nom, icone, prix (en pièces), niveau nécessaire pour l'acheter ;
 *  - taille : rayon (en mètres) de la place qu'elle occupe au sol ;
 *  - banc : true = on peut s'y asseoir ;
 *  - lumiere : true = elle brille le soir ;
 *  - poteaux : (arche) on passe dessous : seuls ses deux poteaux, à cette distance du centre, gênent.
 * On peut ranger une décoration dans le sac à tout moment, et la reposer ailleurs.
 */

export const DECORATIONS = {
  pot: { nom: 'Pot de fleurs', icone: '🪴', prix: 8, niveau: 1, taille: 0.3 },
  massif: { nom: 'Massif de fleurs', icone: '🌷', prix: 12, niveau: 1, taille: 0.6 },
  rosier: { nom: 'Rosier', icone: '🌹', prix: 15, niveau: 1, taille: 0.5 },
  nain: { nom: 'Nain de jardin', icone: '🧙', prix: 18, niveau: 2, taille: 0.3 },
  lanterne: { nom: 'Lanterne', icone: '🏮', prix: 20, niveau: 2, taille: 0.25, lumiere: true },
  nichoir: { nom: 'Nichoir à oiseaux', icone: '🐦', prix: 22, niveau: 2, taille: 0.25 },
  citrouilles: { nom: 'Tas de citrouilles', icone: '🎃', prix: 16, niveau: 3, taille: 0.55 },
  epouvantail: { nom: 'Épouvantail', icone: '🧑‍🌾', prix: 25, niveau: 3, taille: 0.35 },
  bonhomme: { nom: 'Bonhomme de neige', icone: '⛄', prix: 20, niveau: 3, taille: 0.45 },
  banc: { nom: 'Banc', icone: '🪑', prix: 30, niveau: 3, taille: 0.85, banc: true },
  arche: { nom: 'Arche fleurie', icone: '🌸', prix: 45, niveau: 4, taille: 0.2, poteaux: 0.65 },
  fontaine: { nom: 'Fontaine', icone: '⛲', prix: 60, niveau: 5, taille: 0.95 },
}

// Nombre maximum de décorations posées dehors (pour que le jeu reste fluide).
export const DECORATIONS_MAXIMUM = 30
