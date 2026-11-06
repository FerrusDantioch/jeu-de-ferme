/**
 * materiaux.js — les « peintures » des objets 3D.
 *
 * On réutilise la même peinture pour tous les objets d'une même couleur :
 * c'est plus économe pour le téléphone que d'en créer une nouvelle à chaque fois.
 * « Lambert » = un type de peinture mate, simple et rapide à calculer.
 * « flatShading » = facettes bien visibles, pour le style low-poly (formes simples).
 */
import * as THREE from 'three'

const reserve = new Map()

export function materiau(couleur) {
  const cle = String(couleur)
  if (!reserve.has(cle)) {
    reserve.set(cle, new THREE.MeshLambertMaterial({ color: couleur, flatShading: true }))
  }
  return reserve.get(cle)
}

// Palette de couleurs douces utilisée dans tout le jeu.
export const PALETTE = {
  herbe: 0x9fd67f,
  herbeFoncee: 0x86c46a,
  terre: 0xd9b38c,
  tronc: 0x9a6b47,
  feuillage: 0x6dbb5e,
  feuillageClair: 0x8fd178,
  rocher: 0xb9b6ad,
  bois: 0xc89a6a,
  peau: 0xf5cfa8,
  cheveux: 0x7a4b2a,
  chemise: 0xf28b82,
  salopette: 0x6fa8dc,
  chaussures: 0x6b4a35,
  paille: 0xf2d27a,
  rubanChapeau: 0xe06666,
  blanc: 0xffffff,
  noir: 0x333333,
  joues: 0xf4a3a3,

  // --- Bâtiments ---
  murCreme: 0xfbefd5,
  murJaune: 0xfbe3a0,
  murRouge: 0xd9574a,
  murBlanc: 0xf7f3ea,
  toitTuile: 0xd9775a,
  toitArdoise: 0x7c7a8a,
  toitBleu: 0x7fa7d6,
  toitVert: 0x86b886,
  boisFonce: 0x8a5a3b,
  boisClair: 0xe3c193,
  vitre: 0xbfe3f2,
  pierre: 0xc9c4b8,
  brique: 0xb5654a,
  eau: 0x8cc9e8,

  // --- Intérieurs ---
  parquet: 0xd8b07e,
  paillasse: 0xe8cf86,
  foin: 0xf0d36b,
  tapisRose: 0xf2a7a0,
  tapisVert: 0x9fcf9a,
  tissuBleu: 0x8fb8e0,
  tissuBlanc: 0xfdf8ee,
  metal: 0x9aa3a8,
  pot: 0xd97f5a,

  // --- Fleurs et décor ---
  fleurRose: 0xf49ac1,
  fleurJaune: 0xffe066,
  fleurBlanche: 0xffffff,
  fleurViolette: 0xb79ce0,
  citrouille: 0xf29b45,
  tomate: 0xe8554e,
  chou: 0x9ad07a,
}
