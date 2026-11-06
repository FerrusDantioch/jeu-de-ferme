/**
 * objets.js — tout ce qui peut aller dans le sac (l'inventaire).
 *
 * Pour chaque objet : son nom, son icône (un emoji) et sa catégorie
 * ('graine', 'recolte', 'produit' ou 'nourriture').
 * Les graines et les récoltes sont créées automatiquement d'après src/donnees/cultures.js.
 */
import { CULTURES } from './cultures.js'

export const CATEGORIES = [
  { id: 'graine', titre: '🌱 Graines' },
  { id: 'recolte', titre: '🧺 Récoltes' },
  { id: 'produit', titre: '🥚 Produits des animaux' },
  { id: 'nourriture', titre: '🌾 Nourriture des animaux' },
]

export const OBJETS = {
  // Produits des animaux.
  oeuf: { nom: 'Œuf', icone: '🥚', categorie: 'produit' },
  lait: { nom: 'Lait', icone: '🥛', categorie: 'produit' },
  laine: { nom: 'Laine', icone: '🧶', categorie: 'produit' },
  // Nourriture (gratuite, à prendre dans les réserves).
  foin: { nom: 'Foin', icone: '🌾', categorie: 'nourriture' },
  grain: { nom: 'Grain', icone: '🌰', categorie: 'nourriture' },
}

// Pour chaque culture : sa graine et sa récolte.
for (const [id, c] of Object.entries(CULTURES)) {
  OBJETS[`graine-${id}`] = { nom: `Graine de ${c.nomCourt}`, icone: c.icone, categorie: 'graine', culture: id }
  OBJETS[id] = { nom: c.nom, icone: c.icone, categorie: 'recolte' }
}

/** Nom et icône d'un objet (même s'il est inconnu, pour ne jamais planter le jeu). */
export function infosObjet(id) {
  return OBJETS[id] || { nom: id, icone: '❔', categorie: 'autre' }
}
