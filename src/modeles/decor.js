/**
 * decor.js — les petits éléments du décor extérieur :
 * puits, banc, panneau, étang, enclos, carré de potager.
 */
import * as THREE from 'three'
import { materiau, PALETTE, MATERIAU_VITRE } from './materiaux.js'
import { boite, boule, cylindre, toitDeuxPans } from './formes.js'
import { panneauTexte } from './batiments.js'
import { creerBotteDeFoin, creerSac } from './mobilier.js'

/** Un puits en pierre avec un petit toit. */
export function creerPuits() {
  const g = new THREE.Group()
  g.add(cylindre(0.75, 0.7, PALETTE.pierre, 0, 0, 0, 10))
  g.add(cylindre(0.58, 0.05, PALETTE.eau, 0, 0.62, 0, 10))
  for (const x of [-0.62, 0.62]) g.add(boite(0.12, 1.6, 0.12, PALETTE.boisFonce, x, 0.6, 0))
  const toit = toitDeuxPans(1.3, 1.0, 0, 0.45, PALETTE.toitTuile, 0.15, 0.08)
  toit.position.y = 2.15
  g.add(toit)
  g.add(boite(1.3, 0.08, 0.08, PALETTE.boisFonce, 0, 1.75, 0)) // la barre du seau
  g.add(cylindre(0.14, 0.2, PALETTE.metal, 0, 1.25, 0, 8)) // le seau
  return g
}

/** Un banc en bois. Face vers +z. */
export function creerBanc() {
  const g = new THREE.Group()
  g.add(boite(1.6, 0.08, 0.45, PALETTE.bois, 0, 0.42, 0))
  g.add(boite(1.6, 0.4, 0.08, PALETTE.bois, 0, 0.55, -0.2))
  for (const x of [-0.65, 0.65]) {
    g.add(boite(0.1, 0.42, 0.4, PALETTE.boisFonce, x, 0, 0))
  }
  return g
}

/** Un lampadaire en bois avec une lanterne (elle s'allume le soir). */
export function creerLampadaire() {
  const g = new THREE.Group()
  g.add(cylindre(0.08, 1.9, PALETTE.boisFonce, 0, 0, 0, 6))
  g.add(boite(0.42, 0.06, 0.06, PALETTE.boisFonce, 0.14, 1.86, 0)) // le bras
  const lanterne = new THREE.Group()
  lanterne.position.set(0.3, 1.5, 0)
  lanterne.add(boite(0.24, 0.3, 0.24, MATERIAU_VITRE, 0, 0, 0)) // la vitre (s'allume le soir)
  lanterne.add(boite(0.3, 0.05, 0.3, PALETTE.noir, 0, 0.3, 0))
  lanterne.add(boite(0.28, 0.04, 0.28, PALETTE.noir, 0, -0.02, 0))
  lanterne.add(boite(0.03, 0.06, 0.03, PALETTE.noir, 0, 0.35, 0))
  g.add(lanterne)
  return g
}

/** Un panneau planté dans le sol, avec un texte. Face vers +z. */
export function creerPanneau(texte, largeur = 1.4) {
  const g = new THREE.Group()
  g.add(boite(0.1, 0.9, 0.1, PALETTE.boisFonce, 0, 0, -0.03))
  const planche = panneauTexte(texte, largeur, 0.4)
  planche.position.y = 0.85
  g.add(planche)
  return g
}

/** Un petit étang rond avec des pierres autour et deux nénuphars. */
export function creerEtang(rayon = 2.2) {
  const g = new THREE.Group()
  const eau = new THREE.Mesh(new THREE.CircleGeometry(rayon, 18), materiau(PALETTE.eau))
  eau.rotation.x = -Math.PI / 2
  eau.position.y = 0.03
  eau.receiveShadow = true
  g.add(eau)
  const nb = 16
  for (let k = 0; k < nb; k++) {
    const a = (k / nb) * Math.PI * 2
    const r = 0.18 + (k % 3) * 0.05
    const pierre = boule(r, PALETTE.rocher, Math.cos(a) * rayon, 0.05, Math.sin(a) * rayon)
    pierre.scale.y = 0.6
    g.add(pierre)
  }
  for (const [x, z] of [[-0.6, 0.4], [0.7, -0.5]]) {
    const nenuphar = new THREE.Mesh(new THREE.CircleGeometry(0.28, 7), materiau(PALETTE.feuillage))
    nenuphar.rotation.x = -Math.PI / 2
    nenuphar.position.set(x, 0.05, z)
    g.add(nenuphar)
    g.add(boule(0.08, PALETTE.fleurRose, x + 0.05, 0.1, z))
  }
  return g
}

/**
 * Un enclos en bois (pour les animaux, au jalon 3).
 * largeur × profondeur, avec une ouverture (porte) sur le côté gauche, centrée.
 */
export function creerEnclos(largeur, profondeur, ouverture = 1.6) {
  const g = new THREE.Group()
  const hx = largeur / 2
  const hz = profondeur / 2
  // Les côtés sous forme de segments [x1, z1, x2, z2].
  const segments = [
    [-hx, -hz, hx, -hz], // fond
    [-hx, hz, hx, hz], // devant
    [hx, -hz, hx, hz], // droite
    [-hx, -hz, -hx, -ouverture / 2], // gauche, en deux morceaux (l'ouverture au milieu)
    [-hx, ouverture / 2, -hx, hz],
  ]
  for (const [x1, z1, x2, z2] of segments) {
    const longueur = Math.hypot(x2 - x1, z2 - z1)
    const angle = Math.atan2(z2 - z1, x2 - x1)
    const nbPiquets = Math.max(2, Math.round(longueur / 1.2) + 1)
    for (let k = 0; k < nbPiquets; k++) {
      const t = k / (nbPiquets - 1)
      g.add(boite(0.14, 0.9, 0.14, PALETTE.boisClair, x1 + (x2 - x1) * t, 0, z1 + (z2 - z1) * t))
    }
    for (const h of [0.35, 0.7]) {
      const barre = boite(longueur, 0.08, 0.06, PALETTE.boisClair, (x1 + x2) / 2, h, (z1 + z2) / 2)
      barre.rotation.y = -angle
      g.add(barre)
    }
  }
  // De la paille par terre et un abreuvoir.
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(largeur - 0.3, profondeur - 0.3), materiau(PALETTE.paillasse))
  sol.rotation.x = -Math.PI / 2
  sol.position.y = 0.015
  sol.receiveShadow = true
  g.add(sol)
  g.add(boite(1.4, 0.4, 0.5, PALETTE.boisFonce, hx - 1.2, 0, -hz + 0.6))
  g.add(boite(1.2, 0.05, 0.35, PALETTE.eau, hx - 1.2, 0.36, -hz + 0.6))
  return g
}

/** La réserve de nourriture gratuite : des bottes de foin et un sac de grain. */
export function creerReserve() {
  const g = new THREE.Group()
  const b1 = creerBotteDeFoin()
  b1.position.set(-0.3, 0, 0)
  g.add(b1)
  const b2 = creerBotteDeFoin()
  b2.position.set(-0.15, 0.55, 0)
  b2.rotation.y = 0.2
  g.add(b2)
  const sac = creerSac(PALETTE.paille)
  sac.position.set(0.55, 0, 0.1)
  g.add(sac)
  return g
}

/** Le tableau des commandes : un panneau en bois avec des petits papiers épinglés. */
export function creerTableauCommandes() {
  const g = new THREE.Group()
  for (const x of [-0.8, 0.8]) g.add(boite(0.12, 1.8, 0.12, PALETTE.boisFonce, x, 0, 0))
  g.add(boite(1.8, 1.0, 0.08, PALETTE.bois, 0, 0.7, 0.02))
  g.add(boite(1.9, 0.12, 0.25, PALETTE.toitTuile, 0, 1.75, 0.02)) // petit toit
  const titre = panneauTexte('Commandes', 1.3, 0.28)
  titre.position.set(0, 1.42, 0.07)
  g.add(titre)
  for (const [x, y, c] of [[-0.5, 0.85, PALETTE.blanc], [0, 0.8, PALETTE.fleurJaune], [0.5, 0.86, PALETTE.blanc]]) {
    g.add(boite(0.36, 0.42, 0.02, c, x, y, 0.07))
    g.add(boule(0.03, PALETTE.tomate, x, y + 0.38, 0.09)) // punaise
  }
  return g
}
