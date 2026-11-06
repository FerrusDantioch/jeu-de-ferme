/**
 * animaux.js — dessine les animaux (poule, vache, mouton) en formes simples.
 *
 * Chaque animal regarde vers +z. Ses pièces animées sont nommées :
 *  - 'corps' (pour un petit rebond), 'tete' (pour picorer ou brouter),
 *  - 'patte0', 'patte1'… (pour marcher).
 */
import * as THREE from 'three'
import { materiau, PALETTE } from './materiaux.js'
import { boite, boule } from './formes.js'

const OMBRE = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.16, depthWrite: false })

function ombreRonde(rayon) {
  const o = new THREE.Mesh(new THREE.CircleGeometry(rayon, 14), OMBRE)
  o.rotation.x = -Math.PI / 2
  o.position.y = 0.01
  return o
}

/** Une patte accrochée en haut (pour pouvoir la balancer). */
function patte(largeur, hauteur, couleur, x, y, z, nom) {
  const attache = new THREE.Group()
  attache.position.set(x, y, z)
  const p = boite(largeur, hauteur, largeur, couleur, 0, -hauteur, 0)
  attache.add(p)
  attache.name = nom
  return attache
}

export function creerPoule() {
  const g = new THREE.Group()
  const corps = new THREE.Group()
  corps.name = 'corps'
  g.add(corps)
  const ventre = boule(0.2, PALETTE.blanc, 0, 0.32, 0, 1)
  ventre.scale.set(0.9, 0.85, 1.1)
  corps.add(ventre)
  const queue = boule(0.1, PALETTE.blanc, 0, 0.42, -0.2)
  queue.scale.set(0.6, 1.2, 0.8)
  corps.add(queue)
  for (const cote of [-1, 1]) {
    const aile = boule(0.1, PALETTE.murCreme, cote * 0.17, 0.33, -0.02)
    aile.scale.set(0.4, 0.8, 1.2)
    corps.add(aile)
  }
  const tete = new THREE.Group()
  tete.name = 'tete'
  tete.position.set(0, 0.5, 0.14)
  tete.add(boule(0.11, PALETTE.blanc, 0, 0, 0, 1))
  tete.add(boite(0.03, 0.08, 0.12, PALETTE.tomate, 0, 0.08, 0)) // crête
  const bec = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.08, 4), materiau(PALETTE.fleurJaune))
  bec.rotation.x = Math.PI / 2
  bec.position.set(0, -0.01, 0.12)
  tete.add(bec)
  tete.add(boule(0.025, PALETTE.tomate, 0, -0.07, 0.08)) // barbillon
  for (const cote of [-1, 1]) {
    const oeil = new THREE.Mesh(new THREE.SphereGeometry(0.018, 5, 4), materiau(PALETTE.noir))
    oeil.position.set(cote * 0.075, 0.02, 0.07)
    tete.add(oeil)
  }
  corps.add(tete)
  g.add(patte(0.03, 0.17, PALETTE.citrouille, -0.06, 0.17, 0, 'patte0'))
  g.add(patte(0.03, 0.17, PALETTE.citrouille, 0.06, 0.17, 0, 'patte1'))
  g.add(ombreRonde(0.22))
  return g
}

export function creerVache() {
  const g = new THREE.Group()
  const corps = new THREE.Group()
  corps.name = 'corps'
  g.add(corps)
  corps.add(boite(0.62, 0.55, 1.15, PALETTE.blanc, 0, 0.5, 0))
  // Taches noires.
  for (const [x, y, z, l, h, p] of [
    [0.31, 0.7, 0.1, 0.02, 0.25, 0.35], [-0.31, 0.62, -0.2, 0.02, 0.22, 0.3], [0.1, 1.05, -0.25, 0.3, 0.02, 0.3],
  ]) corps.add(boite(l + 0.01, h, p, PALETTE.noir, x, y - h / 2, z))
  corps.add(boite(0.08, 0.35, 0.06, PALETTE.blanc, 0, 0.6, -0.6)) // queue
  const tete = new THREE.Group()
  tete.name = 'tete'
  tete.position.set(0, 0.85, 0.6)
  tete.add(boite(0.38, 0.38, 0.36, PALETTE.blanc, 0, -0.19, 0.05))
  tete.add(boite(0.36, 0.18, 0.12, PALETTE.joues, 0, -0.22, 0.25)) // museau rose
  for (const cote of [-1, 1]) {
    tete.add(boite(0.06, 0.12, 0.06, PALETTE.paille, cote * 0.15, 0.17, 0)) // cornes
    const oreille = boite(0.14, 0.06, 0.08, PALETTE.blanc, cote * 0.25, 0.05, 0)
    tete.add(oreille)
    const oeil = new THREE.Mesh(new THREE.SphereGeometry(0.03, 5, 4), materiau(PALETTE.noir))
    oeil.position.set(cote * 0.11, 0.05, 0.23)
    tete.add(oeil)
  }
  corps.add(tete)
  let n = 0
  for (const z of [0.4, -0.4]) for (const x of [-0.2, 0.2]) {
    g.add(patte(0.12, 0.3, PALETTE.blanc, x, 0.3, z, `patte${n++}`))
  }
  g.add(ombreRonde(0.6))
  return g
}

export function creerMouton() {
  const g = new THREE.Group()
  const corps = new THREE.Group()
  corps.name = 'corps'
  g.add(corps)
  // Laine : un nuage de boules blanches.
  for (const [x, y, z, r] of [
    [0, 0.5, 0, 0.3], [0.17, 0.52, 0.18, 0.2], [-0.17, 0.52, 0.18, 0.2], [0.17, 0.52, -0.2, 0.2],
    [-0.17, 0.52, -0.2, 0.2], [0, 0.68, 0, 0.22], [0, 0.55, -0.32, 0.17],
  ]) corps.add(boule(r, PALETTE.tissuBlanc, x, y, z))
  const tete = new THREE.Group()
  tete.name = 'tete'
  tete.position.set(0, 0.62, 0.34)
  tete.add(boite(0.22, 0.24, 0.24, PALETTE.toitArdoise, 0, -0.12, 0.05))
  tete.add(boule(0.1, PALETTE.tissuBlanc, 0, 0.12, 0)) // toupet
  for (const cote of [-1, 1]) {
    const oreille = boite(0.14, 0.05, 0.07, PALETTE.toitArdoise, cote * 0.16, -0.02, 0.02)
    oreille.rotation.z = -cote * 0.4
    tete.add(oreille)
    const oeil = new THREE.Mesh(new THREE.SphereGeometry(0.022, 5, 4), materiau(PALETTE.blanc))
    oeil.position.set(cote * 0.07, 0.01, 0.17)
    tete.add(oeil)
  }
  corps.add(tete)
  let n = 0
  for (const z of [0.18, -0.18]) for (const x of [-0.12, 0.12]) {
    g.add(patte(0.07, 0.3, PALETTE.toitArdoise, x, 0.3, z, `patte${n++}`))
  }
  g.add(ombreRonde(0.4))
  return g
}

export const FABRIQUES_ANIMAUX = { poule: creerPoule, vache: creerVache, mouton: creerMouton }
