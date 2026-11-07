/**
 * chute.js — ce qui tombe doucement du ciel selon la saison :
 * flocons de neige (hiver), feuilles rousses (automne), pétales roses (printemps).
 *
 * Ce sont de simples « points » (très économes) qui tombent autour du personnage,
 * puis remontent en haut quand ils touchent le sol. Rien ne tombe en été,
 * ni quand « réduire les animations » est choisi.
 */
import * as THREE from 'three'

const NOMBRE_MAXI = 220

// Pour chaque type : combien, quelle taille, quelle vitesse de chute, quel balancement, quelles couleurs.
const TYPES = {
  neige: { nombre: 220, taille: 0.13, vitesse: [0.7, 1.2], balancement: 0.4, couleurs: [0xffffff, 0xf2f7ff] },
  feuilles: { nombre: 70, taille: 0.17, vitesse: [0.5, 0.9], balancement: 1.0, couleurs: [0xe0913f, 0xf2c14e, 0xd0643a] },
  petales: { nombre: 55, taille: 0.11, vitesse: [0.4, 0.7], balancement: 1.1, couleurs: [0xf7bfd6, 0xffffff, 0xf49ac1] },
}

// Une petite pastille ronde et douce (dessinée une seule fois).
function textureRonde() {
  const toile = document.createElement('canvas')
  toile.width = toile.height = 32
  const c = toile.getContext('2d')
  const d = c.createRadialGradient(16, 16, 0, 16, 16, 16)
  d.addColorStop(0, 'rgba(255,255,255,1)')
  d.addColorStop(0.6, 'rgba(255,255,255,0.9)')
  d.addColorStop(1, 'rgba(255,255,255,0)')
  c.fillStyle = d
  c.fillRect(0, 0, 32, 32)
  return new THREE.CanvasTexture(toile)
}

/** @param {THREE.Group} groupe  le lieu (dehors) où ajouter la chute */
export function creerChute(groupe) {
  const positions = new Float32Array(NOMBRE_MAXI * 3)
  const couleurs = new Float32Array(NOMBRE_MAXI * 3)
  const vitesses = new Float32Array(NOMBRE_MAXI)
  const phases = new Float32Array(NOMBRE_MAXI)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(couleurs, 3))
  const materiau = new THREE.PointsMaterial({
    size: 0.13,
    map: textureRonde(),
    vertexColors: true,
    transparent: true,
    depthWrite: false,
  })
  const points = new THREE.Points(geo, materiau)
  points.frustumCulled = false // ils suivent le personnage : toujours à l'écran
  points.visible = false
  groupe.add(points)

  let type = null
  let temps = 0
  const couleur = new THREE.Color()

  /** Replace un point en haut, au hasard autour du centre. */
  function replacer(k, centre, partout) {
    positions[k * 3] = centre.x + (Math.random() - 0.5) * 30
    positions[k * 3 + 1] = partout ? Math.random() * 10 : 8 + Math.random() * 3
    positions[k * 3 + 2] = centre.z + (Math.random() - 0.5) * 26 - 3
  }

  return {
    /** Choisit ce qui tombe : 'neige', 'feuilles', 'petales' ou null (rien). */
    regler(nouveau, centre) {
      type = TYPES[nouveau] ? nouveau : null
      points.visible = !!type
      if (!type) return
      const t = TYPES[type]
      materiau.size = t.taille
      for (let k = 0; k < t.nombre; k++) {
        replacer(k, centre, true)
        vitesses[k] = t.vitesse[0] + Math.random() * (t.vitesse[1] - t.vitesse[0])
        phases[k] = Math.random() * Math.PI * 2
        couleur.set(t.couleurs[k % t.couleurs.length])
        couleurs.set([couleur.r, couleur.g, couleur.b], k * 3)
      }
      geo.setDrawRange(0, t.nombre)
      geo.attributes.color.needsUpdate = true
      geo.attributes.position.needsUpdate = true
    },

    /** À chaque image : tout descend doucement en se balançant. */
    miseAJour(dt, centre, cache) {
      points.visible = !!type && !cache
      if (!points.visible) return
      temps += dt
      const t = TYPES[type]
      for (let k = 0; k < t.nombre; k++) {
        const i = k * 3
        positions[i + 1] -= vitesses[k] * dt
        positions[i] += Math.sin(temps * 1.3 + phases[k]) * t.balancement * dt
        positions[i + 2] += Math.cos(temps * 0.9 + phases[k]) * t.balancement * 0.4 * dt
        // Arrivé au sol (ou trop loin du personnage) : il repart d'en haut.
        if (positions[i + 1] < 0.02 || Math.abs(positions[i] - centre.x) > 18 || Math.abs(positions[i + 2] - centre.z) > 17) {
          replacer(k, centre, false)
        }
      }
      geo.attributes.position.needsUpdate = true
    },
  }
}
