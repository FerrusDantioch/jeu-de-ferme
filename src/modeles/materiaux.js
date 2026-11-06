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
}
