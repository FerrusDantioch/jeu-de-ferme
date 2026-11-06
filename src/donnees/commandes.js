/**
 * commandes.js — les commandes des villageois.
 *
 * Chaque client (voir src/donnees/pnj.js) a au plus UNE commande à la fois.
 * Une commande n'expire JAMAIS et il n'y a aucune pénalité à attendre :
 * elle reste là tant qu'on ne l'a pas livrée.
 *
 * Après une livraison, le client repasse une nouvelle commande un peu plus tard.
 */

// Qui passe des commandes (identifiants de src/donnees/pnj.js), et quand arrive leur
// toute première commande (en minutes après le début du jeu).
export const CLIENTS = [
  { id: 'rose', premiereCommande: 0 },
  { id: 'leon', premiereCommande: 3 },
  { id: 'theo', premiereCommande: 6 },
]

// Temps (en minutes) avant une nouvelle commande, après une livraison : entre min et max.
export const DELAI_NOUVELLE_COMMANDE = { min: 3, max: 8 }

// La toute première commande du jeu (pour apprendre) : deux salades pour Mamie Rose.
export const PREMIERE_COMMANDE = { client: 'rose', articles: [{ id: 'salade', n: 2 }] }

// Récompense : prix de vente des articles × ce multiplicateur, plus un petit bonus.
export const RECOMPENSE = { multiplicateur: 1.6, bonusPieces: 5, bonusExperience: 6 }
