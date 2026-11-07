/**
 * inventaire.js — le sac du joueur : ajouter, retirer, compter des objets.
 */
import { etat } from './etat.js'
import { infosObjet } from '../donnees/objets.js'
import { annoncer } from './evenements.js'

// Les catégories d'objets notées dans le 📖 carnet de collection.
export const CATEGORIES_DU_CARNET = ['recolte', 'fruit', 'produit', 'poisson', 'plat']

// Nombre maximum d'un même objet dans le sac (pour garder des nombres lisibles).
export const MAXIMUM = 999

export function quantite(id) {
  return etat.d.inventaire[id] || 0
}

export function ajouter(id, n = 1) {
  const inv = etat.d.inventaire
  inv[id] = Math.min(MAXIMUM, (inv[id] || 0) + n)
  // Le carnet retient tout ce qu'on a obtenu (et combien en tout).
  if (CATEGORIES_DU_CARNET.includes(infosObjet(id).categorie)) {
    const carnet = (etat.d.carnet ||= {})
    const nouveau = !carnet[id]
    carnet[id] = (carnet[id] || 0) + n
    if (nouveau) annoncer('decouverte', { id })
  }
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
