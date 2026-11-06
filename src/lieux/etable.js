/**
 * etable.js — l'intérieur de l'étable : les vaches dans leurs stalles, la réserve de foin,
 * des seaux, une lanterne. Chargé seulement à la première visite.
 */
import { creerPiece } from './piece.js'
import { PALETTE } from '../modeles/materiaux.js'
import {
  creerStalle, creerBotteDeFoin, creerSeau, creerLanterne, creerCaisse, creerFenetreInterieure,
} from '../modeles/mobilier.js'
import * as THREE from 'three'
import { MATERIAU_INVISIBLE } from '../modeles/formes.js'
import { creerPnjDuLieu } from './pnj-du-lieu.js'
import { creerAnimauxDuLieu, animerAnimaux } from './animaux-du-lieu.js'

// Position (x) des trois stalles, de gauche à droite (places 0, 1 et 2).
const STALLES = [-3, 0, 3]

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
  for (const x of STALLES) {
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
  // Ce tas de foin sert de réserve de nourriture gratuite : on peut le toucher.
  const zoneReserve = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 2.4), MATERIAU_INVISIBLE)
  zoneReserve.position.set(-5.2, 0.7, 2.05)
  zoneReserve.userData.toucher = { type: 'reserve', approche: { x: -4.0, z: 2.05 } }
  piece.groupe.add(zoneReserve)
  piece.touchables.push(zoneReserve)

  // Seaux, caisses et foin à droite.
  placer(creerBotteDeFoin(), 5.2, 0.8, { angle: Math.PI / 2, obstacle: [1.0, 0.6] })
  placer(creerSeau(), 3.8, 1.4, { obstacle: 0.2 })
  placer(creerSeau(), 4.3, 1.9, { obstacle: 0.2 })
  placer(creerCaisse(), 5.0, 3.2, { obstacle: [0.6, 0.6] })
  placer(creerCaisse(0.45), 5.0, 3.2, { y: 0.6, angle: 0.4 })

  // Quelques brins de paille par terre.
  ;[[-2, 0.5], [1.5, 1.8], [-0.5, 2.6], [2.8, -0.3]].forEach(([x, z], k) => {
    const paille = creerBotteDeFoin()
    paille.scale.set(0.55, 1, 0.5)
    placer(paille, x, z, { y: -0.52, angle: k * 0.8 + 0.3 })
  })

  const pnj = creerPnjDuLieu('etable', { ...piece, bulles: outils.bulles })

  // Les vaches, chacune dans sa stalle (elles bougent à peine).
  const zoneStalle = (fiche) => {
    const x = STALLES[fiche.place ?? 0] ?? 0
    return { xMin: x - 0.25, xMax: x + 0.25, zMin: -2.9, zMax: -2.6, angle: 0 }
  }
  const animaux = creerAnimauxDuLieu('etable', zoneStalle, { ...piece, pastilles: outils.pastilles })
  return piece.terminer({
    pnj,
    animaux,
    miseAJour: animerAnimaux(animaux),
    ambiance: { ciel: 0xffeccc, intensite: 1.7 },
  })
}
