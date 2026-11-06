/**
 * personnage.js — fabrique le personnage du joueur en formes simples (low-poly).
 *
 * Le personnage est un « groupe » de pièces : jambes, corps, bras, tête, chapeau.
 * Certaines pièces sont nommées (jambeGauche, brasDroit…) pour pouvoir les animer
 * quand il marche.
 *
 * Tailles en mètres : le personnage mesure environ 1,3 m (style mignon, grosse tête).
 */
import * as THREE from 'three'
import { materiau, PALETTE } from './materiaux.js'

// Petite aide : crée une pièce, la place, et active les ombres.
function piece(geometrie, couleur, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometrie, materiau(couleur))
  m.position.set(x, y, z)
  m.castShadow = true
  return m
}

export function creerModelePersonnage() {
  const groupe = new THREE.Group()
  groupe.name = 'personnage'

  // Le « corps » contient tout sauf l'ombre au sol ; il pourra sautiller en marchant.
  const corps = new THREE.Group()
  corps.name = 'corps'
  groupe.add(corps)

  // --- Jambes (accrochées à la hanche pour pouvoir se balancer) ---
  const geoJambe = new THREE.CylinderGeometry(0.09, 0.08, 0.38, 6)
  geoJambe.translate(0, -0.19, 0) // le point de rotation est en haut (la hanche)
  const geoChaussure = new THREE.BoxGeometry(0.16, 0.1, 0.24)
  for (const cote of [-1, 1]) {
    const hanche = new THREE.Group()
    hanche.position.set(0.11 * cote, 0.45, 0)
    hanche.add(piece(geoJambe, PALETTE.salopette))
    hanche.add(piece(geoChaussure, PALETTE.chaussures, 0, -0.38, 0.04))
    hanche.name = cote < 0 ? 'jambeGauche' : 'jambeDroite'
    corps.add(hanche)
  }

  // --- Tronc : chemise + salopette ---
  corps.add(piece(new THREE.CylinderGeometry(0.22, 0.25, 0.42, 8), PALETTE.chemise, 0, 0.66, 0))
  corps.add(piece(new THREE.CylinderGeometry(0.255, 0.26, 0.2, 8), PALETTE.salopette, 0, 0.54, 0))
  corps.add(piece(new THREE.BoxGeometry(0.26, 0.2, 0.06), PALETTE.salopette, 0, 0.7, 0.2)) // bavette

  // --- Bras (accrochés à l'épaule) ---
  const geoBras = new THREE.CylinderGeometry(0.065, 0.06, 0.36, 6)
  geoBras.translate(0, -0.18, 0)
  const geoMain = new THREE.IcosahedronGeometry(0.07, 0)
  for (const cote of [-1, 1]) {
    const epaule = new THREE.Group()
    epaule.position.set(0.28 * cote, 0.84, 0)
    epaule.rotation.z = 0.12 * cote // bras légèrement écartés
    epaule.add(piece(geoBras, PALETTE.chemise))
    epaule.add(piece(geoMain, PALETTE.peau, 0, -0.38, 0))
    epaule.name = cote < 0 ? 'brasGauche' : 'brasDroit'
    corps.add(epaule)
  }

  // --- Tête ---
  const tete = new THREE.Group()
  tete.name = 'tete'
  tete.position.set(0, 1.08, 0)
  corps.add(tete)
  tete.add(piece(new THREE.IcosahedronGeometry(0.27, 1), PALETTE.peau))
  // Cheveux : une demi-sphère un peu plus grande, posée derrière et dessus.
  const cheveux = piece(
    new THREE.SphereGeometry(0.285, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.55),
    PALETTE.cheveux,
    0, 0.02, -0.03
  )
  cheveux.rotation.x = -0.35
  tete.add(cheveux)
  // Yeux et joues (petites formes, sans ombre pour économiser).
  const geoOeil = new THREE.SphereGeometry(0.035, 6, 4)
  const geoJoue = new THREE.CircleGeometry(0.045, 8)
  for (const cote of [-1, 1]) {
    const oeil = new THREE.Mesh(geoOeil, materiau(PALETTE.noir))
    oeil.position.set(0.09 * cote, 0.02, 0.245)
    tete.add(oeil)
    const joue = new THREE.Mesh(geoJoue, materiau(PALETTE.joues))
    joue.position.set(0.15 * cote, -0.06, 0.225)
    joue.rotation.y = 0.5 * cote
    tete.add(joue)
  }

  // --- Chapeau de paille ---
  const chapeau = new THREE.Group()
  chapeau.position.set(0, 0.2, 0)
  chapeau.rotation.x = -0.1
  chapeau.add(piece(new THREE.CylinderGeometry(0.46, 0.46, 0.03, 12), PALETTE.paille))
  chapeau.add(piece(new THREE.CylinderGeometry(0.2, 0.24, 0.18, 10), PALETTE.paille, 0, 0.1, 0))
  chapeau.add(piece(new THREE.CylinderGeometry(0.245, 0.245, 0.05, 10), PALETTE.rubanChapeau, 0, 0.04, 0))
  tete.add(chapeau)

  // --- Ombre ronde sous les pieds (toujours visible, même si les ombres sont coupées) ---
  const ombre = new THREE.Mesh(
    new THREE.CircleGeometry(0.38, 16),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18, depthWrite: false })
  )
  ombre.rotation.x = -Math.PI / 2
  ombre.position.y = 0.01
  ombre.name = 'ombre'
  groupe.add(ombre)

  return groupe
}
