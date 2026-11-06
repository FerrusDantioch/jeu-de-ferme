/**
 * camera.js — la caméra, c'est « l'œil » du joueur.
 *
 * Ici : une caméra placée en hauteur, derrière et au-dessus du personnage,
 * qui le suit tout en douceur (jamais de mouvement brusque).
 * L'angle ne tourne pas : c'est plus reposant et on ne se perd pas.
 */
import * as THREE from 'three'

// Position de la caméra par rapport au personnage (x = côté, y = hauteur, z = recul).
const DECALAGE = new THREE.Vector3(0, 9.5, 8.5)

// Douceur du suivi : plus le nombre est petit, plus la caméra « glisse » lentement.
const DOUCEUR = 3

export function creerCamera() {
  // 45 = angle de vue (en degrés). 0.1 et 120 = distances min / max visibles.
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 120)
  camera.position.copy(DECALAGE)
  camera.lookAt(0, 0, 0)

  const cible = new THREE.Vector3()
  const positionVoulue = new THREE.Vector3()

  /**
   * Place immédiatement la caméra sur le personnage (au démarrage).
   */
  function placerSur(position) {
    cible.copy(position)
    camera.position.copy(position).add(DECALAGE)
    camera.lookAt(cible)
  }

  /**
   * Appelée à chaque image : rapproche doucement la caméra de sa position idéale.
   * « dt » = temps écoulé depuis l'image précédente, en secondes.
   */
  function suivre(position, dt) {
    // Facteur de rapprochement indépendant de la vitesse de l'appareil.
    const t = 1 - Math.exp(-DOUCEUR * dt)
    cible.lerp(position, t)
    positionVoulue.copy(cible).add(DECALAGE)
    camera.position.copy(positionVoulue)
    camera.lookAt(cible)
  }

  /**
   * Quand l'écran change de taille (rotation du téléphone, fenêtre redimensionnée).
   * Sur un écran en hauteur (portrait), on recule un peu pour voir plus large.
   */
  function adapterTaille(largeur, hauteur) {
    camera.aspect = largeur / hauteur
    camera.fov = largeur < hauteur ? 60 : 45
    camera.updateProjectionMatrix()
  }

  return { camera, placerSur, suivre, adapterTaille }
}
