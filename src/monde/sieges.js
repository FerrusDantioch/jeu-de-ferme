/**
 * sieges.js — les endroits où l'on peut s'asseoir (bancs, chaises, fauteuil, botte de foin).
 *
 * Un « siège » est décrit par :
 *  - x, z : où l'on s'assoit ;
 *  - angle : vers où l'on regarde une fois assis (0 = vers la caméra) ;
 *  - hauteur : hauteur de l'assise, en mètres ;
 *  - devant : l'endroit où l'on se tient juste avant de s'asseoir (et où l'on se relève).
 *
 * Chaque siège reçoit une zone invisible qu'on touche pour s'y asseoir.
 */
import * as THREE from 'three'
import { MATERIAU_INVISIBLE } from '../modeles/formes.js'

/**
 * Les deux places d'un banc (un banc fait 1,6 m de long : deux personnes).
 * @param {number} x, z   centre du banc
 * @param {number} angle  vers où regarde le banc (0 = vers la caméra)
 * @param {number} hauteur  hauteur de l'assise
 */
export function placesDeBanc(x, z, angle, hauteur = 0.5) {
  const avant = { x: Math.sin(angle), z: Math.cos(angle) } // direction du regard
  const cote = { x: Math.cos(angle), z: -Math.sin(angle) } // le long du banc
  return [-0.4, 0.4].map((d) => {
    const sx = x + cote.x * d - avant.x * 0.05
    const sz = z + cote.z * d - avant.z * 0.05
    return { x: sx, z: sz, angle, hauteur, devant: { x: sx + avant.x * 0.9, z: sz + avant.z * 0.9 } }
  })
}

/**
 * Ajoute la zone à toucher d'un siège.
 * @param {object} ctx     { groupe, touchables }
 * @param {object} siege   voir en haut du fichier
 * @param {object} [taille] { largeur, profondeur, hauteur } de la zone
 */
export function ajouterSiege({ groupe, touchables }, siege, { largeur = 0.8, profondeur = 0.7, hauteur = 1.1 } = {}) {
  const zone = new THREE.Mesh(new THREE.BoxGeometry(largeur, hauteur, profondeur), MATERIAU_INVISIBLE)
  zone.position.set(siege.x, hauteur / 2, siege.z)
  zone.rotation.y = siege.angle
  zone.userData.toucher = { type: 'siege', siege }
  groupe.add(zone)
  touchables.push(zone)
  return zone
}

// Petites phrases quand on s'assoit (pas à chaque fois).
export const PHRASES_ASSIS = [
  'Ahh, on est bien ici 😌',
  'Une petite pause…',
  'Quelle belle vue !',
  'Rien ne presse 🌷',
]
