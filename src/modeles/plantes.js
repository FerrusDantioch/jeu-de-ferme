/**
 * plantes.js — dessine les plantes du potager, à chaque étape de leur pousse.
 *
 *  stade 0 : la graine (une petite butte de terre) ;
 *  stade 1 : une petite pousse (deux feuilles) ;
 *  stade 2 : une jeune plante (plus de feuilles, propre à chaque culture) ;
 *  stade 3 : prête à récolter (on voit le légume ou le fruit).
 *
 * Chaque fonction renvoie un groupe posé au sol, centré.
 */
import * as THREE from 'three'
import { materiau, PALETTE } from './materiaux.js'
import { boite, boule, cylindre } from './formes.js'

const VERT = PALETTE.feuillage
const VERT_CLAIR = PALETTE.feuillageClair

/** Une feuille : une petite boule aplatie et penchée. */
function feuille(taille, angle, couleur = VERT_CLAIR, hauteur = 0.1) {
  const f = boule(taille, couleur, Math.sin(angle) * taille * 0.8, hauteur, Math.cos(angle) * taille * 0.8)
  f.scale.set(0.6, 0.35, 1.2)
  f.rotation.y = angle
  f.rotation.x = 0.5
  return f
}

/** Une touffe de n feuilles en rond. */
function touffe(n, taille, couleur, hauteur) {
  const g = new THREE.Group()
  for (let k = 0; k < n; k++) g.add(feuille(taille, (k / n) * Math.PI * 2 + 0.3, couleur, hauteur))
  return g
}

// --- Les stades communs ---

function graine() {
  const g = new THREE.Group()
  const butte = boule(0.12, PALETTE.tronc, 0, 0, 0)
  butte.scale.y = 0.4
  g.add(butte)
  return g
}

function pousse() {
  const g = new THREE.Group()
  g.add(cylindre(0.015, 0.12, VERT, 0, 0, 0, 4))
  g.add(feuille(0.07, 0.8, VERT_CLAIR, 0.13))
  g.add(feuille(0.07, -2.3, VERT_CLAIR, 0.13))
  return g
}

// --- Jeunes plantes et plantes prêtes, culture par culture ---

const FORMES = {
  salade(stade) {
    const g = new THREE.Group()
    if (stade === 2) {
      g.add(touffe(5, 0.1, VERT_CLAIR, 0.06))
    } else {
      g.add(touffe(7, 0.16, PALETTE.chou, 0.08))
      g.add(boule(0.14, PALETTE.feuillageClair, 0, 0.14, 0, 1))
    }
    return g
  },
  carotte(stade) {
    const g = new THREE.Group()
    const taille = stade === 2 ? 0.09 : 0.13
    g.add(touffe(4, taille, VERT, 0.18))
    for (let k = 0; k < 4; k++) g.add(cylindre(0.01, 0.18, VERT, Math.sin(k * 1.6) * 0.04, 0, Math.cos(k * 1.6) * 0.04, 3))
    if (stade === 3) {
      const racine = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 6), materiau(PALETTE.citrouille))
      racine.rotation.x = Math.PI
      racine.position.y = 0.02
      racine.castShadow = true
      g.add(racine)
    }
    return g
  },
  fraise(stade) {
    const g = new THREE.Group()
    g.add(touffe(6, stade === 2 ? 0.1 : 0.13, VERT, 0.09))
    if (stade === 3) {
      for (const [x, z] of [[0.12, 0.05], [-0.1, 0.1], [0.02, -0.13], [-0.08, -0.06]]) {
        g.add(boule(0.045, PALETTE.tomate, x, 0.07, z))
      }
    }
    return g
  },
  tomate(stade) {
    const g = new THREE.Group()
    const h = stade === 2 ? 0.45 : 0.7
    g.add(boite(0.03, h + 0.1, 0.03, PALETTE.bois, 0.08, 0, 0)) // tuteur
    g.add(cylindre(0.02, h, VERT, 0, 0, 0, 4))
    g.add(boule(0.15, VERT, 0, h * 0.55, 0))
    g.add(boule(0.12, VERT_CLAIR, 0.04, h * 0.9, 0.02))
    if (stade === 3) {
      for (const [x, y, z] of [[0.12, 0.35, 0.08], [-0.1, 0.5, 0.1], [0.06, 0.6, -0.12], [-0.08, 0.28, -0.06]]) {
        g.add(boule(0.06, PALETTE.tomate, x, y, z))
      }
    }
    return g
  },
  mais(stade) {
    const g = new THREE.Group()
    const h = stade === 2 ? 0.6 : 1.1
    g.add(cylindre(0.03, h, VERT, 0, 0, 0, 5))
    for (let k = 0; k < (stade === 2 ? 3 : 5); k++) {
      const f = feuille(0.14, k * 2.1, VERT_CLAIR, 0.15 + k * (h / 6))
      g.add(f)
    }
    if (stade === 3) {
      const epi = boule(0.06, PALETTE.fleurJaune, 0.07, h * 0.6, 0)
      epi.scale.y = 2.4
      g.add(epi)
      g.add(boite(0.03, 0.12, 0.03, PALETTE.paille, 0, h, 0)) // la fleur en haut
    }
    return g
  },
  citrouille(stade) {
    const g = new THREE.Group()
    g.add(touffe(5, stade === 2 ? 0.14 : 0.2, VERT, 0.06))
    if (stade === 3) {
      const fruit = boule(0.24, PALETTE.citrouille, 0, 0.17, 0.05, 1)
      fruit.scale.y = 0.75
      g.add(fruit)
      g.add(cylindre(0.025, 0.08, PALETTE.tronc, 0, 0.33, 0.05, 5))
    }
    return g
  },
}

/**
 * Renvoie le modèle d'une plante.
 * @param {string} modele  ex. : 'carotte' (voir src/donnees/cultures.js)
 * @param {number} stade   0, 1, 2 ou 3
 */
export function creerPlante(modele, stade) {
  if (stade <= 0) return graine()
  if (stade === 1) return pousse()
  const fabrique = FORMES[modele] || FORMES.salade
  return fabrique(stade)
}
