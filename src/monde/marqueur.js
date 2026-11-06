/**
 * marqueur.js — le petit cercle qui apparaît au sol là où l'on a touché,
 * pour montrer où le personnage va. Il « respire » doucement puis s'efface à l'arrivée.
 */
import * as THREE from 'three'

export function creerMarqueur(scene) {
  const anneau = new THREE.Mesh(
    new THREE.RingGeometry(0.28, 0.4, 24),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })
  )
  anneau.rotation.x = -Math.PI / 2
  anneau.position.y = 0.03
  anneau.visible = false
  scene.add(anneau)

  let temps = 0
  let actif = false

  return {
    montrer(point) {
      anneau.position.x = point.x
      anneau.position.z = point.z
      anneau.visible = true
      actif = true
      temps = 0
    },
    cacher() {
      actif = false
    },
    miseAJour(dt) {
      if (!anneau.visible) return
      temps += dt
      if (actif) {
        // Apparition douce + légère pulsation (lente, jamais clignotante).
        anneau.material.opacity = Math.min(0.85, anneau.material.opacity + dt * 4)
        const e = 1 + Math.sin(temps * 3) * 0.08
        anneau.scale.set(e, e, e)
      } else {
        // Disparition en fondu.
        anneau.material.opacity -= dt * 2.5
        if (anneau.material.opacity <= 0) {
          anneau.material.opacity = 0
          anneau.visible = false
        }
      }
    },
  }
}
