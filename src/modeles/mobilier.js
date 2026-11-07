/**
 * mobilier.js — les meubles et objets des intérieurs.
 * Chaque fonction renvoie un groupe posé au sol, face vers +z (vers la caméra).
 */
import * as THREE from 'three'
import { PALETTE } from './materiaux.js'
import { boite, boule, cylindre } from './formes.js'

/** Un lit avec couverture et oreiller. Tête de lit vers -z. */
export function creerLit() {
  const g = new THREE.Group()
  g.add(boite(1.3, 0.35, 2.1, PALETTE.boisFonce))
  g.add(boite(1.2, 0.2, 2.0, PALETTE.tissuBlanc, 0, 0.35, 0))
  g.add(boite(1.24, 0.08, 1.4, PALETTE.tapisRose, 0, 0.52, 0.3)) // couverture
  g.add(boite(0.8, 0.14, 0.4, PALETTE.tissuBlanc, 0, 0.55, -0.72)) // oreiller
  g.add(boite(1.3, 0.9, 0.12, PALETTE.boisFonce, 0, 0, -1.04)) // tête de lit
  return g
}

/** Un fauteuil moelleux. Le dossier est vers -z (on s'y assoit en regardant vers +z). */
export function creerFauteuil(couleur = PALETTE.tissuBleu) {
  const g = new THREE.Group()
  g.add(boite(0.8, 0.3, 0.75, PALETTE.boisFonce, 0, 0.05, 0))
  g.add(boite(0.7, 0.12, 0.65, couleur, 0, 0.33, 0.03)) // coussin
  g.add(boite(0.8, 0.6, 0.18, couleur, 0, 0.35, -0.3)) // dossier
  for (const x of [-0.36, 0.36]) g.add(boite(0.12, 0.28, 0.7, couleur, x, 0.35, 0)) // accoudoirs
  for (const x of [-0.32, 0.32]) for (const z of [-0.28, 0.28]) g.add(boite(0.08, 0.05, 0.08, PALETTE.boisFonce, x, 0, z))
  g.add(boite(0.36, 0.22, 0.08, PALETTE.tapisRose, 0, 0.5, -0.17)) // petit coussin
  return g
}

/** Une table ronde. */
export function creerTable(rayon = 0.6) {
  const g = new THREE.Group()
  g.add(cylindre(rayon, 0.08, PALETTE.bois, 0, 0.72, 0, 10))
  g.add(cylindre(0.08, 0.72, PALETTE.boisFonce, 0, 0, 0, 6))
  g.add(cylindre(0.3, 0.05, PALETTE.boisFonce, 0, 0, 0, 8))
  return g
}

/** Une chaise. Le dossier est vers -z. */
export function creerChaise() {
  const g = new THREE.Group()
  g.add(boite(0.45, 0.06, 0.45, PALETTE.bois, 0, 0.45, 0))
  g.add(boite(0.45, 0.5, 0.06, PALETTE.bois, 0, 0.5, -0.2))
  for (const x of [-0.18, 0.18]) for (const z of [-0.18, 0.18]) g.add(boite(0.06, 0.45, 0.06, PALETTE.boisFonce, x, 0, z))
  return g
}

/** Un tapis rectangulaire (au sol, ne bloque pas le passage). */
export function creerTapis(l, p, couleur = PALETTE.tapisRose) {
  const g = new THREE.Group()
  g.add(boite(l, 0.02, p, couleur, 0, 0.005, 0))
  g.add(boite(l * 0.75, 0.025, p * 0.7, PALETTE.tissuBlanc, 0, 0.006, 0))
  g.add(boite(l * 0.6, 0.03, p * 0.5, couleur, 0, 0.007, 0))
  return g
}

/** Une étagère avec des objets colorés (bocaux, livres…). */
export function creerEtagere(l = 1.6, couleurs = [PALETTE.tomate, PALETTE.fleurJaune, PALETTE.tissuBleu, PALETTE.chou]) {
  const g = new THREE.Group()
  const h = 1.9
  g.add(boite(l, h, 0.08, PALETTE.boisFonce, 0, 0, -0.2))
  for (const x of [-l / 2, l / 2]) g.add(boite(0.08, h, 0.45, PALETTE.boisFonce, x, 0, 0))
  let k = 0
  for (const y of [0.1, 0.65, 1.2, 1.75]) {
    g.add(boite(l, 0.06, 0.45, PALETTE.bois, 0, y, 0))
    if (y > 1.7) continue
    for (let x = -l / 2 + 0.25; x < l / 2 - 0.1; x += 0.3) {
      const couleur = couleurs[k++ % couleurs.length]
      g.add(cylindre(0.1, 0.3, couleur, x, y + 0.06, 0, 7))
    }
  }
  return g
}

/** Une cheminée en pierre avec un petit feu (contre le mur du fond). */
export function creerCheminee() {
  const g = new THREE.Group()
  g.add(boite(1.6, 1.3, 0.6, PALETTE.pierre))
  g.add(boite(1.0, 0.8, 0.3, PALETTE.noir, 0, 0, 0.18))
  g.add(boite(1.8, 0.12, 0.7, PALETTE.boisFonce, 0, 1.3, 0)) // le dessus
  g.add(boite(0.9, 1.4, 0.45, PALETTE.pierre, 0, 1.42, -0.08)) // le conduit
  // Bûches et petites flammes (formes immobiles, pas de clignotement).
  g.add(boite(0.6, 0.1, 0.1, PALETTE.tronc, 0, 0.02, 0.25))
  g.add(boule(0.13, PALETTE.citrouille, -0.1, 0.22, 0.25))
  g.add(boule(0.1, PALETTE.fleurJaune, 0.1, 0.2, 0.26))
  return g
}

/** Un petit meuble de cuisine avec plan de travail et évier. */
export function creerCuisine(l = 2.0) {
  const g = new THREE.Group()
  g.add(boite(l, 0.85, 0.6, PALETTE.tissuBleu))
  g.add(boite(l + 0.05, 0.06, 0.65, PALETTE.boisClair, 0, 0.85, 0))
  g.add(boite(0.5, 0.04, 0.35, PALETTE.metal, -l * 0.25, 0.9, 0))
  for (const x of [-l / 4, l / 4]) g.add(boite(0.06, 0.06, 0.04, PALETTE.blanc, x, 0.6, 0.31)) // poignées
  g.add(cylindre(0.15, 0.18, PALETTE.pot, l * 0.25, 0.91, 0, 8)) // une casserole
  return g
}

/** Une plante en pot. */
export function creerPlante(taille = 1) {
  const g = new THREE.Group()
  g.add(cylindre(0.2 * taille, 0.32 * taille, PALETTE.pot, 0, 0, 0, 7))
  g.add(boule(0.32 * taille, PALETTE.feuillage, 0, 0.6 * taille, 0))
  g.add(boule(0.22 * taille, PALETTE.feuillageClair, 0.12 * taille, 0.85 * taille, 0.05))
  return g
}

/** Une fenêtre vue de l'intérieur, à accrocher au mur du fond. */
export function creerFenetreInterieure(l = 1.1, h = 1.0) {
  const g = new THREE.Group()
  g.add(boite(l + 0.16, h + 0.16, 0.06, PALETTE.blanc, 0, -0.08, 0))
  g.add(boite(l, h, 0.08, PALETTE.vitre, 0, 0, 0.01))
  g.add(boite(0.05, h, 0.1, PALETTE.blanc, 0, 0, 0.01))
  g.add(boite(l, 0.05, 0.1, PALETTE.blanc, 0, h / 2, 0.01))
  // Rideaux.
  for (const x of [-l / 2 - 0.05, l / 2 + 0.05]) g.add(boite(0.22, h + 0.2, 0.06, PALETTE.tapisRose, x, -0.15, 0.06))
  return g
}

/** Une botte de foin. */
export function creerBotteDeFoin() {
  const g = new THREE.Group()
  g.add(boite(1.0, 0.55, 0.6, PALETTE.foin))
  g.add(boite(1.02, 0.05, 0.62, PALETTE.paillasse, 0, 0.15, 0))
  g.add(boite(1.02, 0.05, 0.62, PALETTE.paillasse, 0, 0.38, 0))
  return g
}

/** Une stalle (box d'animal) : deux cloisons basses et une mangeoire au fond. */
export function creerStalle(l = 2.2, p = 2.4) {
  const g = new THREE.Group()
  for (const x of [-l / 2, l / 2]) g.add(boite(0.12, 1.1, p, PALETTE.bois, x, 0, 0))
  g.add(boite(l - 0.3, 0.45, 0.5, PALETTE.boisFonce, 0, 0, -p / 2 + 0.3)) // mangeoire
  g.add(boite(l - 0.4, 0.08, 0.4, PALETTE.foin, 0, 0.42, -p / 2 + 0.3))
  return g
}

/** Un seau en métal. */
export function creerSeau() {
  const g = new THREE.Group()
  g.add(cylindre(0.2, 0.35, PALETTE.metal, 0, 0, 0, 8))
  g.add(cylindre(0.16, 0.02, PALETTE.eau, 0, 0.34, 0, 8))
  return g
}

/** Une lanterne posée (lumière douce, sans clignotement). */
export function creerLanterne() {
  const g = new THREE.Group()
  g.add(boite(0.22, 0.04, 0.22, PALETTE.noir))
  g.add(boite(0.16, 0.26, 0.16, PALETTE.fleurJaune, 0, 0.04, 0))
  g.add(boite(0.22, 0.04, 0.22, PALETTE.noir, 0, 0.3, 0))
  return g
}

/** Le comptoir de la boutique, avec une caisse et un panier. Face vers +z. */
export function creerComptoir(l = 3.6) {
  const g = new THREE.Group()
  g.add(boite(l, 1.0, 0.7, PALETTE.boisFonce))
  g.add(boite(l + 0.1, 0.07, 0.8, PALETTE.boisClair, 0, 1.0, 0))
  // Planches décoratives sur la face avant.
  for (let x = -l / 2 + 0.3; x < l / 2; x += 0.6) g.add(boite(0.05, 0.9, 0.02, PALETTE.bois, x, 0.05, 0.36))
  // Caisse enregistreuse.
  g.add(boite(0.5, 0.3, 0.4, PALETTE.toitVert, l * 0.3, 1.07, -0.05))
  g.add(boite(0.4, 0.1, 0.2, PALETTE.blanc, l * 0.3, 1.37, -0.1))
  // Panier de pommes.
  g.add(cylindre(0.26, 0.2, PALETTE.paille, -l * 0.3, 1.07, 0, 8))
  for (const [dx, dz] of [[-0.08, 0], [0.09, 0.04], [0, -0.09]]) g.add(boule(0.09, PALETTE.tomate, -l * 0.3 + dx, 1.3, dz))
  return g
}

/** Un sac de graines (bientôt en vente !). */
export function creerSac(couleur = PALETTE.paille) {
  const g = new THREE.Group()
  g.add(boite(0.45, 0.55, 0.32, couleur))
  g.add(boite(0.3, 0.1, 0.2, couleur, 0, 0.55, 0))
  g.add(boite(0.26, 0.2, 0.02, PALETTE.blanc, 0, 0.2, 0.17))
  return g
}

/** Un panier de légumes posé au sol. */
export function creerPanier(couleur = PALETTE.citrouille) {
  const g = new THREE.Group()
  g.add(cylindre(0.35, 0.3, PALETTE.paille, 0, 0, 0, 8))
  for (const [dx, dz] of [[-0.12, -0.05], [0.12, 0.05], [0, 0.14], [0.02, -0.14]]) g.add(boule(0.13, couleur, dx, 0.36, dz))
  return g
}

/** Une caisse en bois. */
export function creerCaisse(taille = 0.6) {
  const g = new THREE.Group()
  g.add(boite(taille, taille, taille, PALETTE.boisClair))
  g.add(boite(taille + 0.02, 0.08, taille + 0.02, PALETTE.bois, 0, taille * 0.15, 0))
  g.add(boite(taille + 0.02, 0.08, taille + 0.02, PALETTE.bois, 0, taille * 0.75, 0))
  return g
}
