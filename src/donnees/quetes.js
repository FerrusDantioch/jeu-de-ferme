/**
 * quetes.js — les modèles de quêtes du jour.
 *
 * Chaque jour à minuit (heure du téléphone), 3 quêtes sont tirées au hasard parmi celles-ci.
 * Aucune pénalité si on ne les fait pas. Une quête finie mais pas encore « reçue »
 * à minuit est donnée automatiquement.
 *
 * Pour chaque modèle :
 *  - type : l'action à faire (voir src/jeu/quetes.js) ;
 *  - texte : la phrase affichée ({n} est remplacé par le nombre à atteindre,
 *    et {s} par un « s » seulement si ce nombre est plus grand que 1) ;
 *  - objectif : [minimum, maximum] du nombre à atteindre ;
 *  - pieces, experience : [récompense de base, récompense en plus par unité].
 * (Les quêtes sur les animaux ne sont proposées que s'il y a des animaux à la ferme.)
 */

export const NOMBRE_DE_QUETES = 3

export const MODELES_QUETES = [
  { type: 'recolter', texte: 'Récolter {n} fois au potager', objectif: [3, 5], pieces: [5, 3], experience: [4, 2] },
  { type: 'planter', texte: 'Planter {n} graine{s}', objectif: [3, 6], pieces: [4, 2], experience: [3, 1] },
  { type: 'arroser', texte: 'Arroser {n} parcelle{s}', objectif: [2, 4], pieces: [4, 2], experience: [3, 1] },
  { type: 'ramasser', texte: 'Ramasser {n} produit{s} des animaux (œufs, lait, laine)', objectif: [2, 4], pieces: [5, 3], experience: [4, 2] },
  { type: 'nourrir', texte: 'Donner {n} repas aux animaux', objectif: [3, 5], pieces: [4, 2], experience: [3, 1] },
  { type: 'caresser', texte: 'Faire {n} câlin{s} aux animaux', objectif: [3, 6], pieces: [3, 2], experience: [3, 1] },
  { type: 'livrer', texte: 'Livrer {n} commande{s} aux villageois', objectif: [1, 2], pieces: [8, 8], experience: [6, 5] },
  { type: 'vendre', texte: 'Gagner {n} pièces en vendant chez Lila', objectif: [15, 30], pieces: [5, 0.2], experience: [4, 0.1] },
  { type: 'parler', texte: 'Discuter avec {n} villageois différent{s}', objectif: [2, 3], pieces: [3, 2], experience: [3, 2] },
]

// Textes des quêtes spéciales des fêtes (même principe, voir src/donnees/fetes.js).
export const TEXTES_SPECIAUX = {
  oeufs: 'Trouver {n} œuf{s} de Pâques caché{s} dans la ferme 🥚',
}
