/**
 * cuisine.js (règles) — cuisiner une recette : les ingrédients quittent le sac,
 * le plat y entre. Instantané, rien ne brûle jamais.
 */
import { RECETTES } from '../donnees/recettes.js'
import { EXPERIENCE } from '../donnees/economie.js'
import { quantite, retirer, ajouter } from './inventaire.js'
import { etat } from './etat.js'
import { annoncer } from './evenements.js'
import { gagnerExperience } from './economie.js'

/** Les ingrédients d'une recette, avec ce qu'on a : [{ id, n, ai }]. */
export function ingredients(id) {
  return Object.entries(RECETTES[id].ingredients).map(([ing, n]) => ({ id: ing, n, ai: quantite(ing) }))
}

/** Vrai si on a tout ce qu'il faut. */
export function peutCuisiner(id) {
  return ingredients(id).every((i) => i.ai >= i.n)
}

/** Cuisine une recette. Renvoie l'expérience gagnée, ou null si impossible. */
export function cuisiner(id) {
  if (!RECETTES[id] || !peutCuisiner(id)) return null
  for (const i of ingredients(id)) retirer(i.id, i.n)
  ajouter(id, 1)
  etat.d.stats.plats = (etat.d.stats.plats || 0) + 1
  // On retient les recettes déjà réussies (pour le carnet).
  etat.d.recettesFaites = { ...(etat.d.recettesFaites || {}), [id]: (etat.d.recettesFaites?.[id] || 0) + 1 }
  const xp = gagnerExperience(EXPERIENCE.cuisiner)
  annoncer('cuisiner', { id })
  return { xp }
}
