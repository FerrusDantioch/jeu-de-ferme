/**
 * decorations.js (modèles) — les décorations qu'on pose dans la ferme.
 * Chaque fonction renvoie un groupe posé au sol, face vers +z (vers la caméra).
 */
import * as THREE from 'three'
import { PALETTE, MATERIAU_VITRE } from './materiaux.js'
import { boite, boule, cylindre, toitDeuxPans } from './formes.js'
import { creerBanc } from './decor.js'

const FLEURS = [PALETTE.fleurRose, PALETTE.fleurJaune, PALETTE.fleurBlanche, PALETTE.fleurViolette]

/** Une petite fleur (tige + corolle). */
function fleur(couleur, x, z, h = 0.25) {
  const g = new THREE.Group()
  g.add(cylindre(0.015, h, PALETTE.herbeFoncee, x, 0, z, 4))
  g.add(boule(0.08, couleur, x, h + 0.03, z))
  return g
}

const FABRIQUES = {
  pot() {
    const g = new THREE.Group()
    g.add(cylindre(0.22, 0.3, PALETTE.pot, 0, 0, 0, 8))
    g.add(cylindre(0.2, 0.03, PALETTE.terreHumide, 0, 0.29, 0, 8))
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2
      g.add(fleur(FLEURS[k % 4], Math.cos(a) * 0.1, Math.sin(a) * 0.1, 0.45))
    }
    return g
  },
  massif() {
    const g = new THREE.Group()
    g.add(cylindre(0.6, 0.08, PALETTE.terreParcelle, 0, 0, 0, 10))
    // Une bordure de petites pierres.
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2
      const p = boule(0.08, PALETTE.pierre, Math.cos(a) * 0.62, 0.05, Math.sin(a) * 0.62)
      p.scale.y = 0.6
      g.add(p)
    }
    for (let k = 0; k < 11; k++) {
      const a = k * 2.4
      const r = 0.15 + (k % 3) * 0.14
      g.add(fleur(FLEURS[k % 4], Math.cos(a) * r, Math.sin(a) * r, 0.22 + (k % 2) * 0.08))
    }
    return g
  },
  rosier() {
    const g = new THREE.Group()
    g.add(boule(0.45, PALETTE.feuillage, 0, 0.42, 0, 1))
    g.add(boule(0.3, PALETTE.feuillageClair, 0.12, 0.7, 0.05))
    for (let k = 0; k < 9; k++) {
      const a = k * 0.7
      g.add(boule(0.07, k % 2 ? PALETTE.tomate : PALETTE.fleurRose, Math.cos(a) * 0.4, 0.3 + (k % 4) * 0.13, Math.sin(a) * 0.4))
    }
    return g
  },
  nain() {
    const g = new THREE.Group()
    g.add(cylindre(0.13, 0.12, PALETTE.chaussures, 0, 0, 0, 8))
    g.add(cylindre(0.15, 0.25, PALETTE.tissuBleu, 0, 0.12, 0, 8))
    g.add(boule(0.11, PALETTE.peau, 0, 0.47, 0))
    const barbe = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.18, 6), new THREE.MeshLambertMaterial({ color: PALETTE.blanc }))
    barbe.position.set(0, 0.38, 0.06)
    barbe.rotation.x = Math.PI
    g.add(barbe)
    const bonnet = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 6), new THREE.MeshLambertMaterial({ color: PALETTE.tomate }))
    bonnet.position.set(0, 0.65, 0)
    g.add(bonnet)
    g.add(boule(0.03, PALETTE.joues, 0, 0.47, 0.11)) // le nez
    return g
  },
  lanterne() {
    const g = new THREE.Group()
    g.add(cylindre(0.06, 1.0, PALETTE.noir, 0, 0, 0, 6))
    g.add(boite(0.26, 0.32, 0.26, MATERIAU_VITRE, 0, 1.0, 0))
    g.add(boite(0.32, 0.05, 0.32, PALETTE.noir, 0, 1.32, 0))
    g.add(boite(0.3, 0.04, 0.3, PALETTE.noir, 0, 0.98, 0))
    return g
  },
  nichoir() {
    const g = new THREE.Group()
    g.add(cylindre(0.05, 1.2, PALETTE.boisFonce, 0, 0, 0, 6))
    g.add(boite(0.3, 0.3, 0.28, PALETTE.toitBleu, 0, 1.2, 0))
    g.add(cylindre(0.05, 0.02, PALETTE.noir, 0, 1.33, 0.14, 8).rotateX(Math.PI / 2)) // le trou
    const toit = toitDeuxPans(0.3, 0.28, 0, 0.14, PALETTE.toitTuile, 0.05, 0.04)
    toit.position.y = 1.5
    g.add(toit)
    return g
  },
  citrouilles() {
    const g = new THREE.Group()
    for (const [x, z, r] of [[-0.2, 0, 0.22], [0.22, 0.05, 0.18], [0, -0.22, 0.15]]) {
      const c = boule(r, PALETTE.citrouille, x, r * 0.8, z, 1)
      c.scale.y = 0.75
      g.add(c)
      g.add(cylindre(0.02, 0.07, PALETTE.herbeFoncee, x, r * 1.4, z, 4))
    }
    g.add(boite(0.5, 0.35, 0.4, PALETTE.foin, 0.05, 0, -0.55)) // une petite botte de paille
    return g
  },
  epouvantail() {
    const g = new THREE.Group()
    g.add(cylindre(0.05, 1.5, PALETTE.boisFonce, 0, 0, 0, 6))
    g.add(boite(0.9, 0.06, 0.06, PALETTE.boisFonce, 0, 1.05, 0))
    g.add(boite(0.4, 0.45, 0.2, PALETTE.chemise, 0, 0.75, 0)) // la chemise
    for (const x of [-0.32, 0.32]) g.add(boite(0.22, 0.12, 0.14, PALETTE.chemise, x, 1.0, 0))
    g.add(boule(0.16, PALETTE.paille, 0, 1.35, 0))
    g.add(cylindre(0.32, 0.03, PALETTE.paille, 0, 1.45, 0, 10)) // le chapeau
    g.add(cylindre(0.14, 0.14, PALETTE.paille, 0, 1.47, 0, 10))
    return g
  },
  bonhomme() {
    const g = new THREE.Group()
    g.add(boule(0.32, PALETTE.blanc, 0, 0.3, 0, 1))
    g.add(boule(0.23, PALETTE.blanc, 0, 0.75, 0, 1))
    g.add(boule(0.16, PALETTE.blanc, 0, 1.08, 0, 1))
    const nez = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.16, 5), new THREE.MeshLambertMaterial({ color: PALETTE.citrouille }))
    nez.rotation.x = Math.PI / 2
    nez.position.set(0, 1.08, 0.22)
    g.add(nez)
    for (const x of [-0.06, 0.06]) g.add(boule(0.025, PALETTE.noir, x, 1.13, 0.14))
    g.add(cylindre(0.2, 0.05, PALETTE.tomate, 0, 0.9, 0, 10)) // l'écharpe
    g.add(cylindre(0.13, 0.18, PALETTE.noir, 0, 1.2, 0, 10)) // le chapeau
    g.add(cylindre(0.19, 0.03, PALETTE.noir, 0, 1.2, 0, 10))
    return g
  },
  banc() {
    return creerBanc()
  },
  arche() {
    const g = new THREE.Group()
    for (const x of [-0.65, 0.65]) g.add(boite(0.12, 1.9, 0.12, PALETTE.blanc, x, 0, 0))
    // L'arc : un demi-anneau couvert de fleurs.
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.06, 5, 12, Math.PI), new THREE.MeshLambertMaterial({ color: PALETTE.blanc }))
    arc.position.y = 1.9
    g.add(arc)
    for (let k = 0; k <= 10; k++) {
      const a = (k / 10) * Math.PI
      g.add(boule(0.09, k % 2 ? PALETTE.fleurRose : PALETTE.feuillage, Math.cos(a) * 0.65, 1.9 + Math.sin(a) * 0.65, 0.04))
    }
    for (const x of [-0.65, 0.65]) for (let h = 0.4; h < 1.9; h += 0.45) g.add(boule(0.08, PALETTE.feuillageClair, x, h, 0.07))
    return g
  },
  fontaine() {
    const g = new THREE.Group()
    g.add(cylindre(0.95, 0.4, PALETTE.pierre, 0, 0, 0, 12))
    g.add(cylindre(0.82, 0.02, PALETTE.eau, 0, 0.38, 0, 12))
    g.add(cylindre(0.14, 0.8, PALETTE.pierre, 0, 0.3, 0, 8))
    g.add(cylindre(0.4, 0.1, PALETTE.pierre, 0, 1.0, 0, 10))
    g.add(cylindre(0.33, 0.02, PALETTE.eau, 0, 1.09, 0, 10))
    g.add(boule(0.1, PALETTE.eau, 0, 1.2, 0))
    return g
  },
}

/** Fabrique une décoration (voir src/donnees/decorations.js pour la liste). */
export function creerDecoration(type) {
  const fabrique = FABRIQUES[type] || FABRIQUES.pot
  return fabrique()
}
