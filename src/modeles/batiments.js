/**
 * batiments.js — fabrique les bâtiments vus de l'extérieur.
 *
 * Chaque fonction renvoie un groupe posé au sol, centré, avec la PORTE VERS L'AVANT
 * (vers la caméra, côté +z). Les dimensions viennent de src/donnees/ferme.js.
 */
import * as THREE from 'three'
import { PALETTE, MATERIAU_VITRE } from './materiaux.js'
import { boite, boule, pignon, toitDeuxPans } from './formes.js'

// --- Petites pièces réutilisées ---

/** Une fenêtre avec cadre blanc, vitre et croisillons. Face vers +z. */
function fenetre(l = 0.9, h = 0.85) {
  const g = new THREE.Group()
  g.add(boite(l + 0.16, h + 0.16, 0.08, PALETTE.blanc, 0, -0.08, 0))
  g.add(boite(l, h, 0.1, MATERIAU_VITRE, 0, 0, 0.01)) // la vitre (s'allume le soir)
  g.add(boite(0.06, h, 0.12, PALETTE.blanc, 0, 0, 0.01))
  g.add(boite(l, 0.06, 0.12, PALETTE.blanc, 0, h / 2 - 0.03, 0.01))
  return g
}

/** Une jardinière fleurie (à poser sous une fenêtre). Face vers +z. */
function jardiniere(l = 1.0, couleurs = [PALETTE.fleurRose, PALETTE.fleurJaune, PALETTE.fleurBlanche]) {
  const g = new THREE.Group()
  g.add(boite(l, 0.22, 0.26, PALETTE.boisFonce, 0, 0, 0.13))
  const n = 4
  for (let k = 0; k < n; k++) {
    const x = -l / 2 + (l / n) * (k + 0.5)
    g.add(boule(0.09, PALETTE.feuillage, x, 0.26, 0.13))
    g.add(boule(0.07, couleurs[k % couleurs.length], x, 0.34, 0.15))
  }
  return g
}

/** Une porte simple avec cadre et poignée. Face vers +z, posée au sol. */
function porte(l = 1.1, h = 1.9, couleur = PALETTE.boisFonce) {
  const g = new THREE.Group()
  g.add(boite(l + 0.2, h + 0.1, 0.06, PALETTE.blanc, 0, 0, 0))
  g.add(boite(l, h, 0.12, couleur, 0, 0, 0.02))
  g.add(boite(l * 0.7, 0.05, 0.14, PALETTE.boisClair, 0, h * 0.35, 0.02))
  g.add(boite(l * 0.7, 0.05, 0.14, PALETTE.boisClair, 0, h * 0.7, 0.02))
  g.add(boule(0.06, PALETTE.paille, l * 0.32, h * 0.5, 0.1))
  return g
}

/** Place un objet sur la face avant (+z) d'un bâtiment de profondeur p. */
function surFaceAvant(objet, p, x, y) {
  objet.position.set(x, y, p / 2 + 0.02)
  return objet
}

/** Place un objet sur une face de côté (cote = -1 gauche, +1 droite) d'un bâtiment de largeur l. */
function surFaceCote(objet, l, cote, z, y) {
  objet.position.set((cote * l) / 2 + cote * 0.02, y, z)
  objet.rotation.y = (cote * Math.PI) / 2
  return objet
}

/** Panneau avec un texte écrit dessus (dessiné dans une petite image). */
function panneauTexte(texte, l, h, fond = '#fff6dc', couleur = '#7a4b2a') {
  const toile = document.createElement('canvas')
  toile.width = 512
  toile.height = Math.round((512 * h) / l)
  const ctx = toile.getContext('2d')
  ctx.fillStyle = fond
  ctx.fillRect(0, 0, toile.width, toile.height)
  ctx.fillStyle = couleur
  ctx.font = `bold ${Math.round(toile.height * 0.62)}px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(texte, toile.width / 2, toile.height / 2 + 4)
  const texture = new THREE.CanvasTexture(toile)
  texture.colorSpace = THREE.SRGBColorSpace
  const g = new THREE.Group()
  g.add(boite(l + 0.14, h + 0.14, 0.08, PALETTE.boisFonce, 0, -0.07, 0))
  const face = new THREE.Mesh(new THREE.PlaneGeometry(l, h), new THREE.MeshLambertMaterial({ map: texture }))
  face.position.set(0, h / 2, 0.045)
  g.add(face)
  return g
}

// --- Les bâtiments ---

/** La maison du joueur : murs crème, toit de tuiles, cheminée, fenêtres fleuries. */
export function creerMaison({ largeur: l = 6, profondeur: p = 5 } = {}) {
  const g = new THREE.Group()
  const hMur = 2.6
  const hToit = 1.8
  g.add(boite(l + 0.2, 0.3, p + 0.2, PALETTE.pierre))
  g.add(boite(l, hMur, p, PALETTE.murCreme))
  g.add(pignon(l, hToit, p, PALETTE.murCreme, hMur))
  g.add(toitDeuxPans(l, p, hMur, hToit, PALETTE.toitTuile))
  g.add(boite(0.6, 1.7, 0.6, PALETTE.brique, l * 0.27, hMur + 0.3, -p * 0.18)) // cheminée
  g.add(surFaceAvant(porte(), p, 0, 0))
  for (const x of [-l * 0.31, l * 0.31]) {
    g.add(surFaceAvant(fenetre(), p, x, 1.15))
    g.add(surFaceAvant(jardiniere(), p, x, 0.8))
  }
  for (const cote of [-1, 1]) g.add(surFaceCote(fenetre(), l, cote, 0, 1.15))
  g.add(boite(1.6, 0.12, 0.6, PALETTE.pierre, 0, 0, p / 2 + 0.3)) // marche devant la porte
  return g
}

/** L'étable : la grande grange rouge, avec sa double porte à croisillons blancs. */
export function creerEtable({ largeur: l = 7, profondeur: p = 6 } = {}) {
  const g = new THREE.Group()
  const hMur = 3.0
  const hToit = 2.3
  g.add(boite(l + 0.2, 0.25, p + 0.2, PALETTE.pierre))
  g.add(boite(l, hMur, p, PALETTE.murRouge))
  g.add(pignon(l, hToit, p, PALETTE.murRouge, hMur))
  g.add(toitDeuxPans(l, p, hMur, hToit, PALETTE.toitArdoise, 0.4))
  // Coins blancs.
  for (const x of [-l / 2, l / 2]) for (const z of [-p / 2, p / 2]) g.add(boite(0.22, hMur, 0.22, PALETTE.blanc, x, 0, z))
  // Grande double porte avec un X blanc sur chaque battant.
  const lp = 1.25
  const hp = 2.4
  g.add(surFaceAvant(boite(lp * 2 + 0.3, hp + 0.15, 0.06, PALETTE.blanc), p, 0, 0))
  for (const cote of [-1, 1]) {
    const battant = new THREE.Group()
    battant.add(boite(lp, hp, 0.12, PALETTE.boisFonce))
    const diagonale = Math.hypot(lp, hp) - 0.1
    for (const sens of [-1, 1]) {
      const barre = boite(0.1, diagonale, 0.14, PALETTE.blanc, 0, 0, 0)
      barre.position.y = hp / 2
      barre.rotation.z = sens * Math.atan2(lp, hp)
      battant.add(barre)
    }
    battant.add(boite(lp, 0.1, 0.14, PALETTE.blanc, 0, hp / 2 - 0.05, 0))
    g.add(surFaceAvant(battant, p, cote * (lp / 2 + 0.02), 0))
  }
  // Petite porte du grenier à foin, en haut.
  g.add(surFaceAvant(boite(1.2, 1.0, 0.08, PALETTE.blanc), p, 0, hMur + 0.15))
  g.add(surFaceAvant(boite(1.0, 0.85, 0.12, PALETTE.boisFonce), p, 0, hMur + 0.22))
  for (const cote of [-1, 1]) {
    g.add(surFaceCote(fenetre(0.8, 0.7), l, cote, -p * 0.2, 1.4))
    g.add(surFaceCote(fenetre(0.8, 0.7), l, cote, p * 0.2, 1.4))
  }
  return g
}

/** La boutique : murs jaunes, store rayé, vitrine et enseigne. */
export function creerBoutique({ largeur: l = 5, profondeur: p = 4.5 } = {}) {
  const g = new THREE.Group()
  const hMur = 2.6
  const hToit = 1.5
  g.add(boite(l + 0.2, 0.25, p + 0.2, PALETTE.pierre))
  g.add(boite(l, hMur, p, PALETTE.murJaune))
  g.add(pignon(l, hToit, p, PALETTE.murJaune, hMur))
  g.add(toitDeuxPans(l, p, hMur, hToit, PALETTE.toitVert))
  g.add(surFaceAvant(porte(1.0, 1.9, PALETTE.toitVert), p, 0, 0))
  // Deux grandes vitrines.
  for (const x of [-l * 0.3, l * 0.3]) g.add(surFaceAvant(fenetre(1.1, 0.9), p, x, 0.95))
  // Store rayé rouge et blanc, légèrement penché.
  const store = new THREE.Group()
  const nbBandes = 9
  const lStore = l - 0.2
  for (let k = 0; k < nbBandes; k++) {
    const couleur = k % 2 === 0 ? PALETTE.rubanChapeau : PALETTE.blanc
    store.add(boite(lStore / nbBandes, 0.06, 1.0, couleur, -lStore / 2 + (lStore / nbBandes) * (k + 0.5), 0, 0.5))
  }
  store.position.set(0, 2.2, p / 2)
  store.rotation.x = 0.38
  g.add(store)
  // Enseigne sur le haut de la façade.
  const enseigne = panneauTexte('Boutique', 2.0, 0.5)
  enseigne.position.set(0, hMur + 0.25, p / 2 + 0.05)
  g.add(enseigne)
  // Cagettes de légumes devant les vitrines.
  for (const [x, couleur] of [[-l * 0.3, PALETTE.tomate], [l * 0.3, PALETTE.citrouille]]) {
    g.add(boite(0.8, 0.35, 0.4, PALETTE.boisClair, x, 0, p / 2 + 0.22))
    for (const dx of [-0.22, 0, 0.22]) g.add(boule(0.12, couleur, x + dx, 0.42, p / 2 + 0.22))
  }
  return g
}

/** Une petite chaumière de villageois (on ne peut pas y entrer). */
export function creerChaumiere({ largeur: l = 4, profondeur: p = 4, couleurToit = PALETTE.toitBleu, fleurs } = {}) {
  const g = new THREE.Group()
  const hMur = 2.2
  const hToit = 1.6
  g.add(boite(l + 0.2, 0.2, p + 0.2, PALETTE.pierre))
  g.add(boite(l, hMur, p, PALETTE.murBlanc))
  g.add(pignon(l, hToit, p, PALETTE.murBlanc, hMur))
  g.add(toitDeuxPans(l, p, hMur, hToit, couleurToit, 0.3, 0.22))
  g.add(surFaceAvant(porte(0.9, 1.7, couleurToit), p, 0, 0))
  for (const x of [-l * 0.3, l * 0.3]) {
    g.add(surFaceAvant(fenetre(0.65, 0.65), p, x, 1.05))
    g.add(surFaceAvant(jardiniere(0.8, fleurs), p, x, 0.75))
  }
  for (const cote of [-1, 1]) g.add(surFaceCote(fenetre(0.65, 0.65), l, cote, 0, 1.05))
  return g
}

export { panneauTexte }
