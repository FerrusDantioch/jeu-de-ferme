/**
 * inventaire.js — le sac du joueur : ajouter, retirer, compter des objets.
 */
import { etat } from './etat.js'

// Nombre maximum d'un même objet dans le sac (pour garder des nombres lisibles).
export const MAXIMUM = 999

export function quantite(id) {
  return etat.d.inventaire[id] || 0
}

export function ajouter(id, n = 1) {
  const inv = etat.d.inventaire
  inv[id] = Math.min(MAXIMUM, (inv[id] || 0) + n)
  etat.signaler()
}

/** Retire n objets. Renvoie faux (sans rien retirer) s'il n'y en a pas assez. */
export function retirer(id, n = 1) {
  const inv = etat.d.inventaire
  if ((inv[id] || 0) < n) return false
  inv[id] -= n
  if (inv[id] === 0) delete inv[id]
  etat.signaler()
  return true
}

/** Liste des objets présents : [[id, quantité], …] */
export function contenu() {
  return Object.entries(etat.d.inventaire).filter(([, n]) => n > 0)
}
