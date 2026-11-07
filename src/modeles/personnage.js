/**
 * personnage.js — fabrique un personnage en formes simples (low-poly).
 *
 * Sert pour le joueur ET pour les villageois : on peut changer l'apparence
 * (couleurs, coiffure, chapeau, tablier, taille) grâce à l'objet « apparence ».
 *
 * Le personnage est un « groupe » de pièces : jambes, corps, bras, tête, chapeau.
 * Certaines pièces sont nommées (jambeGauche, brasDroit…) pour pouvoir les animer
 * quand il marche.
 *
 * Tailles en mètres : environ 1,3 m (style mignon, grosse tête).
 */
import * as THREE from 'three'
import { materiau, PALETTE } from './materiaux.js'
import { fusionnerEnPlace } from './fusion.js'

// Apparence par défaut : celle du joueur (chemise rose, salopette bleue, chapeau de paille).
const APPARENCE_JOUEUR = {
  peau: PALETTE.peau,
  cheveux: PALETTE.cheveux,
  haut: PALETTE.chemise, // chemise ou robe
  bas: PALETTE.salopette, // pantalon ou salopette
  chaussures: PALETTE.chaussures,
  salopette: true, // ajoute une bavette sur la poitrine
  tablier: null, // couleur d'un tablier (ou null = pas de tablier)
  robe: false, // ajoute une jupe (le « haut » devient une robe)
  coiffure: 'court', // 'court', 'long', 'queue', 'couettes', 'chignon' ou 'boucles'
  chapeau: 'paille', // 'paille', 'casquette', 'foulard', 'fleur' ou 'aucun'
  couleurChapeau: PALETTE.rubanChapeau, // ruban du chapeau de paille ou couleur de la casquette
  taille: 1, // 1 = adulte, 0.8 = enfant
}

/** Ajoute à la tête ce qui dépasse des cheveux selon la coiffure (queue, couettes…). */
function ajouterCoiffure(tete, a) {
  const c = a.cheveux
  if (a.coiffure === 'chignon') tete.add(piece(FORMES.chignon, c, 0, 0.27, -0.12))
  if (a.coiffure === 'long') tete.add(piece(FORMES.cheveuxLongs, c, 0, -0.17, -0.02))
  if (a.coiffure === 'queue') {
    tete.add(piece(FORMES.couette, c, 0, 0.1, -0.27))
    const queue = piece(FORMES.queue, c, 0, -0.08, -0.33)
    queue.rotation.x = Math.PI + 0.35
    tete.add(queue)
  }
  if (a.coiffure === 'couettes') {
    for (const cote of [-1, 1]) tete.add(piece(FORMES.couette, c, 0.27 * cote, -0.04, -0.08))
  }
  if (a.coiffure === 'boucles') {
    // Des petites boucles tout autour, en couronne.
    for (let k = 0; k < 9; k++) {
      const angle = Math.PI * (-0.1 + (k / 8) * 1.2) // d'un côté à l'autre, en passant par derrière
      tete.add(piece(FORMES.boucle, c, Math.cos(angle) * 0.27, 0.0 + (k % 2) * 0.08, -Math.sin(angle) * 0.24))
    }
  }
}

// Petite aide : crée une pièce, la place, et active les ombres.
function piece(geometrie, couleur, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometrie, materiau(couleur))
  m.position.set(x, y, z)
  m.castShadow = true
  return m
}

// Formes partagées par tous les personnages (créées une seule fois : économe).
const FORMES = {
  jambe: new THREE.CylinderGeometry(0.09, 0.08, 0.38, 6).translate(0, -0.19, 0),
  chaussure: new THREE.BoxGeometry(0.16, 0.1, 0.24),
  tronc: new THREE.CylinderGeometry(0.22, 0.25, 0.42, 8),
  ceinture: new THREE.CylinderGeometry(0.255, 0.26, 0.2, 8),
  bavette: new THREE.BoxGeometry(0.26, 0.2, 0.06),
  tablier: new THREE.BoxGeometry(0.34, 0.42, 0.05),
  bras: new THREE.CylinderGeometry(0.065, 0.06, 0.36, 6).translate(0, -0.18, 0),
  main: new THREE.IcosahedronGeometry(0.07, 0),
  tete: new THREE.IcosahedronGeometry(0.27, 1),
  cheveux: new THREE.SphereGeometry(0.285, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.55),
  chignon: new THREE.IcosahedronGeometry(0.13, 0),
  cheveuxLongs: new THREE.CylinderGeometry(0.25, 0.28, 0.42, 10, 1, false, Math.PI * 0.35, Math.PI * 1.3),
  queue: new THREE.ConeGeometry(0.08, 0.36, 6),
  couette: new THREE.IcosahedronGeometry(0.1, 0),
  boucle: new THREE.IcosahedronGeometry(0.09, 0),
  jupe: new THREE.CylinderGeometry(0.26, 0.36, 0.3, 8),
  foulard: new THREE.SphereGeometry(0.3, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.4),
  noeud: new THREE.IcosahedronGeometry(0.07, 0),
  petale: new THREE.IcosahedronGeometry(0.055, 0),
  oeil: new THREE.SphereGeometry(0.035, 6, 4),
  joue: new THREE.CircleGeometry(0.045, 8),
  bordChapeau: new THREE.CylinderGeometry(0.46, 0.46, 0.03, 12),
  calotte: new THREE.CylinderGeometry(0.2, 0.24, 0.18, 10),
  ruban: new THREE.CylinderGeometry(0.245, 0.245, 0.05, 10),
  casquette: new THREE.SphereGeometry(0.29, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.42),
  visiere: new THREE.BoxGeometry(0.3, 0.025, 0.2),
  ombre: new THREE.CircleGeometry(0.38, 16),
}
const MATERIAU_OMBRE = new THREE.MeshBasicMaterial({
  color: 0x000000,
  transparent: true,
  opacity: 0.18,
  depthWrite: false,
})

/**
 * @param {object} [options] apparence voulue (tout ce qui manque reprend celle du joueur)
 */
export function creerModelePersonnage(options = {}) {
  const a = { ...APPARENCE_JOUEUR, ...options }
  const groupe = new THREE.Group()
  groupe.name = 'personnage'

  // Le « corps » contient tout sauf l'ombre au sol ; il pourra sautiller en marchant.
  const corps = new THREE.Group()
  corps.name = 'corps'
  corps.scale.setScalar(a.taille)
  groupe.add(corps)

  // --- Jambes (accrochées à la hanche pour pouvoir se balancer) ---
  for (const cote of [-1, 1]) {
    const hanche = new THREE.Group()
    hanche.position.set(0.11 * cote, 0.45, 0)
    hanche.add(piece(FORMES.jambe, a.bas))
    hanche.add(piece(FORMES.chaussure, a.chaussures, 0, -0.38, 0.04))
    hanche.name = cote < 0 ? 'jambeGauche' : 'jambeDroite'
    corps.add(hanche)
  }

  // --- Tronc ---
  corps.add(piece(FORMES.tronc, a.haut, 0, 0.66, 0))
  corps.add(piece(FORMES.ceinture, a.bas, 0, 0.54, 0))
  if (a.salopette) corps.add(piece(FORMES.bavette, a.bas, 0, 0.7, 0.2))
  if (a.robe) corps.add(piece(FORMES.jupe, a.haut, 0, 0.42, 0))
  if (a.tablier) corps.add(piece(FORMES.tablier, a.tablier, 0, 0.6, 0.235))

  // --- Bras (accrochés à l'épaule) ---
  for (const cote of [-1, 1]) {
    const epaule = new THREE.Group()
    epaule.position.set(0.28 * cote, 0.84, 0)
    epaule.rotation.z = 0.12 * cote // bras légèrement écartés
    epaule.add(piece(FORMES.bras, a.haut))
    epaule.add(piece(FORMES.main, a.peau, 0, -0.38, 0))
    epaule.name = cote < 0 ? 'brasGauche' : 'brasDroit'
    corps.add(epaule)
  }

  // --- Tête ---
  const tete = new THREE.Group()
  tete.name = 'tete'
  tete.position.set(0, 1.08, 0)
  corps.add(tete)
  tete.add(piece(FORMES.tete, a.peau))
  // Cheveux : une demi-sphère un peu plus grande, posée derrière et dessus.
  const cheveux = piece(FORMES.cheveux, a.cheveux, 0, 0.02, -0.03)
  cheveux.rotation.x = -0.35
  tete.add(cheveux)
  ajouterCoiffure(tete, a)
  // Yeux et joues (petites formes, sans ombre pour économiser).
  for (const cote of [-1, 1]) {
    const oeil = new THREE.Mesh(FORMES.oeil, materiau(PALETTE.noir))
    oeil.position.set(0.09 * cote, 0.02, 0.245)
    tete.add(oeil)
    const joue = new THREE.Mesh(FORMES.joue, materiau(PALETTE.joues))
    joue.position.set(0.15 * cote, -0.06, 0.225)
    joue.rotation.y = 0.5 * cote
    tete.add(joue)
  }

  // --- Chapeau ---
  if (a.chapeau === 'paille') {
    const chapeau = new THREE.Group()
    chapeau.position.set(0, 0.2, 0)
    chapeau.rotation.x = -0.1
    chapeau.add(piece(FORMES.bordChapeau, PALETTE.paille))
    chapeau.add(piece(FORMES.calotte, PALETTE.paille, 0, 0.1, 0))
    chapeau.add(piece(FORMES.ruban, a.couleurChapeau, 0, 0.04, 0))
    tete.add(chapeau)
  } else if (a.chapeau === 'casquette') {
    const casquette = piece(FORMES.casquette, a.couleurChapeau, 0, 0.06, -0.01)
    casquette.rotation.x = -0.15
    tete.add(casquette)
    tete.add(piece(FORMES.visiere, a.couleurChapeau, 0, 0.12, 0.3))
  } else if (a.chapeau === 'foulard') {
    // Un foulard noué sur la tête, avec un petit nœud derrière.
    const foulard = piece(FORMES.foulard, a.couleurChapeau, 0, 0.05, -0.02)
    foulard.rotation.x = -0.3
    tete.add(foulard)
    tete.add(piece(FORMES.noeud, a.couleurChapeau, 0, 0.08, -0.29))
  } else if (a.chapeau === 'fleur') {
    // Une fleur piquée dans les cheveux, sur le côté.
    const fleur = new THREE.Group()
    fleur.position.set(0.2, 0.17, 0.1)
    for (let k = 0; k < 5; k++) {
      const angle = (k / 5) * Math.PI * 2
      fleur.add(piece(FORMES.petale, a.couleurChapeau, Math.cos(angle) * 0.06, Math.sin(angle) * 0.06, 0))
    }
    fleur.add(piece(FORMES.petale, PALETTE.fleurJaune, 0, 0, 0.02))
    fleur.rotation.y = 0.9
    tete.add(fleur)
  }

  // Optimisation : la tête (avec chapeau, yeux, joues), le tronc, chaque bras et chaque
  // jambe deviennent chacun UNE seule pièce (ils restent séparés entre eux pour bouger).
  fusionnerEnPlace(tete, { profond: true })
  fusionnerEnPlace(corps)
  for (const nom of ['jambeGauche', 'jambeDroite', 'brasGauche', 'brasDroit']) {
    fusionnerEnPlace(corps.getObjectByName(nom), { profond: true })
  }

  // --- Ombre ronde sous les pieds (toujours visible, même si les ombres sont coupées) ---
  const ombre = new THREE.Mesh(FORMES.ombre, MATERIAU_OMBRE)
  ombre.rotation.x = -Math.PI / 2
  ombre.position.y = 0.01
  ombre.scale.setScalar(a.taille)
  ombre.name = 'ombre'
  groupe.add(ombre)

  return groupe
}
