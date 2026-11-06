/**
 * animaux-du-lieu.js — crée les animaux qui vivent dans un lieu
 * (d'après la mémoire du jeu : voir src/donnees/animaux.js pour ceux du départ).
 */
import { etat } from '../jeu/etat.js'
import { Animal } from '../entites/animal.js'

/**
 * @param {string} idLieu   'exterieur' ou 'etable'
 * @param {function} zonePour  (fiche de l'animal) => { xMin, xMax, zMin, zMax }
 * @param {object} ctx       { groupe, touchables, pastilles }
 * @returns {Animal[]}
 */
export function creerAnimauxDuLieu(idLieu, zonePour, { groupe, touchables, pastilles }) {
  const liste = []
  for (const fiche of etat.d.animaux) {
    if (fiche.lieu !== idLieu) continue
    const animal = new Animal(fiche, zonePour(fiche), pastilles)
    groupe.add(animal.modele)
    touchables.push(animal.zoneToucher)
    liste.push(animal)
  }
  return liste
}

/**
 * Fait vivre une liste d'animaux : à chaque image, et une fois par seconde
 * pour les petites icônes. Renvoie la fonction à appeler à chaque image.
 */
export function animerAnimaux(animaux, autreChaqueSeconde) {
  let compteur = 1
  return (dt) => {
    for (const a of animaux) a.miseAJour(dt)
    compteur += dt
    if (compteur >= 1) {
      compteur = 0
      for (const a of animaux) a.rafraichirIcone()
      if (autreChaqueSeconde) autreChaqueSeconde()
    }
  }
}
