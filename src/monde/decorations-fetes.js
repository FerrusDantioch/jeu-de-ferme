/**
 * decorations-fetes.js — les décorations de la ferme pendant les fêtes
 * (voir src/donnees/fetes.js pour le calendrier).
 *
 *  - 'oeufs'       : des œufs colorés cachés près des arbres (chasse aux œufs de Pâques) ;
 *  - 'sapin'       : un sapin décoré et des cadeaux près de la maison ;
 *  - 'citrouilles' : des citrouilles souriantes le long des chemins ;
 *  - 'coeurs'      : des cœurs roses sur des piquets ;
 *  - 'guirlandes'  : des fanions colorés au-dessus de la grande allée.
 */
import * as THREE from 'three'
import { materiau, PALETTE } from '../modeles/materiaux.js'
import { boite, boule, cylindre, MATERIAU_INVISIBLE } from '../modeles/formes.js'
import { fusionnerParMateriau } from '../modeles/fusion.js'

// Où sont cachés les œufs de Pâques (près des arbres) : [x, z].
export const CACHETTES_OEUFS = [
  [-15.8, -7.6], [3.3, 9.2], [-5.7, 11.8], [13.8, 4.9], [-12.8, 8.4], [0.2, -11.9], [16.4, 6.4], [5.8, 11.8],
]
const COULEURS_OEUFS = [PALETTE.fleurRose, PALETTE.fleurJaune, PALETTE.tissuBleu, PALETTE.fleurViolette, PALETTE.chou]

function oeufDePaques(n) {
  const g = new THREE.Group()
  const coquille = boule(0.16, COULEURS_OEUFS[n % COULEURS_OEUFS.length], 0, 0.2, 0, 1)
  coquille.scale.set(0.8, 1.1, 0.8)
  g.add(coquille)
  const bande = cylindre(0.13, 0.05, COULEURS_OEUFS[(n + 2) % COULEURS_OEUFS.length], 0, 0.17, 0, 10)
  g.add(bande)
  return g
}

function sapin() {
  const g = new THREE.Group()
  g.add(cylindre(0.15, 0.5, PALETTE.tronc, 0, 0, 0, 6))
  const etages = [[1.0, 1.0, 0.4], [0.8, 0.9, 1.0], [0.55, 0.8, 1.55]]
  for (const [r, h, y] of etages) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), materiau(PALETTE.feuillage))
    cone.position.y = y + h / 2
    cone.castShadow = true
    g.add(cone)
  }
  const couleurs = [PALETTE.tomate, PALETTE.fleurJaune, PALETTE.tissuBleu, PALETTE.fleurRose]
  for (let k = 0; k < 12; k++) {
    const a = k * 2.4
    const y = 0.6 + (k % 4) * 0.4
    const r = 0.95 - (y - 0.5) * 0.35
    g.add(boule(0.07, couleurs[k % couleurs.length], Math.cos(a) * r, y, Math.sin(a) * r))
  }
  const etoile = boule(0.14, PALETTE.fleurJaune, 0, 2.45, 0)
  g.add(etoile)
  for (const [x, z, c] of [[0.9, 0.6, PALETTE.tomate], [-0.8, 0.7, PALETTE.tissuBleu], [0.2, 1.0, PALETTE.chou]]) {
    g.add(boite(0.4, 0.3, 0.4, c, x, 0, z))
    g.add(boite(0.42, 0.05, 0.1, PALETTE.fleurJaune, x, 0.3, z))
  }
  return g
}

function citrouilleSouriante() {
  const g = new THREE.Group()
  const fruit = boule(0.32, PALETTE.citrouille, 0, 0.25, 0, 1)
  fruit.scale.y = 0.8
  g.add(fruit)
  g.add(cylindre(0.04, 0.12, PALETTE.tronc, 0, 0.48, 0, 5))
  for (const x of [-0.11, 0.11]) g.add(boite(0.08, 0.08, 0.04, PALETTE.noir, x, 0.3, 0.29))
  g.add(boite(0.22, 0.05, 0.04, PALETTE.noir, 0, 0.17, 0.29))
  return g
}

function coeurSurPiquet() {
  const g = new THREE.Group()
  g.add(boite(0.08, 1.1, 0.08, PALETTE.boisClair))
  const coeur = new THREE.Group()
  coeur.add(boule(0.13, PALETTE.fleurRose, -0.09, 0.08, 0, 1))
  coeur.add(boule(0.13, PALETTE.fleurRose, 0.09, 0.08, 0, 1))
  const pointe = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.28, 4), materiau(PALETTE.fleurRose))
  pointe.rotation.z = Math.PI
  pointe.position.y = -0.08
  coeur.add(pointe)
  coeur.position.y = 1.25
  g.add(coeur)
  return g
}

/** Une guirlande de fanions entre deux poteaux (de x1 à x2, à la hauteur z). */
function guirlande(x1, x2, z, couleurs) {
  const g = new THREE.Group()
  for (const x of [x1, x2]) g.add(cylindre(0.06, 2.4, PALETTE.boisFonce, x, 0, z, 6))
  const longueur = x2 - x1
  const corde = boite(longueur, 0.02, 0.02, PALETTE.blanc, (x1 + x2) / 2, 2.2, z)
  g.add(corde)
  const nb = Math.floor(longueur / 0.35)
  for (let k = 1; k < nb; k++) {
    const x = x1 + (longueur * k) / nb
    const fanion = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 3), materiau(couleurs[k % couleurs.length]))
    fanion.rotation.z = Math.PI
    fanion.scale.z = 0.25
    fanion.position.set(x, 2.06, z)
    g.add(fanion)
  }
  return g
}

/**
 * Construit les décorations d'une fête.
 * @param {object} fete  la fête (voir src/donnees/fetes.js)
 * @param {GrilleChemin} grille  pour déclarer les obstacles (ex. : le sapin)
 * @param {string[]} oeufsTrouves  numéros des œufs déjà trouvés aujourd'hui (ils ne s'affichent pas)
 * @returns {{ groupe: THREE.Group, touchables: THREE.Object3D[], oeufs: Map }}
 */
export function creerDecorationsFete(fete, grille, oeufsTrouves = []) {
  const groupe = new THREE.Group()
  groupe.name = `fete-${fete.id}`
  const touchables = []
  const oeufs = new Map() // numéro → objet 3D
  const fixe = new THREE.Group() // ce qui ne bouge pas (fusionné pour aller plus vite)

  if (fete.decor === 'oeufs') {
    CACHETTES_OEUFS.forEach(([x, z], n) => {
      const oeuf = oeufDePaques(n)
      oeuf.position.set(x, 0, z)
      oeuf.rotation.y = n
      // Zone invisible plus grande que l'œuf : facile à toucher.
      const zone = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 6), MATERIAU_INVISIBLE)
      zone.position.y = 0.25
      zone.userData.toucher = { type: 'oeufPaques', numero: String(n), objet: oeuf }
      oeuf.add(zone)
      oeuf.visible = !oeufsTrouves.includes(String(n))
      groupe.add(oeuf)
      touchables.push(zone)
      oeufs.set(String(n), oeuf)
    })
  } else if (fete.decor === 'sapin') {
    const s = sapin()
    s.position.set(-1.6, 0, -9.8)
    fixe.add(s)
    grille.bloquerCercle(-1.6, -9.8, 0.9, 0.3)
  } else if (fete.decor === 'citrouilles') {
    for (const [x, z, a] of [[-4.4, -7.9, 0], [-7.6, -7.9, 0], [5.4, -7.3, 0], [-9.6, 5.9, 0], [1.6, 2.5, -0.4], [-1.6, 12.5, 0.4], [8.8, 15.3, 0]]) {
      const c = citrouilleSouriante()
      c.position.set(x, 0, z)
      c.rotation.y = a
      fixe.add(c)
    }
  } else if (fete.decor === 'coeurs') {
    for (const [x, z] of [[-1.5, 1], [1.5, 1], [-1.5, 6], [1.5, 6], [-1.5, 11], [1.5, 11], [8.2, -4.4], [8.2, 2.4]]) {
      const c = coeurSurPiquet()
      c.position.set(x, 0, z)
      fixe.add(c)
    }
  } else if (fete.decor === 'guirlandes') {
    const couleurs = fete.couleurs || [PALETTE.fleurRose, PALETTE.fleurJaune, PALETTE.tissuBleu]
    for (const z of [0.5, 5.5, 10.5, 15]) fixe.add(guirlande(-1.6, 1.6, z, couleurs))
  }

  if (fixe.children.length) groupe.add(fusionnerParMateriau(fixe))
  return { groupe, touchables, oeufs }
}
