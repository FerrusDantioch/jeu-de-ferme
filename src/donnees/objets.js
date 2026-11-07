/**
 * objets.js — tout ce qui peut aller dans le sac (l'inventaire).
 *
 * Pour chaque objet : son nom, son icône (un emoji) et sa catégorie
 * ('graine', 'recolte', 'fruit', 'produit', 'poisson', 'plat', 'nourriture' ou 'deco').
 * Les graines et les récoltes sont créées automatiquement d'après src/donnees/cultures.js.
 */
import { CULTURES } from './cultures.js'
import { FRUITS } from './vergers.js'
import { RECETTES } from './recettes.js'
import { POISSONS } from './poissons.js'
import { DECORATIONS } from './decorations.js'

export const CATEGORIES = [
  { id: 'graine', titre: '🌱 Graines' },
  { id: 'recolte', titre: '🧺 Récoltes' },
  { id: 'fruit', titre: '🍎 Fruits du verger' },
  { id: 'produit', titre: '🥚 Produits des animaux' },
  { id: 'poisson', titre: '🎣 Pêche' },
  { id: 'plat', titre: '🍽️ Plats cuisinés' },
  { id: 'nourriture', titre: '🌾 Nourriture des animaux' },
  { id: 'deco', titre: '🌼 Décorations à poser' },
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

// Les fruits du verger et les plats cuisinés.
for (const [id, f] of Object.entries(FRUITS)) OBJETS[id] = { nom: f.nom, icone: f.icone, categorie: 'fruit' }
for (const [id, r] of Object.entries(RECETTES)) OBJETS[id] = { nom: r.nom, icone: r.icone, categorie: 'plat' }
for (const [id, p] of Object.entries(POISSONS)) OBJETS[id] = { nom: p.nom, icone: p.icone, categorie: 'poisson' }
for (const [id, d] of Object.entries(DECORATIONS)) OBJETS[`deco-${id}`] = { nom: d.nom, icone: d.icone, categorie: 'deco' }

/** Nom et icône d'un objet (même s'il est inconnu, pour ne jamais planter le jeu). */
export function infosObjet(id) {
  return OBJETS[id] || { nom: id, icone: '❔', categorie: 'autre' }
}
