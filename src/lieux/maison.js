/**
 * maison.js — l'intérieur de la maison : un lit, une table, une cheminée, une cuisine…
 * Ce fichier n'est chargé que la première fois qu'on entre dans la maison.
 */
import { creerPiece } from './piece.js'
import { PALETTE } from '../modeles/materiaux.js'
import {
  creerLit, creerTable, creerChaise, creerTapis, creerEtagere, creerCheminee,
  creerCuisine, creerPlante, creerFenetreInterieure, creerLanterne,
} from '../modeles/mobilier.js'
import { creerPnjDuLieu } from './pnj-du-lieu.js'

export function creerLieu(outils) {
  const piece = creerPiece({ id: 'maison', titre: '🏠 La maison', largeur: 10, profondeur: 8 })
  const { placer, accrocherAuFond, accrocherSurCote } = piece

  // Mur du fond : cheminée au milieu, lit à gauche, cuisine à droite.
  placer(creerCheminee(), 0, -3.6, { obstacle: [1.8, 0.7] })
  placer(creerLit(), -3.6, -2.8, { obstacle: [1.3, 2.1] })
  placer(creerEtagere(1.4), -1.9, -3.7, { obstacle: [1.4, 0.45] })
  placer(creerCuisine(2.2), 3.4, -3.6, { obstacle: [2.2, 0.6] })
  accrocherAuFond(creerFenetreInterieure(), -3.6, 1.55)
  accrocherAuFond(creerFenetreInterieure(1.2, 0.9), 3.4, 1.6)
  accrocherSurCote(creerFenetreInterieure(), -1, 0.5, 1.4)
  accrocherSurCote(creerFenetreInterieure(), 1, 0.5, 1.4)

  // Le coin repas.
  placer(creerTapis(3.2, 2.2, PALETTE.tapisRose), -1.2, 0.6)
  placer(creerTable(), 2.4, 0.2, { obstacle: 0.6 })
  placer(creerChaise(), 1.45, 0.2, { angle: Math.PI / 2, obstacle: [0.45, 0.45] })
  placer(creerChaise(), 3.35, 0.2, { angle: -Math.PI / 2, obstacle: [0.45, 0.45] })
  placer(creerLanterne(), 2.4, 0.2, { y: 0.8 })

  // Des plantes dans les coins.
  placer(creerPlante(1.1), -4.4, 3.2, { obstacle: 0.25 })
  placer(creerPlante(), 4.4, 3.2, { obstacle: 0.25 })
  placer(creerPlante(0.9), -4.4, -0.6, { obstacle: 0.25 })

  const pnj = creerPnjDuLieu('maison', { ...piece, bulles: outils.bulles })
  return piece.terminer({ pnj })
}
