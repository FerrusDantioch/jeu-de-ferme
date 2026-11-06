/**
 * pnj-du-lieu.js — crée les villageois qui vivent dans un lieu donné
 * (d'après la liste de src/donnees/pnj.js).
 */
import { PNJ as LISTE_PNJ } from '../donnees/pnj.js'
import { PNJ } from '../entites/pnj.js'

/**
 * @param {string} idLieu  ex. : 'exterieur', 'boutique'
 * @param {object} ctx     { groupe, grille, touchables, bulles, maisons }
 * @returns {PNJ[]} la liste des villageois créés
 */
export function creerPnjDuLieu(idLieu, { groupe, grille, touchables, bulles, maisons = {} }) {
  const resultat = []
  for (const donnees of LISTE_PNJ) {
    if (donnees.lieu !== idLieu) continue
    const pnj = new PNJ(donnees, grille, { bulles, maisons })
    groupe.add(pnj.modele)
    touchables.push(pnj.zoneToucher)
    resultat.push(pnj)
  }
  return resultat
}
