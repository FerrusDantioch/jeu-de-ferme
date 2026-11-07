/**
 * verger.js (règles) — les fruits poussent tout seuls sur les arbres, en temps réel.
 *
 * Dans la mémoire du jeu : etat.d.arbres = { idArbre: { depuis } }.
 * (Au début d'une partie, les arbres sont déjà pleins : voir etat.js.)
 * « depuis » = le moment à partir duquel on compte les fruits qui ont poussé :
 * nombre de fruits = temps écoulé ÷ temps pour un fruit (au maximum FRUITS_MAXIMUM).
 */
import { etat } from './etat.js'
import { ajouter } from './inventaire.js'
import { annoncer } from './evenements.js'
import { gagnerExperience } from './economie.js'
import { FRUITS, FRUITS_MAXIMUM } from '../donnees/vergers.js'
import { EXPERIENCE } from '../donnees/economie.js'

const MINUTE = 60000

function memoire(id) {
  if (!etat.d.arbres) etat.d.arbres = {}
  if (!etat.d.arbres[id]) etat.d.arbres[id] = { depuis: Date.now() }
  return etat.d.arbres[id]
}

/**
 * Ce qu'il y a sur un arbre en ce moment.
 * @returns {{ fruit, fruits: number, prochain: number }} prochain = millisecondes avant le prochain fruit
 */
export function observerArbre(arbre, maintenant = Date.now()) {
  const fruit = FRUITS[arbre.fruit]
  const periode = fruit.minutes * MINUTE
  const ecoule = Math.max(0, maintenant - memoire(arbre.id).depuis)
  const fruits = Math.min(FRUITS_MAXIMUM, Math.floor(ecoule / periode))
  const prochain = fruits >= FRUITS_MAXIMUM ? 0 : periode - (ecoule % periode)
  return { fruit, fruits, prochain }
}

/**
 * Secoue l'arbre : tous les fruits mûrs tombent dans le sac.
 * @returns {{ n, xp }|null} nombre de fruits cueillis et expérience gagnée (null s'il n'y avait rien)
 */
export function secouer(arbre, maintenant = Date.now()) {
  const vue = observerArbre(arbre, maintenant)
  if (vue.fruits === 0) return null
  const m = memoire(arbre.id)
  const periode = vue.fruit.minutes * MINUTE
  // Le fruit qui était en train de pousser continue de pousser (on ne perd pas ce temps),
  // sauf si l'arbre était plein.
  m.depuis = vue.fruits >= FRUITS_MAXIMUM ? maintenant : maintenant - ((maintenant - m.depuis) % periode)
  ajouter(arbre.fruit, vue.fruits)
  etat.d.stats.fruits = (etat.d.stats.fruits || 0) + vue.fruits
  const xp = gagnerExperience(EXPERIENCE.cueillir * vue.fruits)
  annoncer('cueillir', { n: vue.fruits, fruit: arbre.fruit })
  return { n: vue.fruits, xp }
}
