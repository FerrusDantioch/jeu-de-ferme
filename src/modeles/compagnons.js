/**
 * compagnons.js (modèles) — un petit chat et un petit chien en formes simples.
 *
 * Face vers +z (vers la caméra). Pièces nommées pour l'animation :
 *  - « corps » : tout l'animal (il se penche pour s'asseoir) ;
 *  - « tete », « queue », « patte0 » à « patte3 » (avant gauche, avant droite, arrière gauche, arrière droite).
 */
import * as THREE from 'three'
import { materiau, PALETTE } from './materiaux.js'
import { fusionnerEnPlace } from './fusion.js'

function piece(geo, couleur, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, materiau(couleur))
  m.position.set(x, y, z)
  m.castShadow = true
  return m
}

const OMBRE = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.16, depthWrite: false })

/**
 * @param {string} espece  'chat' ou 'chien'
 * @param {object} pelage  { couleur, couleur2 } (voir src/donnees/compagnons.js)
 */
export function creerCompagnon(espece, pelage) {
  const chien = espece === 'chien'
  const c1 = pelage.couleur
  const c2 = pelage.couleur2
  // Le chien est un peu plus grand et plus trapu que le chat.
  const t = chien ? { l: 0.26, h: 0.24, p: 0.5, jambe: 0.2, tete: 0.16 } : { l: 0.2, h: 0.19, p: 0.42, jambe: 0.18, tete: 0.135 }

  const groupe = new THREE.Group()
  groupe.name = 'compagnon'
  const corps = new THREE.Group()
  corps.name = 'corps'
  groupe.add(corps)

  // --- Le tronc (et le ventre plus clair) ---
  const yTronc = t.jambe + t.h / 2
  corps.add(piece(new THREE.BoxGeometry(t.l, t.h, t.p), c1, 0, yTronc, 0))
  corps.add(piece(new THREE.BoxGeometry(t.l * 0.8, 0.03, t.p * 0.7), c2, 0, t.jambe + 0.005, 0.02))

  // --- Les pattes (accrochées au tronc pour pouvoir bouger) ---
  const geoPatte = new THREE.CylinderGeometry(0.035, 0.032, t.jambe, 5).translate(0, -t.jambe / 2, 0)
  const geoPied = new THREE.IcosahedronGeometry(0.04, 0)
  ;[[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([cx, cz], n) => {
    const patte = new THREE.Group()
    patte.name = `patte${n}`
    patte.position.set(cx * t.l * 0.32, t.jambe, cz * t.p * 0.36)
    patte.add(piece(geoPatte, c1))
    patte.add(piece(geoPied, c2, 0, -t.jambe + 0.02, 0.01))
    corps.add(patte)
  })

  // --- La tête ---
  const tete = new THREE.Group()
  tete.name = 'tete'
  tete.position.set(0, yTronc + t.h * 0.55, t.p / 2 + t.tete * 0.45)
  corps.add(tete)
  tete.add(piece(new THREE.IcosahedronGeometry(t.tete, 1), c1))
  // Yeux et nez.
  for (const cote of [-1, 1]) tete.add(piece(new THREE.SphereGeometry(0.022, 6, 4), PALETTE.noir, cote * t.tete * 0.42, 0.03, t.tete * 0.86))
  if (chien) {
    // Un museau allongé, une truffe, des oreilles qui tombent.
    tete.add(piece(new THREE.BoxGeometry(0.11, 0.08, 0.1), c2, 0, -0.045, t.tete * 0.95))
    tete.add(piece(new THREE.SphereGeometry(0.028, 6, 4), PALETTE.noir, 0, -0.02, t.tete * 1.28))
    for (const cote of [-1, 1]) {
      const oreille = piece(new THREE.BoxGeometry(0.05, 0.13, 0.08), c1 === 0xf7f4ee ? 0xe3c193 : c1, cote * t.tete * 0.95, -0.02, 0)
      oreille.rotation.z = cote * 0.25
      tete.add(oreille)
    }
  } else {
    // Un petit museau clair, un nez rose, des oreilles pointues.
    tete.add(piece(new THREE.IcosahedronGeometry(0.05, 0), c2, 0, -0.045, t.tete * 0.8))
    tete.add(piece(new THREE.SphereGeometry(0.018, 6, 4), 0xf4a3a3, 0, -0.015, t.tete * 1.0))
    for (const cote of [-1, 1]) {
      const oreille = piece(new THREE.ConeGeometry(0.05, 0.1, 4), c1, cote * t.tete * 0.6, t.tete * 0.85, -0.01)
      oreille.rotation.z = -cote * 0.25
      tete.add(oreille)
    }
  }

  // --- La queue (droite et dressée pour le chat, plus courte pour le chien) ---
  const queue = new THREE.Group()
  queue.name = 'queue'
  queue.position.set(0, yTronc + t.h * 0.3, -t.p / 2)
  const longueur = chien ? 0.2 : 0.3
  const geoQueue = new THREE.CylinderGeometry(0.022, 0.03, longueur, 5).translate(0, longueur / 2, 0)
  const morceau = piece(geoQueue, c1)
  morceau.rotation.x = chien ? -0.9 : -0.35
  queue.add(morceau)
  corps.add(queue)

  // Optimisation : chaque partie qui bouge devient une seule pièce.
  fusionnerEnPlace(tete, { profond: true })
  fusionnerEnPlace(queue, { profond: true })
  for (let n = 0; n < 4; n++) fusionnerEnPlace(corps.getObjectByName(`patte${n}`), { profond: true })
  fusionnerEnPlace(corps)

  // Ombre ronde sous lui.
  const ombre = new THREE.Mesh(new THREE.CircleGeometry(chien ? 0.34 : 0.28, 12), OMBRE)
  ombre.rotation.x = -Math.PI / 2
  ombre.position.y = 0.012
  ombre.name = 'ombre'
  groupe.add(ombre)

  // Le point où il se pose : utile pour l'asseoir sur un banc.
  groupe.userData.hauteurPattes = t.jambe
  return groupe
}
