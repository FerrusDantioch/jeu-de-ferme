/**
 * formes.js — petites aides pour fabriquer des objets avec des formes simples.
 * Utilisées par les bâtiments et les meubles.
 */
import * as THREE from 'three'
import { materiau } from './materiaux.js'

/**
 * Une boîte (pavé) de largeur l, hauteur h, profondeur p.
 * (x, y, z) = position du BAS de la boîte, au centre.
 */
export function boite(l, h, p, couleur, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(l, h, p), materiau(couleur))
  m.position.set(x, y + h / 2, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

/**
 * Un cylindre (rayon r, hauteur h). (x, y, z) = position du bas, au centre.
 * « cotes » = nombre de faces (6 = hexagone, aspect low-poly).
 */
export function cylindre(r, h, couleur, x = 0, y = 0, z = 0, cotes = 8) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, cotes), materiau(couleur))
  m.position.set(x, y + h / 2, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

/**
 * Une boule low-poly de rayon r, centrée en (x, y, z).
 */
export function boule(r, couleur, x = 0, y = 0, z = 0, details = 0) {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, details), materiau(couleur))
  m.position.set(x, y, z)
  m.castShadow = true
  return m
}

/**
 * Le triangle du haut des murs de face et de dos (le « pignon ») :
 * un prisme triangulaire de largeur l, hauteur h, profondeur p, posé à la hauteur y.
 */
export function pignon(l, h, p, couleur, y) {
  const forme = new THREE.Shape()
  forme.moveTo(-l / 2, 0)
  forme.lineTo(l / 2, 0)
  forme.lineTo(0, h)
  forme.closePath()
  const geo = new THREE.ExtrudeGeometry(forme, { depth: p, bevelEnabled: false })
  geo.translate(0, 0, -p / 2)
  const m = new THREE.Mesh(geo, materiau(couleur))
  m.position.y = y
  m.castShadow = true
  m.receiveShadow = true
  return m
}

/**
 * Un toit à deux pans posé sur des murs de largeur l, profondeur p, hauteur hMur.
 * « hToit » = hauteur du sommet au-dessus des murs ; « debord » = dépassement.
 * Renvoie un groupe avec les deux pans.
 */
export function toitDeuxPans(l, p, hMur, hToit, couleur, debord = 0.35, epaisseur = 0.16) {
  const groupe = new THREE.Group()
  const demi = l / 2
  const pente = Math.atan2(hToit, demi)
  const longueurPan = Math.hypot(demi, hToit) + debord
  for (const cote of [-1, 1]) {
    const pan = new THREE.Mesh(new THREE.BoxGeometry(longueurPan, epaisseur, p + debord * 2), materiau(couleur))
    // Le milieu du pan se trouve à mi-longueur, en partant du faîte (le sommet).
    const milieu = longueurPan / 2
    pan.position.set(
      cote * Math.cos(pente) * milieu,
      hMur + hToit - Math.sin(pente) * milieu + epaisseur / 2,
      0
    )
    pan.rotation.z = -cote * pente
    pan.castShadow = true
    pan.receiveShadow = true
    groupe.add(pan)
  }
  return groupe
}

// Matériau des zones invisibles qu'on peut toucher (ex. : autour d'un villageois,
// pour qu'il soit facile à toucher du doigt même s'il est petit à l'écran).
export const MATERIAU_INVISIBLE = new THREE.MeshBasicMaterial({ visible: false })
