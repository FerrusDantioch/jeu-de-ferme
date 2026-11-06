/**
 * boutique.js — l'intérieur de la boutique : le comptoir de Lila, des étagères,
 * des sacs de graines et des paniers de légumes. Chargé seulement à la première visite.
 * Toucher Lila ou son comptoir ouvre la boutique (acheter, vendre).
 */
import { creerPiece } from './piece.js'
import { PALETTE } from '../modeles/materiaux.js'
import {
  creerComptoir, creerEtagere, creerSac, creerPanier, creerTapis, creerPlante,
  creerCaisse, creerFenetreInterieure,
} from '../modeles/mobilier.js'
import * as THREE from 'three'
import { MATERIAU_INVISIBLE } from '../modeles/formes.js'
import { creerPnjDuLieu } from './pnj-du-lieu.js'

export function creerLieu(outils) {
  const piece = creerPiece({
    id: 'boutique',
    titre: '🧺 La boutique',
    largeur: 9,
    profondeur: 7,
    couleurMur: PALETTE.murJaune,
    couleurBas: PALETTE.toitVert,
  })
  const { placer, accrocherSurCote } = piece

  // Le comptoir, avec Lila derrière (elle est ajoutée par la liste des villageois).
  placer(creerComptoir(3.6), 0, -1.6, { obstacle: [3.6, 0.7] })
  // Le comptoir se touche pour ouvrir la boutique.
  const zoneComptoir = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.2, 0.9), MATERIAU_INVISIBLE)
  zoneComptoir.position.set(0, 0.6, -1.6)
  zoneComptoir.userData.toucher = { type: 'boutique', approche: { x: 0, z: -0.6 } }
  piece.groupe.add(zoneComptoir)
  piece.touchables.push(zoneComptoir)

  // Étagères garnies contre le mur du fond.
  placer(creerEtagere(1.6, [PALETTE.tomate, PALETTE.fleurJaune, PALETTE.chou]), -2.8, -3.25, { obstacle: [1.6, 0.45] })
  placer(creerEtagere(1.6, [PALETTE.citrouille, PALETTE.tissuBleu, PALETTE.fleurRose]), 0, -3.25)
  placer(creerEtagere(1.6, [PALETTE.chou, PALETTE.paille, PALETTE.tomate]), 2.8, -3.25, { obstacle: [1.6, 0.45] })
  accrocherSurCote(creerFenetreInterieure(), -1, 2.0, 1.4)
  accrocherSurCote(creerFenetreInterieure(), 1, 2.0, 1.4)

  // Sacs de graines à gauche.
  const couleursSacs = [PALETTE.paille, PALETTE.chou, PALETTE.tissuBleu, PALETTE.fleurRose]
  couleursSacs.forEach((couleur, n) => {
    placer(creerSac(couleur), -3.9, -0.6 + n * 0.6, { angle: Math.PI / 2, obstacle: [0.45, 0.32] })
  })

  // Paniers de légumes et caisses à droite.
  placer(creerPanier(PALETTE.citrouille), 3.8, -0.4, { obstacle: 0.35 })
  placer(creerPanier(PALETTE.tomate), 3.8, 0.6, { obstacle: 0.35 })
  placer(creerPanier(PALETTE.chou), 3.8, 1.6, { obstacle: 0.35 })
  placer(creerCaisse(0.55), -3.4, -2.3, { obstacle: [0.55, 0.55], angle: 0.3 })

  // Un tapis et des plantes près de l'entrée.
  placer(creerTapis(3, 1.8, PALETTE.tapisVert), 0, 1.2)
  placer(creerPlante(1.1), -3.9, 2.9, { obstacle: 0.25 })
  placer(creerPlante(), 3.9, 2.9, { obstacle: 0.25 })

  const pnj = creerPnjDuLieu('boutique', { ...piece, bulles: outils.bulles })
  return piece.terminer({ pnj })
}
