/**
 * geometries.js — les formes de base du jeu, en version « douce ».
 *
 * Tout le décor, les personnages et les animaux sont fabriqués avec des formes simples
 * de Three.js (boîtes, cylindres, boules…). Au départ, elles avaient très peu de faces :
 * c'est le style « low-poly », avec des facettes et des angles bien visibles.
 *
 * Pour un rendu plus doux et plus rond, tout le jeu passe par les fonctions ci-dessous,
 * qui fabriquent les mêmes formes, aux mêmes tailles, mais :
 *  - avec plus de faces (les cylindres et les boules deviennent bien ronds) ;
 *  - des boîtes aux coins et aux arêtes arrondis ;
 *  - (et, dans materiaux.js, un éclairage lissé au lieu des facettes).
 *
 * 👉 Pour revenir à l'ancien style à facettes : mettre FORMES_DOUCES à false dans src/config.js.
 *
 * Les paramètres sont exactement ceux de Three.js : on peut donc écrire geoBoite(l, h, p)
 * là où l'on écrivait new THREE.BoxGeometry(l, h, p).
 */
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { FORMES_DOUCES } from '../config.js'

// Finesse selon la taille : un petit objet (une main, une fleur, un œil) n'a pas besoin
// d'autant de faces qu'un gros (un feuillage d'arbre) pour paraître rond. Cela garde le
// jeu fluide sur tablette (moins de petits triangles à dessiner).
const PETIT = 0.12 // en mètres : en dessous, un objet est « petit »

// Nombre minimum de côtés d'un cylindre ou d'un cône (au-delà, l'œil voit un rond).
const COTES_MINIMUM = { petit: 10, grand: 16 }
// Finesse des boules (icosaèdre) : niveau 1 = 80 faces, niveau 2 = 320 faces.
const DETAIL_BOULE = { petit: 1, grand: 2 }
// Arrondi des boîtes : une fraction de leur plus petit côté, sans dépasser un plafond (en mètres).
const ARRONDI_BOITE = 0.22
const ARRONDI_MAXIMUM = 0.08
// En dessous de cette épaisseur, une boîte reste à angles droits (une planche fine,
// une vitre : l'arrondi ne se verrait pas et coûterait des faces pour rien).
const EPAISSEUR_MINIMUM = 0.06

/** Plus de côtés pour les formes rondes (sans jamais en enlever). */
const cotes = (n = 8, r = 1) => Math.max(n, r < PETIT ? COTES_MINIMUM.petit : COTES_MINIMUM.grand)

/** Une boîte, aux coins arrondis. */
export function geoBoite(l = 1, h = 1, p = 1) {
  const petit = Math.min(l, h, p)
  if (!FORMES_DOUCES || petit < EPAISSEUR_MINIMUM) return new THREE.BoxGeometry(l, h, p)
  // « 1 » = un seul pan incliné par arrondi : un biseau, que l'éclairage lissé rend tout doux.
  return new RoundedBoxGeometry(l, h, p, 1, Math.min(petit * ARRONDI_BOITE, ARRONDI_MAXIMUM))
}

/** Un cylindre (même ordre de paramètres que THREE.CylinderGeometry). */
export function geoCylindre(rHaut, rBas, h, nbCotes, ...autres) {
  return new THREE.CylinderGeometry(rHaut, rBas, h, FORMES_DOUCES ? cotes(nbCotes, Math.max(rHaut, rBas)) : nbCotes, ...autres)
}

/** Un cône (même ordre de paramètres que THREE.ConeGeometry). */
export function geoCone(r, h, nbCotes, ...autres) {
  return new THREE.ConeGeometry(r, h, FORMES_DOUCES ? cotes(nbCotes, r) : nbCotes, ...autres)
}

/**
 * Une boule. Dans l'ancien style, c'était un icosaèdre (20 facettes au « niveau 0 »).
 * En style doux, c'est une boule bien ronde.
 */
export function geoIcosaedre(r = 1, details = 0) {
  if (!FORMES_DOUCES) return new THREE.IcosahedronGeometry(r, details)
  return new THREE.IcosahedronGeometry(r, Math.max(details, r < PETIT ? DETAIL_BOULE.petit : DETAIL_BOULE.grand))
}

/** Un dodécaèdre (les rochers) : en style doux, un galet arrondi (niveau 1 : assez rond une fois lissé). */
export function geoDodecaedre(r = 1, details = 0) {
  return new THREE.DodecahedronGeometry(r, FORMES_DOUCES ? Math.max(details, 1) : details)
}

/** Une sphère (ou un morceau de sphère, comme un chapeau). */
export function geoSphere(r, largeur = 8, hauteur = 6, ...autres) {
  if (!FORMES_DOUCES) return new THREE.SphereGeometry(r, largeur, hauteur, ...autres)
  const petit = r < PETIT
  return new THREE.SphereGeometry(r, Math.max(largeur, petit ? 12 : 24), Math.max(hauteur, petit ? 8 : 12), ...autres)
}

/** Un disque plat (ombres au sol, assiettes…). */
export function geoDisque(r, nbCotes = 8, ...autres) {
  return new THREE.CircleGeometry(r, FORMES_DOUCES ? Math.max(nbCotes, r < PETIT ? 12 : 32) : nbCotes, ...autres)
}

/** Un anneau (l'arche de fleurs). */
export function geoTore(r, epaisseur, nbCotesTube = 8, nbCotesAnneau = 12, ...autres) {
  if (!FORMES_DOUCES) return new THREE.TorusGeometry(r, epaisseur, nbCotesTube, nbCotesAnneau, ...autres)
  return new THREE.TorusGeometry(r, epaisseur, Math.max(nbCotesTube, 10), Math.max(nbCotesAnneau, 32), ...autres)
}
