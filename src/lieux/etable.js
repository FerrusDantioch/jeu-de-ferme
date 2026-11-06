/**
 * etable.js — l'intérieur de l'étable : des stalles (pour les animaux du jalon 3),
 * du foin, des seaux, une lanterne. Chargé seulement à la première visite.
 */
import { creerPiece } from './piece.js'
import { PALETTE } from '../modeles/materiaux.js'
import {
  creerStalle, creerBotteDeFoin, creerSeau, creerLanterne, creerCaisse, creerFenetreInterieure,
} from '../modeles/mobilier.js'
import { creerPnjDuLieu } from './pnj-du-lieu.js'

export function creerLieu(outils) {
  const piece = creerPiece({
    id: 'etable',
    titre: '🐄 L’étable',
    largeur: 12,
    profondeur: 9,
    hauteur: 3.2,
    couleurSol: PALETTE.paillasse,
    couleurMur: PALETTE.murRouge,
    couleurBas: PALETTE.boisFonce,
    lattes: false,
  })
  const { placer, accrocherAuFond, accrocherSurCote, grille } = piece

  // Trois stalles le long du mur du fond (on peut entrer dedans).
  for (const x of [-3, 0, 3]) {
    placer(creerStalle(2.4, 2.4), x, -3.2)
    // Obstacles : les deux cloisons et la mangeoire.
    for (const cote of [-1, 1]) grille.bloquerRectangle(x + cote * 1.2, -3.2, 0.12, 2.4, 0.3)
    grille.bloquerRectangle(x, -4.1, 2.1, 0.5, 0.3)
  }
  accrocherAuFond(creerFenetreInterieure(0.9, 0.7), -4.9, 2.2)
  accrocherAuFond(creerFenetreInterieure(0.9, 0.7), 4.9, 2.2)
  accrocherSurCote(creerFenetreInterieure(), -1, 0.5, 1.6)
  accrocherSurCote(creerFenetreInterieure(), 1, 0.5, 1.6)

  // Du foin à gauche, empilé.
  placer(creerBotteDeFoin(), -5.2, 1.5, { angle: Math.PI / 2, obstacle: [1.0, 0.6] })
  placer(creerBotteDeFoin(), -5.2, 2.6, { angle: Math.PI / 2, obstacle: [1.0, 0.6] })
  placer(creerBotteDeFoin(), -5.2, 2.05, { angle: Math.PI / 2, y: 0.55 })
  placer(creerLanterne(), -5.2, 1.5, { y: 0.55 })

  // Seaux, caisses et foin à droite.
  placer(creerBotteDeFoin(), 5.2, 0.8, { angle: Math.PI / 2, obstacle: [1.0, 0.6] })
  placer(creerSeau(), 3.8, 1.4, { obstacle: 0.2 })
  placer(creerSeau(), 4.3, 1.9, { obstacle: 0.2 })
  placer(creerCaisse(), 5.0, 3.2, { obstacle: [0.6, 0.6] })
  placer(creerCaisse(0.45), 5.0, 3.2, { y: 0.6, angle: 0.4 })

  // Quelques brins de paille par terre.
  for (const [x, z] of [[-2, 0.5], [1.5, 1.8], [-0.5, 2.6], [2.8, -0.3]]) {
    placer(creerBotteDeFoin(), x, z, { y: -0.5 })
  }

  const pnj = creerPnjDuLieu('etable', { ...piece, bulles: outils.bulles })
  return piece.terminer({
    pnj,
    ambiance: { ciel: 0xffeccc, intensite: 1.7 },
  })
}
