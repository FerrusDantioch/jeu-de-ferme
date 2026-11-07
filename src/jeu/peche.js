/**
 * peche.js (règles) — quel poisson mord ? Tiré au hasard selon la saison et l'heure
 * (voir src/donnees/poissons.js). On ne rate jamais une prise.
 */
import { POISSONS } from '../donnees/poissons.js'
import { EXPERIENCE } from '../donnees/economie.js'
import { saisonDuJour, heureDuJour } from './temps.js'
import { ajouter } from './inventaire.js'
import { etat } from './etat.js'
import { annoncer } from './evenements.js'
import { gagnerExperience } from './economie.js'

/** Vrai si c'est le soir ou la nuit (pour les poissons de nuit). */
export function estLaNuit() {
  const h = heureDuJour()
  return h >= 20.5 || h < 6.5
}

/** Les poissons qu'on peut attraper maintenant : [[id, chance], …]. */
export function poissonsPossibles() {
  const saison = saisonDuJour()
  const nuit = estLaNuit()
  return Object.entries(POISSONS)
    .filter(([, p]) => (!p.saisons || p.saisons.includes(saison)) && (p.nuit === undefined || p.nuit === nuit))
    .map(([id, p]) => [id, p.chance])
}

/** Tire au hasard le poisson qui mord. */
export function tirerPrise() {
  const liste = poissonsPossibles()
  const total = liste.reduce((s, [, c]) => s + c, 0)
  let r = Math.random() * total
  for (const [id, c] of liste) {
    r -= c
    if (r <= 0) return id
  }
  return liste[0][0]
}

/** On remonte la ligne : la prise va dans le sac. Renvoie { id, xp }. */
export function prendre(id) {
  ajouter(id, 1)
  etat.d.stats.poissons = (etat.d.stats.poissons || 0) + 1
  const xp = gagnerExperience(EXPERIENCE.pecher)
  annoncer('pecher', { id })
  return { id, xp }
}
